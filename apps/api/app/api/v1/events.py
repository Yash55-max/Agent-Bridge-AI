from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from ...services.mcp_registry import MCPRegistry
import os, json

router = APIRouter()
reg = MCPRegistry()
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")
EVENTS_DIR = os.path.join(DATA_DIR, "events")
os.makedirs(EVENTS_DIR, exist_ok=True)


class PersistEvent(BaseModel):
    line: str
    ts: int | None = None
    type: str = "log"


@router.post("/servers/{server_id}/events")
async def post_event(server_id: str, ev: PersistEvent):
    try:
        reg.get(server_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="server not found")
    path = os.path.join(EVENTS_DIR, f"{server_id}.jsonl")
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(ev.dict()) + "\n")
    return {"ok": True}


@router.get("/servers/{server_id}/events")
async def get_events(server_id: str):
    try:
        reg.get(server_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="server not found")
    path = os.path.join(EVENTS_DIR, f"{server_id}.jsonl")
    out = []
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    out.append(json.loads(line))
                except Exception:
                    continue
    return {"events": out}
