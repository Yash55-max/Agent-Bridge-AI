"""Minimal orchestrator stub for local dev.

This provides placeholder functions for starting/stopping MCP server containers
and a simple in-memory registry used by the rest of the app during development.
"""
from typing import Dict

registry: Dict[str, Dict] = {}

def register_server(name: str, metadata: Dict) -> str:
    server_id = f"srv_{len(registry)+1}"
    registry[server_id] = {"name": name, "metadata": metadata}
    return server_id

def list_servers():
    return registry
