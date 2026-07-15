from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="UdaanSetu.AI API",
    description="FastAPI Backend for UdaanSetu.AI on Vercel Serverless",
    version="1.0.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "message": "FastAPI backend is running successfully on Vercel!",
        "version": "1.0.0"
    }

@app.get("/api/test")
def test_endpoint():
    return {
        "message": "Hello from UdaanSetu.AI FastAPI backend!",
        "status": "success"
    }

# Local dev server run command (using python backend/main.py)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
