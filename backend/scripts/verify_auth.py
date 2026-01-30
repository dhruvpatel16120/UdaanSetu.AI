# import pytest (Removed dependency)
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import get_current_user_uid

# Mock the dependency to test logic without real Firebase Token
def mock_get_current_user_uid():
    return "test_mock_uid"

client = TestClient(app)

def test_unauthorized_access():
    # Attempt to access secured endpoint without token
    response = client.get("/api/user/me")
    assert response.status_code == 403, f"Expected 403 (Forbidden) or 401 (Unauthorized) but got {response.status_code}"
    # Note: HTTPBearer without token returns 403 Forbidden by default in FastAPI or 401 depending on configuration.
    
def test_authorized_access_with_mock():
    # Override dependency
    app.dependency_overrides[get_current_user_uid] = mock_get_current_user_uid
    
    # Attempt access (should fail only if user Logic not found in DB, but Auth passes)
    response = client.get("/api/user/me")
    
    # If user not found in DB, it returns 404. If Auth fails, 401. 
    # Getting 404 means Auth passed.
    assert response.status_code in [200, 404], f"Expected 200/404 (Auth Passed) but got {response.status_code}"
    
    app.dependency_overrides = {}

if __name__ == "__main__":
    print("🧪 Running Auth Security Verification...")
    try:
        test_unauthorized_access()
        print("✅ Unauthorized Access Blocked (Pass)")
    except AssertionError as e:
        print(f"❌ Unauthorized Access Failed: {e}")

    try:
        test_authorized_access_with_mock()
        print("✅ Authorized Access Logic (Pass)")
    except AssertionError as e:
         print(f"❌ Authorized Access Failed: {e}")
