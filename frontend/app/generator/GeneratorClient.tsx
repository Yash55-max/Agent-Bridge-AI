"use client";

import { useState } from "react";

export default function GeneratorClient() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      // Use local Next API route which proxies to the backend to avoid CORS
      const res = await fetch(`/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: globalThis.JSON.stringify({ description }),
      });
      const data = await res.json();
      const code = data.generated_code ?? globalThis.JSON.stringify(data, null, 2);
      setResult(code);
      try {
        window.localStorage.setItem("agentbridge.generated_code", code);
        if (data.server_name) {
          window.localStorage.setItem("agentbridge.server_name", `${data.server_name}`);
        }
      } catch {}
      // Emit event so other panels (output) can pick up the generated code
      try {
        window.dispatchEvent(new CustomEvent("generated", { detail: { generated_code: code, ...data } }));
      } catch {
        // ignore
      }
    } catch (err) {
      setResult(`${err}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Generator</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          rows={6}
          style={{ width: "100%" }}
          placeholder="Describe the MCP server you want..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading}>
            {loading ? "Generating…" : "Generate"}
          </button>
        </div>
      </form>

      {result ? (
        <pre style={{ marginTop: 12, maxHeight: 320, overflow: "auto" }}>{result}</pre>
      ) : null}
    </div>
  );
}
