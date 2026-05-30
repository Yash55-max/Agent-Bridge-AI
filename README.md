# AgentBridge AI

Monorepo scaffold for the AgentBridge AI web application.

## Structure

- `apps/web/` - Next.js frontend with landing, auth, dashboard, generator, and sandbox routes
- `apps/api/` - FastAPI backend with server, sandbox, and event APIs plus Postgres/Alembic scaffolding

## Run (development)

Install the workspace once:

```powershell
pnpm install
```

Then start both apps in separate terminals:

```powershell
pnpm dev:web
```

```powershell
pnpm dev:api
```

## Docker Compose

To run the full local stack with PostgreSQL and Redis:

```powershell
docker compose up --build
```

## Phase 1 foundation

- NextAuth scaffold for GitHub and Google sign-in
- PostgreSQL settings, SQLAlchemy models, and Alembic migrations
- Landing page and dashboard shell
- Root compose stack for web, API, Postgres, and Redis
- CI workflow for backend tests and frontend build

