import os
import asyncio
import json
import logging
from typing import List, Dict, Any, Optional
from duckduckgo_search import DDGS
from app.services.ai_service import synthesize_career_report

# Configure Logging
logger = logging.getLogger("uvicorn.error")

class CareerAdvisorService:
    """
    Consolidated Service for Pillar 3: Career Reports & Roadmaps.
    Uses real-time web search and Gemini LLM.
    """
    
    async def get_market_data(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Fetches latest job market trends and resources via DuckDuckGo."""
        try:
            loop = asyncio.get_running_loop()
            def sync_search():
                with DDGS() as ddgs:
                    # ddgs.text returns a generator, list() consumes it
                    return list(ddgs.text(query, max_results=max_results))
            
            results = await loop.run_in_executor(None, sync_search)
            return results
        except Exception as e:
            logger.error(f"❌ Web Search Failed: {e}")
            return []

    async def generate_full_report(self, user_id: str, query: str, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        The Master Logic for the Career Report Generator.
        """
        # 1. Search Query Expansion
        search_query = f"{query} career demand salary skills roadmap India 2025"
        print(f"🔍 Searching market data for: {query}...")
        
        # 2. Gather Web Data
        market_data = await self.get_market_data(search_query)
        if not market_data:
            print("⚠️ Warning: No market data found via web search. Proceeding with AI internal knowledge.")
        else:
            print(f"📊 Found {len(market_data)} search results.")
        
        # 3. Prepare Context for AI
        user_context = {
            "uid": user_id,
            "query": query,
            "education": user_profile.get("education"),
            "location": user_profile.get("location"),
            "current_skills": user_profile.get("skillset", []),
            "assessment_summary": user_profile.get("professional_summary", "")
        }
        
        # 4. Synthesize with Gemini
        print(f"🚀 Synthesizing AI Report for {user_id}...")
        report = await synthesize_career_report(user_context, market_data)
        
        if not report:
            print("❌ AI Synthesis failed.")
            return {"error": "Failed to generate AI report. Please try again."}
            
        print("✅ Career Report generated successfully.")
        return report

# Singleton Instance
career_advisor = CareerAdvisorService()
