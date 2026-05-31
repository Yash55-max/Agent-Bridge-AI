from fastapi import APIRouter, Body

from app.schemas.preview import PreviewResponse
from app.services.preview_service import get_preview
from app.services.generation_state import store_latest_generation


router = APIRouter()


@router.post("/preview/deploy")
async def deploy_preview(payload: dict = Body(...)):
    server_name = payload.get("server_name") or "deployed-server"
    generated_code = payload.get("generated_code") or ""
    store_latest_generation(server_name=server_name, generated_code=generated_code)
    return {"deployed": True, "server_name": server_name}


@router.get("/preview", response_model=PreviewResponse)
async def preview() -> PreviewResponse:
    return get_preview()
