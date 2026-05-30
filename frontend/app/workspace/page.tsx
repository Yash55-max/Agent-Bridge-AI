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
    <main className="shell">
      <Topbar activePath="/workspace" />

      <section className="workspace" id="workspace">
        <Sidebar activePath="/workspace" items={sidebarItems} />

        <section className="center-pane">
          <GeneratorPanel />
          <HealthPanel sandbox={preview.sandbox} />
          <OutputPanel />
        </section>

        <SandboxPanel title="Live Agent Sandbox" agents={agentCards} preview={preview} />
      </section>
    </main>
  );
}
