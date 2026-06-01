import OutputClient from "@/components/monitoring/OutputClient";

export function OutputPanel() {
  return (
    <article className="panel output-panel workspace-card workspace-card-surface">
      <header className="panel-header output-head compact">
        <div>
          <p className="section-label">Sandbox WS</p>
          <h3>Live event stream</h3>
        </div>
        <div className="tab-row">
          <button className="tab active" type="button">Output</button>
          <button className="tab" type="button">Debug Console</button>
          <button className="tab" type="button">Terminal</button>
        </div>
        <div className="panel-actions">
          <button className="mini-icon-button" type="button" aria-label="Mute">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 5 5 19" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </button>
          <button className="mini-icon-button" type="button" aria-label="Close">
            ×
          </button>
        </div>
      </header>

      <OutputClient />
    </article>
  );
}
