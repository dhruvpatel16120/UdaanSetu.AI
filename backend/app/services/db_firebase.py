import os
import firebase_admin
from firebase_admin import credentials, firestore
import asyncio
from functools import partial
import time

# Global Firestore client to be reused
_db = None
_firebase_initialized = False

# Simple In-Memory Cache
# Format: { "key": { "data": struct, "expires": timestamp } }
_cache = {}
CACHE_TTL = 300  # 5 minutes

def _get_cache(key):
    entry = _cache.get(key)
    if entry and entry["expires"] > time.time():
        return entry["data"]
    if entry:
        _cache.pop(key, None)
    return None

def _set_cache(key, data):
    # Optional: limit cache size
    if len(_cache) > 1000:
         _cache.clear()
    _cache[key] = {
        "data": data,
        "expires": time.time() + CACHE_TTL
    }

def _invalidate_cache(key):
    _cache.pop(key, None)

def get_db():
    global _db, _firebase_initialized
    if not _firebase_initialized:
        init_firebase()
        _firebase_initialized = True
    if _db is None:
        _db = firestore.client()
    return _db

import json

# Initialize Firebase (Singleton)
def init_firebase():
    if not firebase_admin._apps:
        try:
            # 1. Try File Path (Preferred for Local Dev)
            possible_paths = [
                "serviceAccountKey.json",
                os.path.join(os.getcwd(), "serviceAccountKey.json"),
                os.path.join(os.path.dirname(__file__), "../../serviceAccountKey.json"),
                os.path.join(os.path.dirname(__file__), "../../../serviceAccountKey.json")
            ]
            
            cred_path = None
            for p in possible_paths:
                if os.path.exists(p):
                    cred_path = p
                    break

            if cred_path:
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                print(f"Firebase Admin Initialized with {cred_path}")
                return

            # 2. Try Environment Variable (Best for Cloud/Vercel)
            # Support multiple possible env var names
            env_creds = os.getenv("FIREBASE_SERVICE_ACCOUNT") or os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
            if env_creds:
                try:
                    cred_dict = json.loads(env_creds)
                    # Force the project ID from the creds or env to ensure no mismatch
                    project_id = cred_dict.get("project_id", "udaansetu45")
                    cred = credentials.Certificate(cred_dict)
                    firebase_admin.initialize_app(cred, {
                        'projectId': project_id
                    })
                    print(f"Firebase Admin Initialized from Environment Variable for project: {project_id}")
                    return
                except json.JSONDecodeError as e:
                    print(f"❌ Failed to parse Firebase Environment Variable: {e}")
                except Exception as e:
                    print(f"❌ Error during Firebase initialization from Env: {e}")

            print("⚠️ Warning: No Firebase credentials found (JSON file or Environment Variable). Firestore saving will fail.")
        except Exception as e:
            print(f"Failed to initialize Firebase: {e}")

# --- Internal Blocking Helpers (Run in ThreadPool) ---
from app.core.exceptions import DatabaseException

# --- Internal Blocking Helpers (Run in ThreadPool) ---
def _save_assessment_sync(user_id: str, data: dict):
    try:
        db = get_db()
        doc_ref = db.collection("assessments").document(user_id)
        update_data = {
            "assessment_result": data,
            "last_updated": firestore.SERVER_TIMESTAMP
        }
        doc_ref.set(update_data, merge=True)
        return True
    except Exception as e:
        print(f"🔥 Firebase Sync Error (Save Assessment): {e}")
        if "invalid_grant" in str(e).lower():
             print("🚨 AUTH ALERT: Invalid JWT Signature detected.")
        raise DatabaseException(message=f"Failed to save assessment: {str(e)}")

def _get_assessment_sync(user_id: str):
    try:
        db = get_db()
        doc = db.collection("assessments").document(user_id).get()
        if doc.exists:
            return doc.to_dict().get("assessment_result", None)
        return None
    except Exception as e:
        print(f"🔥 Firebase Sync Error (Get Assessment): {e}")
        raise DatabaseException(message=f"Failed to retrieve assessment: {str(e)}")

