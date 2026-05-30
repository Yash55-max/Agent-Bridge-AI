import tempfile
import os
from apps.api.app.services.mcp_registry import MCPRegistry


def test_registry_create_and_get(tmp_path):
    f = tmp_path / "reg.json"
    reg = MCPRegistry(path=str(f))
    entry = reg.create("MyServer", "desc", "print('hi')")
    assert entry["name"] == "MyServer"
    found = reg.get(entry["id"])
    assert found["generated_code"] == "print('hi')"


def test_registry_update_and_delete(tmp_path):
    f = tmp_path / "reg.json"
    reg = MCPRegistry(path=str(f))
    entry = reg.create("S1", "d", "c")
    reg.update(entry["id"], {"status": "running"})
    updated = reg.get(entry["id"])
    assert updated["status"] == "running"
    reg.delete(entry["id"])
    try:
        reg.get(entry["id"])
        assert False, "should have raised"
    except KeyError:
        assert True
