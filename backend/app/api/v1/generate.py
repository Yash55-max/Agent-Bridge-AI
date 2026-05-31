from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, StreamingResponse
from app.services.generate_service import generate_mcp_server
from app.services.generation_state import store_latest_generation
import json
from urllib.parse import parse_qs
import io
import zipfile
import re


router = APIRouter()


def _extract_prompt(payload: dict | None, raw: bytes, request: Request) -> str | None:
    if isinstance(payload, dict):
        prompt = payload.get("prompt") or payload.get("description")
        if isinstance(prompt, str) and prompt.strip():
            return prompt.strip()

    content_type = request.headers.get("content-type", "")

    if "multipart/form-data" in content_type:
        return None

    if "application/x-www-form-urlencoded" in content_type and raw:
        try:
            qs = parse_qs(raw.decode("utf-8"))
            for key in ("prompt", "description"):
                values = qs.get(key)
                if values and values[0].strip():
                    return values[0].strip()
        except Exception as e:
            print("[generate] urlencoded parse error:", e)

    return request.query_params.get("prompt") or request.query_params.get("description")


@router.post("/generate")
@router.post("/generate-mcp")
async def generate(request: Request):
    """Generate MCP server code from a natural language prompt.

    Supports multiple input formats for robustness:
    - application/json with {"prompt": "..."} or {"description": "..."}
    - application/x-www-form-urlencoded with `prompt=...` or `description=...`
    - multipart/form-data with a `prompt` or `description` field
    - query params `?prompt=...` or `?description=...`
    """
    # Read raw body for logging/debugging
    try:
        raw = await request.body()
    except Exception as e:
        raw = b""
        print("[generate] failed to read raw body:", e)

    payload: dict | None = None
    content_type = request.headers.get("content-type", "")

    if raw and "application/json" in content_type:
        try:
            parsed = json.loads(raw.decode("utf-8"))
            if isinstance(parsed, dict):
                payload = parsed
        except Exception as e:
            print("[generate] JSON parse error:", e)

    if "multipart/form-data" in content_type:
        try:
            form = await request.form()
            payload = {"prompt": form.get("prompt"), "description": form.get("description")}
        except Exception as e:
            print("[generate] form parse error:", e)

    prompt = _extract_prompt(payload, raw, request)

    if not prompt:
        # Return a clear JSON error explaining acceptable inputs
        return JSONResponse(
            content={
                "error": "missing_prompt",
                "message": "Provide 'prompt' or 'description' via JSON, form data, or query params.",
                "raw_body": raw.decode("utf-8", errors="replace"),
            },
            status_code=422,
        )

    result = generate_mcp_server(prompt)
    store_latest_generation(
        server_name=result.get("server_name", "generated-server"),
        generated_code=result.get("generated_code", ""),
        provider=result.get("provider"),
        model=result.get("model"),
    )
    # If the client requested a zip download, package generated code into files
    download = None
    if isinstance(payload, dict):
        download = payload.get("download")
    if not download:
        download = request.query_params.get("download")

    if str(download).lower() == "zip":
        code = result.get("generated_code", "")

        def parse_code_to_files(text: str) -> dict:
            files: dict[str, str] = {}
            # Find fenced code blocks
            blocks = re.findall(r"```(?:[a-zA-Z0-9]+)?\n(.*?)```", text, flags=re.S)
            if blocks:
                for idx, block in enumerate(blocks, start=1):
                    lines = block.strip().splitlines()
                    filename = None
                    # Check for a file hint in the first line like '# file: name.py'
                    if lines:
                        m = re.match(r"^\s*(?:#|//)\s*file\s*[:=]\s*(\S+)", lines[0], flags=re.I)
                        if m:
                            filename = m.group(1)
                            # drop the hint line
                            block = "\n".join(lines[1:])
                    if not filename:
                        # default to extension based on fence language would be better, use .py
                        filename = f"file_{idx}.py"
                    files[filename] = block
                return files

            # No fenced blocks — create a single file
            return {"generated.py": text}

        files = parse_code_to_files(code)
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
            for name, content in files.items():
                z.writestr(name, content)
        buf.seek(0)
        return StreamingResponse(buf, media_type="application/zip", headers={"Content-Disposition": "attachment; filename=generated_mcp.zip"})

    return JSONResponse(content=result)
