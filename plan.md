# AgentBridge AI — Implementation Plan

A platform that lets developers instantly generate secure, custom MCP (Model Context Protocol) servers using plain English, and visually simulate how multi-agent systems interact with them in real time.

---

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph "Browser Client"
        UI["Next.js Frontend<br/>(App Router)"]
        WS["WebSocket Client"]
        Monaco["Monaco Editor"]
        Sandbox["Agent Sandbox UI<br/>(React Flow + D3)"]
    end

    subgraph "API Gateway"
        API["FastAPI Backend"]
        Auth["Auth / JWT Middleware"]
        RateLimit["Rate Limiter"]
    end

    subgraph "Core Services"
        CodeGen["Code Generation Engine<br/>(OpenAI GPT-5.x)"]
        Validator["Code Validator &<br/>Security Scanner"]
        MCPRegistry["MCP Server Registry"]
        AgentOrch["Agent Orchestrator"]
    end

    subgraph "Execution Layer"
        DockerMgr["Docker Manager"]
        Container1["MCP Server Container 1"]
        Container2["MCP Server Container 2"]
        ContainerN["MCP Server Container N"]
    end

    subgraph "Data Layer"
        PG["PostgreSQL"]
        Redis["Redis<br/>(Cache + PubSub)"]
        S3["Object Storage<br/>(Generated Code)"]
    end

    UI -->|HTTPS| API
    WS -->|WSS| API
    Monaco --> UI
    Sandbox --> UI

    API --> Auth --> RateLimit
    API --> CodeGen
    API --> Validator
    API --> MCPRegistry
    API --> AgentOrch

    CodeGen -->|Responses API| OpenAI["OpenAI API"]
    Validator --> DockerMgr
    AgentOrch --> DockerMgr
    AgentOrch -->|JSON-RPC 2.0| Container1
    AgentOrch -->|JSON-RPC 2.0| Container2
    AgentOrch -->|JSON-RPC 2.0| ContainerN

    MCPRegistry --> PG
    API --> PG
    API --> Redis
    DockerMgr --> Container1
    DockerMgr --> Container2
    DockerMgr --> ContainerN
    CodeGen --> S3

    style UI fill:#6366f1,color:#fff
    style Sandbox fill:#8b5cf6,color:#fff
    style API fill:#0ea5e9,color:#fff
    style CodeGen fill:#f59e0b,color:#fff
    style AgentOrch fill:#10b981,color:#fff
    style DockerMgr fill:#ef4444,color:#fff
    style PG fill:#3b82f6,color:#fff
    style Redis fill:#dc2626,color:#fff
```

---

## 2. Core Feature Architecture

### 2.1 MCP Server Generation Pipeline

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Next.js Frontend
    participant API as FastAPI
    participant LLM as OpenAI GPT-5.x
    participant Validator
    participant Docker as Docker Manager
    participant Registry as MCP Registry

    User->>Frontend: Describe server in plain English
    Frontend->>API: POST /api/generate
    
    API->>LLM: Send structured prompt<br/>(system + user description)
    LLM-->>API: Generated FastMCP Python code
    
    API->>Validator: Static analysis + security scan
    Validator-->>API: Validation report
    
    alt Validation Passes
        API->>Docker: Build & start container
        Docker-->>API: Container ID + health check
        API->>Registry: Register MCP server metadata
        Registry-->>API: Server ID
        API-->>Frontend: Success + server details + code preview
        Frontend-->>User: Live editor + deployment URL
    else Validation Fails
        API->>LLM: Re-prompt with error context
        LLM-->>API: Corrected code
        API->>Validator: Re-validate
    end
```

### 2.2 Multi-Agent Sandbox Architecture

