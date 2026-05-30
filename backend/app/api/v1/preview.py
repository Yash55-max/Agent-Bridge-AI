from fastapi import APIRouter

from app.schemas.preview import PreviewResponse
from app.services.preview_service import get_preview


router = APIRouter()


@router.get("/preview", response_model=PreviewResponse)
async def preview() -> PreviewResponse:
    return get_preview()
