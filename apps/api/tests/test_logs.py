import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.mcp_registry import MCPRegistry

client = TestClient(app)


def test_logs_get(monkeypatch):
    reg = MCPRegistry()
    entry = reg.create("test", "desc", "print('hello')")
    # set a fake container id in registry
    reg.update(entry["id"], {"container_id": "fake-cid-logs"})

    class FakeDocker:
        def get_logs(self, name, tail=200):
            assert name == "fake-cid-logs"
            return "line1\nline2\n"

    monkeypatch.setattr("app.api.v1.servers.docker", FakeDocker())

    r = client.get(f"/api/v1/servers/{entry['id']}/logs")
    assert r.status_code == 200
    assert "line1" in r.text


def test_logs_stream(monkeypatch):
    reg = MCPRegistry()
    entry = reg.create("test-stream", "desc", "print('hello')")
    reg.update(entry["id"], {"container_id": "fake-cid-stream"})

    class FakeDocker:
        def stream_logs(self, name):
            assert name == "fake-cid-stream"
            yield "stream-line-1\n"
            yield "stream-line-2\n"

    monkeypatch.setattr("app.api.v1.servers.docker", FakeDocker())

    r = client.get(f"/api/v1/servers/{entry['id']}/logs/stream")
    assert r.status_code == 200
    # SSE frames should include 'data: '
    assert "data: stream-line-1" in r.text
    assert "data: stream-line-2" in r.text
