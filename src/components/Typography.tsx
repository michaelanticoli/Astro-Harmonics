// ─── TYPOGRAPHY MICRO-COMPONENTS ─────────────────────────────────────────────
// Rule — a horizontal rule styled with the editorial ink variable.
// Label — an all-caps DM Mono label used throughout every panel.
//
// Migration note for quantumelodic-web-app:
//   Replace the hardcoded `rgba(26,23,20,…)` ink values with
//   `var(--border)` / `var(--muted-foreground)` from QM's Tailwind config.

import React from "react";

export function Rule({ className = "", opacity = 1 }: { className?: string; opacity?: number }) {
  return (
    <div
      className={`w-full border-t ${className}`}
      style={{ borderColor: `rgba(26,23,20,${opacity * 0.1})` }}
    />
  );
}

export function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`text-xs tracking-widest uppercase ${className}`}
      style={{
        fontFamily: "'DM Mono', monospace",
        color: "var(--muted-foreground)",
        letterSpacing: "0.14em",
      }}
    >
      {children}
    </span>
  );
}