```mermaid
graph LR
    subgraph "Sandbox UI (Browser)"
        Canvas["React Flow Canvas"]
        AgentNode1["Agent Node A<br/>(Configurable Role)"]
        AgentNode2["Agent Node B<br/>(Configurable Role)"]
        MCPNode["MCP Server Node"]
        LogPanel["Real-Time Log Panel"]
        Timeline["Interaction Timeline"]
    end

    subgraph "Backend Orchestration"
        Orch["Agent Orchestrator"]
        AgentRuntime1["Agent Runtime A<br/>(LLM-Powered)"]
        AgentRuntime2["Agent Runtime B<br/>(LLM-Powered)"]
        MCPClient["MCP Client<br/>(JSON-RPC 2.0)"]
    end

    subgraph "Running MCP Server"
        MCPServer["Generated MCP Server<br/>(Docker Container)"]
        Tools["Tools"]
        Resources["Resources"]
        Prompts["Prompts"]
    end

    Canvas --> AgentNode1
    Canvas --> AgentNode2
    Canvas --> MCPNode
    Canvas --> LogPanel
    Canvas --> Timeline

    AgentNode1 -.->|WebSocket| Orch
    AgentNode2 -.->|WebSocket| Orch
    MCPNode -.->|WebSocket| Orch

    Orch --> AgentRuntime1
    Orch --> AgentRuntime2
    AgentRuntime1 --> MCPClient
    AgentRuntime2 --> MCPClient
    MCPClient -->|Streamable HTTP| MCPServer
    MCPServer --> Tools
    MCPServer --> Resources
    MCPServer --> Prompts

    style Canvas fill:#6366f1,color:#fff
    style Orch fill:#10b981,color:#fff
    style MCPServer fill:#f59e0b,color:#fff
```

---

## 3. Tech Stack

| Layer | Technology | Rationale |
|:---|:---|:---|
| **Frontend** | Next.js 15 (App Router) | SSR, file-based routing, React Server Components |
| **UI Components** | shadcn/ui + Radix | Accessible, composable, themeable |
| **Code Editor** | Monaco Editor (@monaco-editor/react) | VS Code-grade editing in-browser |
| **Agent Visualization** | React Flow + Framer Motion | Node-graph canvas for agent simulation |
| **Styling** | Tailwind CSS 4 | Utility-first, rapid iteration |
| **Backend API** | FastAPI (Python 3.12+) | Async, OpenAPI auto-docs, Pydantic validation |
| **MCP SDK** | FastMCP (Python) | Official high-level MCP server builder |
| **AI Code Gen** | OpenAI Responses API (GPT-5.x) | Best-in-class code generation with reasoning |
| **Database** | PostgreSQL 16 | Relational store for users, servers, projects |
| **Cache / PubSub** | Redis 7 | Session cache, real-time event streaming |
| **Containerization** | Docker Engine API | Isolated MCP server execution |
| **Auth** | NextAuth.js + JWT | GitHub/Google OAuth, session management |
| **Package Management** | pnpm (JS) + uv (Python) | Fast, disk-efficient, lockfile-safe |
| **Monorepo** | Turborepo | Unified builds, caching, task orchestration |
| **Deployment** | Vercel (frontend) + Fly.io/Railway (backend) | Edge CDN + container hosting |

---

## 4. Monorepo Structure

