import GeneratorClient from "@/app/generator/GeneratorClient";
import { CodeViewerPanel } from "@/components/workspace/code-viewer-panel";

export function GeneratorPanel() {
  return (
    <section className="generator-workspace">
      <header className="workspace-hero">
        <p className="section-label">Natural Language to MCP</p>
        <h2>Design, generate, inspect</h2>
        <p className="workspace-hero-copy">
          Describe the server you want, generate the MCP implementation, then review the resulting code before you deploy it into the sandbox flow.
        </p>
      </header>

      <article className="panel workspace-card workspace-card-surface">
        <div className="workspace-card-body">
          <GeneratorClient />
        </div>
      </article>

      <CodeViewerPanel />
    </section>
  );
}
