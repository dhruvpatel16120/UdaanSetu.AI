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
        
        # CSV Data Path
        self.csv_path = os.path.join(os.path.dirname(__file__), "../data/gujarat_job_market.csv")

    def get_csv_context(self, sector_filter: str = None) -> str:
        """
        Retrieves relevant job data from the local CSV snapshot.
        """
        try:
            df = pd.read_csv(self.csv_path)
            
            if sector_filter:
                # Fuzzy filter or exact
                df = df[df['Sector'].str.contains(sector_filter, case=False, na=False)]
            
            if df.empty:
                return "No specific local data found in CSV records."
                
            return df.to_string(index=False)
        except Exception as e:
            return f"Error reading local data: {str(e)}"

    def perform_web_research(self, query: str) -> str:
        """
        Uses LangChain Search Tool to find real-time data from Web, LinkedIn, etc.
        """
        try:
            # We append specific site queries to simulate "LinkedIn/YouTube" search
            # independent of actual API access constraints
            search_query = f"{query} Gujarat India job market trends salaries 2024 2025 site:linkedin.com OR site:naukri.com OR site:indeed.in"
            web_results = self.search.run(search_query)
            return web_results
        except Exception as e:
            return f"Web search failed: {str(e)}"

    async def generate_market_analysis(self, user_query: str, user_bio: str) -> dict:
        """
        Synthesizes a Market Intelligence Report using RAG (CSV + Web).
        """
        # 1. Gather Context
        csv_data = self.get_csv_context() # Load all or filter if we could extract sector from query
        web_data = self.perform_web_research(user_query)
        
        # 2. Construct Prompt
        template = """
        You are an Expert Job Market Analyst for Gujarat, India.
        
        Using the following combined context, answer the user's career query.
        
        1. HISTORICAL BASELINE DATA (Kaggle/Offline Records):
        {csv_context}
        *Note: This data may be dated. Use it for general categorization and historical baselines.*
        
        2. REAL-TIME MARKET VERIFICATION (Live Web Search - Naukri/LinkedIn):
        {web_context}
        *Note: Prioritize this for current demand, active salary trends, and immediate openings.*
        
        USER PROFILE:
        {user_bio}
        
        USER QUERY: {query}
        
        TASK:
        Provide a strategic market analysis.
        1. Compare the historical baseline with current web trends (e.g., "Salaries have risen by 20% compared to historical data").
        2. Highlight any discrepancies between the offline records and current market reality.
        3. Provide specific, actionable advice for the Gujarat region.
        
        Output format: JSON with keys 'demand_analysis', 'salary_insight', 'skills_gap', 'verdict'.
        Do not use markdown backticks.
        """
        
        prompt = PromptTemplate(
            input_variables=["csv_context", "web_context", "user_bio", "query"],
            template=template
        )
        
        chain = prompt | self.llm
        
        try:
            response = await chain.ainvoke({
                "csv_context": csv_data,
                "web_context": web_data,
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
