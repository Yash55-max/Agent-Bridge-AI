import json
import os
from typing import Dict, Any, List
from uuid import uuid4

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
REGISTRY_FILE = os.path.join(DATA_DIR, "registry.json")

os.makedirs(DATA_DIR, exist_ok=True)


class MCPRegistry:
    def __init__(self, path: str = REGISTRY_FILE):
        self.path = path
        if not os.path.exists(self.path):
            with open(self.path, "w", encoding="utf-8") as f:
                json.dump([], f)

    def _load(self) -> List[Dict[str, Any]]:
        with open(self.path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _save(self, data: List[Dict[str, Any]]):
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def list(self) -> List[Dict[str, Any]]:
        return self._load()

    def create(self, name: str, spec: str, code: str) -> Dict[str, Any]:
        data = self._load()
        entry = {
            "id": str(uuid4()),
            "name": name,
            "natural_language_spec": spec,
            "generated_code": code,
            "status": "draft",
        }
        data.append(entry)
        self._save(data)
        return entry

    def get(self, id: str) -> Dict[str, Any]:
        data = self._load()
        for e in data:
            if e.get("id") == id:
                return e
        raise KeyError("not found")

    def update(self, id: str, patch: Dict[str, Any]) -> Dict[str, Any]:
        data = self._load()
        for i, e in enumerate(data):
            if e.get("id") == id:
                data[i].update(patch)
                self._save(data)
                return data[i]
        raise KeyError("not found")

    def delete(self, id: str):
        data = self._load()
        data = [e for e in data if e.get("id") != id]
        self._save(data)
