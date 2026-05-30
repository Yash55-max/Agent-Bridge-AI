"use client";

import { useEffect, useMemo, useState } from "react";

const agents = [
  {
    name: "Agent 1: The Data Analyst",
    status: "Ready",
    accent: "violet",
    description: "Extracts data, builds structured findings, and summarizes insights.",
  },
  {
    name: "Agent 2: The Supervisor",
    status: "Monitoring",
    accent: "teal",
    description: "Checks protocol steps, validates outputs, and formats the final result.",
  },
] as const;

export function SandboxExperience() {
  const [mission, setMission] = useState("");
  const [trace, setTrace] = useState<string[]>([]);
  const [result, setResult] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
    const wsUrl = base.replace(/^http/, "ws") + "/api/v1/sandbox/demo-session";
    const ws = new WebSocket(wsUrl);

    ws.addEventListener("open", () => {
      setConnected(true);
      setTrace((current) => [...current, "[ws] Connected to sandbox protocol stream."]);
    });

    ws.addEventListener("message", (event) => {
      setTrace((current) => [...current, `[ws] ${event.data}`]);
    });

    ws.addEventListener("close", () => {
      setConnected(false);
      setTrace((current) => [...current, "[ws] Connection closed."]);
    });

    return () => ws.close();
  }, []);

  const traceLines = useMemo(() => trace.slice(-20), [trace]);

  async function runMission() {
    setTrace((current) => [
      ...current,
      `[mission] ${mission}`,
      "[agent 1] Calling generated MCP server tool...",
      "[server] Returning database payload...",
      "[agent 1] Passing structured context to Agent 2...",
      "[agent 2] Formatting summary and validating output...",
    ]);

    setResult(
      "Inactive users from the last 30 days were identified, summarized, and packaged into a concise report for the supervisor."
    );
  }

  return (
    <main className="simulation-shell">
      <section className="simulation-sidebar panel">
        <header className="panel-header compact">
          <div>
            <p className="section-label">Agent Configuration</p>
            <h3>Two-agent stack</h3>
          </div>
        </header>

        <div className="agent-stack">
          {agents.map((agent) => (
            <article key={agent.name} className={`agent-config ${agent.accent}`}>
              <h4>{agent.name}</h4>
              <p>{agent.status}</p>
              <span>{agent.description}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="simulation-main panel">
        <header className="panel-header compact">
          <div>
            <p className="section-label">Live Simulator</p>
            <h3>Multi-Agent Sandbox</h3>
          </div>
          <div className={connected ? "status-good" : "status-warn"}>{connected ? "Connected" : "Connecting"}</div>
        </header>

        <div className="mission-input-block">
          <p className="section-label">Task Input</p>
          <textarea aria-label="Sandbox mission" value={mission} onChange={(event) => setMission(event.target.value)} />
          <div className="mission-actions">
            <button className="primary-cta inline-cta" type="button" onClick={runMission}>
              Run Mission
            </button>
            <a className="secondary-cta inline-cta" href="/workspace">
              Back to Workspace
            </a>
          </div>
        </div>

        <div className="trace-and-output">
          <article className="trace-panel">
            <header className="panel-header compact">
              <h3>Live Protocol Trace</h3>
            </header>
            <pre className="trace-log">
              {traceLines.map((line, idx) => (
                <span key={idx}>{line}{"\n"}</span>
              ))}
            </pre>
          </article>

          <article className="result-panel">
            <header className="panel-header compact">
              <h3>Final Output</h3>
            </header>
            <div className="result-window">{result}</div>
          </article>
        </div>
      </section>
    </main>
  );
}
