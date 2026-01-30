import os
import firebase_admin
from firebase_admin import credentials, firestore
import asyncio
from functools import partial
import time

# Simple In-Memory Cache
# Format: { "key": { "data": struct, "expires": timestamp } }
_cache = {}
CACHE_TTL = 300  # 5 minutes

def _get_cache(key):
    entry = _cache.get(key)
    if entry and entry["expires"] > time.time():
        return entry["data"]
    if entry:
        del _cache[key]
    return None

def _set_cache(key, data):
    _cache[key] = {
        "data": data,
        "expires": time.time() + CACHE_TTL
    }

def _invalidate_cache(key):
    if key in _cache:
        del _cache[key]

import json

# Initialize Firebase (Singleton)
def init_firebase():
    if not firebase_admin._apps:
        try:
            # 1. Try Environment Variable (Best for Vercel)
            env_creds = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
            if env_creds:
                try:
                    cred_dict = json.loads(env_creds)
                    cred = credentials.Certificate(cred_dict)
                    firebase_admin.initialize_app(cred)
                    print("Firebase Admin Initialized from Environment Variable")
                    return
                except json.JSONDecodeError as e:
                    print(f"❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: {e}")

            # 2. Try File Path (Fallback for Local)
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
                print("Warning: serviceAccountKey.json not found and FIREBASE_SERVICE_ACCOUNT_JSON not set. Firestore saving will fail.")
        except Exception as e:
            print(f"Failed to initialize Firebase: {e}")

# --- Internal Blocking Helpers (Run in ThreadPool) ---
from app.core.exceptions import DatabaseException

# --- Internal Blocking Helpers (Run in ThreadPool) ---
def _save_assessment_sync(user_id: str, data: dict):
    try:
        if not firebase_admin._apps: init_firebase()
        db = firestore.client()
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
        if not firebase_admin._apps: init_firebase()
        db = firestore.client()
        doc = db.collection("assessments").document(user_id).get()
        if doc.exists:
            return doc.to_dict().get("assessment_result", None)
        return None
    except Exception as e:
        print(f"🔥 Firebase Sync Error (Get Assessment): {e}")
        raise DatabaseException(message=f"Failed to retrieve assessment: {str(e)}")

def _save_profile_sync(user_id: str, data: dict):
    try:
        if not firebase_admin._apps: init_firebase()
        db = firestore.client()
        db.collection("users").document(user_id).set(data, merge=True)
        return True
    except Exception as e:
        print(f"🔥 Firebase Sync Error (Save Profile): {e}")
        raise DatabaseException(message=f"Failed to save profile: {str(e)}")

def _get_profile_sync(user_id: str):
    try:
        if not firebase_admin._apps: init_firebase()
        db = firestore.client()
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
        if not firebase_admin._apps: init_firebase()
        db = firestore.client()
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
        if not firebase_admin._apps: init_firebase()
        db = firestore.client()
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
