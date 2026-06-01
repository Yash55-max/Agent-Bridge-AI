import Link from "next/link";
import { Topbar } from "@/components/shell/topbar";

const overviewSection = {
  id: "overview",
  title: "Overview",
  copy: "AgentBridge AI turns plain-English prompts into MCP-style FastAPI services, previews the output, and runs a live sandbox to inspect the generated system before you ship it.",
};

const workflowSection = {
  id: "workflow",
  title: "Workflow",
  copy: "The intended flow is prompt -> generate -> preview -> sandbox -> deploy. The workspace ties those steps together so you can keep the code, runtime state, and agent output in one place.",
};

const architectureSection = {
  id: "architecture",
  title: "Architecture",
  copy: "The frontend is a Next.js app and the backend is a FastAPI service. The backend handles generation, preview state, sandbox sessions, WebSocket updates, and MCP-style tool routes.",
};

const apiSurfaceSection = {
  id: "api",
  title: "API surface",
  copy: "The backend exposes health, generation, preview, sandbox, tools, and websocket routes. The docs page mirrors the runtime contract so the UI and backend stay aligned.",
};

const protocolSection = {
  id: "protocol",
  title: "Sandbox protocol",
  copy: "Sandbox clients receive agent:analysis, mcp:tool_result, and final events. Final responses should be rendered as structured paragraphs rather than a single unbroken line.",
};

const deploySection = {
  id: "deploy",
  title: "Deployment",
  copy: "Deploy the frontend on Vercel and the backend on Render. Set NEXT_PUBLIC_BACKEND_URL on the frontend and keep the Render backend pointed at Python 3.12.x with the backend root directory.",
};

const troubleshootingSection = {
  id: "troubleshooting",
  title: "Troubleshooting",
  copy: "If generation falls back to local mode, check GROQ_API_KEY. If browser requests fail, verify CORS_ORIGINS. If Render crashes on boot, make sure the backend config and runtime files are in sync.",
};

const apiRoute1 = ["GET /health", "Health check used by Render and the app shell."] as const;
const apiRoute2 = ["POST /api/generate", "Generate MCP code from prompt or description."] as const;
const apiRoute3 = ["POST /api/generate?download=zip", "Download the generated code as a ZIP bundle."] as const;
const apiRoute4 = ["GET /api/v1/preview", "Read the most recent preview metadata."] as const;
const apiRoute5 = ["POST /api/v1/preview/deploy", "Persist the latest generated artifact."] as const;
const apiRoute6 = ["GET /api/v1/tools/list", "List tools discovered from the latest generation."] as const;
const apiRoute7 = ["POST /api/v1/tools/call", "Call supported demo tools such as add and multiply."] as const;
const apiRoute8 = ["POST /api/v1/sandbox/start", "Create a sandbox session for live agent analysis."] as const;
const apiRoute9 = ["GET /api/v1/ws/sandbox/{session_id}", "Stream live sandbox events over WebSocket."] as const;

const envVar1 = ["NEXT_PUBLIC_BACKEND_URL", "Frontend URL for the deployed backend."] as const;
const envVar2 = ["CORS_ORIGINS", "Comma-separated browser origins or * for permissive access."] as const;
const envVar3 = ["LLM_PROVIDER", "Set to groq to use the remote provider or leave on fallback mode."] as const;
const envVar4 = ["GROQ_API_KEY", "Required for Groq-backed generation."] as const;
const envVar5 = ["GROQ_MODEL", "Model name used for generation requests."] as const;

