def generate_mcp_server(description: str) -> dict:
    # This is a minimal stub that returns a mock Python FastMCP server.
    server_name = "generated_server"
    code = """# Auto-generated MCP server (stub)
from fastapi import FastAPI

app = FastAPI()

@app.get('/tools/list')
async def list_tools():
    return ['echo', 'time']

@app.get('/health')
async def health():
    return {'status': 'ok'}
    """

    return {
        "server_name": server_name,
        "generated_code": code,
        "note": "This is a stub generator. Integrate LLM in generate_service for real generation.",
    }
