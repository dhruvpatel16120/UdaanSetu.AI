import os
import pandas as pd
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_community.document_loaders import CSVLoader

# Load Env
from dotenv import load_dotenv
load_dotenv()

class MarketIntelligenceService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-pro", 
            google_api_key=self.api_key,
            temperature=0.3
        )
        self.search = DuckDuckGoSearchRun()
        self.csv_path = os.path.join(os.path.dirname(__file__), "../data/gujarat_job_market.csv")

    def get_csv_context(self, sector_filter: str = None) -> str:
        """
        Retrieves relevant job data from the local CSV snapshot.
        """
        try:
            df = pd.read_csv(self.csv_path)
            if sector_filter:
                df = df[df['Sector'].str.contains(sector_filter, case=False, na=False)]
            return df.to_string(index=False) if not df.empty else "No specific local data found in CSV records."
        except Exception as e:
            return f"Error reading local data: {str(e)}"

    async def perform_web_research(self, query: str) -> dict:
        """
        Optimized parallel search for strictly separated contexts.
        """
        # Search 1: Hard Numbers (Salaries, Demand) - Indeed, Naukri, Glassdoor
        stats_query = f"{query} Gujarat India salary data demand trends 2024 2025 site:indeed.in OR site:naukri.com OR site:glassdoor.co.in"
        
        # Search 2: Content & Roadmap (Skills, Future, Learning) - YouTube, Medium, LinkedIn Articles
        learning_query = f"{query} career roadmap skills path 2025 tutorial site:youtube.com OR site:linkedin.com/pulse OR site:medium.com"
        
        # In a real async environment, these would run in parallel.
        # For simplicity here, we run sequential but separate.
        try:
            stats_results = self.search.run(stats_query)
            learning_results = self.search.run(learning_query)
            
            return {
                "stats_context": stats_results,
                "learning_context": learning_results
            }
        except Exception as e:
            return {"error": str(e)}

    async def generate_market_analysis(self, user_query: str, user_bio: str) -> dict:
        """
        Synthesizes a Comprehensive Market Intelligence Report (7-Part Strategy).
        """
        # 1. Gather Context
        csv_data = self.get_csv_context()
        web_search_results = await self.perform_web_research(user_query)
        
        # 2. Construct Prompt
        template = """
        You are an Expert Career Strategist & Market Analyst for Gujarat, India.
        
        Analyze the following multi-source data to answer the User's Query.
        
        --- SOURCE 1: HISTORICAL BASELINE (Local CSV) ---
        {csv_context}
        
        --- SOURCE 2: LIVE MARKET STATS (Indeed, Naukri, Glassdoor) ---
        {web_stats}
        
        --- SOURCE 3: LEARNING & TRENDS (YouTube, Blogs, LinkedIn) ---
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
                "web_stats": web_search_results.get("stats_context", ""),
                "web_learning": web_search_results.get("learning_context", ""),
                "user_bio": user_bio,
                "query": user_query
            })
            
            # Simple text parsing for the JSON
            import json
            content = response.content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
            
        except Exception as e:
            print(f"Market Intelligence Error: {e}")
            return {"error": str(e)}

# Singleton instance
market_service = MarketIntelligenceService()
