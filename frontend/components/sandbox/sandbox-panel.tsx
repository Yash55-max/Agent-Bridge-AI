import { FocusIcon, SearchIcon } from "@/components/icons";
import type { AgentCard, PreviewPayload } from "@/lib/preview";
import SandboxClient from "@/app/sandbox/SandboxClient";

export function SandboxPanel({
  title,
  agents,
  preview,
}: {
  title: string;
  agents: AgentCard[];
  preview: PreviewPayload;
}) {
  const [firstAgent, secondAgent] = agents as unknown as [AgentCard?, AgentCard?];
  const [primaryTool, secondaryTool, tertiaryTool] = preview.tools as unknown as [string?, string?, string?];

  return (
    <section className="sandbox-pane workspace-card workspace-card-surface">
      <header className="panel-header sandbox-header compact">
        <div>
          <p className="section-label">Agents</p>
          <h3>{title}</h3>
        </div>
        <div className="sandbox-actions">
          <button className="mini-icon-button" type="button" aria-label="Zoom in">
            <SearchIcon />
          </button>
          <button className="mini-icon-button" type="button" aria-label="Zoom out">
            <SearchIcon />
          </button>
          <button className="mini-icon-button" type="button" aria-label="Fit to screen">
            <FocusIcon />
          </button>
        </div>
      </header>

      <div className="sandbox-grid">
        {firstAgent ? (
          <article className={`agent-card ${firstAgent.accent}`}>
            <div className="agent-card-head">
              <div className="agent-avatar">✦</div>
              <div>
                <h3>{firstAgent.title}</h3>
                <p>{firstAgent.state}</p>
              </div>
            </div>
            <div className="agent-console">{firstAgent.body}</div>
          </article>
        ) : (
          <article className="agent-card violet">
            <div className="agent-card-head">
              <div className="agent-avatar">✦</div>
              <div>
                <h3>No agents yet</h3>
                <p>Connect a server to stream live analysis.</p>
              </div>
            </div>
            <div className="agent-console">Generate a server to populate the sandbox with live agent turns and summaries.</div>
          </article>
        )}

        {secondAgent ? (
          <article className={`agent-card ${secondAgent.accent}`}>
            <div className="agent-card-head">
              <div className="agent-avatar">✦</div>
              <div>
                <h3>{secondAgent.title}</h3>
                <p>{secondAgent.state}</p>
              </div>
            </div>
            <div className="agent-console">{secondAgent.body}</div>
          </article>
        ) : null}

        <div className="server-node">
          <div className="node-icon">⟡</div>
          <h3>{preview.name}</h3>
          <div className="chip-row">
            {primaryTool ? <span>{`${primaryTool}`.replaceAll("_", " ")}</span> : null}
            {secondaryTool ? <span>{`${secondaryTool}`.replaceAll("_", " ")}</span> : null}
            {tertiaryTool ? <span>{`${tertiaryTool}`.replaceAll("_", " ")}</span> : null}
          </div>
          <div className="progress-track">
            <span />
          </div>
          <p>Traffic: {preview.sandbox.events} events</p>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <SandboxClient />
      </div>

      <div className="sandbox-link" aria-hidden>
        <span />
      </div>
    </section>
  );
}
