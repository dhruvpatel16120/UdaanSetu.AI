"""
================================================================================
UdaanSetu.AI - Security Layer
================================================================================
File: security.py
Purpose: Handles Firebase ID Token verification to secure API endpoints.
================================================================================
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from app.services.db_firebase import init_firebase

# Ensure Firebase is initialized
init_firebase()

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verifies the Firebase ID Token from the Authorization header.
    Returns the user's decoded token payload (uid, email, etc.).
    """
    token = credentials.credentials
    try:
        # Verify the ID token while checking if the token is revoked.
        decoded_token = auth.verify_id_token(token, check_revoked=True)
        return decoded_token
    except auth.RevokedIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token revoked. Please login again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired. Please login again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        error_msg = str(e)
        if "RefreshError" in error_msg or "Invalid JWT" in error_msg:
             # This is a server configuration error, not a user error
             raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication Service Unavailable (System Clock/Config Error).",
            )
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user_uid(user_payload: dict = Depends(get_current_user)) -> str:
    """
    Helper dependency to extract just the UID from the validated token.
    """
    return user_payload.get("uid")
