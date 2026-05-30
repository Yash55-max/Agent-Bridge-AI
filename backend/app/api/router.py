from fastapi import APIRouter

from app.api.v1.preview import router as preview_router
from app.api.v1.generate import router as generate_router
from app.api.v1.ws import router as ws_router


api_router = APIRouter()
api_router.include_router(preview_router, prefix="/v1", tags=["preview"])
api_router.include_router(generate_router, prefix="/v1", tags=["generate"])
api_router.include_router(ws_router, prefix="/v1", tags=["ws"])
