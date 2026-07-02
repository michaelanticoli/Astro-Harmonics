// ─── CHART SVG HELPERS ───────────────────────────────────────────────────────
// Geometry utilities for placing glyphs, drawing sector arcs, and computing
// polar coordinates on the natal wheel.
//
// Coordinate convention: ecliptic 0° → left of wheel (western astrology).
// `asc` (ascendant) is subtracted so the Ascendant always sits at 9-o'clock.

import { normDeg, toRad } from "./astroEngine";

/** Convert ecliptic longitude `ecl` (and ascendant offset `asc`) to SVG (x, y). */
export function astroXY(cx: number, cy: number, r: number, ecl: number, asc: number) {
  const diff = normDeg(ecl - asc);
  const rad  = toRad(180 + diff);
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

/** SVG arc `d` attribute for a zodiac sector (30° slice of the wheel).
 *  r1 = outer radius, r2 = inner radius */
export function sectorPath(cx: number, cy: number, r1: number, r2: number, startEcl: number, asc: number): string {
  const sRad = toRad(180 + normDeg(startEcl - asc));
  const eRad = sRad + toRad(30);
  const ox1 = cx + r1 * Math.cos(sRad), oy1 = cy - r1 * Math.sin(sRad);
  const ox2 = cx + r1 * Math.cos(eRad), oy2 = cy - r1 * Math.sin(eRad);
  const ix2 = cx + r2 * Math.cos(eRad), iy2 = cy - r2 * Math.sin(eRad);
  const ix1 = cx + r2 * Math.cos(sRad), iy1 = cy - r2 * Math.sin(sRad);
  return `M ${ox1} ${oy1} A ${r1} ${r1} 0 0 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${r2} ${r2} 0 0 0 ${ix1} ${iy1} Z`;
}

/** Convert hex colour string to comma-separated RGB channels for rgba() usage.
 *  e.g. "#8b6b22" → "139,107,34"  */
export function hexRgb(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8)  & 255;
  const b =  n        & 255;
  return `${r},${g},${b}`;
}
