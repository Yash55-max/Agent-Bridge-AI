import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.mcp_registry import MCPRegistry

client = TestClient(app)


def test_deploy_flow(monkeypatch, tmp_path):
    reg = MCPRegistry()
    # create a server entry
    entry = reg.create("test", "desc", "print('hello')")

    # mock docker manager methods
    class FakeDocker:
        def build_from_code(self, server_id, code, tag):
            assert server_id == entry["id"]
            assert "print('hello')" in code
            return True

        def run_container(self, tag, name, port_map=None, memory=None, cpus=None):
            return "fake-cid-123"

    monkeypatch.setattr("app.api.v1.servers.docker", FakeDocker())

    payload = {"server_id": entry["id"], "image_tag": "test:latest", "port": 8001}
    r = client.post("/api/v1/servers/deploy", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data.get("container_id") == "fake-cid-123"

    # verify registry updated
    updated = reg.get(entry["id"])
    assert updated.get("status") == "running"
    assert updated.get("container_id") == "fake-cid-123"
