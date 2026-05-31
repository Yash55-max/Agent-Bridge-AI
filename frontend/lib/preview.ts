export type SidebarItem = {
  label: string;
  active: boolean;
  icon: "folder" | "server" | "robot" | "gear";
  href: string;
};

export type AgentCard = {
  title: string;
  state: string;
  accent: "violet" | "teal";
  body: string;
};

export type PreviewPayload = {
  name: string;
  status: string;
  tools: string[];
  sandbox: {
    agents: number;
    events: number;
    latencyMs: number;
  };
};

export const sidebarItems: SidebarItem[] = [
  { label: "Workspace", active: true, icon: "folder", href: "/workspace" },
  { label: "Sandbox", active: false, icon: "server", href: "/sandbox" },
  { label: "Deploy", active: false, icon: "robot", href: "/deploy" },
  { label: "Docs", active: false, icon: "gear", href: "/workspace#docs" },
];

export const agentCards: AgentCard[] = [
  // No pre-configured agents by default; sandbox will render configured agents at runtime
];

export const outputLines = [
  // Empty by default; populated from live events or generated outputs
];

export const defaultPreview: PreviewPayload = {
  name: "No generation yet",
  status: "idle",
  tools: [],
  sandbox: {
    agents: 0,
    events: 0,
    latencyMs: 0,
  },
};

export async function loadPreview(): Promise<PreviewPayload> {
  try {
    const response = await fetch(`/api/preview`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return defaultPreview;
    }

    return (await response.json()) as PreviewPayload;
  } catch {
    return defaultPreview;
  }
}
