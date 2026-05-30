from fastapi import APIRouter, Request, Form
from fastapi.responses import JSONResponse
from app.services.generate_service import generate_mcp_server
import json
from urllib.parse import parse_qs


router = APIRouter()


@router.post("/generate")
async def generate(request: Request):
    """Generate MCP server code from a natural language description (stub).

    Supports multiple input formats for robustness:
    - application/json with {"description": "..."}
    - application/x-www-form-urlencoded with `description=...`
    - multipart/form-data with a `description` field
    - query param `?description=...`
    """
    # Read raw body for logging/debugging
    try:
        raw = await request.body()
    except Exception as e:
        raw = b""
        print("[generate] failed to read raw body:", e)

    content_type = request.headers.get("content-type", "")
    description = None

    # Try JSON first
    if raw and "application/json" in content_type:
        try:
            payload = json.loads(raw.decode("utf-8"))
            description = payload.get("description") if isinstance(payload, dict) else None
        except Exception as e:
            print("[generate] JSON parse error:", e)

    # Try form data (multipart)
    if (description is None) and ("multipart/form-data" in content_type):
        try:
            form = await request.form()
            description = form.get("description")
        except Exception as e:
            print("[generate] form parse error:", e)

    # Try urlencoded
    if (description is None) and ("application/x-www-form-urlencoded" in content_type):
        try:
            qs = parse_qs(raw.decode("utf-8")) if raw else {}
            vals = qs.get("description")
            if vals:
                description = vals[0]
        except Exception as e:
            print("[generate] urlencoded parse error:", e)

    # Fallback to query param
    if description is None:
        description = request.query_params.get("description")

    if not description:
        # Return a clear JSON error explaining acceptable inputs
        return JSONResponse(
            content={
                "error": "missing_description",
                "message": "Provide 'description' via JSON, form data, or ?description=...",
                "raw_body": raw.decode("utf-8", errors="replace"),
            },
            status_code=422,
        )

    result = generate_mcp_server(description)
    return JSONResponse(content=result)
