from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class ASGILoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            if request.method in ("POST", "PUT", "PATCH"):
                raw = await request.body()
                print("[ASGI LOG] PATH:", request.url.path)
                print("[ASGI LOG] HEADERS:", dict(request.headers))
                try:
                    print("[ASGI LOG] RAW BODY:", raw.decode("utf-8"))
                except Exception:
                    print("[ASGI LOG] RAW BODY (bytes):", raw)
                # Re-inject the body for downstream consumers
                async def receive():
                    return {"type": "http.request", "body": raw}
                request._receive = receive
        except Exception as e:
            print("[ASGI LOG] middleware error:", e)
        response = await call_next(request)
        return response

from app.api.router import api_router
from app.core.config import get_settings


settings = get_settings()
app = FastAPI(title=settings.app_name, version=settings.app_version)

# Add ASGI logging middleware to record raw incoming request bytes for debugging
app.add_middleware(ASGILoggingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/_echo")
async def _echo(request: Request):
    raw = await request.body()
    text = raw.decode("utf-8") if raw else ""
    print("[_echo] raw:", raw)
    return {"raw": text}
