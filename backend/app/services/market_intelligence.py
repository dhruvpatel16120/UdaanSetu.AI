import os
import pandas as pd
import asyncio
from concurrent.futures import ThreadPoolExecutor
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from duckduckgo_search import DDGS
from langchain_community.document_loaders import WebBaseLoader
from dotenv import load_dotenv
import json

# Load Env
load_dotenv()

class MarketIntelligenceService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            print("WARNING: GEMINI_API_KEY not found. Market Intelligence may fail.")
            
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash", 
            google_api_key=self.api_key,
            temperature=0.3
        )
        self.csv_path = os.path.join(os.path.dirname(__file__), "../data/dataset.csv")
        self._csv_cache = None
        self._load_csv()

    def _load_csv(self):
        """Load CSV into memory once."""
        try:
            if os.path.exists(self.csv_path):
                self._csv_cache = pd.read_csv(self.csv_path)
            else:
                print(f"Dataset not found at {self.csv_path}")
                self._csv_cache = pd.DataFrame() # Empty DF
        except Exception as e:
            print(f"Error loading CSV: {e}")
            self._csv_cache = pd.DataFrame()

    def _run_search_sync(self, query: str, max_results: int = 5) -> list:
        """Helper to run DuckDuckGo search synchronously. Returns list of dicts."""
        try:
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=max_results))
                return results # [{'title':..., 'href':..., 'body':...}]
        except Exception as e:
            print(f"Search error: {e}")
            return []

    async def _run_search(self, query: str, max_results: int = 3) -> list:
        """Run search in a separate thread to avoid blocking the event loop."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._run_search_sync, query, max_results)

    def _load_web_content_sync(self, urls: list) -> str:
        """Helper to load web content using WebBaseLoader."""
        if not urls:
            return ""
        try:
            loader = WebBaseLoader(urls)
            # Use load() which returns a list of Documents
            docs = loader.load()
            content = "\n\n".join([f"--- Content from {d.metadata.get('source', 'URL')} ---\n{d.page_content[:2000]}..." for d in docs])
            return content
        except Exception as e:
            return f"Error loading web pages: {str(e)}"

    async def _load_full_page_content(self, urls: list) -> str:
        """Async wrapper for WebBaseLoader."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._load_web_content_sync, urls)

    def get_csv_context(self, sector_filter: str = None) -> str:
        """
        Retrieves relevant job data from the cached CSV.
        """
        try:
            df = self._csv_cache
            if df.empty:
                return "No specific local data found in CSV records."

            # Filter by sector if provided (searching in Job Title or Description)
            if sector_filter:
                mask = df['Job Title'].str.contains(sector_filter, case=False, na=False) | \
                       df['Description'].str.contains(sector_filter, case=False, na=False)
                df = df[mask]
            
            # Limit to top 20 relevant results to avoid context overflow
            return df.head(20).to_string(index=False)
        except Exception as e:
            return f"Error reading local data: {str(e)}"

    async def perform_web_research(self, query: str) -> dict:
        """
        RAG Pipeline: Search -> Select Top URLs -> Load Full Content -> Return Context.
        """
        # Search 1: Hard Numbers (Salaries, Demand) - Indeed, Naukri, Glassdoor
        # Specifically targeting Gujarat for local market data
        stats_query = f"{query} Gujarat India salary data demand trends 2025 site:indeed.in OR site:naukri.com OR site:glassdoor.co.in"
        
        # Search 2: Content & Roadmap (Skills, Future, Learning)
        learning_query = f"{query} career roadmap skills path 2025 tutorial site:youtube.com OR site:linkedin.com/pulse OR site:medium.com"
        
        try:
            # 1. Run Initial Searches in Parallel (Limit to 3 results for speed)
            stats_results_list, learning_results_list = await asyncio.gather(
                self._run_search(stats_query), # Max results default is 5, but we rely on _run_search_sync logic if updated
                self._run_search(learning_query)
            )
            
            # 2. Extract Top URLs for Deep Dive (RAG)
            # We take ONLY top 1 stats URL to optimize speed (deep reading is slow)
            top_stats_urls = [r['href'] for r in stats_results_list[:1] if 'href' in r]
            
            # 3. Load Full Content for these URLs (The "WebLoader" part)
            full_stats_content = await self._load_full_page_content(top_stats_urls)
            
            # 4. Prepare Context
            # We use snippets for learning (usually enough) and Full Content for Stats (need numbers)
            stats_snippets = "\n".join([f"- {r.get('title')}: {r.get('body')}" for r in stats_results_list])
            learning_snippets = "\n".join([f"- {r.get('title')}: {r.get('body')}" for r in learning_results_list])
            
            combined_stats_context = f"search_snippets:\n{stats_snippets}\n\ndeep_dive_content:\n{full_stats_content}"

            return {
                "stats_context": combined_stats_context,
                "learning_context": learning_snippets
            }
        except Exception as e:
            print(f"Web Research Error: {e}")
            return {"stats_context": "Error fetching web data.", "learning_context": "Error fetching web data."}

    async def generate_market_analysis(self, user_query: str, user_bio: str) -> dict:
        """
        Synthesizes a Comprehensive Market Intelligence Report (7-Part Strategy).
        """
        # 1. Gather Context
        csv_data = self.get_csv_context()
        web_search_context = await self.perform_web_research(user_query)
        
        # 2. Construct Prompt
        template = """
        You are an Expert Career Strategist & Market Analyst for Gujarat, India.
        
        Analyze the following multi-source data to answer the User's Query.
        
        --- SOURCE 1: HISTORICAL BASELINE (Local CSV) ---
        {csv_context}
        
        --- SOURCE 2: LIVE MARKET STATS (Web Search + Full Page Content) ---
        {web_stats}
        
        --- SOURCE 3: LEARNING & TRENDS (Snippet Data) ---
        {web_learning}
        
        --- USER CONTEXT ---
        User Bio: {user_bio}
        User Query: {query}
        
        --- THE TASK ---
        Generate a highly detailed strategic report in JSON format.
        You MUST synthesize data from all sources. If YouTube/Learning context suggests a specific tool or roadmap, include it.
        
        REQUIRED JSON STRUCTURE:
        {{
            "market_snapshot": {{
                "demand_level": "High/Medium/Low",
                "salary_range": "e.g. 25k - 50k INR",
                "trend_direction": "Rising/Stable/Declining",
                "key_insight": "One sentence summary of the market reality vs history."
            }},
            "skills_matrix": {{
                "must_have": ["Skill 1", "Skill 2"],
                "good_to_have": ["Skill 3", "Skill 4"],
                "emerging_tech": ["New Tool mentioned in 2025 trends"]
            }},
            "learning_roadmap": [
                {{ "step": "Phase 1: Foundations", "action": "What to learn first", "duration": "e.g. 1 month" }},
                {{ "step": "Phase 2: Advanced", "action": "Next steps", "duration": "e.g. 2 months" }}
            ],
            "career_path": {{
                "entry_role": "Junior Title",
                "progression": "Senior Title -> Lead Title",
                "future_outlook": "Where this industry is heading in 5 years"
            }},
            "resources": [
                {{ "name": "Recommended YouTube Topic/Channel", "type": "Video" }},
                {{ "name": "Recommended Certification/Course", "type": "Course" }}
            ]
        }}
        
        Return ONLY valid JSON.
        """
        
        prompt = PromptTemplate(
            input_variables=["csv_context", "web_stats", "web_learning", "user_bio", "query"],
            template=template
        )
        
        chain = prompt | self.llm
        
        try:
            response = await chain.ainvoke({
                "csv_context": csv_data,
                "web_stats": web_search_context.get("stats_context", ""),
                "web_learning": web_search_context.get("learning_context", ""),
                "user_bio": user_bio,
                "query": user_query
            })
            
            # Simple text parsing for the JSON
            content = response.content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
            
        except Exception as e:
            print(f"Market Intelligence Error: {e}")
            return {"error": str(e)}

# Singleton instance
market_service = MarketIntelligenceService()
