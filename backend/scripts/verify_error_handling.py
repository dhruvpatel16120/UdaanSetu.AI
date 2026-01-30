import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.core.exceptions import DatabaseException

client = TestClient(app)

# Test Catching Google Auth Error Globally
def test_google_auth_crash_handling():
    with patch("app.services.user_service.get_user_by_firebase_id") as mock_get:
        # Simulate the specific Google RefreshError message in a generic Exception
        mock_get.side_effect = Exception("invalid_grant: Invalid JWT Signature.")
        
        # We need to bypass the security check to reach the service layer logic,
        # OR we can test the handler directly. Easier to test the handler via an endpoint that fails.
        # Let's mock the security dependency to let us through.
        app.dependency_overrides = {} # Reset
        from app.core.security import get_current_user_uid
        app.dependency_overrides[get_current_user_uid] = lambda: "test_uid"

        response = client.get("/api/user/me")
        
        print("\n--> Response:", response.json())
        assert response.status_code == 503
        assert response.json()["error"]["code"] == "auth_configuration_error"
        assert "System authentication service is temporarily unavailable" in response.json()["error"]["message"]

if __name__ == "__main__":
    try:
        test_google_auth_crash_handling()
        print("✅ Global Exception Handler correctly catches Auth Refresh Errors (503 Service Unavailable)")
    except AssertionError as e:
        print(f"❌ Test Failed: {e}")
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
