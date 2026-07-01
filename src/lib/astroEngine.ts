// ─── ASTRONOMICAL CALCULATION ENGINE ─────────────────────────────────────────
// Pure, dependency-free functions that compute planet positions, the Ascendant,
// Midheaven, and inter-planetary aspects from a birth date/time/location.
//
// Ephemeris accuracy: simplified mean-motion model, ±1–3° for inner planets,
// acceptable for chart layout and musical mapping.  For higher accuracy in
// quantumelodic-web-app, compare outputs with chartToScore.ts and consider
// replacing with an ephemeris library (e.g. astronomia or astro-compute-js).

import {
  ZODIAC,
  PLANETS_RAW,
  ASPECT_DEFS,
  NOTES,
  RHYTHMS,
  INK,
  ELEMENT_DESCRIPTIONS,
} from "./astroConstants";
import type { BirthData, PlanetPosition, Aspect, ChartData } from "./types";

// ─── Math helpers ──────────────────────────────────────────────────────────────
export const normDeg = (d: number): number => ((d % 360) + 360) % 360;
export const toRad   = (d: number): number => d * Math.PI / 180;

const J2000 = 2451545.0;

// ─── Julian Day Number ────────────────────────────────────────────────────────
export function julianDay(date: string, time: string): number {
  const [y, m, d]  = date.split("-").map(Number);
  const [h, mn]    = (time || "12:00").split(":").map(Number);
  const UT         = h + mn / 60;
  const a  = Math.floor((14 - m) / 12);
  const yr = y + 4800 - a;
  const mo = m + 12 * a - 3;
  const JDN =
    d +
    Math.floor((153 * mo + 2) / 5) +
    365 * yr +
    Math.floor(yr / 4) -
    Math.floor(yr / 100) +
    Math.floor(yr / 400) -
    32045;
  return JDN + (UT - 12) / 24;
}

// ─── Solar longitude ──────────────────────────────────────────────────────────
export function sunLon(jd: number): number {
  const T  = (jd - J2000) / 36525;
  const L0 = 280.46646 + 36000.76983 * T;
  const M  = toRad(normDeg(357.52911 + 35999.05029 * T));
  return normDeg(
    L0 + (1.914602 - 0.004817 * T) * Math.sin(M) + 0.019993 * Math.sin(2 * M),
  );
}

// ─── Lunar longitude ──────────────────────────────────────────────────────────
export function moonLon(jd: number): number {
  const T  = (jd - J2000) / 36525;
  const L0 = normDeg(218.3165 + 481267.8813 * T);
  const M  = toRad(normDeg(134.9634 + 477198.8676 * T));
  const D  = toRad(normDeg(297.8502 + 445267.1115 * T));
  return normDeg(
    L0 + 6.2886 * Math.sin(M) + 1.274 * Math.sin(2 * D - M) + 0.6583 * Math.sin(2 * D),
  );
}

// ─── Outer planet longitudes (mean motion) ────────────────────────────────────
const OUTER_DATA: Record<string, { lon0: number; motion: number }> = {
  Mercury: { lon0: 252.251, motion: 4.0923 },
  Venus:   { lon0: 181.979, motion: 1.6021 },
  Mars:    { lon0: 355.433, motion: 0.5240 },
  Jupiter: { lon0:  34.351, motion: 0.0831 },
  Saturn:  { lon0:  50.077, motion: 0.0334 },
  Uranus:  { lon0: 314.055, motion: 0.0117 },
  Neptune: { lon0: 304.349, motion: 0.0060 },
  Pluto:   { lon0: 238.929, motion: 0.0040 },
};

export const outerLon = (name: string, jd: number): number =>
  normDeg(OUTER_DATA[name].lon0 + OUTER_DATA[name].motion * (jd - J2000));

// ─── Ascendant ────────────────────────────────────────────────────────────────
export function calcAscendant(jd: number, lat: number, lon: number): number {
  const GMST = normDeg(280.46061837 + 360.98564736629 * (jd - J2000));
  const LST  = normDeg(GMST + lon);
  const lstR = toRad(LST);
  const latR = toRad(lat);
  const eps  = toRad(23.44);
  const num  = Math.cos(lstR);
  const den  = -Math.sin(lstR) * Math.cos(eps) - Math.tan(latR) * Math.sin(eps);
  let asc = Math.atan2(num, den) * 180 / Math.PI;
  if (Math.cos(lstR) < 0) asc += 180;
  return normDeg(asc);
}

