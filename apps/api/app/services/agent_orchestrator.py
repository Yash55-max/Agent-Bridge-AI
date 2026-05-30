import asyncio
import httpx
from typing import List, Dict, Any
from uuid import uuid4


class AgentOrchestrator:
    """A minimal orchestrator that simulates agents by making HTTP calls to MCP servers.
    This is a lightweight stub for local dev and demo purposes (no LLM).
    """

    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}

    async def start_session(self, mcp_base_url: str, agents: List[Dict[str, Any]]) -> str:
        session_id = str(uuid4())
        self.sessions[session_id] = {"mcp": mcp_base_url, "agents": agents, "events": []}
        # run an example simulation loop in background
        asyncio.create_task(self._run_demo(session_id))
        return session_id

    async def _run_demo(self, session_id: str):
        session = self.sessions[session_id]
        mcp = session["mcp"].rstrip("/")
        agents = session["agents"]
        async with httpx.AsyncClient(timeout=10.0) as client:
            for turn in range(3):
                for agent in agents:
                    # agents call a `tools/list` endpoint on the MCP server if available
                    try:
                        r = await client.get(f"{mcp}/tools/list")
                        result = r.json() if r.status_code == 200 else {"error": r.status_code}
                    except Exception as e:
                        result = {"error": str(e)}
                    event = {"type": "mcp:tool_result", "agent": agent.get("name"), "result": result}
                    session["events"].append(event)
                    # small delay to simulate runtime
                    await asyncio.sleep(0.3)
        # mark completion
        session["events"].append({"type": "simulation:done", "totalTurns": 3})

    def get_events(self, session_id: str):
        return self.sessions.get(session_id, {}).get("events", [])
