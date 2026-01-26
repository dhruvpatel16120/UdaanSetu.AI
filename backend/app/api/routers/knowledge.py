from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Optional
from app.services.rag_engine import get_rag_engine
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class SearchResult(BaseModel):
    content: str
    metadata: Dict
    score: float

@router.post("/build_index")
async def build_index():
    """
    Triggers reading all documents from data/ and building the FAISS index.
    """
    try:
        engine = get_rag_engine()
        result = engine.build_index()
        return {"status": "success", "message": result}
    except Exception as e:
        logger.error(f"Build index error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search", response_model=List[SearchResult])
async def search_knowledge(query: str = Query(..., min_length=1), k: int = 5):
    """
    Searches the knowledge base for top k relevant results.
    """
    try:
        engine = get_rag_engine()
        results = engine.search(query, k=k)
        return results
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
