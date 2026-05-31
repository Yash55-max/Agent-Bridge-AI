from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict

from app.services.generation_state import get_latest_generation_preview, get_latest_generated_code

router = APIRouter()


class ToolCall(BaseModel):
    name: str
    params: Dict[str, Any]


@router.get("/tools/list")
async def list_tools():
    preview = get_latest_generation_preview()
    tools = list(preview.get("tools", []))
    code = get_latest_generated_code() or ""
    # Heuristic: if the generated code contains multiply usage, ensure 'multiply' is listed
    if "multiply" not in tools and ("*" in code or "multiply" in code.lower()):
        tools.append("multiply")
    return {"tools": tools}


@router.post("/tools/call")
async def call_tool(call: ToolCall):
    name = call.name
    params = call.params or {}

    # validate numeric params with bounds
    def _get_param(key: str):
        if key not in params:
            raise HTTPException(status_code=400, detail=f"Missing parameter: {key}")
        try:
            num = float(params[key])
        except Exception:
            raise HTTPException(status_code=400, detail=f"Invalid numeric parameter: {key}")
        if not (abs(num) <= 1e12):
            raise HTTPException(status_code=400, detail=f"Parameter '{key}' out of allowed range (-1e12..1e12)")
        return num

    # Implement a safe calculator subset
    if name == "add":
        a = _get_param("a")
        b = _get_param("b")
        return {"result": a + b}

    if name == "multiply":
        a = _get_param("a")
        b = _get_param("b")
        return {"result": a * b}

    if name == "subtract":
        # keep subtract for compatibility but prefer multiply if code suggests
        a = _get_param("a")
        b = _get_param("b")
        return {"result": a - b}

    raise HTTPException(status_code=404, detail="unknown tool")
