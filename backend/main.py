import uvicorn
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv(override=True)

from app.main import app

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
