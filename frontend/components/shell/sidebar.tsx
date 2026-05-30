import Link from "next/link";
import { SidebarIcon } from "@/components/icons";
import type { SidebarItem } from "@/lib/preview";

export function Sidebar({ items, activePath }: { items: SidebarItem[]; activePath?: string }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <p className="sidebar-kicker">Console</p>
        <p className="sidebar-version">v1.0.4-stable</p>
      </div>

      <div className="sidebar-nav" role="list">
        {items.map((item) => (
          <Link
            key={item.label}
            className={`sidebar-item ${item.active || activePath === item.href ? "active" : ""}`}
            href={item.href}
          >
            <span className="sidebar-icon">
              <SidebarIcon name={item.icon} />
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <Link className="new-server" href="/workspace">
        <span aria-hidden>+</span>
        New Server
      </Link>

      <div className="sidebar-footer">
        <Link href="/workspace#docs">Documentation</Link>
        <Link href="/workspace#support">Feedback</Link>
      </div>
    </aside>
  );
}
