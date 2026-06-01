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
    <section className="generator-client">
      <header className="generator-client-head">
        <div>
          <p className="section-label">Generator</p>
          <h3>Natural language prompt</h3>
        </div>
        <p className="generator-hint">Write one clear request. The backend will format the result into MCP-ready FastAPI code.</p>
      </header>

      <form className="generator-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="mcp-description">
          What should the MCP server do?
        </label>
        <textarea
          id="mcp-description"
          rows={6}
          placeholder="Describe the MCP server you want..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="generator-actions">
          <button className="primary-cta generator-submit" type="submit" disabled={loading}>
            {loading ? "Generating…" : "Generate"}
          </button>
        </div>
      </form>

      {result ? (
        <section className="generator-result" aria-live="polite">
          <p className="section-label">Latest output</p>
          <pre>{result}</pre>
        </section>
      ) : null}
    </section>
  );
}
