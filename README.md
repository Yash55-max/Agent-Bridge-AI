# AgentBridge AI

AgentBridge AI is a local web application for generating MCP servers from plain English prompts. The current app has a public landing page, a workspace dashboard, a generator UI, and a FastAPI backend that can return generated code as JSON or as a ZIP file.

## Project layout

- `frontend/` - Next.js 15 app with the landing page, workspace, generator, deploy, and sandbox routes
- `backend/` - FastAPI service that exposes generation and health endpoints
- `docker/` - Docker secret files and helper images
- `docker-compose.yml` - Local stack for PostgreSQL, Redis, API, and web

## Prerequisites

- Node.js 18+ and pnpm
- Python 3.12+
- Docker Desktop if you want the compose stack

## Local setup

Install frontend dependencies:

```powershell
Set-Location 'D:\Agent Bridge\frontend'
pnpm install
```

Install backend dependencies:

```powershell
Set-Location 'D:\Agent Bridge\backend'
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Run locally

Start the frontend:

```powershell
Set-Location 'D:\Agent Bridge\frontend'
pnpm dev
```

Start the backend:

```powershell
Set-Location 'D:\Agent Bridge\backend'
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

## Docker Compose

To run the full stack with PostgreSQL and Redis:

```powershell
Set-Location 'D:\Agent Bridge'
docker compose up --build
```

If you want Groq-backed generation in Docker, put your raw API key in `docker/secrets/groq_api_key` before starting the stack.

If Groq is unavailable (missing key, invalid key, network issue, or API error), the backend returns a local stub response so the demo can keep running.

## Deployment

This repo is set up for a split deployment:

- Backend on Render from the `backend/` folder.
- Frontend on Vercel from the `frontend/` folder.

Render backend settings:

- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- `CORS_ORIGINS`: set to `*` or your Vercel domain
- `GROQ_API_KEY`: set in Render secrets if you want Groq-backed generation

Vercel frontend settings:

- Root directory: `frontend`
- Framework preset: Next.js
- Environment variable: `NEXT_PUBLIC_BACKEND_URL` pointing to the Render backend URL

For local development, copy `frontend/.env.example` to `frontend/.env.local` and set `NEXT_PUBLIC_BACKEND_URL` to your local backend URL.

## Frontend routes

- `/` - landing page
- `/workspace` - dashboard workspace
- `/generator` - generator page
- `/deploy` - deployment helper page
- `/sandbox` - sandbox landing page
- `/sandbox/[id]` - sandbox detail page
- `/servers/[id]` - server detail page

## Backend API

- `GET /health` - health check
- `POST /api/generate` - generate MCP code from `prompt` or `description`
- `POST /api/generate-mcp` - alias for the generation endpoint
- `POST /api/generate?download=zip` - return a ZIP bundle instead of JSON
- `POST /_echo` - debug endpoint that echoes the raw request body

## Environment variables

The backend reads `GROQ_API_KEY`, `GROQ_API_URL`, `GROQ_MODEL`, and `LLM_PROVIDER` from the root `.env` file or from the Docker secret mount. The compose stack also injects `DATABASE_URL` and `CORS_ORIGINS` for the API service.

## Validation

The frontend build is expected to pass with:

```powershell
Set-Location 'D:\Agent Bridge\frontend'
pnpm build
```

The backend smoke tests are expected to pass with:

```powershell
Set-Location 'D:\Agent Bridge\backend'
.\.venv\Scripts\python.exe -m pytest -q
```

