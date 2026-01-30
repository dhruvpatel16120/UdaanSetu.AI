import os
import asyncio
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
            model="gemini-1.5-flash", 
            google_api_key=self.api_key,
            temperature=0.3
        )

    def _run_search_sync(self, query: str, max_results: int = 5) -> list:
        """Helper to run DuckDuckGo search synchronously."""
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
        """Helper to load web content using WebBaseLoader."""
        if not urls:
            return ""
        try:
            loader = WebBaseLoader(urls)
            docs = loader.load()
            content = "\n\n".join([f"--- Source: {d.metadata.get('source', 'URL')} ---\n{d.page_content[:1500]}..." for d in docs])
            return content
        except Exception as e:
            return f"Error loading web pages: {str(e)}"

    async def _load_full_page_content(self, urls: list) -> str:
        """Async wrapper for WebBaseLoader."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._load_web_content_sync, urls)

    async def perform_web_research(self, query: str) -> dict:
        """
        RAG Pipeline with Optimized Token Usage.
        """
        stats_query = f"{query} salary demand trends Gujarat India 2025"
        learning_query = f"{query} learning path free courses roadmap"
        
        try:
            # 1. Run Searches
            stats_results_list, learning_results_list = await asyncio.gather(
                self._run_search(stats_query, max_results=3),
                self._run_search(learning_query, max_results=3)
            )
            
            # 2. Extract Top URL for deep dive
            top_stats_urls = [r['href'] for r in stats_results_list[:1] if 'href' in r]
            full_stats_content = await self._load_full_page_content(top_stats_urls)
            
            # 3. Prepare Context
            stats_snippets = "\n".join([f"- {r.get('title')}: {r.get('body')}" for r in stats_results_list])
            learning_snippets = "\n".join([f"- {r.get('title')}: {r.get('body')}" for r in learning_results_list])
            
            return {
                "stats_context": f"Snippets:\n{stats_snippets}\n\nDeep Dive:\n{full_stats_content}",
                "learning_context": learning_snippets
            }
        except Exception as e:
            print(f"Web Research Error: {e}")
            return {"stats_context": "Error", "learning_context": "Error"}

    async def generate_market_analysis(self, user_query: str, user_profile: dict) -> dict:
        """
        Synthesizes Market Intelligence using User Context.
        """
        education = user_profile.get("education", "Unknown")
        location = user_profile.get("location", "Gujarat")
        skills = user_profile.get("traits", {}).get("top_skills", []) or user_profile.get("skills", [])
        if isinstance(skills, list): skills = ", ".join(skills)
        
        # Gather Data
        web_search_context = await self.perform_web_research(user_query)
        
        # Construct Optimized Prompt
        template = """
        Role: Career Strategist for Rural India.
        Task: Analyze Job Market based on User Profile & Data.
        
        --- USER PROFILE ---
        Edu: {education} | Loc: {location} | Skills: {skills}
        Query: {query}
        
        --- LIVE MARKET DATA ---
        [Stats & Demand]: {web_stats}
        [Learning]: {web_learning}
        
        --- OUTPUT REQUIREMENT (JSON) ---
        Generate a strategic JSON report.
        {{
            "market_snapshot": {{
                "demand_level": "High/Medium/Low",
                "salary_range": "e.g. 25k - 40k INR",
                "trend": "Analysis of growth",
                "insight": "1-sentence reality check."
            }},
            "skills_matrix": {{
                "user_has": ["Skills from profile"],
                "missing": ["Demanded skills"],
                "emerging": ["New tools/trends"]
            }},
            "learning_roadmap": [
                {{ "step": "Phase 1", "action": "Goal", "duration": "1 month" }}
            ],
            "career_path": {{
                "role": "Entry Level",
                "growth": "Senior Level",
                "future": "Outlook"
            }},
            "resources": [
                {{ "name": "Resource", "type": "Free Course" }}
            ]
        }}
        """
        
        prompt = PromptTemplate(
            input_variables=["web_stats", "web_learning", "education", "location", "skills", "query"],
            template=template
        )
        
        chain = prompt | self.llm
        
        try:
            response = await chain.ainvoke({
                "web_stats": web_search_context.get("stats_context", "")[:3000],
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
market_analyzer = MarketIntelligenceService()
