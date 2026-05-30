from fastapi import APIRouter, WebSocket

router = APIRouter()


@router.websocket("/sandbox/{session_id}")
async def sandbox_ws(websocket: WebSocket, session_id: str):
    await websocket.accept()
    try:
        await websocket.send_json({"event": "connected", "session_id": session_id})
        while True:
            data = await websocket.receive_text()
            # echo back for now
            await websocket.send_json({"event": "echo", "message": data})
    except Exception:
        await websocket.close()
