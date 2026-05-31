from fastapi import APIRouter

from app.api.v1.preview import router as preview_router
from app.api.v1.generate import router as generate_router
from app.api.v1.ws import router as ws_router
from app.api.v1.sandbox import router as sandbox_router
from app.api.v1.tools import router as tools_router


api_router = APIRouter()
api_router.include_router(preview_router, prefix="/v1", tags=["preview"])
api_router.include_router(generate_router, prefix="/v1", tags=["generate"])
api_router.include_router(ws_router, prefix="/v1", tags=["ws"])
api_router.include_router(sandbox_router, prefix="/v1", tags=["sandbox"])
api_router.include_router(tools_router, prefix="/v1", tags=["tools"])
