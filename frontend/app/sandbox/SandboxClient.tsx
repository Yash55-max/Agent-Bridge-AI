"use client";

import { useEffect, useRef, useState } from "react";

type SandboxEvent = {
  kind: string;
  title: string;
  agent?: string;
  payload?: unknown;
  raw?: string;
};

function prettyPayload(value: unknown) {
  if (typeof value === "string") {
    // unescape common escaped newlines and tabs that come double-escaped in JSON strings
    let s = value.replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t");
    s = s.trim();
    // if it's JSON string, pretty print it
    try {
      if ((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
        const parsed = JSON.parse(s);
        return JSON.stringify(parsed, null, 2);
      }
    } catch {
      // fall through
    }
    return s;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function summarizeEvent(message: Record<string, unknown>, raw: string): SandboxEvent {
  const kind = typeof message.type === "string" ? message.type : typeof message.event === "string" ? message.event : "message";
  const agent = typeof message.agent === "string" ? message.agent : undefined;

  if (kind === "connected") {
    return {
      kind,
      title: "Sandbox connected",
      payload: prettyPayload(message),
      raw,
    };
  }

  if (kind === "agent:analysis") {
    return {
      kind,
      title: agent ? `Agent analysis: ${agent}` : "Agent analysis",
      agent,
      payload: message.result ?? message,
      raw,
    };
  }

  if (kind === "mcp:tool_result") {
    return {
      kind,
      title: agent ? `Tool result: ${agent}` : "Tool result",
      agent,
      payload: message.result ?? message,
      raw,
    };
  }

  if (kind === "final") {
    const res = message.result as Record<string, unknown> | undefined;
    if (res && Array.isArray(res.paragraphs)) {
      return {
        kind,
        title: "Final summary",
        payload: res.paragraphs,
        raw,
      };
    }
    if (res && typeof res.summary === "string") {
      const paras = (res.summary as string).split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
      return {
        kind,
        title: "Final summary",
        payload: paras,
        raw,
      };
    }
    return { kind, title: "Final summary", payload: message, raw };
  }

  if (kind === "simulation:done") {
    return {
      kind,
      title: "Simulation finished",
      payload: prettyPayload(message),
      raw,
    };
  }

  return {
    kind,
    title: kind,
    payload: prettyPayload(message),
    raw,
  };
}

export default function SandboxClient() {
  const [events, setEvents] = useState<SandboxEvent[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [eventCount, setEventCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

    async function startAndConnect() {
      try {
        const res = await fetch(`${base}/api/v1/sandbox/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ server_url: base }),
        });
        if (!mounted) return;
        const payload = await res.json();
        const sid: string | undefined = payload.session_id;
        if (!sid) {
          setEvents((current) => [...current, { kind: "error", title: "Failed to start session", raw: "missing session_id" }]);
          return;
        }
        setSessionId(sid);
        setEvents((current) => [...current, { kind: "session", title: "Session started", payload: sid, raw: sid }]);

        const wsUrl = base.replace(/^http/, "ws") + `/api/v1/ws/sandbox/${sid}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        ws.addEventListener("open", () => setEvents((current) => [...current, { kind: "ws:open", title: "WebSocket connected", raw: "open" }]));

        ws.addEventListener("message", (ev) => {
          const raw = `${ev.data}`;
          setEventCount((count) => count + 1);
          try {
            const obj = JSON.parse(raw);
            setEvents((current) => [...current, summarizeEvent(obj as Record<string, unknown>, raw)]);
          } catch (e) {
            setEvents((current) => [...current, { kind: "raw", title: "Raw message", payload: raw, raw }]);
          }
        });

        ws.addEventListener("close", () => setEvents((current) => [...current, { kind: "ws:close", title: "WebSocket closed", raw: "close" }]));
      } catch (e) {
        setEvents((current) => [...current, { kind: "error", title: "Start error", payload: String(e), raw: String(e) }]);
      }
    }

    startAndConnect();

    return () => {
      mounted = false;
      wsRef.current?.close();
    };
  }, []);

  function sendPing() {
    wsRef.current?.send("ping");
    setEvents((current) => [...current, { kind: "client", title: "Sent ping", raw: "ping" }]);
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Sandbox (WS)</h2>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div>Session: {sessionId ?? "starting..."}</div>
        <div>Events: {eventCount}</div>
        <button onClick={sendPing}>Send ping</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <h3>Structured Trace</h3>
        <div style={{ maxHeight: 320, overflow: "auto", background: "#0b0b0b", color: "#e6e6e6", padding: 12, borderRadius: 8, border: "1px solid rgba(148,163,184,0.2)" }}>
          {events.map((event, index) => (
            <article key={`${event.kind}-${index}`} style={{ padding: "8px 0", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                <strong>{event.title}</strong>
                <span style={{ fontSize: 12, opacity: 0.7 }}>{event.kind}</span>
              </div>
              {event.agent ? <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Agent: {event.agent}</div> : null}
              {Array.isArray(event.payload) ? (
                <div style={{ marginTop: 8, color: "#d9f99d" }}>
                  {event.payload.map((p, i) => (
                    <p key={i} style={{ margin: "6px 0" }}>
                      {typeof p === "string" ? p : prettyPayload(p)}
                    </p>
                  ))}
                </div>
              ) : event.payload ? (
                <pre style={{ whiteSpace: "pre-wrap", marginTop: 8, marginBottom: 0, color: "#d9f99d" }}>{prettyPayload(event.payload)}</pre>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
