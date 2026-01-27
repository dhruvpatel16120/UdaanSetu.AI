import os
import json
import logging
import re
import pickle
from pathlib import Path
from typing import List, Dict, Optional, Tuple

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer, CrossEncoder
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import (
    PyPDFLoader, TextLoader, Docx2txtLoader, CSVLoader, BSHTMLLoader
)
from langchain_core.documents import Document
from pydantic import BaseModel, Field

# PRODUCTION LOGGING
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RAGEngine")

class RAGDocument(BaseModel):
    content: str = Field(..., description="Cleaned chunk text")
    metadata: Dict = Field(default_factory=dict, description="Source, Year, Sector, etc.")

class RAGEngine:
    def __init__(
        self,
        data_dir: Optional[str] = None,
        index_dir: Optional[str] = None,
        # Multilingual Embedding
        embedding_model_name: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        # Semantic Reranker
        reranker_model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"
    ):
        base_dir = Path(__file__).parent.parent
        self.data_dir = Path(data_dir) if data_dir else base_dir / "data"
        self.index_dir = Path(index_dir) if index_dir else self.data_dir / "indexes"
        self.index_dir.mkdir(parents=True, exist_ok=True)
        
        self.embedding_model_name = embedding_model_name
        self.reranker_model_name = reranker_model_name
        
        # Lazy Loading Placeholders
        self._embedding_model = None
        self._reranker = None
        self._embedding_dim = None

        self.index: Optional[faiss.Index] = None
        self.documents: List[RAGDocument] = []
        
        # Step 2: Advanced Chunking Strategy (Optimized for Tokens)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,  # Reduced from 800 to save tokens
            chunk_overlap=50, # Reduced overlap
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    @property
    def embedding_model(self):
        if self._embedding_model is None:
            logger.info(f"Retriever: Lazy Initializing {self.embedding_model_name}")
            self._embedding_model = SentenceTransformer(self.embedding_model_name)
        return self._embedding_model

    @property
    def embedding_dim(self):
        if self._embedding_dim is None:
            self._embedding_dim = self.embedding_model.get_sentence_embedding_dimension()
        return self._embedding_dim

    @property
    def reranker(self):
        if self._reranker is None:
            logger.info(f"Reranker: Lazy Initializing {self.reranker_model_name}")
            self._reranker = CrossEncoder(self.reranker_model_name)
        return self._reranker

    def search(self, query: str, k: int = 15) -> List[Dict]:
        """
        Step 6: Similarity Search (Vector DB Retrieval)
        """
        if self.index is None:
            if not self.load_index(): return []
            
        # Step 5: Query Embedding
        query_embedding = self.embedding_model.encode(query, convert_to_numpy=True)
        query_vector = np.array([query_embedding]).astype('float32')
        
        distances, indices = self.index.search(query_vector, k)
        
        results = []
        for idx, dist in zip(indices[0], distances[0]):
            if idx != -1 and idx < len(self.documents):
                doc = self.documents[idx]
                results.append({
                    "content": doc.content,
                    "metadata": doc.metadata,
                    "score": float(dist) # L2 Distance
                })
        return results

    def rerank(self, query: str, documents: List[Dict], top_n: int = 3) -> List[Dict]:
        """
        Step 7: Reranking (Cross-Encoder optimization)
        """
        if not documents: return []
            
        # Cross-Comparison
        pairs = [[query, doc["content"][:1000]] for doc in documents] # Limit input to reranker
        scores = self.reranker.predict(pairs)
        
        for i, score in enumerate(scores):
            documents[i]["rerank_score"] = float(score)
            
        return sorted(documents, key=lambda x: x["rerank_score"], reverse=True)[:top_n]

    def get_context_for_query(self, query: str, user_profile: Optional[Dict] = None, k: int = 3) -> str:
        """
        Step 8: Context Builder (Final Assembly - Resource Optimized)
        """
        # Step 5 Expansion: Personlize query based on user background
        expanded_query = query
        if user_profile:
            pref = user_profile.get("interest_domains", [])
            expanded_query = f"{query} [Context: {user_profile.get('education')} student in Gujarat interested in {pref}]"

        # Search optimized: k=10 initial, top_n=k returned
        initial_results = self.search(expanded_query, k=10)
        best_results = self.rerank(query, initial_results, top_n=k)
        
        if not best_results: 
            return "<knowledge_status>NO_DOMAIN_SPECIFIC_DATA_FOUND</knowledge_status>"
        
        # XML Formatting for LLM (Step 8)
        # Optimized: Truncate content to max 1200 chars per chunk
        context_parts = ["<verified_knowledge_base>"]
        for i, res in enumerate(best_results, 1):
            source = res['metadata'].get('source', 'UdaanLink_Database')
            clean_content = res['content'][:1200].replace("\n", " ") # Compress newlines
            chunk = f"""  <entry id="{i}" source="{source}">
    <content>{clean_content}...</content>
  </entry>"""
            context_parts.append(chunk)
            
        context_parts.append("</verified_knowledge_base>")
        return "\n".join(context_parts)

    def save_index(self, name: str = "career_knowledge") -> None:
        if self.index is None: return
        faiss.write_index(self.index, str(self.index_dir / f"{name}.index"))
        with open(self.index_dir / f"{name}_docs.pkl", 'wb') as f:
            pickle.dump(self.documents, f)

    def load_index(self, name: str = "career_knowledge") -> bool:
        idx_p, doc_p = self.index_dir / f"{name}.index", self.index_dir / f"{name}_docs.pkl"
        if not idx_p.exists() or not doc_p.exists(): return False
        self.index = faiss.read_index(str(idx_p))
        with open(doc_p, 'rb') as f: self.documents = pickle.load(f)
        return True

    def build_index(self) -> str:
        """Master Build (Steps 1, 2, 3, 4)"""
        # Step 1: Load Docs
        documents = []
        supported = {".pdf": PyPDFLoader, ".txt": TextLoader, ".docx": Docx2txtLoader, ".csv": CSVLoader}
        for file_path in self.data_dir.rglob("*"):
            ext = file_path.suffix.lower()
            if ext in supported:
                try:
                    loader = supported[ext](str(file_path))
                    docs = loader.load()
                    for d in docs: d.metadata["source"] = file_path.name
                    documents.extend(docs)
                except Exception as e: logger.error(f"KB_LOAD_ERROR: {e}")

        # JSON Loading (Specialized)
        for jf in ["careers.json", "roadmaps.json", "skills.json", "government_schemes.json"]:
            jp = self.data_dir / jf
            if jp.exists():
                with open(jp, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        for item in data: documents.append(Document(page_content=json.dumps(item), metadata={"source": jf}))

        # Step 2: Chunking
        chunks = self.text_splitter.split_documents(documents)
        
        # Step 3 & 4: Embedding to Vector DB
        embeddings_list = []
        self.documents = []
        for chunk in chunks:
            self.documents.append(RAGDocument(content=chunk.page_content, metadata=chunk.metadata))
            embeddings_list.append(self.embedding_model.encode(chunk.page_content, convert_to_numpy=True))
        
        self.index = faiss.IndexFlatL2(self.embedding_dim)
        self.index.add(np.array(embeddings_list).astype('float32'))
        self.save_index()
        return f"Index Ready: {len(chunks)} Chunks."

_rag_engine = None
def get_rag_engine():
    global _rag_engine
    if _rag_engine is None: _rag_engine = RAGEngine(); _rag_engine.load_index()
    return _rag_engine
