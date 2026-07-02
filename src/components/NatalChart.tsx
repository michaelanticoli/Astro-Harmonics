// ─── NATAL CHART SVG COMPONENT ───────────────────────────────────────────────
// Renders the interactive natal wheel as a pure SVG element.  All rendering is
// done with inline SVG (no canvas, no third-party chart lib) so it scales
// perfectly at any resolution and can be server-side rendered.
//
// Migration note for quantumelodic-web-app:
//   • Swap hardcoded hex colours (`INK`, `#f0ece3`, `#f5f2eb`) for CSS vars
//     or configurable props if using on a dark background.
//   • The `inkColor` and `chartBg` props are provided for exactly this
//     purpose — pass `inkColor="currentColor"` on the dark QM theme.
//   • The component is self-contained: it only needs `ChartData` and
//     the ZODIAC / ASPECT_DEFS constants it imports.

import React from "react";
import type { ChartData } from "../lib/types";
import { ZODIAC, ASPECT_DEFS, INK } from "../lib/astroConstants";
import { astroXY, sectorPath } from "../lib/chartHelpers";

// ─── Wheel geometry constants ─────────────────────────────────────────────────
const CX = 250, CY = 250;
const RZ_OUT = 236, RZ_IN = 200, RH_IN = 163, RA = 116;

// ─── Props ────────────────────────────────────────────────────────────────────
export interface NatalChartProps {
  chart: ChartData;
  selected: string | null;
  active: string | null;
  onSelect: (name: string | null) => void;
  /** Ink colour override — defaults to AH editorial dark `#1a1714`.
   *  Pass `"currentColor"` or a light hex on dark themes. */
  inkColor?: string;
  /** Chart background fill — defaults to AH parchment tint `#f0ece3`. */
  chartBg?: string;
  /** Selected-planet text fill — defaults to AH primary-foreground `#f5f2eb`. */
  selTextColor?: string;
}

