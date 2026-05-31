from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ...services.agent_orchestrator import AgentOrchestrator
import json
from pathlib import Path

router = APIRouter()
orch = AgentOrchestrator()
DATA_DIR = Path(__file__).resolve().parents[2] / "data"
SESSIONS_DIR = DATA_DIR / "sessions"


def _ensure_sessions_dir() -> Path:
    SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
    return SESSIONS_DIR


class AgentConfig(BaseModel):
    name: str
    role: str = ""
    goal: str = ""


class StartSessionReq(BaseModel):
    server_url: str
    agents: list[AgentConfig] = []


@router.post("/sandbox/start")
async def start_session(req: StartSessionReq):
    agents = [a.dict() for a in req.agents] if req.agents else []
    if not agents:
        agents = [
            {"name": "Agent 1: The Data Analyst", "role": "analyst", "goal": "Extract data, build structured findings, and summarize insights."},
            {"name": "Agent 2: The Supervisor", "role": "supervisor", "goal": "Check protocol steps, validate outputs, and format the final result."},
        ]
    session_id = await orch.start_session(req.server_url, agents)
    path = _ensure_sessions_dir() / f"{session_id}.json"
    with path.open("w", encoding="utf-8") as f:
        json.dump({"session_id": session_id, "server_url": req.server_url, "agents": agents, "events": []}, f, indent=2)
    return {"session_id": session_id}


@router.get("/sandbox/{session_id}/events")
async def get_events(session_id: str):
    events = orch.get_events(session_id)
    return {"events": events}


@router.get("/sandbox/{session_id}/replay")
async def replay(session_id: str):
    path = _ensure_sessions_dir() / f"{session_id}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="not found")
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


class CommandReq(BaseModel):
    command: str


@router.post("/sandbox/command")
async def send_command(req: CommandReq):
    # Append the command to all active sessions and broadcast
    appended = 0
    for session_id, session in orch.sessions.items():
        event = {"type": "command", "command": req.command}
        session["events"].append(event)
        appended += 1
        try:
            # best-effort broadcast
            from app.services.event_broadcaster import manager as broadcaster

            await broadcaster.broadcast(session_id, event)
        except Exception:
            pass
    return {"appended": appended}
