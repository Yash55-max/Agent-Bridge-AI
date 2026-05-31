import Link from "next/link";

export default function Page() {
  return (
    <main className="landing-shell">
      <section className="landing-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="brand-mark" style={{ width: 18, height: 18 }} />
          <p className="section-label">AgentBridge AI</p>
        </div>
        <h1>Generate MCP servers from a prompt, then jump straight into the workspace.</h1>
        <p className="landing-copy">
          Turn a short description into a ready-to-run FastAPI MCP server, inspect the output, and continue
          refining it inside the workspace.
        </p>

        <div className="landing-actions">
          <Link className="primary-cta inline-cta" href="/workspace">
            Open Workspace
          </Link>
          <Link className="secondary-cta inline-cta" href="/generator">
            Try the Generator
          </Link>
        </div>

        <div className="landing-stats">
          <article className="landing-stat">
            <strong>Prompt to server</strong>
            <span>FastAPI MCP scaffolds from natural language.</span>
          </article>
          <article className="landing-stat">
            <strong>Workspace connected</strong>
            <span>Move from the landing page into the live dashboard.</span>
          </article>
          <article className="landing-stat">
            <strong>Groq-powered</strong>
            <span>Uses the configured Groq provider in the backend.</span>
          </article>
        </div>
        <pre className="code-preview">{
      `# sample generated tool
      from fastapi import FastAPI
      app = FastAPI()

      @app.post('/add')
      def add(a: float, b: float):
          return {{'result': a + b}}
      `}</pre>
      </section>

      <section className="landing-grid">
        <article className="landing-card">
          <p className="section-label">01 · Describe</p>
          <h2>Write the server you want in plain English.</h2>
          <p>
            Ask for routes, tools, packaging, or a complete MCP server template and let the generator do the
            heavy lifting.
          </p>
        </article>

        <article className="landing-card">
          <p className="section-label">02 · Generate</p>
          <h2>Review output, code blocks, and downloadable files.</h2>
          <p>
            The backend can return code or a ZIP bundle, so you can inspect the result before taking it further.
          </p>
        </article>

        <article className="landing-card">
          <p className="section-label">03 · Continue</p>
          <h2>Open the workspace for the full dashboard experience.</h2>
          <p>
            The workspace brings together generation, health, output, and sandbox panels in one place.
          </p>
        </article>
      </section>
    </main>
  );
}