export function NatalChart({
  chart,
  selected,
  active,
  onSelect,
  inkColor   = INK,
  chartBg    = "#f0ece3",
  selTextColor = "#f5f2eb",
}: NatalChartProps) {
  const { planets, aspects, ascendant } = chart;

  return (
    <svg
      viewBox="0 0 500 500"
      className="w-full h-full"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      <defs>
        <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke={inkColor} strokeWidth="0.3" strokeOpacity="0.08" />
        </pattern>
      </defs>

      {/* Ground */}
      <circle cx={CX} cy={CY} r={RZ_OUT + 4} fill={chartBg} />
      <circle cx={CX} cy={CY} r={RZ_OUT + 4} fill="url(#hatch)" />

      {/* Zodiac sectors — alternating tone */}
      {ZODIAC.map((sign, i) => (
        <path
          key={sign.name}
          d={sectorPath(CX, CY, RZ_OUT, RZ_IN, i * 30, ascendant)}
          fill={i % 2 === 0 ? "rgba(26,23,20,0.03)" : "transparent"}
          stroke={inkColor}
          strokeWidth="0.4"
          strokeOpacity="0.2"
        />
      ))}

      {/* Zodiac glyphs */}
      {ZODIAC.map((sign, i) => {
        const mid = astroXY(CX, CY, (RZ_OUT + RZ_IN) / 2, i * 30 + 15, ascendant);
        return (
          <text
            key={sign.name}
            x={mid.x}
            y={mid.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="11"
            fill={sign.color}
            opacity="0.85"
            style={{ userSelect: "none" }}
          >
            {sign.glyph}
          </text>
        );
      })}

      {/* Ring borders */}
      <circle cx={CX} cy={CY} r={RZ_OUT} fill="none" stroke={inkColor} strokeWidth="0.6" strokeOpacity="0.35" />
      <circle cx={CX} cy={CY} r={RZ_IN}  fill="none" stroke={inkColor} strokeWidth="0.4" strokeOpacity="0.2"  />
      <circle cx={CX} cy={CY} r={RH_IN}  fill="none" stroke={inkColor} strokeWidth="0.4" strokeOpacity="0.15" />
      <circle cx={CX} cy={CY} r={RA + 4} fill="none" stroke={inkColor} strokeWidth="0.3" strokeOpacity="0.1"  />

      {/* Outer degree marks — every 5° */}
      {Array.from({ length: 72 }, (_, i) => {
        const ecl = i * 5;
        const p1  = astroXY(CX, CY, RZ_OUT - 1, ecl, ascendant);
        const p2  = astroXY(CX, CY, RZ_OUT - (i % 6 === 0 ? 9 : 5), ecl, ascendant);
        return (
          <line
            key={i}
            x1={p1.x} y1={p1.y}
            x2={p2.x} y2={p2.y}
            stroke={inkColor}
            strokeWidth="0.4"
            strokeOpacity={i % 6 === 0 ? 0.4 : 0.18}
          />
        );
      })}

      {/* House division lines (every 30°) */}
      {Array.from({ length: 12 }, (_, i) => {
        const p1 = astroXY(CX, CY, RH_IN, i * 30, ascendant);
        const p2 = astroXY(CX, CY, RZ_IN, i * 30, ascendant);
        const p3 = astroXY(CX, CY, 52,    i * 30, ascendant);
        const isAngular = i % 3 === 0;
        return (
          <g key={i}>
            <line
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={inkColor}
              strokeWidth={isAngular ? 0.8 : 0.35}
              strokeOpacity={isAngular ? 0.5 : 0.18}
            />
            {isAngular && (
              <line
                x1={p1.x} y1={p1.y} x2={p3.x} y2={p3.y}
                stroke={inkColor}
                strokeWidth="0.5"
                strokeOpacity="0.25"
                strokeDasharray="2,3"
              />
            )}
          </g>
        );
      })}

      {/* House numbers */}
      {Array.from({ length: 12 }, (_, i) => {
        const mid = astroXY(CX, CY, (RZ_IN + RH_IN) / 2, i * 30 + 15, ascendant);
        return (
          <text
            key={i}
            x={mid.x} y={mid.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="8"
            fill={inkColor}
            opacity="0.3"
            style={{ userSelect: "none" }}
          >
            {i + 1}
          </text>
        );
      })}

      {/* ASC / MC / DSC / IC labels */}
      {[
        { ecl: 0,   label: "ASC" },
        { ecl: 90,  label: "IC"  },
        { ecl: 180, label: "DSC" },
        { ecl: 270, label: "MC"  },
      ].map(({ ecl, label }) => {
        const pt = astroXY(CX, CY, RZ_OUT + 14, ecl, ascendant);
        return (
          <text
            key={label}
            x={pt.x} y={pt.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="7"
            fill={inkColor}
            opacity="0.55"
            letterSpacing="0.06em"
            style={{ userSelect: "none" }}
          >
            {label}
          </text>
        );
      })}

      {/* Aspect lines */}
      {aspects.map((asp, i) => {
        const p1 = planets.find(p => p.name === asp.planet1)!;
        const p2 = planets.find(p => p.name === asp.planet2)!;
        if (!p1 || !p2) return null;
        const a1  = astroXY(CX, CY, RA, p1.degree, ascendant);
        const a2  = astroXY(CX, CY, RA, p2.degree, ascendant);
        const def = ASPECT_DEFS.find(d => d.name === asp.type)!;
        return (
          <line
            key={i}
            x1={a1.x} y1={a1.y}
            x2={a2.x} y2={a2.y}
            stroke={asp.color}
            strokeWidth="0.6"
            strokeOpacity={asp.harmony === "consonant" ? 0.5 : asp.harmony === "dissonant" ? 0.4 : 0.3}
            strokeDasharray={def?.dash === "none" ? undefined : def?.dash}
          />
        );
      })}

      {/* Center disc */}
      <circle cx={CX} cy={CY} r={50} fill={chartBg} stroke={inkColor} strokeWidth="0.5" strokeOpacity="0.2" />
      <circle cx={CX} cy={CY} r={46} fill="none"    stroke={inkColor} strokeWidth="0.3" strokeOpacity="0.1" />
      <text x={CX} y={CY - 11} textAnchor="middle" fontSize="7.5"  fill={inkColor} opacity="0.35" letterSpacing="0.12em">KEY</text>
      <text x={CX} y={CY}      textAnchor="middle" fontSize="8.5"  fill={inkColor} opacity="0.6"  letterSpacing="0.05em" fontWeight="500">{chart.musicalKey}</text>
      <text x={CX} y={CY + 13} textAnchor="middle" fontSize="7"    fill={inkColor} opacity="0.3">{chart.tempo} BPM · {chart.timeSignature}</text>

      {/* Planet markers */}
      {planets.map(planet => {
        const pos   = astroXY(CX, CY, (RH_IN + RA + 4) / 2, planet.degree, ascendant);
        const isSel = planet.name === selected;
        const isAct = planet.name === active;
        const r     = 7;
        return (
          <g
            key={planet.name}
            onClick={() => onSelect(selected === planet.name ? null : planet.name)}
            style={{ cursor: "pointer" }}
          >
            {isSel && (
              <circle cx={pos.x} cy={pos.y} r={r + 5} fill={planet.color} opacity="0.1" />
            )}
            <circle
              cx={pos.x} cy={pos.y} r={r}
              fill={isSel || isAct ? planet.color : chartBg}
              stroke={planet.color}
              strokeWidth={isSel || isAct ? 0 : 1}
              strokeOpacity="0.7"
            />
            <text
              x={pos.x} y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="7.5"
              fill={isSel || isAct ? selTextColor : planet.color}
              style={{ userSelect: "none", pointerEvents: "none" }}
            >
              {planet.glyph}
            </text>
            <text
              x={pos.x} y={pos.y + r + 5}
              textAnchor="middle"
              fontSize="5.5"
              fill={inkColor}
              opacity="0.4"
              style={{ userSelect: "none", pointerEvents: "none" }}
            >
              {planet.signDegree}°
            </text>
          </g>
        );
      })}
    </svg>
  );
}
