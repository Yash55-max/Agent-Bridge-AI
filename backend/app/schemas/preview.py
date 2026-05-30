from pydantic import BaseModel


class SandboxPreview(BaseModel):
    agents: int
    events: int
    latencyMs: int


class PreviewResponse(BaseModel):
    name: str
    status: str
    tools: list[str]
    sandbox: SandboxPreview
