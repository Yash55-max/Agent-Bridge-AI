type IconName = "folder" | "server" | "robot" | "gear";

function baseProps() {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    // use quoted attribute name so the hyphenated ARIA attribute is preserved when spread into JSX
    'aria-hidden': true,
  };
}

export function SidebarIcon({ name }: { name: IconName }) {
  switch (name) {
    case "folder":
      return (
        <svg {...baseProps()}>
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4.2a2 2 0 0 1 1.6.8l.9 1.2a2 2 0 0 0 1.6.8H18.5A2.5 2.5 0 0 1 21 10.3v6.2A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
        </svg>
      );
    case "server":
      return (
        <svg {...baseProps()}>
          <rect x="4" y="4" width="16" height="6" rx="1.8" />
          <rect x="4" y="14" width="16" height="6" rx="1.8" />
          <path d="M8 7h.01M8 17h.01M11 7h5M11 17h5" />
        </svg>
      );
    case "robot":
      return (
        <svg {...baseProps()}>
          <rect x="5" y="7" width="14" height="11" rx="3" />
          <path d="M12 3v4M9 11h.01M15 11h.01M8 17h8M8 7h8" />
        </svg>
      );
    case "gear":
      return (
        <svg {...baseProps()}>
          <circle cx="12" cy="12" r="3.25" />
          <path d="M19 12a7.1 7.1 0 0 0-.08-1l1.58-1.24-1.5-2.6-1.9.54a7.1 7.1 0 0 0-1.73-1l-.3-1.95h-3l-.3 1.95a7.1 7.1 0 0 0-1.73 1l-1.9-.54-1.5 2.6L5.08 11a7.1 7.1 0 0 0 0 2l-1.58 1.24 1.5 2.6 1.9-.54a7.1 7.1 0 0 0 1.73 1l.3 1.95h3l.3-1.95a7.1 7.1 0 0 0 1.73-1l1.9.54 1.5-2.6L18.92 13a7.1 7.1 0 0 0 .08-1Z" />
        </svg>
      );
  }
}

export function SearchIcon() {
  return (
    <svg {...baseProps()}>
      <circle cx="11" cy="11" r="5.5" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function FocusIcon() {
  return (
    <svg {...baseProps()}>
      <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
      <path d="M8 8 3 3M21 3l-5 5M8 16l-5 5M21 21l-5-5" />
    </svg>
  );
}
