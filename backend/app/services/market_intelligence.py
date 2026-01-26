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
                self._csv_cache = pd.DataFrame() # Empty DF
        except Exception as e:
            print(f"Error loading CSV: {e}")
            self._csv_cache = pd.DataFrame()

    def _run_search_sync(self, query: str, max_results: int = 5) -> list:
        """Helper to run DuckDuckGo search synchronously. Returns list of dicts."""
        try:
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=max_results))
                return results 
        except Exception as e:
            print(f"Search error: {e}")
            return []

    async def _run_search(self, query: str, max_results: int = 3) -> list:
        """Run search in a separate thread."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._run_search_sync, query, max_results)

    def _load_web_content_sync(self, urls: list) -> str:
        """Helper to load web content using WebBaseLoader with STRICT TOKEN LIMITS."""
        if not urls:
            return ""
        try:
            loader = WebBaseLoader(urls)
            docs = loader.load()
            # OPTIMIZATION: Take only first 1500 chars to save tokens
            content = "\n\n".join([f"--- Source: {d.metadata.get('source', 'URL')} ---\n{d.page_content[:1500]}..." for d in docs])
            return content
        except Exception as e:
            return f"Error loading web pages: {str(e)}"

    async def _load_full_page_content(self, urls: list) -> str:
        """Async wrapper for WebBaseLoader."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._load_web_content_sync, urls)

    def get_csv_context(self, sector_filter: str = None) -> str:
        """Retrieves relevant job data from the cached CSV."""
        try:
            df = self._csv_cache
            if df.empty:
                return "No local data."

            # Filter by sector if provided 
            if sector_filter:
                mask = df['Job Title'].str.contains(sector_filter, case=False, na=False) | \
                       df['Description'].str.contains(sector_filter, case=False, na=False)
                df = df[mask]
            
            # OPTIMIZATION: Limit to top 10 rows only
            return df.head(10).to_string(index=False)
        except Exception as e:
            return f"Error reading local data: {str(e)}"

    async def perform_web_research(self, query: str) -> dict:
        """
        RAG Pipeline with Optimized Token Usage.
        """
        # Search 1: Hard Numbers (Salaries, Demand) 
        stats_query = f"{query} salary demand trends Gujarat India 2025"
        
        # Search 2: Learning Roadmap
        learning_query = f"{query} learning path free courses roadmap"
        
        try:
            # 1. Run Searches (Limit results)
            stats_results_list, learning_results_list = await asyncio.gather(
                self._run_search(stats_query, max_results=3),
                self._run_search(learning_query, max_results=3)
            )
            
            # 2. Extract Top URLs (Limit to 1 for deep dive)
            top_stats_urls = [r['href'] for r in stats_results_list[:1] if 'href' in r]
            
            # 3. Load Full Content (Truncated)
            full_stats_content = await self._load_full_page_content(top_stats_urls)
            
            # 4. Prepare Context (Use Snippets for the rest)
            stats_snippets = "\n".join([f"- {r.get('title')}: {r.get('body')}" for r in stats_results_list])
            learning_snippets = "\n".join([f"- {r.get('title')}: {r.get('body')}" for r in learning_results_list])
            
            combined_stats_context = f"Snippets:\n{stats_snippets}\n\nDeep Dive:\n{full_stats_content}"

            return {
                "stats_context": combined_stats_context,
                "learning_context": learning_snippets
            }
        except Exception as e:
            print(f"Web Research Error: {e}")
            return {"stats_context": "Error", "learning_context": "Error"}

    async def generate_market_analysis(self, user_query: str, user_profile: dict) -> dict:
        """
        Synthesizes Market Intelligence using User Context.
        Arguments:
            user_query: The specific question (e.g., "Is Python good?")
            user_profile: Dict containing {education, location, interests, skills, etc.}
        """
        # 1. Extract Context
        # Clean up profile to essential strings for prompt
        education = user_profile.get("education", "Unknown")
        location = user_profile.get("location", "Gujarat")
        skills = user_profile.get("traits", {}).get("top_skills", []) or user_profile.get("skills", [])
        if isinstance(skills, list): skills = ", ".join(skills)
        
        # 2. Gather Data
        csv_data = self.get_csv_context()
        web_search_context = await self.perform_web_research(user_query)
        
        # 3. Construct Optimized Prompt
        template = """
        Role: Career Strategist for Rural India.
        Task: Analyze Job Market based on User Profile & Data.
        
        --- USER PROFILE ---
        Edu: {education} | Loc: {location} | Skills: {skills}
        Query: {query}
        
        --- MARKET DATA ---
        [Historical]: {csv_context}
        [Live Stats]: {web_stats}
        [Learning]: {web_learning}
        
        --- OUTPUT REQUIREMENT (JSON) ---
        Generate a strategic JSON report matching the user's skills to the market.
        {{
            "market_snapshot": {{
                "demand_level": "High/Medium/Low",
                "salary_range": "e.g. 25k - 40k INR",
                "trend": "Growth/Stable",
                "insight": "1-sentence reality check for this user."
            }},
            "skills_matrix": {{
                "user_has": ["Skills from profile that act as assets"],
                "missing": ["Critical skills demanded by market data"],
                "emerging": ["New tools mentioned in live stats"]
            }},
            "learning_roadmap": [
                {{ "step": "Phase 1", "action": "Foundations", "duration": "1 month" }}
            ],
            "career_path": {{
                "role": "Entry Level Title",
                "growth": "Senior Title",
                "future": "5-year outlook"
            }},
            "resources": [
                {{ "name": "Specific Course/Video", "type": "Free Resource" }}
            ]
        }}
        """
        
        prompt = PromptTemplate(
            input_variables=["csv_context", "web_stats", "web_learning", "education", "location", "skills", "query"],
            template=template
        )
        
        chain = prompt | self.llm
        
        try:
            response = await chain.ainvoke({
                "csv_context": csv_data,
                "web_stats": web_search_context.get("stats_context", "")[:3000], # HARD CAP CONTEXT
                "web_learning": web_search_context.get("learning_context", "")[:1000],
                "education": education,
                "location": location,
                "skills": str(skills),
                "query": user_query
            })
            
            content = response.content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
            
        except Exception as e:
            print(f"Analysis Error: {e}")
            return {"error": str(e)}

# Singleton instance
market_service = MarketIntelligenceService()
