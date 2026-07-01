import { useState, useCallback } from "react";
import { RotateCcw } from "lucide-react";

// ─── Lib imports ─────────────────────────────────────────────────────────────
import type { BirthData, ChartData } from "../lib/types";
import { buildChart } from "../lib/astroEngine";
import { useAudioEngine } from "../lib/audioEngine";

// ─── Component imports ────────────────────────────────────────────────────────
import { BirthForm }    from "../components/BirthForm";
import { NatalChart }   from "../components/NatalChart";
import { ScorePanel }   from "../components/ScorePanel";
import { ComposePanel } from "../components/ComposePanel";
import { ReportPanel }  from "../components/ReportPanel";
import { SynastryPanel } from "../components/SynastryPanel";
import { TransitsPanel } from "../components/TransitsPanel";

// ─── Main App ─────────────────────────────────────────────────────────────────

type Tab = "score" | "compose" | "report" | "synastry" | "transits";

const TABS: { id: Tab; label: string }[] = [
  { id: "score",    label: "Score"    },
  { id: "compose",  label: "Compose"  },
  { id: "report",   label: "Report"   },
  { id: "synastry", label: "Synastry" },
  { id: "transits", label: "Transits" },
];

const GRAIN = (
  <div
    className="fixed inset-0 pointer-events-none"
    style={{
      zIndex: 0,
      opacity: 1,
      backgroundImage: "radial-gradient(rgba(26,23,20,0.055) 1px, transparent 1px)",
      backgroundSize: "28px 28px",
    }}
  />
);

export default function App() {
  const [chart,    setChart]    = useState<ChartData | null>(null);
  const [tab,      setTab]      = useState<Tab>("score");
  const [selected, setSelected] = useState<string | null>(null);
  const audio                   = useAudioEngine(chart);

  const handleSubmit = useCallback((b: BirthData) => {
    setChart(buildChart(b));
    setTab("score");
    setSelected(null);
  }, []);

  const handleReset = () => {
    audio.stop();
    setChart(null);
    setSelected(null);
  };

  // ─── Landing / birth form ──────────────────────────────────────────────────
  if (!chart) {
    return (
      <div className="relative min-h-screen bg-background" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        {GRAIN}
        <div style={{ position: "relative", zIndex: 1 }}>
          <BirthForm onSubmit={handleSubmit} />
        </div>
      </div>
    );
  }

  // ─── Chart view ───────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-background" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      {GRAIN}
      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 1 }}>

        {/* Header */}
        <header
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(26,23,20,0.08)" }}
        >
          <div className="flex items-center gap-6">
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.16em", color: "var(--foreground)", opacity: 0.7 }}>
              ASTRO·HARMONICS
            </span>
            <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontStyle: "italic", fontSize: "0.95rem", color: "var(--foreground)" }}>
              {chart.birthData.name}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--muted-foreground)" }}>
              {chart.musicalKey} · {chart.tempo} BPM · {chart.timeSignature}
            </span>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ fontFamily: "'DM Mono', monospace", color: "var(--muted-foreground)", letterSpacing: "0.08em" }}
            >
              <RotateCcw size={11} /> New
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 flex flex-col lg:flex-row" style={{ minHeight: 0 }}>

          {/* Chart column */}
          <div
            className="lg:w-[480px] xl:w-[520px] flex-shrink-0 flex flex-col"
            style={{ borderRight: "1px solid rgba(26,23,20,0.08)" }}
          >
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10">

              {/* Selected-planet callout */}
              {selected && (() => {
                const p = chart.planets.find(pl => pl.name === selected)!;
                return (
                  <div className="w-full mb-6 pb-5" style={{ borderBottom: "1px solid rgba(26,23,20,0.08)" }}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <span style={{ fontSize: "1.6rem", color: p.color }}>{p.glyph}</span>
                        <div>
                          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: "1.2rem", color: "var(--foreground)" }}>
                            {p.name}
                          </div>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--muted-foreground)" }}>
                            {p.sign} {p.signDegree}° · House {p.house} · {p.note} · {p.frequency} Hz
                          </div>
                          <div className="mt-0.5 text-sm italic" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, color: "var(--muted-foreground)" }}>
                            {p.instrument} · {p.timbre}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelected(null)}
                        style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "var(--muted-foreground)", marginTop: 4 }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Natal wheel */}
              <div className="w-full" style={{ maxWidth: 440, aspectRatio: "1" }}>
                <NatalChart
                  chart={chart}
                  selected={selected}
                  active={audio.activePlanet}
                  onSelect={setSelected}
                />
              </div>

              {/* Chart footnote */}
              <div className="w-full mt-4 flex items-center justify-between">
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "var(--muted-foreground)", opacity: 0.45, letterSpacing: "0.1em" }}>
                  {chart.birthData.date} · {chart.birthData.city}
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "var(--muted-foreground)", opacity: 0.45 }}>
                  select planet for detail
                </span>
              </div>
            </div>
          </div>

          {/* Panel column */}
          <div className="flex-1 flex flex-col min-h-0">

            {/* Tab bar */}
            <div className="flex" style={{ borderBottom: "1px solid rgba(26,23,20,0.08)" }}>
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className="px-5 py-4 text-xs tracking-widest transition-all"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: "0.12em",
                    color: tab === id ? "var(--foreground)" : "var(--muted-foreground)",
                    borderBottom: `2px solid ${tab === id ? "var(--foreground)" : "transparent"}`,
                    marginBottom: -1,
                  }}
                >
                  {label.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div
              className="flex-1 overflow-y-auto p-6 lg:p-8 xl:p-10"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(26,23,20,0.12) transparent" }}
            >
              {tab === "score"    && <ScorePanel    chart={chart} selected={selected} onSelect={setSelected} />}
              {tab === "compose"  && <ComposePanel  chart={chart} engine={audio} />}
              {tab === "report"   && <ReportPanel   chart={chart} />}
              {tab === "synastry" && <SynastryPanel chart={chart} />}
              {tab === "transits" && <TransitsPanel chart={chart} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
