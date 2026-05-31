from app.schemas.preview import PreviewResponse, SandboxPreview
from app.services.generation_state import get_latest_generation_preview


def get_preview() -> PreviewResponse:
    current = get_latest_generation_preview()
    sandbox = current.get("sandbox", {})
    return PreviewResponse(
        name=current.get("name", "No generation yet"),
        status=current.get("status", "idle"),
        tools=current.get("tools", []),
        sandbox=SandboxPreview(
            agents=int(sandbox.get("agents", 0)),
            events=int(sandbox.get("events", 0)),
            latencyMs=int(sandbox.get("latencyMs", 0)),
        ),
    )
