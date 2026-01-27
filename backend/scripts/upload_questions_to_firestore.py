
import os
import sys
from dotenv import load_dotenv

# Add parent directory to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.data.question_bank import QUESTIONS
from app.services.db_firebase import init_firebase
from firebase_admin import firestore
import firebase_admin

def upload_questions():
    print("Uploading questions to Firestore...")
    if not firebase_admin._apps:
        init_firebase()
        
    db = firestore.client()
    collection_ref = db.collection("questions")
    
    for q in QUESTIONS:
        doc_id = q["id"]
        # Use a copy to avoid mutating original
        q_data = dict(q)
        collection_ref.document(doc_id).set(q_data)
        print(f"Uploaded: {doc_id}")
    
    print("Done!")

if __name__ == "__main__":
    upload_questions()
