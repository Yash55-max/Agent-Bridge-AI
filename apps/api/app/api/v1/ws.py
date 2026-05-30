from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

# Simple in-memory manager for websockets per session
class ConnectionManager:
    def __init__(self):
        self.active: dict[str, list[WebSocket]] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active.setdefault(session_id, []).append(websocket)

    def disconnect(self, session_id: str, websocket: WebSocket):
        conns = self.active.get(session_id, [])
        if websocket in conns:
            conns.remove(websocket)

    async def broadcast(self, session_id: str, message: dict):
        conns = self.active.get(session_id, [])
        for ws in list(conns):
            try:
                await ws.send_json(message)
            except Exception:
                conns.remove(ws)

manager = ConnectionManager()


@router.websocket("/ws/sandbox/{session_id}")
async def ws_sandbox(websocket: WebSocket, session_id: str):
    await manager.connect(session_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # echo back for now
            await manager.broadcast(session_id, {"echo": data})
    except WebSocketDisconnect:
        manager.disconnect(session_id, websocket)
