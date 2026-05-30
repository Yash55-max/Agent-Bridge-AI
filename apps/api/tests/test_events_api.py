from fastapi.testclient import TestClient
from app.main import app
from app.services.mcp_registry import MCPRegistry

client = TestClient(app)


def test_post_and_get_events():
    reg = MCPRegistry()
    entry = reg.create("evt-test", "desc", "print('ok')")
    sid = entry["id"]

    r = client.post(f"/api/v1/servers/{sid}/events", json={"line": "first", "ts": 123, "type": "log"})
    assert r.status_code == 200

    r2 = client.get(f"/api/v1/servers/{sid}/events")
    assert r2.status_code == 200
    j = r2.json()
    assert isinstance(j.get("events"), list)
    assert any(e.get("line") == "first" for e in j.get("events"))
