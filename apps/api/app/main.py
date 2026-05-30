from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.v1 import servers, sandbox, ws, events
from .core.config import get_settings
from pydantic import BaseModel

app = FastAPI(title="AgentBridge API")
settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(servers.router, prefix="/api/v1")
app.include_router(sandbox.router, prefix="/api/v1")
app.include_router(ws.router, prefix="/api/v1")
app.include_router(events.router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/v1/config")
async def config():
    return {
        "app_name": settings.app_name,
        "environment": settings.environment,
        "database_url": settings.database_url,
    }

class GenerateRequest(BaseModel):
    description: str

@app.post("/api/v1/generate")
async def generate(req: GenerateRequest):
    # stubbed generator response (kept for compatibility)
    return {
        "server_name": "generated_server",
        "generated_code": "# Auto-generated MCP server (stub)\n",
        "note": "This is a stub generator. Integrate LLM for real generation."
    }
