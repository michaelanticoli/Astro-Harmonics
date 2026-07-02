// ─── REPORT PANEL ────────────────────────────────────────────────────────────
// Numbered prose sections: Cosmic Signature, Solar Voice, Lunar Voice,
// Inner Planets, Outer Planets, and The Living Score.
//
// Migration note for quantumelodic-web-app:
//   Compare with QM's `harmonicWisdom.ts` and `placementSentences.ts` for
//   compatible narrative text generators.  The section structure here is
//   more editorial/prose-form; QM uses structured placement sentences.
//   Both can coexist — this panel is a "long-read" companion view.

import React from "react";
import type { ChartData } from "../lib/types";
import { domDesc } from "../lib/astroEngine";

export function ReportPanel({ chart }: { chart: ChartData }) {
  const { planets, ascSign, dominantElement, musicalKey, tempo, timeSignature, mode, birthData } = chart;
  const sun  = planets[0];
  const moon = planets[1];

  const sections = [
    {
      title: "Cosmic Signature",
      body:  `${birthData.name}'s composition opens in ${musicalKey} — a ${mode} landscape at ${tempo} BPM in ${timeSignature}. The dominant element is ${dominantElement.toLowerCase()}, shaping an overall character of ${domDesc(dominantElement)}. The Ascendant in ${ascSign} sets the compositional architecture: the timbre of the whole.`,
    },
    {
      title: "Solar Voice",
      body:  `The Sun in ${sun.sign} at ${sun.signDegree}° resonates at ${sun.frequency} Hz — ${sun.note} — through ${sun.instrument}. This is the fundamental tone: ${sun.timbre}. The ${sun.mode} mode saturates every melodic phrase that originates from this chart.`,
    },
    {
      title: "Lunar Voice",
      body:  `The Moon in ${moon.sign} at ${moon.signDegree}° sounds at ${moon.frequency} Hz — ${moon.note} — through ${moon.instrument}. ${moon.timbre}. Against the solar clarity, the Moon provides a ${moon.mode} countermelody from the ${moon.house}th house.`,
    },
    {
      title: "Inner Planets",
      body:  planets.slice(2, 6)
        .map(p => `${p.name} in ${p.sign} (${p.signDegree}°) — ${p.frequency} Hz, ${p.note}, ${p.instrument}. ${p.mode} mode. ${p.rhythm}.`)
        .join("\n\n"),
    },
    {
      title: "Outer Planets",
      body:  planets.slice(6)
        .map(p => `${p.name} in ${p.sign} (${p.signDegree}°) — ${p.frequency} Hz, voiced as ${p.instrument}. ${p.timbre}.`)
        .join("\n\n"),
    },
    {
      title: "The Living Score",
      body:  `This Chart Song stands complete as a portrait. In Synastry, it layers with another's natal score — harmonic consonance or productive dissonance between two cosmic compositions. In Transit Fusion, today's sky creates a real-time mashup: your natal frequencies in conversation with the present orbital moment.`,
    },
  ];

  return (
    <div className="space-y-0">
      {sections.map((s, i) => (
        <div key={s.title}>
          <div className="py-5" style={{ borderBottom: "1px solid rgba(26,23,20,0.07)" }}>
            <div className="flex items-baseline gap-6">
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.65rem",
                  color: "var(--muted-foreground)",
                  minWidth: 16,
                  opacity: 0.5,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p
                  className="mb-2"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: "0.9rem", color: "var(--foreground)" }}
                >
                  {s.title}
                </p>
                {s.body.split("\n\n").map((para, j) => (
                  <p
                    key={j}
                    className="text-sm leading-relaxed mb-2 last:mb-0"
                    style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, color: "var(--muted-foreground)" }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
