import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

def test_genai():
    print(f"Testing Gemini-Pro with key: {api_key[:5]}..." if api_key else "No Key Found")
    
    try:
        llm = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=api_key)
        response = llm.invoke("Hello, are you working?")
        print("Success!")
        print(response.content)
    except Exception as e:
        print(f"Gemini Pro Failed: {e}")

    try:
        print("\nTesting Gemini-1.5-Flash...")
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key)
        response = llm.invoke("Hello, are you working?")
        print("Success!")
        print(response.content)
    except Exception as e:
        print(f"Gemini Flash Failed: {e}")

if __name__ == "__main__":
    test_genai()
