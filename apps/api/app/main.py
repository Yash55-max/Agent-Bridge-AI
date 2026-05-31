from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.v1 import servers, sandbox, ws, events
from .core.config import get_settings
from pydantic import BaseModel
from .services.generate_service import generate_mcp_server
from fastapi.responses import StreamingResponse
import io
import zipfile
import re

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
    prompt: str | None = None
    description: str | None = None
    download: str | None = None


def _resolve_prompt(request: GenerateRequest) -> str | None:
    prompt = request.prompt or request.description
    if prompt:
        prompt = prompt.strip()
    return prompt or None

@app.post("/api/v1/generate")
@app.post("/api/v1/generate-mcp")
async def generate(req: GenerateRequest):
    prompt = _resolve_prompt(req)
    if not prompt:
        return {
            "error": "missing_prompt",
            "message": "Provide 'prompt' or 'description' in the request body.",
        }

    result = generate_mcp_server(prompt)

    if req.download and str(req.download).lower() == "zip":
        code = result.get("generated_code", "")

        def parse_code_to_files(text: str) -> dict:
            files: dict[str, str] = {}
            blocks = re.findall(r"```(?:[a-zA-Z0-9]+)?\n(.*?)```", text, flags=re.S)
            if blocks:
                for idx, block in enumerate(blocks, start=1):
                    lines = block.strip().splitlines()
                    filename = None
                    if lines:
                        m = re.match(r"^\s*(?:#|//)\s*file\s*[:=]\s*(\S+)", lines[0], flags=re.I)
                        if m:
                            filename = m.group(1)
                            block = "\n".join(lines[1:])
                    if not filename:
                        filename = f"file_{idx}.py"
                    files[filename] = block
                return files
            return {"generated.py": text}

        files = parse_code_to_files(code)
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
            for name, content in files.items():
                z.writestr(name, content)
        buf.seek(0)
        return StreamingResponse(buf, media_type="application/zip", headers={"Content-Disposition": "attachment; filename=generated_mcp.zip"})

    return result
