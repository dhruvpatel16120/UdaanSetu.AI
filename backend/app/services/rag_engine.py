import os
import json
import logging
from typing import List, Dict, Any, Optional

# Configure Logging
logger = logging.getLogger("uvicorn.error")

class LeanRAG:
    """
    A lightweight RAG engine that avoids heavy native libraries like FAISS/NumPy.
    Suitable for Vercel Serverless Functions.
    """
    def __init__(self, data_path: str = "app/data"):
        self.data_path = data_path
        self.knowledge_chunks: List[Dict[str, Any]] = []
        self._load_knowledge()

    def _load_knowledge(self):
        """Loads knowledge from JSON files in the data directory."""
        try:
            files = ["careers.json", "roadmaps.json", "skills.json", "government_schemes.json"]
            for file in files:
                path = os.path.join(self.data_path, file)
                if os.path.exists(path):
                    with open(path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if isinstance(data, list):
                            self.knowledge_chunks.extend(data)
            logger.info(f"📚 LeanRAG: Loaded {len(self.knowledge_chunks)} knowledge chunks.")
        except Exception as e:
            logger.error(f"❌ LeanRAG Load Error: {e}")

    def search(self, query: str, k: int = 5) -> str:
        """
        Simple Keyword + BM25-lite search across the JSON chunks.
        In a serverless env, we prioritize speed and low memory.
        """
        if not self.knowledge_chunks:
            return "No knowledge base data available."

        query_words = set(query.lower().split())
        scored_chunks = []

        for chunk in self.knowledge_chunks:
            # Flatten chunk to string for searching
            chunk_str = json.dumps(chunk).lower()
            score = sum(1 for word in query_words if word in chunk_str)
            if score > 0:
                scored_chunks.append((score, chunk))

        # Sort by score and take top k
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        results = [json.dumps(c[1]) for c in scored_chunks[:k]]

        if not results:
            return "No specific matches found in knowledge base."
        
        return "\n\n".join(results)

# Singleton Instance
_rag = None

def get_rag_engine():
    global _rag
    if _rag is None:
        # Get absolute path to data dir
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        data_dir = os.path.join(base_dir, "data")
        _rag = LeanRAG(data_path=data_dir)
    return _rag
