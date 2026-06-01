import { GeneratorPanel } from "@/components/generator/generator-panel";
import { HealthPanel } from "@/components/monitoring/health-panel";
import { OutputPanel } from "@/components/monitoring/output-panel";
import { SandboxPanel } from "@/components/sandbox/sandbox-panel";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { agentCards, loadPreview, sidebarItems } from "@/lib/preview";

export default async function WorkspacePage() {
  const preview = await loadPreview();

  return (
    <main className="shell workspace-shell">
      <Topbar activePath="/workspace" />

      <section className="workspace workspace-grid" id="workspace" aria-label="Workspace">
        <Sidebar activePath="/workspace" items={sidebarItems} />

        <section className="workspace-main" aria-label="Generator workspace">
          <GeneratorPanel />
        </section>

        <aside className="workspace-status" aria-label="Workspace status">
          <div className="workspace-status-sticky">
            <HealthPanel status={preview.status} sandbox={preview.sandbox} />
            <OutputPanel />
            <SandboxPanel title="Live Agent Sandbox" agents={agentCards} preview={preview} />
          </div>
        </aside>
      </section>
    </main>
  );
}