def _save_profile_sync(user_id: str, data: dict):
    try:
        db = get_db()
        db.collection("users").document(user_id).set(data, merge=True)
        return True
    except Exception as e:
        print(f"🔥 Firebase Sync Error (Save Profile): {e}")
        raise DatabaseException(message=f"Failed to save profile: {str(e)}")

def _get_profile_sync(user_id: str):
    try:
        db = get_db()
        doc = db.collection("users").document(user_id).get()
        if doc.exists:
            return doc.to_dict()
        return None
    except Exception as e:
        print(f"🔥 Firebase Sync Error (Get Profile): {e}")
        raise DatabaseException(message=f"Failed to retrieve profile: {str(e)}")

# --- Async Public Interface ---

async def save_assessment_result(user_id: str, data: dict):
    try:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, partial(_save_assessment_sync, user_id, data))
        # Invalidate cache
        _invalidate_cache(f"assessment:{user_id}")
        print(f"Async saved assessment for {user_id}")
        return True
    except Exception as e:
        print(f"Error saving assessment: {e}")
        return False

async def get_assessment_result(user_id: str):
    # CKECK CACHE 1st
    cached = _get_cache(f"assessment:{user_id}")
    if cached: 
        return cached

    try:
        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(None, partial(_get_assessment_sync, user_id))
        if result:
            _set_cache(f"assessment:{user_id}", result)
        return result
    except Exception as e:
        print(f"Error getting assessment: {e}")
        return None

async def save_user_profile(user_id: str, profile_data: dict):
    try:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, partial(_save_profile_sync, user_id, profile_data))
        _invalidate_cache(f"profile:{user_id}")
        print(f"Async saved profile for {user_id}")
        return True
    except Exception as e:
        print(f"Error saving profile: {e}")
        return False

async def get_user_profile(user_id: str):
    cached = _get_cache(f"profile:{user_id}")
    if cached: return cached

    try:
        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(None, partial(_get_profile_sync, user_id))
        if result:
            _set_cache(f"profile:{user_id}", result)
        return result
    except Exception as e:
        print(f"Error getting profile: {e}")
        return None

# --- Career Report Specific (New Separate Collection) ---

def _save_career_report_sync(user_id: str, data: dict):
    try:
        db = get_db()
        db.collection("career_reports").document(user_id).set({
            "report": data,
            "updated_at": firestore.SERVER_TIMESTAMP
        }, merge=True)
        return True
    except Exception as e:
        print(f"🔥 Firebase Sync Error (Save Career Report): {e}")
        if "invalid_grant" in str(e).lower():
            print("🚨 AUTH ALERT: Invalid JWT Signature detected. Please sync system clock or check Service Account.")
        return False

def _get_career_report_sync(user_id: str):
    try:
        db = get_db()
        doc = db.collection("career_reports").document(user_id).get()
        if doc.exists:
            return doc.to_dict().get("report")
        return None
    except Exception as e:
        print(f"🔥 Firebase Sync Error (Get Career Report): {e}")
        if "invalid_grant" in str(e).lower():
            print("🚨 AUTH ALERT: Invalid JWT Signature detected. Please sync system clock or check Service Account.")
        return None

async def save_career_report(user_id: str, data: dict):
    try:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, partial(_save_career_report_sync, user_id, data))
        _invalidate_cache(f"report:{user_id}")
        return True
    except Exception as e:
        print(f"Error saving career report: {e}")
        return False

async def get_career_report(user_id: str):
    cached = _get_cache(f"report:{user_id}")
    if cached: return cached

    try:
        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(None, partial(_get_career_report_sync, user_id))
        if result:
            _set_cache(f"report:{user_id}", result)
        return result
    except Exception as e:
        print(f"Error getting career report: {e}")
        return None
