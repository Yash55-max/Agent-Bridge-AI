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
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      const code = data.generated_code ?? JSON.stringify(data, null, 2);
      setResult(code);
      // Emit event so other panels (output) can pick up the generated code
      try {
        // @ts-ignore - window may not exist in some SSR contexts
        window.dispatchEvent(new CustomEvent("generated", { detail: { generated_code: code } }));
      } catch (e) {
        // ignore
      }
    } catch (err) {
      setResult(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Generator (MVP)</h2>
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
    </div>
  );
}