// ─── Aspects ──────────────────────────────────────────────────────────────────
// Accepts any array of PlanetPosition objects so it works for both natal
// aspects and cross-chart (synastry / transit) comparisons.
export function calcAspects(planets: PlanetPosition[]): Aspect[] {
  const result: Aspect[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const diff  = Math.abs(planets[i].degree - planets[j].degree);
      const angle = diff > 180 ? 360 - diff : diff;
      for (const def of ASPECT_DEFS) {
        const orb = Math.abs(angle - def.degrees);
        if (orb <= def.orb) {
          result.push({
            planet1: planets[i].name,
            planet2: planets[j].name,
            type: def.name,
            orb: Math.round(orb * 10) / 10,
            musicalInterval: def.musicalInterval,
            harmony: def.harmony,
            color:
              def.harmony === "consonant"
                ? "#3f5c35"
                : def.harmony === "dissonant"
                  ? "#7a3f2a"
                  : INK,
          });
          break;
        }
      }
    }
  }
  return result;
}

// ─── Cross-chart aspect calculator (synastry / transits) ──────────────────────
// Marks person-B planets with a prefix so calcAspects can compute all pairs,
// then filters to only cross-person aspects.
export function calcCrossChartAspects(
  planetsA: PlanetPosition[],
  planetsB: PlanetPosition[],
  prefixB = "P:",
): Aspect[] {
  const mixed = [
    ...planetsA,
    ...planetsB.map(p => ({ ...p, name: `${prefixB}${p.name}` })),
  ];
  return calcAspects(mixed).filter(
    a => a.planet1.startsWith(prefixB) !== a.planet2.startsWith(prefixB),
  );
}

// ─── Full chart builder ───────────────────────────────────────────────────────
export function buildChart(birth: BirthData): ChartData {
  const jd  = julianDay(birth.date, birth.time);
  const asc = calcAscendant(jd, birth.lat, birth.lon);

  const rawLons = [
    { name: "Sun",  lon: sunLon(jd)  },
    { name: "Moon", lon: moonLon(jd) },
    ...Object.keys(OUTER_DATA).map(n => ({ name: n, lon: outerLon(n, jd) })),
  ];

  const planets: PlanetPosition[] = rawLons.map(({ name, lon }) => {
    const pr   = PLANETS_RAW.find(p => p.name === name)!;
    const si   = Math.floor(lon / 30) % 12;
    const semi = Math.round((lon / 360) * 24) % 24;
    return {
      name,
      glyph: pr.glyph,
      degree: lon,
      sign: ZODIAC[si].name,
      signIndex: si,
      signDegree: Math.floor(lon % 30),
      house: Math.floor(normDeg(lon - asc) / 30) + 1,
      color: pr.color,
      note: `${NOTES[semi % 12]}${semi >= 12 ? 4 : 3}`,
      frequency: Math.round(pr.baseFreq * Math.pow(2, semi / 12) * 100) / 100,
      instrument: pr.instrument,
      waveform: pr.waveform,
      mode: ZODIAC[si].mode,
      rhythm: RHYTHMS[(Math.floor(normDeg(lon - asc) / 30)) % 12],
      timbre: pr.timbre,
    };
  });

  const aspects = calcAspects(planets);

  const elC: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  planets.forEach(p => elC[ZODIAC[p.signIndex].element]++);
  const domEl  = Object.entries(elC).sort((a, b) => b[1] - a[1])[0][0];
  const sun    = planets[0];
  const mars   = planets[4];
  const ascSi  = Math.floor(asc / 30) % 12;

  return {
    birthData: birth,
    planets,
    aspects,
    ascendant: asc,
    ascSign: ZODIAC[ascSi].name,
    midheaven: normDeg(asc + 270),
    dominantElement: domEl,
    musicalKey: `${ZODIAC[sun.signIndex].noteBase} ${ZODIAC[sun.signIndex].mode}`,
    tempo: Math.round(60 + (mars.degree / 360) * 80),
    timeSignature: ["4/4","3/4","6/8","5/4","7/8","4/4","3/4","6/8","4/4","5/4","7/8","4/4"][ascSi],
    mode: ZODIAC[ascSi].mode,
  };
}

// ─── Element description ──────────────────────────────────────────────────────
export function domDesc(element: string): string {
  return ELEMENT_DESCRIPTIONS[element] ?? "";
}
