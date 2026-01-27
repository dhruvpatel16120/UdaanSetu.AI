import os
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase (Singleton)
# Ensure you have GOOGLE_APPLICATION_CREDENTIALS set or pass not-found error gracefully for dev
def init_firebase():
    if not firebase_admin._apps:
        try:
             # Look for service account file, typical name
             # Expecting it in the root backend directory or relative to this file
             # We try multiple paths to be safe
            possible_paths = [
                "serviceAccountKey.json",
                os.path.join(os.getcwd(), "serviceAccountKey.json"),
                os.path.join(os.path.dirname(__file__), "../../serviceAccountKey.json"),
                 os.path.join(os.path.dirname(__file__), "../../../serviceAccountKey.json")
            ]
            
            cred_path = possible_paths[0]
            for p in possible_paths:
                if os.path.exists(p):
                    cred_path = p
                    break

            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                print(f"Firebase Admin Initialized with {cred_path}")
            else:
                print("Warning: serviceAccountKey.json not found. Firestore saving will fail.")
        except Exception as e:
            print(f"Failed to initialize Firebase: {e}")

def save_assessment_result(user_id: str, data: dict):
    """
    Saves assessment result to Firestore.
    Structure: users/{user_id}
    Behavior: Overwrites existing assessment data (No history).
    """
    try:
        if not firebase_admin._apps:
            init_firebase()
            
        db = firestore.client()
        # Reference to the assessments document
        doc_ref = db.collection("assessments").document(user_id)
        
        # We store the assessment data. Using set with merge=True for safety, 
        # but assessments are generally self-contained now.
        
        update_data = {
            "assessment_result": data,
            "last_updated": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref.set(update_data, merge=True)
        print(f"Successfully saved assessment for user {user_id}")
        return True
    except Exception as e:
        print(f"Error saving to Firestore: {e}")
        return False

def get_assessment_result(user_id: str):
    """
    Retrieves assessment result from Firestore.
    """
    try:
        if not firebase_admin._apps:
            init_firebase()
            
        db = firestore.client()
        doc_ref = db.collection("assessments").document(user_id)
        doc = doc_ref.get()
        
        if doc.exists:
            data = doc.to_dict()
            return data.get("assessment_result", None)
        return None
    except Exception as e:
        print(f"Error getting from Firestore: {e}")
        return None

def get_questions_from_firestore():
    """
    Fetches all questions from the 'questions' collection.
    """
    try:
        if not firebase_admin._apps:
            init_firebase()
            
        db = firestore.client()
        questions_ref = db.collection("questions")
        docs = questions_ref.stream()
        
        questions = []
        for doc in docs:
            q_data = doc.to_dict()
            if "id" not in q_data:
                q_data["id"] = doc.id
            questions.append(q_data)
        
        return questions
    except Exception as e:
        print(f"Error fetching questions from Firestore: {e}")
        return None

def save_user_profile(firebase_id: str, profile_data: dict):
    """
    Saves or updates user profile data in Firestore.
    """
    try:
        if not firebase_admin._apps:
            init_firebase()
            
        db = firestore.client()
        user_ref = db.collection("users").document(firebase_id)
        
        # Use merge=True to not overwrite assessment results or other data
        user_ref.set(profile_data, merge=True)
        print(f"Successfully saved user profile for {firebase_id}")
        return True
    except Exception as e:
        print(f"Error saving user profile to Firestore: {e}")
        return False

def get_user_profile(firebase_id: str):
    """
    Retrieves full user document from Firestore.
    """
    try:
        if not firebase_admin._apps:
            init_firebase()
            
        db = firestore.client()
        user_ref = db.collection("users").document(firebase_id)
        doc = user_ref.get()
        
        if doc.exists:
            return doc.to_dict()
        return None
    except Exception as e:
        print(f"Error getting user profile from Firestore: {e}")
        return None
