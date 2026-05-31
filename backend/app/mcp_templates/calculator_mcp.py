from pydantic import BaseModel, Field

try:
    # fastmcp is optional in the dev environment; provide a simple fallback
    from fastmcp import FastMCP
except Exception:
    FastMCP = None


class CalcParams(BaseModel):
    a: float = Field(..., description="First operand", le=1e12, ge=-1e12)
    b: float = Field(..., description="Second operand", le=1e12, ge=-1e12)


if FastMCP is not None:
    mcp = FastMCP("Calculator")


    @mcp.tool()
    def add(a: float, b: float) -> float:
        """Add two numbers together."""
        return a + b


    @mcp.tool()
    def multiply(a: float, b: float) -> float:
        """Multiply two numbers together."""
        return a * b


    if __name__ == "__main__":
        # Run as an MCP server over SSE transport
        mcp.run(transport="sse", port=8080)
else:
    # Fallback FastAPI-style implementation for environments without fastmcp
    from fastapi import FastAPI

    app = FastAPI(title="Calculator MCP (fallback)")


    @app.post("/tools/call")
    async def call_tool(payload: dict):
        name = payload.get("name")
        params = payload.get("params") or {}
        data = CalcParams(**params)
        if name == "add":
            return {"result": data.a + data.b}
        if name == "multiply":
            return {"result": data.a * data.b}
        return {"error": "unknown tool"}
