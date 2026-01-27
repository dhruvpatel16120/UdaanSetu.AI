
import sys
import os
from pathlib import Path

# Add backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.rag_engine import RAGEngine
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RAGTest")

def test_rag():
    print("Initializing RAGEngine...")
    rag = RAGEngine()
    
    if rag.load_index():
        print("✅ Index loaded successfully.")
    else:
        print("❌ Failed to load index. Build it first?")
        return

    query = "What are the best career options in IT for a generic student?"
    print(f"\n🔍 Testing Query: '{query}'")
    
    # Test 1: Vector Search
    results = rag.search(query, k=5)
    print(f"\n--- Vector Search Results (Top {len(results)}) ---")
    for i, res in enumerate(results):
        print(f"{i+1}. {res['metadata'].get('source', 'Unknown')} (Score: {res['score']:.4f})")
        print(f"   Snippet: {res['content'][:100]}...")

    # Test 2: Reranking
    print("\n--- Testing Reranking ---")
    reranked = rag.rerank(query, results, top_n=3)
    for i, res in enumerate(reranked):
        print(f"{i+1}. {res['metadata'].get('source', 'Unknown')} (Rerank Score: {res['rerank_score']:.4f})")
        print(f"   Snippet: {res['content'][:100]}...")

    # Test 3: Context Builder
    print("\n--- Testing Context Builder ---")
    user_profile = {"education": "12th Science", "interest_domains": ["Computer Science"]}
    context = rag.get_context_for_query(query, user_profile=user_profile)
    print("Generated Context Snippet:")
    print(context[:500] + "...")

if __name__ == "__main__":
    test_rag()
