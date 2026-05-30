import GeneratorClient from "@/app/generator/GeneratorClient";
import { CodeViewerPanel } from "@/components/workspace/code-viewer-panel";

export function GeneratorPanel() {
  return (
    <article className="panel panel-large">
      <header className="panel-header">
        <h2>Natural Language to MCP</h2>
      </header>

      <div style={{ padding: 8 }}>
        <GeneratorClient />
      </div>

      <div style={{ padding: 8 }}>
        <CodeViewerPanel />
      </div>
    </article>
  );
}
