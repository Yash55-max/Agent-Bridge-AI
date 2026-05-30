from app.schemas.preview import PreviewResponse, SandboxPreview


def get_preview() -> PreviewResponse:
    return PreviewResponse(
        name="AgentBridge MCP",
        status="running",
        tools=["fetch_github_prs", "analyze_dataset", "create_chart"],
        sandbox=SandboxPreview(agents=2, events=6, latencyMs=42),
    )
