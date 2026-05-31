from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ...services.agent_orchestrator import AgentOrchestrator
import os
import json

router = APIRouter()
orch = AgentOrchestrator()
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")
SESSIONS_DIR = os.path.join(DATA_DIR, "sessions")
os.makedirs(SESSIONS_DIR, exist_ok=True)


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
    path = os.path.join(SESSIONS_DIR, f"{session_id}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"session_id": session_id, "server_url": req.server_url, "agents": agents, "events": []}, f, indent=2)
    return {"session_id": session_id}


@router.get("/sandbox/{session_id}/events")
async def get_events(session_id: str):
    events = orch.get_events(session_id)
    return {"events": events}


@router.get("/sandbox/{session_id}/replay")
async def replay(session_id: str):
    path = os.path.join(SESSIONS_DIR, f"{session_id}.json")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="not found")
    with open(path, "r", encoding="utf-8") as f:
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