```
AgentBridge AI/
├── apps/
│   ├── web/                          # Next.js 15 frontend
│   │   ├── app/
│   │   │   ├── (auth)/               # Auth routes (login, register)
│   │   │   ├── (dashboard)/          # Protected dashboard routes
│   │   │   │   ├── projects/         # Project management
│   │   │   │   ├── generator/        # MCP server generator UI
│   │   │   │   ├── sandbox/          # Multi-agent sandbox
│   │   │   │   └── servers/          # Server management & monitoring
│   │   │   ├── (marketing)/          # Public landing page
│   │   │   ├── api/                  # Next.js API routes (BFF)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── editor/               # Monaco editor wrapper
│   │   │   ├── sandbox/              # React Flow agent canvas
│   │   │   ├── generator/            # Generation wizard components
│   │   │   └── ui/                   # shadcn/ui components
│   │   ├── lib/                      # Utilities, API client, hooks
│   │   ├── styles/
│   │   └── next.config.ts
│   │
│   └── api/                          # FastAPI backend
│       ├── app/
│       │   ├── main.py               # FastAPI app entry
│       │   ├── core/
│       │   │   ├── config.py          # Settings via pydantic-settings
│       │   │   ├── security.py        # Auth, JWT, RBAC
│       │   │   └── events.py          # Startup/shutdown lifecycle
│       │   ├── api/
│       │   │   ├── v1/
│       │   │   │   ├── generate.py    # Code generation endpoints
│       │   │   │   ├── servers.py     # MCP server CRUD
│       │   │   │   ├── sandbox.py     # Sandbox session management
│       │   │   │   ├── projects.py    # Project management
│       │   │   │   └── ws.py          # WebSocket handlers
│       │   │   └── deps.py            # Dependency injection
│       │   ├── services/
│       │   │   ├── codegen.py         # OpenAI code generation service
│       │   │   ├── validator.py       # AST validation + security scan
│       │   │   ├── docker_mgr.py      # Docker container lifecycle
│       │   │   ├── mcp_registry.py    # MCP server registry
│       │   │   └── agent_orchestrator.py  # Multi-agent runtime
│       │   ├── models/                # SQLAlchemy ORM models
│       │   ├── schemas/               # Pydantic request/response schemas
│       │   └── prompts/               # LLM prompt templates
│       │       ├── system_prompt.py
│       │       └── templates/
│       ├── tests/
│       ├── Dockerfile
│       └── pyproject.toml
│
├── packages/
│   ├── shared-types/                  # Shared TypeScript types (OpenAPI-generated)
│   ├── mcp-templates/                 # Base MCP server templates & snippets
│   └── ui/                            # Shared UI component library
│
├── docker/
│   ├── sandbox-base/                  # Base image for MCP server containers
│   │   ├── Dockerfile
│   │   └── requirements.txt           # Pre-installed: fastmcp, httpx, pydantic
│   └── docker-compose.yml             # Local dev stack
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## 5. Detailed Component Design

### 5.1 Code Generation Engine

The core differentiator — turning natural language into production-ready FastMCP server code.

```mermaid
graph TD
    NL["Natural Language Input"] --> Parser["Intent Parser"]
    Parser --> ToolExtract["Extract Tools<br/>(actions the server exposes)"]
    Parser --> ResExtract["Extract Resources<br/>(data the server provides)"]
    Parser --> PromptExtract["Extract Prompts<br/>(reusable templates)"]
    Parser --> DepsExtract["Extract Dependencies<br/>(httpx, sqlalchemy, etc.)"]
    
    ToolExtract --> SchemaGen["Generate Pydantic<br/>Input/Output Schemas"]
    ResExtract --> SchemaGen
    
    SchemaGen --> PromptAssembly["Assemble LLM Prompt"]
    PromptExtract --> PromptAssembly
    DepsExtract --> PromptAssembly
    
    PromptAssembly --> LLM["OpenAI GPT-5.x<br/>(Responses API)"]
    LLM --> RawCode["Raw Python Code"]
    
    RawCode --> ASTCheck["AST Validation"]
    ASTCheck --> SecurityScan["Security Scanner<br/>(no os.system, no eval,<br/>no file traversal)"]
    SecurityScan --> TypeCheck["Type Check<br/>(mypy --strict)"]
    TypeCheck --> TestGen["Auto-generate<br/>Basic Tests"]
    
    TestGen --> FinalCode["Validated MCP Server Code"]

    style NL fill:#6366f1,color:#fff
    style LLM fill:#f59e0b,color:#fff
    style FinalCode fill:#10b981,color:#fff
```

**Prompt Engineering Strategy:**

The system prompt instructs the LLM to generate code following this exact template:

```python
# Generated by AgentBridge AI
from fastmcp import FastMCP
from pydantic import BaseModel, Field
# ... additional imports based on user description

mcp = FastMCP("{{server_name}}")

# --- Pydantic Models ---
class {{ModelName}}(BaseModel):
    """{{description}}"""
    {{fields}}

# --- Tools ---
@mcp.tool
async def {{tool_name}}({{params}}) -> {{return_type}}:
    """{{tool_description}}"""
    {{implementation}}

# --- Resources ---
@mcp.resource("{{uri_pattern}}")
async def {{resource_name}}() -> str:
    """{{resource_description}}"""
    {{implementation}}

# --- Prompts ---
@mcp.prompt
def {{prompt_name}}({{params}}) -> str:
    """{{prompt_description}}"""
    return f"{{template}}"

if __name__ == "__main__":
    mcp.run(transport="sse", port={{port}})
