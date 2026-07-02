// ─── TRANSITS PANEL ──────────────────────────────────────────────────────────
// Computes today's planetary positions (via Greenwich, noon UT) and overlays
// them against the natal chart, showing cross aspects and sign comparisons.
//
// Migration note for quantumelodic-web-app:
//   QM's LunarReports page does a similar live-sky overlay.  The cross-aspect
//   logic here (`buildChart` + prefix filtering) is directly reusable; the
//   natal-vs-transit row layout can replace or supplement QM's existing UI.

import React, { useMemo } from "react";
import type { ChartData } from "../lib/types";
import { buildChart, calcAspects } from "../lib/astroEngine";
import { Rule, Label } from "./Typography";

export function TransitsPanel({ chart }: { chart: ChartData }) {
  const todayStr    = new Date().toISOString().slice(0, 10);
  const transitChart = useMemo(
    () => buildChart({ name: "Transits", date: todayStr, time: "12:00", city: "Greenwich", lat: 51.48, lon: 0 }),
    [todayStr],
  );

  const cross = useMemo(
    () =>
      calcAspects([
        ...chart.planets,
        ...transitChart.planets.map(p => ({ ...p, name: `T:${p.name}` })),
      ]).filter(a => a.planet1.startsWith("T:") !== a.planet2.startsWith("T:")),
    [chart.planets, transitChart.planets],
  );

  return (
    <div className="space-y-6">
      <div>
        <Label className="block">Current Sky</Label>
        <p
          className="mt-2"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontStyle: "italic", fontSize: "1.1rem", color: "var(--foreground)" }}
        >
          Transit Fusion — {todayStr}
        </p>
        <p
          className="mt-2 text-sm leading-relaxed"
          style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, color: "var(--muted-foreground)" }}
        >
          Today's orbital positions sounding against your natal chart. The present cosmos
          in harmonic conversation with your birth score.
        </p>
      </div>

      <Rule />

      <Label>Planet Positions — Natal vs. Transit</Label>

      <div className="space-y-0">
        {transitChart.planets.slice(0, 8).map(tp => {
          const natal = chart.planets.find(p => p.name === tp.name)!;
          return (
            <div
              key={tp.name}
              className="py-3 flex items-start justify-between"
              style={{ borderBottom: "1px solid rgba(26,23,20,0.06)" }}
            >
              <div className="flex items-center gap-3">
                <span style={{ color: tp.color, fontSize: "0.95rem", width: 18 }}>{tp.glyph}</span>
                <span style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, fontSize: "0.875rem", color: "var(--foreground)" }}>
                  {tp.name}
                </span>
              </div>
              <div className="text-right">
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--foreground)" }}>
                  ↑ {tp.sign} {tp.signDegree}°
                </div>
                {natal && (
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--muted-foreground)" }}>
                    ● {natal.sign} {natal.signDegree}°
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Rule />

      <Label>Active Transit Aspects — {cross.length}</Label>

      <div className="space-y-0">
        {cross.slice(0, 7).map((a, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2.5"
            style={{ borderBottom: "1px solid rgba(26,23,20,0.04)" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full" style={{ background: a.color }} />
              <span
                className="text-sm"
                style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, color: "var(--foreground)" }}
              >
                {a.planet1.replace("T:", "Transit ")} · {a.type} · {a.planet2.replace("T:", "Transit ")}
              </span>
            </div>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", color: "var(--muted-foreground)" }}>
              {a.musicalInterval}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
