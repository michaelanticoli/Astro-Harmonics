// ─── SCORE PANEL ─────────────────────────────────────────────────────────────
// Displays the planet-score list (sign, house, note, frequency) and the top-8
// aspects, with expandable rows for instrument / mode / timbre / rhythm detail.
//
// Migration note for quantumelodic-web-app:
//   This panel maps closely to QM's PlanetDetailPanel + AspectDetailPanel.
//   Consider merging them rather than importing this wholesale — the row
//   expand pattern and `Label` typography component are the most useful parts.

import React from "react";
import type { ChartData } from "../lib/types";
import { Label } from "./Typography";

export function ScorePanel({
  chart,
  selected,
  onSelect,
}: {
  chart: ChartData;
  selected: string | null;
  onSelect: (name: string | null) => void;
}) {
  return (
    <div className="space-y-0">
      <div
        className="flex items-baseline justify-between pb-4 mb-2"
        style={{ borderBottom: "1px solid rgba(26,23,20,0.08)" }}
      >
        <Label>Planet · Sign · House</Label>
        <Label>Note · Hz</Label>
      </div>

      {chart.planets.map(p => {
        const isSel = selected === p.name;
        return (
          <div key={p.name}>
            <div
              onClick={() => onSelect(isSel ? null : p.name)}
              className="flex items-center justify-between py-3.5 cursor-pointer transition-colors"
              style={{ borderBottom: `1px solid rgba(26,23,20,${isSel ? 0.12 : 0.06})` }}
            >
              <div className="flex items-center gap-4">
                <span style={{ fontSize: "1.1rem", color: p.color, width: 20, display: "inline-block" }}>
                  {p.glyph}
                </span>
                <div>
                  <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: "0.95rem", color: "var(--foreground)" }}>
                    {p.name}
                  </span>
                  <span className="ml-3 text-xs" style={{ fontFamily: "'DM Mono', monospace", color: "var(--muted-foreground)" }}>
                    {p.sign} {p.signDegree}° · H{p.house}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", color: "var(--foreground)" }}>
                  {p.note}
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--muted-foreground)" }}>
                  {p.frequency} Hz
                </div>
              </div>
            </div>

            {isSel && (
              <div
                className="py-4 px-4 grid grid-cols-2 gap-x-6 gap-y-3"
                style={{ background: "rgba(26,23,20,0.03)", borderBottom: "1px solid rgba(26,23,20,0.08)" }}
              >
                {[
                  { k: "Instrument", v: p.instrument },
                  { k: "Mode",       v: p.mode       },
                  { k: "Timbre",     v: p.timbre     },
                  { k: "Rhythm",     v: p.rhythm     },
                ].map(({ k, v }) => (
                  <div key={k}>
                    <Label>{k}</Label>
                    <p
                      className="mt-0.5 text-sm"
                      style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, color: "var(--foreground)" }}
                    >
                      {v}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Aspects */}
      <div className="pt-6">
        <Label className="block mb-3">Aspect · Harmonic Interval</Label>
        {chart.aspects.slice(0, 8).map((a, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2.5"
            style={{ borderBottom: "1px solid rgba(26,23,20,0.05)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: a.color }} />
              <span style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "var(--foreground)" }}>
                {a.planet1} {a.type} {a.planet2}
              </span>
            </div>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--muted-foreground)" }}>
              {a.musicalInterval}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
