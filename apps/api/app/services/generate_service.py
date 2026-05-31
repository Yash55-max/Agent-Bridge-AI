from __future__ import annotations

import json
from pathlib import Path

import httpx

from app.core.config import get_settings


SYSTEM_PROMPT = (
    "You are an expert Python engineer. Generate a complete, valid FastAPI MCP server "
    "implementation from the user's request. Return only the code inside a single markdown code block."
)


def _build_payload(prompt: str) -> dict:
    settings = get_settings()
    return {
        "model": settings.groq_model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": 1024,
        "temperature": 0.2,
    }


def _extract_text(response_body: object) -> str:
    if isinstance(response_body, str):
        return response_body.strip()

    if not isinstance(response_body, dict):
        return str(response_body)

    output_text = response_body.get("output_text")
    if isinstance(output_text, str) and output_text.strip():
        return output_text.strip()

    choices = response_body.get("choices")
    if isinstance(choices, list) and choices:
        first_choice = choices[0]
        if isinstance(first_choice, dict):
            message = first_choice.get("message")
            if isinstance(message, dict):
                content = message.get("content")
                if isinstance(content, str) and content.strip():
                    return content.strip()
                if isinstance(content, list):
                    pieces = [part.get("text", "") for part in content if isinstance(part, dict)]
                    joined = "".join(pieces).strip()
                    if joined:
                        return joined

    # Groq/OpenAI-compatible response shape
    if isinstance(choices, list) and choices:
        first = choices[0]
        if isinstance(first, dict):
            message = first.get("message")
            if isinstance(message, dict):
                content = message.get("content")
                if isinstance(content, str) and content.strip():
                    return content.strip()

    output = response_body.get("output")
    if isinstance(output, dict):
        message = output.get("message")
        if isinstance(message, dict):
            content = message.get("content")
            if isinstance(content, list):
                pieces = [part.get("text", "") for part in content if isinstance(part, dict)]
                joined = "".join(pieces).strip()
                if joined:
                    return joined

    content = response_body.get("content")
    if isinstance(content, list):
        pieces = [part.get("text", "") for part in content if isinstance(part, dict)]
        joined = "".join(pieces).strip()
        if joined:
            return joined

    return json.dumps(response_body, indent=2)


def _stub_response(prompt: str, reason: str) -> dict:
    return {
        "server_name": "generated_server_stub",
        "generated_code": """# Generation unavailable locally\nfrom fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get('/health')\nasync def health():\n    return {'status': 'ok'}\n""",
        "model": "local-stub",
        "provider": "local",
        "note": f"{reason} Prompt preserved: {prompt}",
    }


def generate_mcp_server(prompt: str) -> dict:
    settings = get_settings()
    groq_key = settings.groq_api_key
    if not groq_key:
        secret_path = Path('/run/secrets/groq_api_key')
        if secret_path.exists():
            try:
                groq_key = secret_path.read_text().strip()
            except Exception:
                groq_key = None

    want_groq = (settings.llm_provider or "").lower() == "groq"
    if want_groq and not groq_key:
        return _stub_response(prompt, "Groq provider selected but GROQ_API_KEY is missing.")

    # Prefer Groq if configured or explicitly requested
    if groq_key or want_groq:
        try:
            url = settings.groq_api_url or "https://api.groq.com/openai/v1/chat/completions"
            headers = {"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"}
            payload = _build_payload(prompt)
            with httpx.Client(timeout=30.0) as client:
                r = client.post(url, json=payload, headers=headers)
                r.raise_for_status()
                body = r.json()
                content = _extract_text(body)
                return {
                    "server_name": "generated_server",
                    "generated_code": content,
                    "model": settings.groq_model,
                    "provider": "groq",
                }
        except Exception as exc:
            return _stub_response(prompt, f"Groq API unavailable: {exc}")
    # No other providers configured or Groq failed — return stub
    return _stub_response(prompt, "No LLM provider available or all providers failed.")