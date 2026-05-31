# Backend

This directory contains the FastAPI service used by AgentBridge AI.

## What it does

- Accepts a natural-language prompt
- Sends the prompt to the configured Groq provider
- Returns generated MCP server code as JSON
- Can package the generated output into a ZIP download

## Run

Install dependencies:

```powershell
Set-Location 'D:\Agent Bridge\backend'
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Start the API server:

```powershell
Set-Location 'D:\Agent Bridge\backend'
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `GET /health` - health check
- `POST /api/generate` - generate MCP code from `prompt` or `description`
- `POST /api/generate-mcp` - alias for the generation endpoint
- `POST /api/generate?download=zip` - return a ZIP bundle
- `POST /_echo` - echo the raw request body for debugging

## Environment

The backend looks for these values in the workspace `.env` file or via Docker secrets:

- `LLM_PROVIDER=groq`
- `GROQ_API_KEY`
- `GROQ_API_URL`

## Tests

Run the backend smoke tests with:

```powershell
Set-Location 'D:\Agent Bridge\backend'
.\.venv\Scripts\python.exe -m pytest -q
```