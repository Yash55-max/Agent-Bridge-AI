"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import eventStore from "../../../lib/eventStore";

export default function SandboxPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: serverId } = use(params);
  const [timeline, setTimeline] = useState<Array<{line:string, ts:number}>>([]);
  const [replaying, setReplaying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // seed from local event store
    const evs = eventStore.getEvents(serverId);
    setTimeline(evs.map((e:any) => ({ line: e.line, ts: e.ts })));
    // subscribe to live events
    const unsub = eventStore.subscribeLogs((e:any) => {
      if (e.serverId === serverId) setTimeline((t) => [...t, { line: e.line, ts: e.ts }]);
    });
    return () => unsub();
  }, [serverId]);

  async function fetchRemoteAndReplay() {
    const r = await fetch(`/api/v1/servers/${serverId}/events`);
    if (!r.ok) return;
    const j = await r.json();
    const evs = j.events || [];
    // play them with a simple interval
    setReplaying(true);
    setTimeline([]);
    for (let i = 0; i < evs.length; i++) {
      const e = evs[i];
      // wait a bit between events
      // use ts differences if available
      const delay = 150;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, delay));
      setTimeline((t) => [...t, { line: e.line, ts: e.ts || Date.now() }]);
      // also add to eventStore for unified state
      eventStore.addLogEvent(serverId, e.line);
    }
    setReplaying(false);
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Sandbox Replay for {serverId}</h1>
      <div style={{ marginBottom: 12 }}>
        <button onClick={fetchRemoteAndReplay} disabled={replaying}>
          {replaying ? "Replaying..." : "Replay Remote Events"}
        </button>
        <button
          onClick={() => {
            // clear timeline
            setTimeline([]);
          }}
          style={{ marginLeft: 8 }}
        >
          Clear
        </button>
      </div>

      <div style={{ border: "1px solid #ddd", padding: 12, maxHeight: 400, overflow: "auto" }}>
        {timeline.length === 0 ? <div>No events</div> : null}
        {timeline.map((e, i) => (
          <div key={i} style={{ padding: 6, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 12, color: "#666" }}>{new Date(e.ts).toLocaleTimeString()}</div>
            <div style={{ fontFamily: "monospace" }}>{e.line}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
