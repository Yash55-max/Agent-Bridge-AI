"use client";

import { useEffect, useState } from "react";

function escapeJson(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildJsonBody(key: string, value: string) {
  return `{"${key}":"${escapeJson(value)}"}`;
}

function appendTrace(current: string, entry: string) {
  return current ? `${current}\n${entry}` : entry;
}

function captureGroup(text: string, pattern: RegExp) {
  const match = text.match(pattern);
  return match ? `${(match as any)[1] ?? ""}` : "";
}

export function SandboxExperience() {
  const [mission, setMission] = useState("");
  const [trace, setTrace] = useState("");
  const [result, setResult] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let mounted = true;
    const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

    async function startSession() {
      try {
        const res = await fetch(`${base}/api/v1/sandbox/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: buildJsonBody("server_url", window.localStorage.getItem("agentbridge.server_name") ?? ""),
        });
        if (!mounted) return;
        const payload = await res.json();
        const sessionId: string | undefined = payload.session_id;
        if (!sessionId) {
          setTrace((current) => appendTrace(current, "[sandbox] failed to start session"));
          return;
        }
        const wsUrl = base.replace(/^http/, "ws") + `/api/v1/ws/sandbox/${sessionId}`;
        const ws = new WebSocket(wsUrl);

        ws.addEventListener("open", () => {
          setConnected(true);
          setTrace((current) => appendTrace(current, `[ws] connected ${sessionId}`));
        });

        ws.addEventListener("message", (event) => {
          const text = `${event.data}`;
          if (text.includes('"type":"final"')) {
            const payload = captureGroup(text, /"payload"\s*:\s*"((?:\\.|[^"\\])*)"/);
            setResult(payload ? payload.replace(/\\"/g, '"').replace(/\\\\/g, "\\") : text);
          } else {
            const message = captureGroup(text, /"message"\s*:\s*"((?:\\.|[^"\\])*)"/);
            setTrace((current) => appendTrace(current, message || text));
          }
        });

        ws.addEventListener("close", () => {
          setConnected(false);
          setTrace((current) => appendTrace(current, "[ws] connection closed"));
        });
      } catch (e) {
        setTrace((current) => appendTrace(current, `[sandbox] error starting session: ${e}`));
      }
    }

    startSession();
    return () => {
      mounted = false;
    };
  }, []);

  async function runMission() {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
    try {
      await fetch(`${base}/api/v1/sandbox/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: buildJsonBody("command", mission),
      });
      setTrace((current) => appendTrace(current, `[mission] dispatched: ${mission}`));
    } catch (e) {
      setTrace((current) => appendTrace(current, `[mission] dispatch error: ${e}`));
    }
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
          <article className="agent-config violet">
            <h4>Agent 1: The Data Analyst</h4>
            <p>Ready</p>
            <span>Extracts data, builds structured findings, and summarizes insights.</span>
          </article>
          <article className="agent-config teal">
            <h4>Agent 2: The Supervisor</h4>
            <p>Monitoring</p>
            <span>Checks protocol steps, validates outputs, and formats the final result.</span>
          </article>
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
            <pre className="trace-log">{trace}</pre>
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
