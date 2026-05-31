from __future__ import annotations

import re
import time
from threading import Lock


_state_lock = Lock()
_latest_state: dict | None = None


def _extract_tools(code: str) -> list[str]:
    names: list[str] = []
    for match in re.finditer(r"^\s*(?:async\s+)?def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(", code, flags=re.M):
        name = match.group(1)
        if name in {"main", "health", "startup", "shutdown"}:
            continue
        names.append(name)
    # Keep order while removing duplicates
    seen: set[str] = set()
    ordered: list[str] = []
    for name in names:
        if name not in seen:
            seen.add(name)
            ordered.append(name)
    return ordered


def store_latest_generation(server_name: str, generated_code: str, provider: str | None = None, model: str | None = None) -> None:
    global _latest_state
    with _state_lock:
        _latest_state = {
            "name": server_name or "generated-server",
            "generated_code": generated_code or "",
            "status": "ready",
            "tools": _extract_tools(generated_code or ""),
            "sandbox": {
                "agents": 0,
                "events": 0,
                "latencyMs": 0,
            },
            "meta": {
                "provider": provider,
                "model": model,
                "updatedAt": int(time.time() * 1000),
            },
        }


def get_latest_generation_preview() -> dict:
    with _state_lock:
        if _latest_state is None:
            return {
                "name": "No generation yet",
                "status": "idle",
                "tools": [],
                "sandbox": {
                    "agents": 0,
                    "events": 0,
                    "latencyMs": 0,
                },
            }
        return {
            "name": _latest_state.get("name", "generated-server"),
            "status": _latest_state.get("status", "ready"),
            "tools": list(_latest_state.get("tools", [])),
            "sandbox": dict(_latest_state.get("sandbox", {"agents": 0, "events": 0, "latencyMs": 0})),
        }


def get_latest_generated_code() -> str:
    with _state_lock:
        if _latest_state is None:
            return ""
        return str(_latest_state.get("generated_code", ""))
