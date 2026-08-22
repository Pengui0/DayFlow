from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_profile_unauthorized():
    response = client.get("/employees/me")
    assert response.status_code == 401