```

**Security Scanner Rules (Blocklist):**
- `os.system()`, `subprocess.*`, `eval()`, `exec()`, `__import__()`
- File system access outside `/app/data/`
- Network calls to internal IPs (SSRF prevention)
- Import of disallowed modules (`ctypes`, `socket` raw access)

---

### 5.2 Agent Sandbox Orchestrator

```mermaid
sequenceDiagram
    participant User
    participant SandboxUI as Sandbox UI (React Flow)
    participant WS as WebSocket
    participant Orch as Agent Orchestrator
    participant AgentA as Agent A Runtime
    participant AgentB as Agent B Runtime
    participant MCP as MCP Server (Container)

    User->>SandboxUI: Configure agents + connect to MCP server
    User->>SandboxUI: Click "Run Simulation"
    SandboxUI->>WS: Start simulation session
    WS->>Orch: Initialize agents with roles & goals
    
    loop Simulation Loop
        Orch->>AgentA: "You are a data analyst. Your goal is..."
        AgentA->>Orch: tool_call: list_datasets()
        Orch->>MCP: JSON-RPC: tools/call {name: "list_datasets"}
        MCP-->>Orch: Result: ["sales_2024", "users_q1"]
        Orch-->>AgentA: Tool result
        AgentA->>Orch: tool_call: analyze_dataset("sales_2024")
        Orch->>MCP: JSON-RPC: tools/call {name: "analyze_dataset"}
        MCP-->>Orch: Result: {summary: "...", rows: 1500}
        
        Note over Orch: Agent A shares findings with Agent B
        Orch->>AgentB: "Agent A found: {summary}. Now visualize..."
        AgentB->>Orch: tool_call: create_chart(...)
        Orch->>MCP: JSON-RPC: tools/call {name: "create_chart"}
        MCP-->>Orch: Result: {chart_url: "..."}
        
        Orch-->>WS: Stream all events in real-time
        WS-->>SandboxUI: Render animated interactions
    end

    SandboxUI-->>User: Full interaction timeline + logs
```

**Agent Configuration Model:**

Each agent in the sandbox has:
| Property | Type | Description |
|:---|:---|:---|
| `name` | string | Human-readable label (e.g., "Data Analyst") |
| `role` | string | System prompt / persona description |
| `goal` | string | What this agent is trying to accomplish |
| `model` | enum | LLM model to use (gpt-5.5, gpt-4.1, etc.) |
| `allowed_tools` | string[] | Which MCP tools this agent can call |
| `max_turns` | int | Maximum interaction rounds |
| `temperature` | float | Creativity vs. determinism |

---

### 5.3 Real-Time Communication Layer

```mermaid
graph LR
    subgraph "Frontend"
        ReactApp["Next.js App"]
        WSHook["useWebSocket Hook"]
        EventStore["Zustand Event Store"]
    end

    subgraph "Backend"
        WSEndpoint["FastAPI WebSocket<br/>/ws/sandbox/{session_id}"]
        RedisPubSub["Redis PubSub"]
        OrchestratorWorker["Orchestrator Worker"]
    end

    ReactApp --> WSHook
    WSHook -->|WSS| WSEndpoint
    WSEndpoint --> RedisPubSub
    RedisPubSub --> OrchestratorWorker
    OrchestratorWorker --> RedisPubSub
    RedisPubSub --> WSEndpoint
    WSEndpoint -->|WSS| WSHook
    WSHook --> EventStore
    EventStore --> ReactApp

    style ReactApp fill:#6366f1,color:#fff
    style WSEndpoint fill:#0ea5e9,color:#fff
    style RedisPubSub fill:#dc2626,color:#fff
```

**WebSocket Event Protocol:**

```typescript
// Events flowing from backend → frontend
type SandboxEvent =
  | { type: "agent:thinking";    agentId: string; content: string }
  | { type: "agent:tool_call";   agentId: string; toolName: string; args: Record<string, any> }
  | { type: "mcp:tool_result";   toolName: string; result: any; durationMs: number }
  | { type: "agent:message";     agentId: string; targetAgentId: string; content: string }
  | { type: "agent:complete";    agentId: string; summary: string }
  | { type: "simulation:done";   totalTurns: number; durationMs: number }
  | { type: "error";             code: string; message: string }
