"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import eventStore from "../../../lib/eventStore";

export default function ServerPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [server, setServer] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [logs, setLogs] = useState<string>("");
  const [tailing, setTailing] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const logsRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => {
    fetch(`/api/v1/servers/${id}`)
      .then((r) => r.json())
      .then(setServer)
      .catch(() => setServer(null));
    fetch(`/api/v1/servers/${id}/health`)
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth(null));
    // fetch logs and seed event store
    fetch(`/api/v1/servers/${id}/logs?tail=200`)
      .then((r) => r.text())
      .then((txt) => {
        setLogs(txt);
        // split into lines and push into event store for replay
        txt.split(/\r?\n/).forEach((ln) => {
          if (ln) {
            eventStore.addLogEvent(id, ln);
            // persist to backend (best-effort)
            try {
              fetch(`/api/v1/servers/${id}/events`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ line: ln, ts: Date.now(), type: "log" }),
              });
            } catch (err) {}
          }
        });
      })
      .catch(() => setLogs(""));
  }, [id]);

  // SSE with reconnect/backoff and pushing into event store
  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimer: number | null = null;
    const url = `/api/v1/servers/${id}/logs/stream`;
    let attempt = 0;

    function connect() {
      try {
        es = new EventSource(url);
      } catch (err) {
        scheduleReconnect();
        return;
      }

      es.onopen = () => {
        attempt = 0;
      };

      es.onmessage = (e) => {
        // append new data lines
        setLogs((prev) => (prev ? prev + "\n" + e.data : e.data));
        // record in event store for unified replay and persist
        try {
          eventStore.addLogEvent(id, e.data);
          fetch(`/api/v1/servers/${id}/events`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ line: e.data, ts: Date.now(), type: "log" }),
          });
        } catch (err) {}
      };

      es.onerror = () => {
        try {
          es && es.close();
        } catch (err) {}
        es = null;
        scheduleReconnect();
      };
    }

    function scheduleReconnect() {
      attempt += 1;
      const delay = Math.min(30000, 500 * Math.pow(2, attempt));
      reconnectTimer = window.setTimeout(() => {
        connect();
      }, delay) as unknown as number;
    }

    if (tailing) connect();

    return () => {
      try {
        if (es) es.close();
      } catch (err) {}
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
    };
  }, [id, tailing]);

  // auto-scroll when logs change
  useEffect(() => {
    if (!autoScroll) return;
    try {
      if (logsRef.current) {
        logsRef.current.scrollTop = logsRef.current.scrollHeight;
      }
    } catch (err) {}
  }, [logs, autoScroll]);

  async function stop() {
    setLoading(true);
    await fetch(`/api/v1/servers/${id}/stop`, { method: "POST" });
    setLoading(false);
    // refresh
    const h = await fetch(`/api/v1/servers/${id}/health`).then((r) => r.json());
    setHealth(h);
  }

  async function remove() {
    setLoading(true);
    await fetch(`/api/v1/servers/${id}/remove`, { method: "POST" });
    setLoading(false);
    router.push("/servers");
  }

  function download() {
    window.location.href = `/api/v1/servers/${id}/download`;
  }

  if (!server) return <div>Loading server...</div>;

  return (
    <main style={{ padding: 24 }}>
      <h1>{server.name}</h1>
      <p>{server.natural_language_spec}</p>
      <h3>Status: {server.status}</h3>
      <pre style={{ background: "#f3f4f6", padding: 12 }}>{server.generated_code}</pre>

      <div style={{ marginTop: 12 }}>
        <button onClick={download}>Download Code</button>
        <button onClick={stop} disabled={loading} style={{ marginLeft: 8 }}>
          Stop
        </button>
        <button onClick={remove} disabled={loading} style={{ marginLeft: 8 }}>
          Remove
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <h4>Health</h4>
        <pre>{JSON.stringify(health, null, 2)}</pre>
      </div>

      <div style={{ marginTop: 16 }}>
        <h4>Logs</h4>
        <div style={{ marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={async () => {
              const t = await fetch(`/api/v1/servers/${id}/logs?tail=500`).then((r) => r.text());
              setLogs(t);
              // seed event store
              t.split(/\r?\n/).forEach((ln) => ln && eventStore.addLogEvent(id, ln));
            }}
          >
            Refresh Logs
          </button>

          <button
            onClick={() => {
              setTailing((s) => !s);
            }}
          >
            {tailing ? "Stop Tailing" : "Start Tailing"}
          </button>

          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} />
            Auto-scroll
          </label>

          <button
            onClick={() => {
              eventStore.clearEvents(id);
              setLogs("");
            }}
          >
            Clear Logs
          </button>
        </div>
        <pre ref={logsRef} style={{ background: "#0f172a", color: "#e6edf3", padding: 12, maxHeight: 400, overflow: "auto" }}>{logs}</pre>
      </div>
    </main>
  );
}
