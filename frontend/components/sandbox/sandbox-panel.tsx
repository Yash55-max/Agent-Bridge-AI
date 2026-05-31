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
  return (
    <section className="sandbox-pane">
      <header className="panel-header sandbox-header">
        <h2>{title}</h2>
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
        {(agents as AgentCard[]).map((card: AgentCard) => (
          <article key={card.title} className={`agent-card ${card.accent}`}>
            <div className="agent-card-head">
              <div className="agent-avatar">✦</div>
              <div>
                <h3>{card.title}</h3>
                <p>{card.state}</p>
              </div>
            </div>
            <div className="agent-console">{card.body}</div>
          </article>
        ))}

        <div className="server-node">
          <div className="node-icon">⟡</div>
          <h3>{preview.name}</h3>
          <div className="chip-row">
            {(preview.tools as string[]).map((tool: string) => (
              <span key={tool}>{tool.split("_").join(" ")}</span>
            ))}
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
