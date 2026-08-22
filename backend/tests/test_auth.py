from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_signin_invalid_credentials():
    response = client.post("/auth/signin", json={
        "email": "invalid@dayflow.com",
        "password": "WrongPassword123"
    })
    assert response.status_code == 401