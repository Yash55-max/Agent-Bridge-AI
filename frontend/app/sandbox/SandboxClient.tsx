"use client";

import { useEffect, useRef, useState } from "react";

export default function SandboxClient() {
  const [logs, setLogs] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
    const wsUrl = base.replace(/^http/, "ws") + "/api/v1/sandbox/test-session";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.addEventListener("open", () => setLogs((l) => [...l, "ws:open"]));
    ws.addEventListener("message", (ev) => setLogs((l) => [...l, `recv: ${ev.data}`]));
    ws.addEventListener("close", () => setLogs((l) => [...l, "ws:close"]));
    return () => ws.close();
  }, []);

  function sendPing() {
    wsRef.current?.send("ping");
    setLogs((l) => [...l, "sent: ping"]);
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Sandbox (WS)</h2>
      <div>
        <button onClick={sendPing}>Send ping</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <h3>Logs</h3>
        <div style={{ maxHeight: 240, overflow: "auto", background: "#0b0b0b", color: "#e6e6e6", padding: 8 }}>
          {logs.map((ln, i) => (
            <div key={i}>{ln}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
