import os
from langchain_postgres import PGVector
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
from dotenv import load_dotenv

load_dotenv()

class VectorStoreService:
    def __init__(self):
        self.db_url = os.getenv("POSTGRES_URL") or os.getenv("DATABASE_URL")
        self.api_key = os.getenv("GEMINI_API_KEY")
        
        self.embeddings = None
        self.vector_store = None
        
        if self.api_key:
            self.embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001", 
                google_api_key=self.api_key
            )
        
        if self.db_url and self.embeddings:
            try:
                # Connection string must be for asyncpg or psycopg3 usually for langchain-postgres?
                # Actually langchain-postgres uses psycopg3 usually.
                # We'll try standard connection.
                self.vector_store = PGVector(
                    embeddings=self.embeddings,
                    collection_name="udaansetu_knowledge",
                    connection=self.db_url,
                    use_jsonb=True,
                )
                print("✅ Vector Store Service initialized with PostgreSQL.")
            except Exception as e:
                print(f"⚠️ Vector Store Initialization Failed: {e}")
                self.vector_store = None
        else:
            print("⚠️ Missing DB URL or API Key for Vector Store.")

    async def add_texts(self, texts: list, metadatas: list = None):
        """Add text chunks to the vector store."""
        if not self.vector_store:
            return False
            
        try:
            await self.vector_store.aadd_texts(texts, metadatas=metadatas)
            return True
        except Exception as e:
            print(f"Error adding texts: {e}")
            return False

    async def similarity_search(self, query: str, k: int = 3):
        """Retrieve relevant documents."""
        if not self.vector_store:
            return []
            
        try:
            docs = await self.vector_store.asimilarity_search(query, k=k)
            return docs
        except Exception as e:
            print(f"Error in similarity search: {e}")
            return []

# Singleton
vector_service = VectorStoreService()
