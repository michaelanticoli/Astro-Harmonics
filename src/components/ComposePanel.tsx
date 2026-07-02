// ─── COMPOSE PANEL ───────────────────────────────────────────────────────────
// Playback controls, key-specs grid, waveform visualiser, and planetary-voice
// roster.  Requires the `useAudioEngine` hook to be instantiated in the parent
// and passed as the `engine` prop.
//
// Migration note for quantumelodic-web-app:
//   • The waveform SVG visualises the active oscillator amplitude — replace
//     with QM's PlanetChoirMixer if a richer mixing UI is needed.
//   • Icons (Play, Pause, Square, Volume2, VolumeX) come from lucide-react,
//     which QM already depends on.
//   • `hexRgb` is used for the planet-voice badge backgrounds — pull from
//     chartHelpers.ts or replicate inline.

import React from "react";
import { Play, Pause, Square, Volume2, VolumeX } from "lucide-react";
import type { ChartData } from "../lib/types";
import type { AudioEngineReturn } from "../lib/audioEngine";
import { INK } from "../lib/astroConstants";
import { hexRgb } from "../lib/chartHelpers";
import { Label } from "./Typography";

export function ComposePanel({
  chart,
  engine,
}: {
  chart: ChartData;
  engine: AudioEngineReturn;
}) {
  const { play, stop, isPlaying, activePlanet, volume, setVolume } = engine;
  const activePl = chart.planets.find(p => p.name === activePlanet);

  return (
    <div className="space-y-8">
      {/* Key specs grid */}
      <div
        className="grid grid-cols-3 gap-0"
        style={{
          borderTop:  "1px solid rgba(26,23,20,0.08)",
          borderLeft: "1px solid rgba(26,23,20,0.08)",
        }}
      >
        {[
          { k: "Key",     v: chart.musicalKey     },
          { k: "Tempo",   v: `${chart.tempo} BPM` },
          { k: "Meter",   v: chart.timeSignature   },
          { k: "Mode",    v: chart.mode            },
          { k: "Element", v: chart.dominantElement  },
          { k: "Asc",     v: chart.ascSign          },
        ].map(({ k, v }) => (
          <div
            key={k}
            className="p-4"
            style={{
              borderRight:  "1px solid rgba(26,23,20,0.08)",
              borderBottom: "1px solid rgba(26,23,20,0.08)",
            }}
          >
            <Label className="block">{k}</Label>
            <div
              className="mt-1.5"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: "0.95rem", color: "var(--foreground)" }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>

      {/* Composition title */}
      <div>
        <Label>Chart Song</Label>
        <p
          className="mt-1"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontStyle: "italic", fontSize: "1.4rem", color: "var(--foreground)" }}
        >
          "{chart.birthData.name}'s Cosmos"
        </p>
      </div>

      {/* Waveform visualiser */}
      <div style={{ borderTop: "1px solid rgba(26,23,20,0.08)", borderBottom: "1px solid rgba(26,23,20,0.08)", padding: "16px 0" }}>
        <svg viewBox="0 0 400 52" className="w-full" style={{ height: 52 }}>
          {chart.planets.map((p, i) => {
            const isAct = p.name === activePlanet;
            const segW  = 400 / chart.planets.length;
            const amp   = isAct ? 22 : 7 + (p.frequency / 400) * 4;
            const pts   = Array.from({ length: 28 }, (_, j) => {
              const x = i * segW + (j / 27) * segW;
              const y = 26 + amp * Math.sin((j / 27) * Math.PI * 3.5 + i * 1.4);
              return `${x},${y}`;
            }).join(" ");
            return (
              <polyline
                key={p.name}
                points={pts}
                fill="none"
                stroke={p.color}
                strokeWidth={isAct ? 1.2 : 0.5}
                strokeOpacity={isAct ? 0.9 : 0.3}
              />
            );
          })}
          <line x1="0" y1="26" x2="400" y2="26" stroke={INK} strokeWidth="0.3" strokeOpacity="0.1" />
        </svg>
      </div>

      {/* Active note readout */}
      <div style={{ minHeight: 28 }}>
        {activePl ? (
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: activePl.color }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: "var(--foreground)" }}>
              {activePl.name} · {activePl.note} · {activePl.frequency} Hz · {activePl.instrument}
            </span>
          </div>
        ) : (
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: "var(--muted-foreground)", opacity: 0.5 }}>
            {isPlaying ? "initialising…" : "press play to render composition"}
          </span>
        )}
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={isPlaying ? stop : play}
          className="flex items-center justify-center w-11 h-11 transition-colors"
          style={{
            border:      "1px solid rgba(26,23,20,0.3)",
            background:  isPlaying ? "var(--foreground)" : "transparent",
            color:       isPlaying ? "var(--primary-foreground)" : "var(--foreground)",
          }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        {isPlaying && (
          <button
            onClick={stop}
            className="flex items-center justify-center w-9 h-9 transition-colors"
            style={{ border: "1px solid rgba(26,23,20,0.15)", color: "var(--muted-foreground)" }}
          >
            <Square size={13} />
          </button>
        )}

        {/* Volume slider */}
        <div className="flex-1 flex items-center gap-3">
          <VolumeX size={12} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
          <div className="flex-1 h-px relative" style={{ background: "rgba(26,23,20,0.12)" }}>
            <input
              type="range" min="0" max="1" step="0.01"
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              style={{ height: "20px", top: "-10px" }}
            />
            <div
              className="h-px"
              style={{ width: `${volume * 100}%`, background: "var(--foreground)", transition: "width 0.05s" }}
            />
            <div
              className="w-2 h-2 absolute top-1/2 -translate-y-1/2"
              style={{ left: `calc(${volume * 100}% - 4px)`, background: "var(--foreground)", borderRadius: 0 }}
            />
          </div>
          <Volume2 size={12} style={{ color: "var(--foreground)", flexShrink: 0 }} />
        </div>
      </div>

      {/* Planetary voice roster */}
      <div>
        <Label className="block mb-3">Planetary Voices</Label>
        <div className="flex flex-wrap gap-2">
          {chart.planets.map(p => (
            <div
              key={p.name}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-all"
              style={{
                border:     `1px solid ${p.name === activePlanet ? p.color : "rgba(26,23,20,0.1)"}`,
                background: p.name === activePlanet ? `rgba(${hexRgb(p.color)},0.07)` : "transparent",
                fontFamily: "'DM Mono', monospace",
                color:      p.name === activePlanet ? p.color : "var(--muted-foreground)",
              }}
            >
              {p.glyph} {p.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
