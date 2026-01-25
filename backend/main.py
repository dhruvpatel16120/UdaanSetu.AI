import uvicorn
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv(override=True)

from app.main import app

if __name__ == "__main__":
    host = "0.0.0.0"
    port = 8000
    print(f"Starting UdaanSetu Backend on {host}:{port}...")
    print("If you encounter 'getaddrinfo failed', check your usage of --host arguments.")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
