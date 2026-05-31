from fastapi import APIRouter, WebSocket
from app.services.event_broadcaster import manager

router = APIRouter()


@router.websocket("/ws/sandbox/{session_id}")
async def sandbox_ws(websocket: WebSocket, session_id: str):
    await manager.connect(session_id, websocket)
    try:
        await manager.broadcast(session_id, {"event": "connected", "session_id": session_id})
        while True:
            data = await websocket.receive_text()
            # echo back for now
            await manager.broadcast(session_id, {"event": "echo", "message": data})
    except Exception:
        manager.disconnect(session_id, websocket)
