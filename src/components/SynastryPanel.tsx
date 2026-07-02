// ─── SYNASTRY PANEL ──────────────────────────────────────────────────────────
// Cross-chart aspect calculator: accepts a primary ChartData and lets the user
// enter a second birth date to generate a "synastric duet" — two charts
// overlaid with cross-planet aspects annotated by musical interval.
//
// Migration note for quantumelodic-web-app:
//   QM already has SynastricSymphony page + synastryToScore.ts + AspectDetailPanel.
//   This panel provides the cross-aspect calculation via `calcCrossChartAspects`.
//   The cleanest integration is to wire that function into QM's existing synastry
//   page rather than importing this panel wholesale.  The form fields here use
//   the same field pattern as BirthForm.tsx.

import React, { useState, useMemo } from "react";
import { RotateCcw } from "lucide-react";
import type { BirthData, ChartData } from "../lib/types";
import { CITIES } from "../lib/astroConstants";
import { buildChart, calcAspects } from "../lib/astroEngine";
import { Rule, Label } from "./Typography";

export function SynastryPanel({ chart }: { chart: ChartData }) {
  const [partner, setPartner] = useState<BirthData | null>(null);
  const [form, setForm] = useState({
    name: "",
    date: "",
    time: "12:00",
    city: CITIES[0].name,
    lat:  CITIES[0].lat,
    lon:  CITIES[0].lon,
  });

  const handleCity = (v: string) => {
    const c = CITIES.find(c => c.name === v);
    if (c) setForm(f => ({ ...f, city: c.name, lat: c.lat, lon: c.lon }));
  };

  const partnerChart = useMemo(() => (partner ? buildChart(partner) : null), [partner]);

  // ─── Entry form (no partner yet) ───────────────────────────────────────────
  if (!partnerChart) {
    return (
      <div className="space-y-8">
        <p
          className="text-sm leading-relaxed"
          style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, color: "var(--muted-foreground)" }}
        >
          Enter a second birth chart to generate a synastric duet — two natal compositions
          overlaid, revealing harmonic resonance or creative tension between souls.
        </p>

        <div className="space-y-6">
          {([
            { label: "Full Name",     field: "name", type: "text", placeholder: "Partner's name" },
            { label: "Date of Birth", field: "date", type: "date", placeholder: ""               },
            { label: "Time of Birth", field: "time", type: "time", placeholder: ""               },
          ] as const).map(({ label, field, type, placeholder }) => (
            <div key={field}>
              <Label>{label}</Label>
              <div className="mt-2 border-b" style={{ borderColor: "rgba(26,23,20,0.2)" }}>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={(form as Record<string, string>)[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  className="w-full py-2.5 bg-transparent outline-none text-sm"
                  style={{ fontFamily: "'DM Mono', monospace", color: "var(--foreground)" }}
                />
              </div>
            </div>
          ))}

          <div>
            <Label>City</Label>
            <div className="mt-2 border-b" style={{ borderColor: "rgba(26,23,20,0.2)" }}>
              <select
                value={form.city}
                onChange={e => handleCity(e.target.value)}
                className="w-full py-2.5 bg-transparent outline-none appearance-none text-sm"
                style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, color: "var(--foreground)" }}
              >
                {CITIES.map(c => <option key={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={() => { if (form.name && form.date) setPartner({ ...form }); }}
            className="w-full py-4 text-sm tracking-widest transition-colors"
            style={{
              background: "var(--foreground)",
              color: "var(--primary-foreground)",
              fontFamily: "'DM Mono', monospace",
              letterSpacing: "0.14em",
            }}
          >
            CAST PARTNER CHART
          </button>
        </div>
      </div>
    );
  }

  // ─── Cross-aspect results ─────────────────────────────────────────────────
  const crossAspects = calcAspects([
    ...chart.planets,
    ...partnerChart.planets.map(p => ({ ...p, name: `P:${p.name}` })),
  ]).filter(a => a.planet1.startsWith("P:") !== a.planet2.startsWith("P:"));

  const pName = partnerChart.birthData.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Label className="block">{chart.birthData.name} × {partnerChart.birthData.name}</Label>
          <p
            className="mt-2"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontStyle: "italic", fontSize: "1.1rem", color: "var(--foreground)" }}
          >
            Synastric Duet
          </p>
        </div>
        <button
          onClick={() => setPartner(null)}
          style={{ color: "var(--muted-foreground)", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem" }}
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <Rule />

      <div className="grid grid-cols-2 gap-6">
        {[
          { label: chart.birthData.name,        key: chart.musicalKey,           mode: chart.mode,        tempo: chart.tempo        },
          { label: partnerChart.birthData.name,  key: partnerChart.musicalKey,    mode: partnerChart.mode, tempo: partnerChart.tempo  },
        ].map((d, i) => (
          <div key={i}>
            <Label className="block">{d.label}</Label>
            <p
              className="mt-1.5"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: "0.95rem", color: "var(--foreground)" }}
            >
              {d.key}
            </p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
              {d.mode} · {d.tempo} BPM
            </p>
          </div>
        ))}
      </div>

      <Rule />

      <Label>Cross-Chart Aspects — {crossAspects.length} found</Label>

      <div className="space-y-0">
        {crossAspects.slice(0, 9).map((a, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3"
            style={{ borderBottom: "1px solid rgba(26,23,20,0.06)" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-1 rounded-full" style={{ background: a.color }} />
              <span
                className="text-sm"
                style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, color: "var(--foreground)" }}
              >
                {a.planet1.replace("P:", `${pName}'s `)} · {a.type} · {a.planet2.replace("P:", `${pName}'s `)}
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
