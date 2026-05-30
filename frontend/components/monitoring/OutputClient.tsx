"use client";

import { useEffect, useState } from "react";
import { outputLines as initialLines } from "@/lib/preview";

export default function OutputClient({ maxLines = 200 }: { maxLines?: number }) {
  const [lines, setLines] = useState<string[]>(initialLines ?? []);

  useEffect(() => {
    function onGenerated(ev: any) {
      const code = ev?.detail?.generated_code;
      if (code) {
        const header = `--- Generated @ ${new Date().toLocaleTimeString()} ---`;
        setLines(prevLines => [header, code, "", ...prevLines].slice(0, maxLines));
      }
    }

    window.addEventListener("generated", onGenerated as EventListener);
    return () => window.removeEventListener("generated", onGenerated as EventListener);
  }, [maxLines]);

  return (
    <pre className="output-log">
      {lines.map((line, i) => (
        <span key={i}>{line}{"\n"}</span>
      ))}
    </pre>
  );
}