```

---

## 6. Database Schema

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : owns
    PROJECTS ||--o{ MCP_SERVERS : contains
    MCP_SERVERS ||--o{ SERVER_VERSIONS : has
    PROJECTS ||--o{ SANDBOX_SESSIONS : has
    SANDBOX_SESSIONS ||--o{ SANDBOX_AGENTS : includes
    SANDBOX_SESSIONS ||--o{ SIMULATION_EVENTS : produces

    USERS {
        uuid id PK
        string email
        string name
        string avatar_url
        string auth_provider
        timestamp created_at
    }

    PROJECTS {
        uuid id PK
        uuid user_id FK
        string name
        text description
        timestamp created_at
        timestamp updated_at
    }

    MCP_SERVERS {
        uuid id PK
        uuid project_id FK
        string name
        text natural_language_spec
        text generated_code
        string status "draft|building|running|stopped|error"
        string container_id
        int port
        string deploy_url
        jsonb tool_manifest
        jsonb resource_manifest
        timestamp created_at
        timestamp updated_at
    }

    SERVER_VERSIONS {
        uuid id PK
        uuid server_id FK
        int version_number
        text code_snapshot
        text change_description
        timestamp created_at
    }

    SANDBOX_SESSIONS {
        uuid id PK
        uuid project_id FK
        uuid mcp_server_id FK
        string status "configuring|running|completed|failed"
        jsonb config
        timestamp started_at
        timestamp completed_at
    }

    SANDBOX_AGENTS {
        uuid id PK
        uuid session_id FK
        string name
        text role
        text goal
        string model
        jsonb allowed_tools
        int max_turns
        float temperature
    }

    SIMULATION_EVENTS {
        uuid id PK
        uuid session_id FK
        uuid agent_id FK
        string event_type
        jsonb payload
        int sequence_number
        timestamp created_at
    }
```

---

## 7. Landing Page & Key UI Screens

### 7.1 Application Screens

| Screen | Route | Purpose |
|:---|:---|:---|
| **Landing Page** | `/` | Hero, value prop, demo video, pricing |
| **Dashboard** | `/dashboard` | Project overview, quick actions, usage stats |
| **Generator** | `/generator` | NL input → code preview → deploy wizard |
| **Code Editor** | `/servers/[id]/edit` | Monaco editor with live MCP server code |
| **Server Dashboard** | `/servers/[id]` | Server health, tool manifest, logs, test console |
| **Agent Sandbox** | `/sandbox/[id]` | React Flow canvas, agent config, simulation controls |
| **Simulation Replay** | `/sandbox/[id]/replay/[sessionId]` | Timeline playback of past simulations |

### 7.2 UI Component Architecture

```mermaid
graph TD
    subgraph "Generator Page"
        NLInput["Natural Language Input<br/>(Rich textarea + examples)"]
        ServerConfig["Server Config Panel<br/>(name, auth, deps)"]
        CodePreview["Code Preview<br/>(Monaco, read-only)"]
        ToolManifest["Tool/Resource Manifest<br/>(auto-detected cards)"]
        DeployBtn["Deploy Button"]
    end

    subgraph "Sandbox Page"
        FlowCanvas["React Flow Canvas"]
        AgentPalette["Agent Palette<br/>(drag to add agents)"]
        MCPSelector["MCP Server Selector<br/>(connect to generated server)"]
        SimControls["Simulation Controls<br/>(play, pause, step, speed)"]
        EventLog["Event Log Panel<br/>(filterable, searchable)"]
        MetricsPanel["Metrics Panel<br/>(latency, token usage, calls)"]
    end

    NLInput --> CodePreview
    ServerConfig --> CodePreview
    CodePreview --> ToolManifest
    ToolManifest --> DeployBtn

    AgentPalette --> FlowCanvas
    MCPSelector --> FlowCanvas
    SimControls --> FlowCanvas
    FlowCanvas --> EventLog
    FlowCanvas --> MetricsPanel

    style NLInput fill:#6366f1,color:#fff
    style FlowCanvas fill:#8b5cf6,color:#fff
    style CodePreview fill:#0ea5e9,color:#fff
```

---

## 8. Phased Delivery Plan

### Phase 1 — Foundation (Weeks 1–3)
> Monorepo setup, auth, database, basic UI shell

- [ ] Initialize Turborepo monorepo with Next.js + FastAPI
- [ ] Configure pnpm workspaces + uv for Python
- [ ] Set up PostgreSQL with SQLAlchemy + Alembic migrations
- [ ] Implement NextAuth.js (GitHub + Google OAuth)
- [ ] Build landing page with premium dark-mode design
- [ ] Create dashboard shell with sidebar navigation
- [ ] Set up Docker Compose for local dev (Postgres, Redis, API, Web)
- [ ] Configure CI/CD pipeline (lint, typecheck, test)

