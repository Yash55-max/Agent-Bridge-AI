import Link from "next/link";

export function Topbar({ activePath }: { activePath?: string }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark" />
        <div>
          <h1>AgentBridge AI</h1>
          <p>Console v1.0.4-stable</p>
        </div>
      </div>

      <nav className="topnav" aria-label="Primary">
        <Link className={activePath === "/workspace" ? "active" : ""} href="/workspace">
          Workspace
        </Link>
        <Link className={activePath === "/sandbox" ? "active" : ""} href="/sandbox">
          Sandbox
        </Link>
        <Link className={activePath === "/deploy" ? "active" : ""} href="/deploy">
          Deploy
        </Link>
        <Link href="/workspace#docs">Docs</Link>
      </nav>

      <div className="topbar-actions">
        <button className="project-pill" type="button">Project: Default</button>
        <button className="icon-button" type="button" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 17H9a3 3 0 0 1-3-3v-3a6 6 0 1 1 12 0v3a3 3 0 0 1-3 3Z" />
            <path d="M10 17a2 2 0 0 0 4 0" />
          </svg>
        </button>
        <button className="icon-button" type="button" aria-label="Help">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M9.8 9a2.4 2.4 0 1 1 4.1 1.7c-.9.8-1.7 1.1-1.7 2.8" />
            <path d="M12 17h.01" />
          </svg>
        </button>
        <div className="avatar" aria-label="User profile">
          <span>AB</span>
        </div>
      </div>
    </header>
  );
}
