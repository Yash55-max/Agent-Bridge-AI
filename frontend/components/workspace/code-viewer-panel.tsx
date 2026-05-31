"use client";

import { useEffect, useMemo, useState } from "react";

const defaultCode = `# Generated code will appear here after you run the generator.`;

export function CodeViewerPanel() {
  const [code, setCode] = useState(defaultCode);

  useEffect(() => {
    function onGenerated(event: Event) {
      const detail = (event as CustomEvent<{ generated_code?: string }>).detail;
      if (detail?.generated_code) {
        setCode(detail.generated_code);
      }
    }

    window.addEventListener("generated", onGenerated);
    return () => window.removeEventListener("generated", onGenerated);
  }, []);

  const canDownload = useMemo(() => code.trim().length > 0, [code]);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
  }

  function downloadScript() {
    const blob = new Blob([code], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "generated_mcp_server.py";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <article className="panel code-panel-shell">
      <header className="panel-header compact">
        <div>
          <p className="section-label">Code Viewer</p>
          <h3>Generated FastAPI/Python</h3>
        </div>
        <div className="panel-actions">
          <button className="snippet-button" type="button" onClick={copyCode} aria-label="Copy code">
            Copy Code
          </button>
          <button className="snippet-button" type="button" onClick={downloadScript} disabled={!canDownload} aria-label="Download script">
            Download Script
          </button>
        </div>
      </header>

      <pre className="code-viewer">
        <code>{code}</code>
      </pre>

      <div className="deploy-strip">
        <button
          className="primary-cta inline-cta"
          type="button"
          onClick={async () => {
            try {
              await fetch(`/api/v1/preview/deploy`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ server_name: "deployed-server", generated_code: code }),
              });
              // navigate to sandbox after deploy
              window.location.href = "/sandbox";
            } catch (e) {
              console.error("deploy failed", e);
            }
          }}
        >
          Deploy to Sandbox
        </button>
      </div>
    </article>
  );
}