export default function DocsPage() {
  return (
    <main className="docs-shell">
      <Topbar activePath="/docs" />

      <section className="docs-layout" aria-label="Application documentation">
        <aside className="docs-toc" aria-label="Documentation table of contents">
          <div className="docs-toc-card">
            <p className="section-label">Docs</p>
            <h1>AgentBridge AI</h1>
            <p className="docs-toc-copy">
              A quick product guide for the workspace, generator, sandbox, deployment flow, and backend contract.
            </p>

            <nav className="docs-nav">
              <a href="#overview">Overview</a>
              <a href="#workflow">Workflow</a>
              <a href="#architecture">Architecture</a>
              <a href="#api">API surface</a>
              <a href="#protocol">Sandbox protocol</a>
              <a href="#deploy">Deployment</a>
              <a href="#troubleshooting">Troubleshooting</a>
              <a href="#api">API reference</a>
              <a href="#env">Environment</a>
              <a href="#routes">Routes</a>
              <a href="#files">Related files</a>
            </nav>

            <div className="docs-toc-actions">
              <Link className="primary-cta inline-cta" href="/workspace">
                Open Workspace
              </Link>
              <Link className="secondary-cta inline-cta" href="/generator">
                Try Generator
              </Link>
            </div>
          </div>
        </aside>

        <article className="docs-content">
          <header className="docs-hero workspace-card workspace-card-surface">
            <p className="section-label">Application docs</p>
            <h2>Everything the app does, in one glanceable place.</h2>
            <p className="docs-hero-copy">
              This page is the in-app documentation for AgentBridge AI. It matches the current runtime behavior of the workspace and backend, so the UI, APIs, and deployment steps stay easy to discover.
            </p>
          </header>

          <section className="docs-grid">
            <section id={overviewSection.id} className="docs-card workspace-card workspace-card-surface">
              <header className="docs-card-head">
                <p className="section-label">{overviewSection.title}</p>
                <h3>{overviewSection.title}</h3>
              </header>
              <p>{overviewSection.copy}</p>
            </section>

            <section id={workflowSection.id} className="docs-card workspace-card workspace-card-surface">
              <header className="docs-card-head">
                <p className="section-label">{workflowSection.title}</p>
                <h3>{workflowSection.title}</h3>
              </header>
              <p>{workflowSection.copy}</p>
            </section>

            <section id={architectureSection.id} className="docs-card workspace-card workspace-card-surface">
              <header className="docs-card-head">
                <p className="section-label">{architectureSection.title}</p>
                <h3>{architectureSection.title}</h3>
              </header>
              <p>{architectureSection.copy}</p>
            </section>

            <section id={apiSurfaceSection.id} className="docs-card workspace-card workspace-card-surface">
              <header className="docs-card-head">
                <p className="section-label">{apiSurfaceSection.title}</p>
                <h3>{apiSurfaceSection.title}</h3>
              </header>
              <p>{apiSurfaceSection.copy}</p>
            </section>

            <section id={protocolSection.id} className="docs-card workspace-card workspace-card-surface">
              <header className="docs-card-head">
                <p className="section-label">{protocolSection.title}</p>
                <h3>{protocolSection.title}</h3>
              </header>
              <p>{protocolSection.copy}</p>
            </section>

            <section id={deploySection.id} className="docs-card workspace-card workspace-card-surface">
              <header className="docs-card-head">
                <p className="section-label">{deploySection.title}</p>
                <h3>{deploySection.title}</h3>
              </header>
              <p>{deploySection.copy}</p>
            </section>

            <section id={troubleshootingSection.id} className="docs-card workspace-card workspace-card-surface">
              <header className="docs-card-head">
                <p className="section-label">{troubleshootingSection.title}</p>
                <h3>{troubleshootingSection.title}</h3>
              </header>
              <p>{troubleshootingSection.copy}</p>
            </section>
          </section>

          <section id="api" className="docs-block workspace-card workspace-card-surface">
            <header className="docs-block-head">
              <p className="section-label">API reference</p>
              <h3>Backend routes</h3>
            </header>
            <div className="docs-table">
              <div className="docs-table-row">
                <code>{apiRoute1[0]}</code>
                <span>{apiRoute1[1]}</span>
              </div>
              <div className="docs-table-row">
                <code>{apiRoute2[0]}</code>
                <span>{apiRoute2[1]}</span>
              </div>
              <div className="docs-table-row">
                <code>{apiRoute3[0]}</code>
                <span>{apiRoute3[1]}</span>
              </div>
              <div className="docs-table-row">
                <code>{apiRoute4[0]}</code>
                <span>{apiRoute4[1]}</span>
              </div>
              <div className="docs-table-row">
                <code>{apiRoute5[0]}</code>
                <span>{apiRoute5[1]}</span>
              </div>
              <div className="docs-table-row">
                <code>{apiRoute6[0]}</code>
                <span>{apiRoute6[1]}</span>
              </div>
              <div className="docs-table-row">
                <code>{apiRoute7[0]}</code>
                <span>{apiRoute7[1]}</span>
              </div>
              <div className="docs-table-row">
                <code>{apiRoute8[0]}</code>
                <span>{apiRoute8[1]}</span>
              </div>
              <div className="docs-table-row">
                <code>{apiRoute9[0]}</code>
                <span>{apiRoute9[1]}</span>
              </div>
            </div>
          </section>

          <section id="env" className="docs-block workspace-card workspace-card-surface">
            <header className="docs-block-head">
              <p className="section-label">Environment</p>
              <h3>Required variables</h3>
            </header>
            <div className="docs-table">
              <div className="docs-table-row">
                <code>{envVar1[0]}</code>
                <span>{envVar1[1]}</span>
              </div>
              <div className="docs-table-row">
                <code>{envVar2[0]}</code>
                <span>{envVar2[1]}</span>
              </div>
              <div className="docs-table-row">
                <code>{envVar3[0]}</code>
                <span>{envVar3[1]}</span>
              </div>
              <div className="docs-table-row">
                <code>{envVar4[0]}</code>
                <span>{envVar4[1]}</span>
              </div>
              <div className="docs-table-row">
                <code>{envVar5[0]}</code>
                <span>{envVar5[1]}</span>
              </div>
            </div>
          </section>

          <section id="routes" className="docs-block workspace-card workspace-card-surface">
            <header className="docs-block-head">
              <p className="section-label">Routes</p>
              <h3>App entry points</h3>
            </header>
            <div className="docs-route-grid">
              <div>
                <h4>Frontend</h4>
                <ul>
                  <li><code>/workspace</code> - main dashboard with generator, code viewer, health, output, and sandbox panels.</li>
                  <li><code>/generator</code> - standalone prompt-to-code experience.</li>
                  <li><code>/deploy</code> - deployment helper workflow.</li>
                  <li><code>/sandbox</code> and <code>/sandbox/[id]</code> - sandbox overview and session replay.</li>
                  <li><code>/servers/[id]</code> - server detail and log view.</li>
                </ul>
              </div>
              <div>
                <h4>Backend</h4>
                <ul>
                  <li><code>/health</code> - readiness endpoint used by Render.</li>
                  <li><code>/api/generate</code> - generation entry point.</li>
                  <li><code>/api/v1/preview</code> - latest preview state.</li>
                  <li><code>/api/v1/tools/*</code> - demo MCP tool discovery and invocation.</li>
                  <li><code>/api/v1/sandbox/*</code> - live agent session management.</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="files" className="docs-block workspace-card workspace-card-surface">
            <header className="docs-block-head">
              <p className="section-label">Related files</p>
              <h3>Documentation sources</h3>
            </header>
            <ul className="docs-file-list">
              <li><Link href="/docs">This docs page</Link> - live product documentation in the app.</li>
              <li><Link href="/workspace">/workspace</Link> - primary operator interface.</li>
              <li><Link href="/generator">/generator</Link> - focused generation entry point.</li>
              <li><span>docs/agent_protocol.md</span> - sandbox event shapes and rendering notes in the repository.</li>
            </ul>
          </section>
        </article>
      </section>
    </main>
  );
}