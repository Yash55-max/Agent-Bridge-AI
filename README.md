# AgentBridge AI

[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Render](https://img.shields.io/badge/Render-2D2D2D?logo=render&logoColor=white)](https://render.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

AgentBridge AI is a full-stack application for turning plain-English prompts into MCP-style FastAPI services, previewing the generated output, and running live sandbox analysis against the deployed result.

The active deployment stack is:

- `frontend/` - Next.js app with the landing page, generator, workspace, deploy flow, sandbox UI, and server detail pages.
- `backend/` - FastAPI service that generates code, stores preview state, serves sandbox APIs, and exposes MCP-style tool routes.

## What the application does

- Accepts a prompt describing the server you want.
- Calls the configured LLM provider, or a local fallback when Groq is unavailable.
- Produces MCP-compatible FastAPI code.
- Lets you deploy the generated code into the preview/sandbox flow.
- Starts a live sandbox session and streams structured agent analysis over WebSocket.
- Renders the final analysis as readable paragraphs instead of a single long line.

## Core features

- Prompt-to-code generation with Groq support.
- Local fallback generation so demos still work when the LLM is unavailable.
- Deploy preview endpoint to store the latest generated artifact.
- Live sandbox session with WebSocket updates.
- Structured final output with `summary`, `paragraphs`, and `raw` fields.
- MCP tool discovery and tool calls for calculator-style demo actions.
- Render and Vercel deployment support.

## Repository layout

- `frontend/` - Next.js application and UI components.
- `backend/` - FastAPI API, sandbox orchestrator, generation services, and MCP templates.
- `docker/` - Docker helper files and secrets.
- `docs/` - Protocol and supporting documentation.
- `render.yaml` - Render blueprint for the backend.
- `docker-compose.yml` - Local stack for the broader workspace.

## Prerequisites

- Node.js 18 or newer.
- Python 3.12 or newer.
- pnpm.
- Docker Desktop if you want to use the compose stack.

## Environment variables

### Frontend

The frontend expects the backend URL through `NEXT_PUBLIC_BACKEND_URL`.

Example:

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com
```

### Backend

The backend reads:

- `GROQ_API_KEY`
- `GROQ_API_URL`
- `GROQ_MODEL`
- `LLM_PROVIDER`
- `CORS_ORIGINS`

For deployment, `CORS_ORIGINS` should include your Vercel domain or `*` if you want permissive cross-origin access.

## Local development

### 1. Install frontend dependencies

```powershell
Set-Location 'D:\Agent Bridge\frontend'
pnpm install
```

### 2. Install backend dependencies

```powershell
Set-Location 'D:\Agent Bridge\backend'
python -m pip install -r requirements.txt
```

### 3. Start the backend

```powershell
Set-Location 'D:\Agent Bridge\backend'
python -m uvicorn app.main:app --reload --port 8000
```

### 4. Start the frontend

```powershell
Set-Location 'D:\Agent Bridge\frontend'
pnpm dev
```

If the frontend cannot reach the backend, set `NEXT_PUBLIC_BACKEND_URL` in `frontend/.env.local`.

## Local Docker stack

The workspace includes a compose file for the local stack.

```powershell
Set-Location 'D:\Agent Bridge'
docker compose up --build
```

If you want Groq-backed generation in Docker, place your API key in `docker/secrets/groq_api_key`.

## Deployment

This repo is set up for a split deployment:

- Backend on Render.
- Frontend on Vercel.

### Render backend

Use the `backend/` directory as the root directory.

Suggested settings:

- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment variables:
  - `CORS_ORIGINS=*` or your Vercel domain
  - `GROQ_API_KEY` if you want Groq generation
  - `LLM_PROVIDER=groq`
  - `GROQ_MODEL=llama-3.1-8b-instant`

### Vercel frontend

Use the `frontend/` directory as the root directory.

Suggested settings:

- Framework preset: Next.js
- Environment variable: `NEXT_PUBLIC_BACKEND_URL=https://your-render-service.onrender.com`

A sample frontend env file is included at [frontend/.env.example](frontend/.env.example).

## Application routes

### Frontend

- `/` - public landing page.
- `/workspace` - main workspace dashboard.
- `/generator` - prompt-to-code generator.
- `/deploy` - deployment helper page.
- `/sandbox` - sandbox landing page.
- `/sandbox/[id]` - sandbox session detail view.
- `/servers/[id]` - server detail view.

### Backend API

- `GET /health` - health check.
- `POST /api/generate` - generate MCP code from `prompt` or `description`.
- `POST /api/generate-mcp` - alias for generation.
- `POST /api/generate?download=zip` - return a ZIP bundle.
- `POST /api/v1/preview/deploy` - store the latest generated code for preview/sandbox flows.
- `GET /api/v1/preview` - return the latest preview metadata.
- `GET /api/v1/tools/list` - list discovered MCP tools.
- `POST /api/v1/tools/call` - call supported MCP demo tools.
- `POST /api/v1/sandbox/start` - create a sandbox session.
- `GET /api/v1/sandbox/{session_id}/events` - return stored sandbox events.
- `GET /api/v1/sandbox/{session_id}/replay` - replay a stored sandbox session.
- `POST /api/v1/sandbox/command` - broadcast a sandbox command to active sessions.
- `GET /api/v1/ws/sandbox/{session_id}` - WebSocket stream for live sandbox events.

## Protocol notes

The sandbox emits structured WebSocket messages. The most important event shapes are documented in [docs/agent_protocol.md](docs/agent_protocol.md).

Key fields to expect:

- `agent:analysis` events contain `result.summary` and `result.detail`.
- `final` events contain `result.summary`, `result.paragraphs`, and `result.raw`.

## Validation

Frontend build:

```powershell
Set-Location 'D:\Agent Bridge\frontend'
pnpm build
```

Backend tests:

```powershell
Set-Location 'D:\Agent Bridge\backend'
python -m pytest -q
```

## Troubleshooting

- If the frontend shows stale backend data, make sure `NEXT_PUBLIC_BACKEND_URL` points to the deployed Render service.
- If the backend rejects browser requests, update `CORS_ORIGINS` on Render.
- If Groq is unavailable, the backend falls back to a local stub so the demo can continue.
- If the sandbox trace looks like one long line, the frontend is expected to format `final.paragraphs` as separate paragraphs.

## Related files

- [render.yaml](render.yaml) - Render deployment blueprint.
- [frontend/.env.example](frontend/.env.example) - frontend environment example.
- [docs/agent_protocol.md](docs/agent_protocol.md) - sandbox event protocol.
