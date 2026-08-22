from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_apply_leave_unauthorized():
    response = client.post("/leave-requests/", json={
        "leave_type": "paid",
        "start_date": "2026-09-01",
        "end_date": "2026-09-05",
        "remarks": "Holiday"
    })
    assert response.status_code == 401