### Phase 2 — Code Generation Engine (Weeks 4–6)
> The core NL → MCP server pipeline

- [ ] Build prompt engineering framework (system prompts, templates)
- [ ] Integrate OpenAI Responses API for code generation
- [ ] Implement AST-based code validator
- [ ] Build security scanner (blocklist + static analysis)
- [ ] Create Generator UI (NL input, config panel, code preview)
- [ ] Wire Monaco Editor for generated code editing
- [ ] Implement iterative refinement loop (validation → re-prompt)
- [ ] Build MCP server registry (CRUD + metadata)

### Phase 3 — Container Runtime (Weeks 7–8)
> Spin up generated MCP servers in isolated containers

- [ ] Create base Docker image with FastMCP + common deps
- [ ] Build Docker Manager service (create, start, stop, destroy)
- [ ] Implement container health checks + auto-restart
- [ ] Add resource limits (CPU, memory, network isolation)
- [ ] Build server dashboard (health, logs, tool manifest)
- [ ] Implement MCP tool testing console (manual tool invocation)
- [ ] Add deploy URL routing (reverse proxy)

### Phase 4 — Multi-Agent Sandbox (Weeks 9–12)
> Visual agent simulation environment

- [ ] Build React Flow canvas with custom agent/MCP nodes
- [ ] Implement agent configuration panel (role, goal, model, tools)
- [ ] Build Agent Orchestrator backend service
- [ ] Implement MCP client (JSON-RPC 2.0 over Streamable HTTP)
- [ ] Set up WebSocket layer for real-time event streaming
- [ ] Build event log panel with filtering
- [ ] Implement simulation controls (play, pause, step-through, speed)
- [ ] Build interaction timeline visualization
- [ ] Add simulation replay from stored events
- [ ] Build metrics panel (latency, token usage, tool call frequency)

### Phase 5 — Polish & Ship (Weeks 13–14)
> Production hardening, docs, and launch prep

- [ ] Comprehensive error handling and user-facing error messages
- [ ] Rate limiting and usage quotas
- [ ] API documentation (auto-generated from OpenAPI)
- [ ] User onboarding flow with interactive tutorial
- [ ] Export capabilities (download generated code, export simulation logs)
- [ ] Performance optimization (code splitting, lazy loading, caching)
- [ ] End-to-end testing (Playwright)
- [ ] Deploy to production (Vercel + Fly.io/Railway)

---

## 9. User Review Required

> [!IMPORTANT]
> **AI Model Selection**: The plan uses OpenAI's GPT-5.x via the Responses API for code generation. Should we also support alternative models (e.g., Gemini 2.5 Pro, Claude) as selectable backends, or is OpenAI-only acceptable for the MVP?

> [!IMPORTANT]
> **Container Hosting Strategy**: Running Docker containers for each generated MCP server requires a container-capable host (Fly.io, Railway, AWS ECS). This has significant cost implications at scale. Should we explore a Pyodide/WASM-based in-browser execution option for a lighter "preview" mode?

> [!WARNING]
> **Scope vs. Timeline**: The full 5-phase plan targets ~14 weeks. If you want a faster MVP, we could cut Phase 4 (Sandbox) to a simpler "single-agent test console" and deliver in ~8 weeks, then iterate on the full multi-agent sandbox as Phase 2 of the product.

---

---

## 11. Verification Plan

### Automated Tests
- **Unit tests**: pytest for all backend services (codegen, validator, docker_mgr, orchestrator)
- **Integration tests**: Test full NL → code → container → tool_call pipeline
- **E2E tests**: Playwright for critical user flows (generate → deploy → test → sandbox)
- **Contract tests**: Validate generated MCP servers respond correctly to `tools/list`, `tools/call`

### Manual Verification
- Generate MCP servers from 10+ diverse NL descriptions and verify correctness
- Run sandbox simulations with 2–4 agents and verify real-time visualization
- Test security scanner against known-malicious code patterns
- Performance testing: code generation latency < 10s, container startup < 5s
- Browser testing across Chrome, Firefox, Safari
