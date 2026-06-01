export function HealthPanel({
  status,
  sandbox,
}: {
  status: string;
  sandbox: { agents: number; latencyMs: number };
}) {
  return (
    <article className="panel health-panel workspace-card workspace-card-surface">
      <header className="panel-header compact">
        <div>
          <p className="section-label">System Health</p>
          <h3>Runtime status</h3>
        </div>
      </header>

      <div className="health-grid">
        <div>
          <p className="muted">Server Status</p>
          <p className={`health-value ${status === "ready" || status === "running" ? "status-good" : "status-warn"}`}>
            {status}
          </p>
        </div>
        <div>
          <p className="muted">Latency</p>
          <p className="health-value">{sandbox.latencyMs}ms</p>
        </div>
        <div>
          <p className="muted">Agents Connected</p>
          <p className="health-value">{sandbox.agents}</p>
        </div>
        <div>
          <p className="muted">Tools</p>
          <p className="health-value small">Live from preview API</p>
        </div>
      </div>
    </article>
  );
}
