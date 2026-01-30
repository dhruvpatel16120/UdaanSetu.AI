
import os
import time
import firebase_admin
from firebase_admin import credentials, firestore
import google.generativeai as genai
from google import genai as g_genai
import requests

def test_system_time():
    print("--- [1] System Time Check ---")
    local_time = time.time()
    try:
        # Google's servers are very reliable for this
        response = requests.head("https://www.google.com", timeout=5)
        server_date_str = response.headers.get('date')
        if server_date_str:
            import email.utils
            remote_time = email.utils.mktime_tz(email.utils.parsedate_tz(server_date_str))
            diff = abs(local_time - remote_time)
            print(f"Local time (UTC): {time.ctime(local_time)}")
            print(f"Remote time (UTC): {server_date_str}")
            print(f"Drift: {diff:.2f} seconds")
            if diff > 300:
                print("🚨 WARNING: System clock drift > 5 minutes! This WILL cause JWT errors.")
            else:
                print("✅ Clock seems okay.")
        else:
            print("Could not get Date header from Google.")
    except Exception as e:
        print(f"Time Check Error: {e}")

def test_firebase():
    print("\n--- [2] Firebase Admin SDK Check ---")
    cred_path = "serviceAccountKey.json"
    if not os.path.exists(cred_path):
        print(f"❌ {cred_path} NOT FOUND in {os.getcwd()}")
        return
        
    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print("Firebase App Initialized.")
            
        db = firestore.client()
        # Try a simple read
        print("Attempting to read 'users' collection (first 1 document)...")
        docs = db.collection("users").limit(1).get()
        print(f"✅ Connection Successful. Found {len(list(docs))} doc(s).")
    except Exception as e:
        print(f"❌ Firebase Auth Failed: {e}")

def test_gemini():
    print("\n--- [3] Gemini SDK Check ---")
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ GEMINI_API_KEY not found in environment.")
        return
        
    print("Testing Legacy SDK (google.generativeai)...")
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content("Say 'Auth Success'")
        print(f"✅ Legacy SDK: {response.text.strip()}")
    except Exception as e:
        print(f"❌ Legacy Gemini Failed: {e}")

    print("Testing Modern SDK (google.genai)...")
    try:
        client = g_genai.Client(api_key=api_key)
        response = client.models.generate_content(model="gemini-1.5-flash", contents="Say 'Auth Success'")
        print(f"✅ Modern SDK: {response.text.strip()}")
    except Exception as e:
        print(f"❌ Modern Gemini Failed: {e}")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    test_system_time()
    test_firebase()
    test_gemini()
