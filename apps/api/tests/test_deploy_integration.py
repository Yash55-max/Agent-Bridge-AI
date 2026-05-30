import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.mcp_registry import MCPRegistry

client = TestClient(app)


def test_deploy_integration(monkeypatch):
    reg = MCPRegistry()
    # create a server entry with generated_code
    entry = reg.create("int-test", "desc", "print('hello-deploy')")
    # ensure registry has no container initially

    class FakeDocker:
        def build_from_code(self, server_id, code, tag):
            assert server_id == entry["id"]
            assert "hello-deploy" in code
            return True

        def run_container(self, tag, name, port_map=None, memory=None, cpus=None):
            return "fake-cid-int-1"

        def health_check(self, name):
            return True

        def get_logs(self, name, tail=200):
            return "init-log-line\nstarted"

        def stream_logs(self, name):
            yield "stream-init\n"
            yield "stream-next\n"

    monkeypatch.setattr("app.api.v1.servers.docker", FakeDocker())

    payload = {"server_id": entry["id"], "image_tag": "int:latest", "port": 8010}
    r = client.post("/api/v1/servers/deploy", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data.get("container_id") == "fake-cid-int-1"

    # registry updated
    updated = reg.get(entry["id"])
    assert updated.get("status") == "running"
    assert updated.get("container_id") == "fake-cid-int-1"

    # health
    r2 = client.get(f"/api/v1/servers/{entry['id']}/health")
    assert r2.status_code == 200
    assert r2.json().get("healthy") is True

    # logs GET
    r3 = client.get(f"/api/v1/servers/{entry['id']}/logs")
    assert r3.status_code == 200
    assert "init-log-line" in r3.text

    # stream (SSE)
    r4 = client.get(f"/api/v1/servers/{entry['id']}/logs/stream")
    assert r4.status_code == 200
    assert "data: stream-init" in r4.text
    assert "data: stream-next" in r4.text
