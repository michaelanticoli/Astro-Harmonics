import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Play, Pause, Square, Volume2, VolumeX, RotateCcw } from "lucide-react";

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface BirthData {
  name: string; date: string; time: string; city: string; lat: number; lon: number;
}
interface PlanetPosition {
  name: string; glyph: string; degree: number; sign: string; signIndex: number;
  signDegree: number; house: number; color: string; note: string; frequency: number;
  instrument: string; waveform: OscillatorType; mode: string; rhythm: string; timbre: string;
}
interface Aspect {
  planet1: string; planet2: string; type: string; orb: number;
  musicalInterval: string; harmony: "consonant" | "dissonant" | "neutral"; color: string;
}
interface ChartData {
  birthData: BirthData; planets: PlanetPosition[]; aspects: Aspect[];
  ascendant: number; ascSign: string; midheaven: number; dominantElement: string;
  musicalKey: string; tempo: number; timeSignature: string; mode: string;
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const INK  = "#1a1714";
const FAINT = "rgba(26,23,20,0.08)";

const ZODIAC = [
  { name: "Aries",       glyph: "♈", element: "Fire",  mode: "Phrygian",   noteBase: "E",  color: "#7a3f2a" },
  { name: "Taurus",      glyph: "♉", element: "Earth", mode: "Lydian",     noteBase: "F",  color: "#3f5c35" },
  { name: "Gemini",      glyph: "♊", element: "Air",   mode: "Dorian",     noteBase: "G",  color: "#3c5070" },
  { name: "Cancer",      glyph: "♋", element: "Water", mode: "Aeolian",    noteBase: "A",  color: "#3a4278" },
  { name: "Leo",         glyph: "♌", element: "Fire",  mode: "Ionian",     noteBase: "B",  color: "#7a3f2a" },
  { name: "Virgo",       glyph: "♍", element: "Earth", mode: "Dorian",     noteBase: "C",  color: "#3f5c35" },
  { name: "Libra",       glyph: "♎", element: "Air",   mode: "Lydian",     noteBase: "D",  color: "#3c5070" },
  { name: "Scorpio",     glyph: "♏", element: "Water", mode: "Phrygian",   noteBase: "Eb", color: "#3a4278" },
  { name: "Sagittarius", glyph: "♐", element: "Fire",  mode: "Mixolydian", noteBase: "F#", color: "#7a3f2a" },
  { name: "Capricorn",   glyph: "♑", element: "Earth", mode: "Locrian",    noteBase: "G#", color: "#3f5c35" },
  { name: "Aquarius",    glyph: "♒", element: "Air",   mode: "Whole Tone", noteBase: "Bb", color: "#3c5070" },
  { name: "Pisces",      glyph: "♓", element: "Water", mode: "Chromatic",  noteBase: "B",  color: "#3a4278" },
];

const PLANETS_RAW = [
  { name: "Sun",     glyph: "☉", baseFreq: 126.22, waveform: "sine"     as OscillatorType, instrument: "Cello",          color: "#8b6b22", timbre: "Warm, full-bodied"    },
  { name: "Moon",    glyph: "☽", baseFreq: 210.42, waveform: "sine"     as OscillatorType, instrument: "Strings",         color: "#6b7282", timbre: "Silvery, flowing"     },
  { name: "Mercury", glyph: "☿", baseFreq: 141.27, waveform: "triangle" as OscillatorType, instrument: "Flute",           color: "#4b6b4a", timbre: "Bright, articulate"   },
  { name: "Venus",   glyph: "♀", baseFreq: 221.23, waveform: "sine"     as OscillatorType, instrument: "Harp",            color: "#7a4a58", timbre: "Sweet, harmonious"    },
  { name: "Mars",    glyph: "♂", baseFreq: 144.72, waveform: "sawtooth" as OscillatorType, instrument: "Trumpet",         color: "#7a3a28", timbre: "Bold, driving"        },
  { name: "Jupiter", glyph: "♃", baseFreq: 183.58, waveform: "triangle" as OscillatorType, instrument: "French Horn",     color: "#6b5042", timbre: "Rich, expansive"      },
  { name: "Saturn",  glyph: "♄", baseFreq: 147.85, waveform: "square"   as OscillatorType, instrument: "Organ",           color: "#4c4c5a", timbre: "Austere, sustained"   },
  { name: "Uranus",  glyph: "♅", baseFreq: 207.36, waveform: "sawtooth" as OscillatorType, instrument: "Synthesizer",     color: "#3a6b68", timbre: "Electric, unexpected" },
  { name: "Neptune", glyph: "♆", baseFreq: 211.44, waveform: "sine"     as OscillatorType, instrument: "Glass Harmonica", color: "#4a4a7a", timbre: "Ethereal, dreamy"     },
  { name: "Pluto",   glyph: "♇", baseFreq: 140.25, waveform: "square"   as OscillatorType, instrument: "Bass Drone",      color: "#5a3a6b", timbre: "Deep, transformative" },
];

const ASPECT_DEFS = [
  { name: "Conjunction", degrees: 0,   orb: 8, musicalInterval: "Unison",        harmony: "neutral"   as const, dash: "none"  },
  { name: "Sextile",     degrees: 60,  orb: 6, musicalInterval: "Minor 3rd",     harmony: "consonant" as const, dash: "none"  },
  { name: "Square",      degrees: 90,  orb: 8, musicalInterval: "Minor 7th",     harmony: "dissonant" as const, dash: "4,3"   },
  { name: "Trine",       degrees: 120, orb: 8, musicalInterval: "Perfect 5th",   harmony: "consonant" as const, dash: "none"  },
  { name: "Quincunx",    degrees: 150, orb: 3, musicalInterval: "Tritone",       harmony: "dissonant" as const, dash: "2,4"   },
  { name: "Opposition",  degrees: 180, orb: 8, musicalInterval: "Octave",        harmony: "neutral"   as const, dash: "8,3"   },
];

const CITIES = [
  { name: "New York, USA",           lat: 40.7128,  lon: -74.0060  },
  { name: "Los Angeles, USA",        lat: 34.0522,  lon: -118.2437 },
  { name: "Chicago, USA",            lat: 41.8781,  lon: -87.6298  },
  { name: "London, UK",              lat: 51.5074,  lon: -0.1278   },
  { name: "Paris, France",           lat: 48.8566,  lon: 2.3522    },
  { name: "Berlin, Germany",         lat: 52.5200,  lon: 13.4050   },
  { name: "Amsterdam, Netherlands",  lat: 52.3676,  lon: 4.9041    },
  { name: "Stockholm, Sweden",       lat: 59.3293,  lon: 18.0686   },
  { name: "Copenhagen, Denmark",     lat: 55.6761,  lon: 12.5683   },
  { name: "Oslo, Norway",            lat: 59.9139,  lon: 10.7522   },
  { name: "Helsinki, Finland",       lat: 60.1699,  lon: 24.9384   },
  { name: "Tokyo, Japan",            lat: 35.6762,  lon: 139.6503  },
  { name: "Mumbai, India",           lat: 19.0760,  lon: 72.8777   },
  { name: "Sydney, Australia",       lat: -33.8688, lon: 151.2093  },
  { name: "São Paulo, Brazil",       lat: -23.5505, lon: -46.6333  },
  { name: "Mexico City, Mexico",     lat: 19.4326,  lon: -99.1332  },
  { name: "Toronto, Canada",         lat: 43.6532,  lon: -79.3832  },
  { name: "Cairo, Egypt",            lat: 30.0444,  lon: 31.2357   },
];

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const RHYTHMS = [
  "Quarter notes — driving pulse", "Half notes — sustained breath", "Eighth notes — forward motion",
  "Dotted quarter — uneven lilt", "Triplets — rolling compound", "Sixteenth notes — rapid detail",
  "Whole notes — vast expansion", "Syncopated — off-balance thrust", "Ostinato — fixed repetition",
  "Polyrhythm — layered strata", "Free time — unmeasured float", "Marcato — deliberate accent",
];

// ─── CALCULATION ENGINE ──────────────────────────────────────────────────────

const normDeg = (d: number) => ((d % 360) + 360) % 360;
const toRad   = (d: number) => d * Math.PI / 180;
const J2000   = 2451545.0;

function julianDay(date: string, time: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const [h, mn]   = (time || "12:00").split(":").map(Number);
  const UT = h + mn / 60;
  const a = Math.floor((14 - m) / 12), yr = y + 4800 - a, mo = m + 12 * a - 3;
  const JDN = d + Math.floor((153 * mo + 2) / 5) + 365 * yr + Math.floor(yr / 4) - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045;
  return JDN + (UT - 12) / 24;
}

function sunLon(jd: number): number {
  const T = (jd - J2000) / 36525;
  const L0 = 280.46646 + 36000.76983 * T;
  const M = toRad(normDeg(357.52911 + 35999.05029 * T));
  return normDeg(L0 + (1.914602 - 0.004817 * T) * Math.sin(M) + 0.019993 * Math.sin(2 * M));
}

function moonLon(jd: number): number {
  const T = (jd - J2000) / 36525;
  const L0 = normDeg(218.3165 + 481267.8813 * T);
  const M  = toRad(normDeg(134.9634 + 477198.8676 * T));
  const D  = toRad(normDeg(297.8502 + 445267.1115 * T));
  return normDeg(L0 + 6.2886 * Math.sin(M) + 1.274 * Math.sin(2 * D - M) + 0.6583 * Math.sin(2 * D));
}

const OUTER: Record<string, { lon0: number; motion: number }> = {
  Mercury: { lon0: 252.251, motion: 4.0923 }, Venus:   { lon0: 181.979, motion: 1.6021 },
  Mars:    { lon0: 355.433, motion: 0.5240 }, Jupiter: { lon0:  34.351, motion: 0.0831 },
  Saturn:  { lon0:  50.077, motion: 0.0334 }, Uranus:  { lon0: 314.055, motion: 0.0117 },
  Neptune: { lon0: 304.349, motion: 0.0060 }, Pluto:   { lon0: 238.929, motion: 0.0040 },
};

const outerLon = (name: string, jd: number) => normDeg(OUTER[name].lon0 + OUTER[name].motion * (jd - J2000));

function calcAscendant(jd: number, lat: number, lon: number): number {
  const GMST = normDeg(280.46061837 + 360.98564736629 * (jd - J2000));
  const LST  = normDeg(GMST + lon);
  const lstR = toRad(LST), latR = toRad(lat), eps = toRad(23.44);
  const num  = Math.cos(lstR), den = -Math.sin(lstR) * Math.cos(eps) - Math.tan(latR) * Math.sin(eps);
  let asc = Math.atan2(num, den) * 180 / Math.PI;
  if (Math.cos(lstR) < 0) asc += 180;
  return normDeg(asc);
}

function calcAspects(planets: PlanetPosition[]): Aspect[] {
  const result: Aspect[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const diff = Math.abs(planets[i].degree - planets[j].degree);
      const angle = diff > 180 ? 360 - diff : diff;
      for (const def of ASPECT_DEFS) {
        const orb = Math.abs(angle - def.degrees);
        if (orb <= def.orb) {
          result.push({
            planet1: planets[i].name, planet2: planets[j].name,
            type: def.name, orb: Math.round(orb * 10) / 10,
            musicalInterval: def.musicalInterval, harmony: def.harmony,
            color: def.harmony === "consonant" ? "#3f5c35" : def.harmony === "dissonant" ? "#7a3f2a" : INK,
          });
          break;
        }
      }
    }
  }
  return result;
}

function buildChart(birth: BirthData): ChartData {
  const jd  = julianDay(birth.date, birth.time);
  const asc = calcAscendant(jd, birth.lat, birth.lon);
  const rawLons = [
    { name: "Sun", lon: sunLon(jd) }, { name: "Moon", lon: moonLon(jd) },
    ...Object.keys(OUTER).map(n => ({ name: n, lon: outerLon(n, jd) })),
  ];
  const planets: PlanetPosition[] = rawLons.map(({ name, lon }) => {
    const pr = PLANETS_RAW.find(p => p.name === name)!;
    const si = Math.floor(lon / 30) % 12;
    const semi = Math.round((lon / 360) * 24) % 24;
    return {
      name, glyph: pr.glyph, degree: lon,
      sign: ZODIAC[si].name, signIndex: si, signDegree: Math.floor(lon % 30),
      house: Math.floor(normDeg(lon - asc) / 30) + 1,
      color: pr.color,
      note: `${NOTES[semi % 12]}${semi >= 12 ? 4 : 3}`,
      frequency: Math.round(pr.baseFreq * Math.pow(2, semi / 12) * 100) / 100,
      instrument: pr.instrument, waveform: pr.waveform,
      mode: ZODIAC[si].mode, rhythm: RHYTHMS[(Math.floor(normDeg(lon - asc) / 30)) % 12],
      timbre: pr.timbre,
    };
  });
  const aspects = calcAspects(planets);
  const elC: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  planets.forEach(p => elC[ZODIAC[p.signIndex].element]++);
  const domEl = Object.entries(elC).sort((a, b) => b[1] - a[1])[0][0];
  const sun = planets[0], mars = planets[4];
  const ascSi = Math.floor(asc / 30) % 12;
  return {
    birthData: birth, planets, aspects,
    ascendant: asc, ascSign: ZODIAC[ascSi].name, midheaven: normDeg(asc + 270),
    dominantElement: domEl,
    musicalKey: `${ZODIAC[sun.signIndex].noteBase} ${ZODIAC[sun.signIndex].mode}`,
    tempo: Math.round(60 + (mars.degree / 360) * 80),
    timeSignature: ["4/4","3/4","6/8","5/4","7/8","4/4","3/4","6/8","4/4","5/4","7/8","4/4"][ascSi],
    mode: ZODIAC[ascSi].mode,
  };
}

// ─── SVG CHART HELPERS ───────────────────────────────────────────────────────

function astroXY(cx: number, cy: number, r: number, ecl: number, asc: number) {
  const diff = normDeg(ecl - asc);
  const rad  = toRad(180 + diff);
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function sectorPath(cx: number, cy: number, r1: number, r2: number, startEcl: number, asc: number) {
  const sRad = toRad(180 + normDeg(startEcl - asc));
  const eRad = sRad + toRad(30);
  const ox1 = cx + r1 * Math.cos(sRad), oy1 = cy - r1 * Math.sin(sRad);
  const ox2 = cx + r1 * Math.cos(eRad), oy2 = cy - r1 * Math.sin(eRad);
  const ix2 = cx + r2 * Math.cos(eRad), iy2 = cy - r2 * Math.sin(eRad);
  const ix1 = cx + r2 * Math.cos(sRad), iy1 = cy - r2 * Math.sin(sRad);
  return `M ${ox1} ${oy1} A ${r1} ${r1} 0 0 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${r2} ${r2} 0 0 0 ${ix1} ${iy1} Z`;
}

// ─── AUDIO ENGINE ────────────────────────────────────────────────────────────

function playNote(ctx: AudioContext, dest: AudioNode, freq: number, waveform: OscillatorType, dur: number, vol = 0.22) {
  const osc = ctx.createOscillator(), gain = ctx.createGain(), filter = ctx.createBiquadFilter();
  osc.type = waveform; osc.frequency.value = freq;
  filter.type = "lowpass"; filter.frequency.value = Math.min(freq * 5, 3500);
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + 0.05);
  gain.gain.setValueAtTime(vol * 0.7, now + 0.15);
  gain.gain.linearRampToValueAtTime(0, now + dur - 0.05);
  osc.connect(filter).connect(gain).connect(dest);
  osc.start(now); osc.stop(now + dur);
}

function useAudioEngine(chart: ChartData | null) {
  const ctxRef    = useRef<AudioContext | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [isPlaying, setPlaying]   = useState(false);
  const [activePlanet, setActive] = useState<string | null>(null);
  const [volume, setVolume]       = useState(0.7);
  const volRef = useRef(volume);
  useEffect(() => { volRef.current = volume; }, [volume]);

  const stop = useCallback(() => {
    timersRef.current.forEach(clearTimeout); timersRef.current = [];
    ctxRef.current?.close(); ctxRef.current = null;
    setPlaying(false); setActive(null);
  }, []);

  const play = useCallback(() => {
    if (!chart) return;
    if (ctxRef.current) { stop(); return; }
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.value = volRef.current;
    const delay = ctx.createDelay(1.0), fb = ctx.createGain();
    delay.delayTime.value = 0.25; fb.gain.value = 0.22;
    master.connect(ctx.destination); master.connect(delay);
    delay.connect(fb); fb.connect(delay); fb.connect(ctx.destination);
    setPlaying(true);
    const durOpts = [1, 0.5, 1.5, 0.75, 2, 0.5];
    let ms = 100;
    const seq = [];
    for (let c = 0; c < 3; c++) for (let i = 0; i < chart.planets.length; i++) seq.push({ p: chart.planets[i], d: durOpts[(i + c * 3) % durOpts.length] });
    seq.forEach(({ p, d }) => {
      const dur = (d * 60000 / chart.tempo) / 1000;
      const t = setTimeout(() => {
        setActive(p.name);
        playNote(ctx, master, p.frequency, p.waveform, dur, 0.3 * volRef.current);
        if (["Saturn","Pluto","Jupiter"].includes(p.name)) playNote(ctx, master, p.frequency / 2, "sine", dur * 1.3, 0.1 * volRef.current);
      }, ms);
      timersRef.current.push(t);
      ms += d * 60000 / chart.tempo;
    });
    const done = setTimeout(() => stop(), ms + 300);
    timersRef.current.push(done);
  }, [chart, stop]);

  useEffect(() => () => { stop(); }, [stop]);
  return { play, stop, isPlaying, activePlanet, volume, setVolume };
}

// ─── NATAL CHART ─────────────────────────────────────────────────────────────

const CX = 250, CY = 250;
const RZ_OUT = 236, RZ_IN = 200, RH_IN = 163, RA = 116;

function NatalChart({ chart, selected, active, onSelect }: {
  chart: ChartData; selected: string | null; active: string | null;
  onSelect: (n: string | null) => void;
}) {
  const { planets, aspects, ascendant } = chart;

  return (
    <svg viewBox="0 0 500 500" className="w-full h-full" style={{ fontFamily: "'DM Mono', monospace" }}>
      <defs>
        <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke={INK} strokeWidth="0.3" strokeOpacity="0.08" />
        </pattern>
      </defs>

      {/* Ground */}
      <circle cx={CX} cy={CY} r={RZ_OUT + 4} fill="#f0ece3" />
      <circle cx={CX} cy={CY} r={RZ_OUT + 4} fill="url(#hatch)" />

      {/* Zodiac sectors — alternating tone */}
      {ZODIAC.map((sign, i) => (
        <path key={sign.name}
          d={sectorPath(CX, CY, RZ_OUT, RZ_IN, i * 30, ascendant)}
          fill={i % 2 === 0 ? "rgba(26,23,20,0.03)" : "transparent"}
          stroke={INK} strokeWidth="0.4" strokeOpacity="0.2"
        />
      ))}

      {/* Zodiac glyphs */}
      {ZODIAC.map((sign, i) => {
        const mid = astroXY(CX, CY, (RZ_OUT + RZ_IN) / 2, i * 30 + 15, ascendant);
        return (
          <text key={sign.name} x={mid.x} y={mid.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize="11" fill={sign.color} opacity="0.85"
            style={{ userSelect: "none" }}>
            {sign.glyph}
          </text>
        );
      })}

      {/* Ring borders */}
      <circle cx={CX} cy={CY} r={RZ_OUT} fill="none" stroke={INK} strokeWidth="0.6" strokeOpacity="0.35" />
      <circle cx={CX} cy={CY} r={RZ_IN}  fill="none" stroke={INK} strokeWidth="0.4" strokeOpacity="0.2"  />
      <circle cx={CX} cy={CY} r={RH_IN}  fill="none" stroke={INK} strokeWidth="0.4" strokeOpacity="0.15" />
      <circle cx={CX} cy={CY} r={RA + 4} fill="none" stroke={INK} strokeWidth="0.3" strokeOpacity="0.1"  />

      {/* Outer degree marks — every 5° */}
      {Array.from({ length: 72 }, (_, i) => {
        const ecl = i * 5;
        const p1  = astroXY(CX, CY, RZ_OUT - 1, ecl, ascendant);
        const p2  = astroXY(CX, CY, RZ_OUT - (i % 6 === 0 ? 9 : 5), ecl, ascendant);
        return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={INK} strokeWidth="0.4" strokeOpacity={i % 6 === 0 ? 0.4 : 0.18} />;
      })}

      {/* House division lines (every 30°) */}
      {Array.from({ length: 12 }, (_, i) => {
        const p1 = astroXY(CX, CY, RH_IN, i * 30, ascendant);
        const p2 = astroXY(CX, CY, RZ_IN, i * 30, ascendant);
        const p3 = astroXY(CX, CY, 52, i * 30, ascendant);
        const isAngular = i % 3 === 0;
        return (
          <g key={i}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={INK} strokeWidth={isAngular ? 0.8 : 0.35} strokeOpacity={isAngular ? 0.5 : 0.18} />
            {isAngular && <line x1={p1.x} y1={p1.y} x2={p3.x} y2={p3.y} stroke={INK} strokeWidth="0.5" strokeOpacity="0.25" strokeDasharray="2,3" />}
          </g>
        );
      })}

      {/* House numbers */}
      {Array.from({ length: 12 }, (_, i) => {
        const mid = astroXY(CX, CY, (RZ_IN + RH_IN) / 2, i * 30 + 15, ascendant);
        return <text key={i} x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="central" fontSize="8" fill={INK} opacity="0.3" style={{ userSelect: "none" }}>{i + 1}</text>;
      })}

      {/* ASC / MC / DSC / IC labels */}
      {[
        { ecl: 0,   label: "ASC" },
        { ecl: 90,  label: "IC"  },
        { ecl: 180, label: "DSC" },
        { ecl: 270, label: "MC"  },
      ].map(({ ecl, label }) => {
        const pt = astroXY(CX, CY, RZ_OUT + 14, ecl, ascendant);
        return <text key={label} x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="central" fontSize="7" fill={INK} opacity="0.55" letterSpacing="0.06em" style={{ userSelect: "none" }}>{label}</text>;
      })}

      {/* Aspect lines */}
      {aspects.map((asp, i) => {
        const p1 = planets.find(p => p.name === asp.planet1)!;
        const p2 = planets.find(p => p.name === asp.planet2)!;
        if (!p1 || !p2) return null;
        const a1 = astroXY(CX, CY, RA, p1.degree, ascendant);
        const a2 = astroXY(CX, CY, RA, p2.degree, ascendant);
        const def = ASPECT_DEFS.find(d => d.name === asp.type)!;
        return (
          <line key={i} x1={a1.x} y1={a1.y} x2={a2.x} y2={a2.y}
            stroke={asp.color} strokeWidth="0.6"
            strokeOpacity={asp.harmony === "consonant" ? 0.5 : asp.harmony === "dissonant" ? 0.4 : 0.3}
            strokeDasharray={def?.dash === "none" ? undefined : def?.dash}
          />
        );
      })}

      {/* Center disc */}
      <circle cx={CX} cy={CY} r={50} fill="#f0ece3" stroke={INK} strokeWidth="0.5" strokeOpacity="0.2" />
      <circle cx={CX} cy={CY} r={46} fill="none" stroke={INK} strokeWidth="0.3" strokeOpacity="0.1" />
      <text x={CX} y={CY - 11} textAnchor="middle" fontSize="7.5" fill={INK} opacity="0.35" letterSpacing="0.12em">KEY</text>
      <text x={CX} y={CY}     textAnchor="middle" fontSize="8.5" fill={INK} opacity="0.6" letterSpacing="0.05em" fontWeight="500">{chart.musicalKey}</text>
      <text x={CX} y={CY + 13} textAnchor="middle" fontSize="7" fill={INK} opacity="0.3">{chart.tempo} BPM · {chart.timeSignature}</text>

      {/* Planet markers */}
      {planets.map(planet => {
        const pos  = astroXY(CX, CY, (RH_IN + RA + 4) / 2, planet.degree, ascendant);
        const isSel = planet.name === selected;
        const isAct = planet.name === active;
        const r     = 7;
        return (
          <g key={planet.name} onClick={() => onSelect(selected === planet.name ? null : planet.name)} style={{ cursor: "pointer" }}>
            {isSel && <circle cx={pos.x} cy={pos.y} r={r + 5} fill={planet.color} opacity="0.1" />}
            <circle cx={pos.x} cy={pos.y} r={r}
              fill={isSel || isAct ? planet.color : "#f0ece3"}
              stroke={planet.color}
              strokeWidth={isSel || isAct ? 0 : 1}
              strokeOpacity="0.7"
            />
            <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
              fontSize="7.5" fill={isSel || isAct ? "#f5f2eb" : planet.color}
              style={{ userSelect: "none", pointerEvents: "none" }}>
              {planet.glyph}
            </text>
            <text x={pos.x} y={pos.y + r + 5} textAnchor="middle"
              fontSize="5.5" fill={INK} opacity="0.4"
              style={{ userSelect: "none", pointerEvents: "none" }}>
              {planet.signDegree}°
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── RULE COMPONENT ──────────────────────────────────────────────────────────

function Rule({ className = "", opacity = 1 }: { className?: string; opacity?: number }) {
  return <div className={`w-full border-t ${className}`} style={{ borderColor: `rgba(26,23,20,${opacity * 0.1})` }} />;
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`text-xs tracking-widest uppercase ${className}`}
      style={{ fontFamily: "'DM Mono', monospace", color: "var(--muted-foreground)", letterSpacing: "0.14em" }}>
      {children}
    </span>
  );
}

// ─── BIRTH FORM ───────────────────────────────────────────────────────────────

function BirthForm({ onSubmit }: { onSubmit: (d: BirthData) => void }) {
  const [form, setForm] = useState({ name: "", date: "1990-06-21", time: "14:30", city: CITIES[0].name, lat: CITIES[0].lat, lon: CITIES[0].lon });
  const [err, setErr]   = useState("");

  const handleCity = (v: string) => {
    const c = CITIES.find(c => c.name === v);
    if (c) setForm(f => ({ ...f, city: c.name, lat: c.lat, lon: c.lon }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setErr("Name required"); return; }
    if (!form.date)         { setErr("Date required"); return; }
    setErr(""); onSubmit({ ...form });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      {/* Masthead */}
      <header className="px-8 pt-10 pb-0 flex items-start justify-between">
        <div>
          <div className="text-xs tracking-widest" style={{ fontFamily: "'DM Mono', monospace", color: "var(--muted-foreground)", letterSpacing: "0.18em" }}>
            ASTRO·HARMONICS
          </div>
        </div>
        <div className="text-xs text-right" style={{ fontFamily: "'DM Mono', monospace", color: "var(--muted-foreground)", opacity: 0.5 }}>
          fig. I — natal chart composer
        </div>
      </header>

      {/* Main composition */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left — display type */}
        <div className="lg:w-1/2 flex flex-col justify-between px-8 pt-16 pb-12">
          <div>
            <h1 style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 300,
              fontSize: "clamp(3.5rem, 9vw, 7.5rem)",
              lineHeight: 0.9,
              letterSpacing: "-0.02em",
              color: "var(--foreground)",
            }}>
              Your<br />
              Cosmos<br />
              <em style={{ fontStyle: "italic", fontWeight: 200 }}>Composed.</em>
            </h1>
            <p className="mt-8 max-w-sm leading-relaxed" style={{ fontWeight: 300, fontSize: "0.95rem", color: "var(--muted-foreground)" }}>
              Enter your birth data. Your natal chart is translated into a living musical composition — each planet's orbital frequency rendered as pitch, timbre, rhythm, and mode.
            </p>
          </div>

          {/* Esoteric diagram */}
          <div className="mt-12 lg:mt-0">
            <svg viewBox="0 0 200 200" width="140" height="140" style={{ opacity: 0.25 }}>
              <circle cx="100" cy="100" r="90" fill="none" stroke={INK} strokeWidth="0.5" />
              <circle cx="100" cy="100" r="65" fill="none" stroke={INK} strokeWidth="0.5" />
              <circle cx="100" cy="100" r="40" fill="none" stroke={INK} strokeWidth="0.5" />
              <circle cx="100" cy="100" r="3"  fill={INK} />
              {Array.from({ length: 12 }, (_, i) => {
                const a = toRad(i * 30 - 90);
                return (
                  <g key={i}>
                    <line x1={100 + 62 * Math.cos(a)} y1={100 + 62 * Math.sin(a)} x2={100 + 92 * Math.cos(a)} y2={100 + 92 * Math.sin(a)} stroke={INK} strokeWidth="0.5" />
                    <line x1={100 + 37 * Math.cos(a)} y1={100 + 37 * Math.sin(a)} x2={100 + 63 * Math.cos(a)} y2={100 + 63 * Math.sin(a)} stroke={INK} strokeWidth="0.3" strokeDasharray="1,3" />
                  </g>
                );
              })}
              {Array.from({ length: 4 }, (_, i) => {
                const a = toRad(i * 90);
                return <line key={i} x1={100 + 40 * Math.cos(a)} y1={100 + 40 * Math.sin(a)} x2={100 - 40 * Math.cos(a)} y2={100 - 40 * Math.sin(a)} stroke={INK} strokeWidth="0.3" strokeOpacity="0.5" />;
              })}
              <text x="100" y="104" textAnchor="middle" fontSize="8" fill={INK} fontFamily="'DM Mono', monospace">⊕</text>
            </svg>
          </div>
        </div>

        {/* Right — form */}
        <div className="lg:w-1/2 flex items-center justify-center px-8 py-16 lg:border-l" style={{ borderColor: "rgba(26,23,20,0.08)" }}>
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-8">
            <div className="space-y-6">
              {([
                { label: "Full Name",    field: "name",  type: "text",  placeholder: "Given and family name" },
                { label: "Date of Birth",field: "date",  type: "date",  placeholder: "" },
                { label: "Time of Birth",field: "time",  type: "time",  placeholder: "" },
              ] as const).map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <Label>{label}</Label>
                  <div className="mt-2 border-b" style={{ borderColor: "rgba(26,23,20,0.2)" }}>
                    <input
                      type={type} placeholder={placeholder}
                      value={(form as Record<string, string>)[field]}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      className="w-full py-2.5 bg-transparent outline-none text-base"
                      style={{
                        fontFamily: field === "name" ? "'Fraunces', serif" : "'DM Mono', monospace",
                        fontWeight: field === "name" ? 300 : 400,
                        color: "var(--foreground)",
                        fontSize: field === "name" ? "1.1rem" : "0.875rem",
                      }}
                    />
                  </div>
                </div>
              ))}

              <div>
                <Label>City of Birth</Label>
                <div className="mt-2 border-b relative" style={{ borderColor: "rgba(26,23,20,0.2)" }}>
                  <select
                    value={form.city}
                    onChange={e => handleCity(e.target.value)}
                    className="w-full py-2.5 bg-transparent outline-none appearance-none text-sm"
                    style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, color: "var(--foreground)" }}>
                    {CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="mt-1.5">
                  <Label>{form.lat > 0 ? `${form.lat.toFixed(2)}°N` : `${Math.abs(form.lat).toFixed(2)}°S`} · {form.lon > 0 ? `${form.lon.toFixed(2)}°E` : `${Math.abs(form.lon).toFixed(2)}°W`}</Label>
                </div>
              </div>
            </div>

            {err && <p className="text-xs" style={{ fontFamily: "'DM Mono', monospace", color: "#7a2a20" }}>{err}</p>}

            <button type="submit" className="w-full py-4 text-sm tracking-widest transition-colors"
              style={{
                background: "var(--foreground)", color: "var(--primary-foreground)",
                fontFamily: "'DM Mono', monospace", letterSpacing: "0.16em",
              }}>
              CAST CHART
            </button>

            <p className="text-center" style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "var(--muted-foreground)", opacity: 0.5, letterSpacing: "0.08em" }}>
              Orbital frequencies after Hans Cousto · Simplified ephemeris
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

// ─── SCORE PANEL ─────────────────────────────────────────────────────────────

function ScorePanel({ chart, selected, onSelect }: { chart: ChartData; selected: string | null; onSelect: (n: string | null) => void }) {
  return (
    <div className="space-y-0">
      <div className="flex items-baseline justify-between pb-4 mb-2" style={{ borderBottom: `1px solid rgba(26,23,20,0.08)` }}>
        <Label>Planet · Sign · House</Label>
        <Label>Note · Hz</Label>
      </div>
      {chart.planets.map((p, i) => {
        const isSel = selected === p.name;
        return (
          <div key={p.name}>
            <div
              onClick={() => onSelect(isSel ? null : p.name)}
              className="flex items-center justify-between py-3.5 cursor-pointer transition-colors"
              style={{ borderBottom: `1px solid rgba(26,23,20,${isSel ? 0.12 : 0.06})` }}
            >
              <div className="flex items-center gap-4">
                <span style={{ fontSize: "1.1rem", color: p.color, width: 20, display: "inline-block" }}>{p.glyph}</span>
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
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", color: "var(--foreground)" }}>{p.note}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--muted-foreground)" }}>{p.frequency} Hz</div>
              </div>
            </div>

            {isSel && (
              <div className="py-4 px-4 grid grid-cols-2 gap-x-6 gap-y-3" style={{ background: "rgba(26,23,20,0.03)", borderBottom: `1px solid rgba(26,23,20,0.08)` }}>
                {[
                  { k: "Instrument", v: p.instrument },
                  { k: "Mode",       v: p.mode       },
                  { k: "Timbre",     v: p.timbre     },
                  { k: "Rhythm",     v: p.rhythm     },
                ].map(({ k, v }) => (
                  <div key={k}>
                    <Label>{k}</Label>
                    <p className="mt-0.5 text-sm" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, color: "var(--foreground)" }}>{v}</p>
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
          <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid rgba(26,23,20,0.05)` }}>
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

// ─── COMPOSE PANEL ───────────────────────────────────────────────────────────

function ComposePanel({ chart, engine }: { chart: ChartData; engine: ReturnType<typeof useAudioEngine> }) {
  const { play, stop, isPlaying, activePlanet, volume, setVolume } = engine;
  const activePl = chart.planets.find(p => p.name === activePlanet);

  return (
    <div className="space-y-8">
      {/* Key specs */}
      <div className="grid grid-cols-3 gap-0" style={{ borderTop: `1px solid rgba(26,23,20,0.08)`, borderLeft: `1px solid rgba(26,23,20,0.08)` }}>
        {[
          { k: "Key",      v: chart.musicalKey       },
          { k: "Tempo",    v: `${chart.tempo} BPM`   },
          { k: "Meter",    v: chart.timeSignature     },
          { k: "Mode",     v: chart.mode              },
          { k: "Element",  v: chart.dominantElement   },
          { k: "Asc",      v: chart.ascSign           },
        ].map(({ k, v }) => (
          <div key={k} className="p-4" style={{ borderRight: `1px solid rgba(26,23,20,0.08)`, borderBottom: `1px solid rgba(26,23,20,0.08)` }}>
            <Label className="block">{k}</Label>
            <div className="mt-1.5" style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: "0.95rem", color: "var(--foreground)" }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Composition title */}
      <div>
        <Label>Chart Song</Label>
        <p className="mt-1" style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontStyle: "italic", fontSize: "1.4rem", color: "var(--foreground)" }}>
          "{chart.birthData.name}'s Cosmos"
        </p>
      </div>

      {/* Waveform */}
      <div style={{ borderTop: `1px solid rgba(26,23,20,0.08)`, borderBottom: `1px solid rgba(26,23,20,0.08)`, padding: "16px 0" }}>
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
            return <polyline key={p.name} points={pts} fill="none" stroke={p.color} strokeWidth={isAct ? 1.2 : 0.5} strokeOpacity={isAct ? 0.9 : 0.3} />;
          })}
          {/* Baseline */}
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

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button onClick={isPlaying ? stop : play}
          className="flex items-center justify-center w-11 h-11 transition-colors"
          style={{ border: `1px solid rgba(26,23,20,0.3)`, background: isPlaying ? "var(--foreground)" : "transparent", color: isPlaying ? "var(--primary-foreground)" : "var(--foreground)" }}>
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        {isPlaying && (
          <button onClick={stop}
            className="flex items-center justify-center w-9 h-9 transition-colors"
            style={{ border: `1px solid rgba(26,23,20,0.15)`, color: "var(--muted-foreground)" }}>
            <Square size={13} />
          </button>
        )}
        <div className="flex-1 flex items-center gap-3">
          <VolumeX size={12} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
          <div className="flex-1 h-px relative" style={{ background: "rgba(26,23,20,0.12)" }}>
            <input type="range" min="0" max="1" step="0.01" value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer" style={{ height: "20px", top: "-10px" }}
            />
            <div className="h-px" style={{ width: `${volume * 100}%`, background: "var(--foreground)", transition: "width 0.05s" }} />
            <div className="w-2 h-2 absolute top-1/2 -translate-y-1/2" style={{ left: `calc(${volume * 100}% - 4px)`, background: "var(--foreground)", borderRadius: 0 }} />
          </div>
          <Volume2 size={12} style={{ color: "var(--foreground)", flexShrink: 0 }} />
        </div>
      </div>

      {/* Planet voice grid */}
      <div>
        <Label className="block mb-3">Planetary Voices</Label>
        <div className="flex flex-wrap gap-2">
          {chart.planets.map(p => (
            <div key={p.name}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-all"
              style={{
                border: `1px solid ${p.name === activePlanet ? p.color : "rgba(26,23,20,0.1)"}`,
                background: p.name === activePlanet ? `rgba(${hexRgb(p.color)},0.07)` : "transparent",
                fontFamily: "'DM Mono', monospace",
                color: p.name === activePlanet ? p.color : "var(--muted-foreground)",
              }}>
              {p.glyph} {p.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── REPORT PANEL ────────────────────────────────────────────────────────────

function ReportPanel({ chart }: { chart: ChartData }) {
  const { planets, ascSign, dominantElement, musicalKey, tempo, timeSignature, mode, birthData } = chart;
  const sun = planets[0], moon = planets[1];

  const sections = [
    {
      title: "Cosmic Signature",
      body: `${birthData.name}'s composition opens in ${musicalKey} — a ${mode} landscape at ${tempo} BPM in ${timeSignature}. The dominant element is ${dominantElement.toLowerCase()}, shaping an overall character of ${domDesc(dominantElement)}. The Ascendant in ${ascSign} sets the compositional architecture: the timbre of the whole.`,
    },
    {
      title: "Solar Voice",
      body: `The Sun in ${sun.sign} at ${sun.signDegree}° resonates at ${sun.frequency} Hz — ${sun.note} — through ${sun.instrument}. This is the fundamental tone: ${sun.timbre}. The ${sun.mode} mode saturates every melodic phrase that originates from this chart.`,
    },
    {
      title: "Lunar Voice",
      body: `The Moon in ${moon.sign} at ${moon.signDegree}° sounds at ${moon.frequency} Hz — ${moon.note} — through ${moon.instrument}. ${moon.timbre}. Against the solar clarity, the Moon provides a ${moon.mode} countermelody from the ${moon.house}th house.`,
    },
    {
      title: "Inner Planets",
      body: planets.slice(2, 6).map(p => `${p.name} in ${p.sign} (${p.signDegree}°) — ${p.frequency} Hz, ${p.note}, ${p.instrument}. ${p.mode} mode. ${p.rhythm}.`).join("\n\n"),
    },
    {
      title: "Outer Planets",
      body: planets.slice(6).map(p => `${p.name} in ${p.sign} (${p.signDegree}°) — ${p.frequency} Hz, voiced as ${p.instrument}. ${p.timbre}.`).join("\n\n"),
    },
    {
      title: "The Living Score",
      body: `This Chart Song stands complete as a portrait. In Synastry, it layers with another's natal score — harmonic consonance or productive dissonance between two cosmic compositions. In Transit Fusion, today's sky creates a real-time mashup: your natal frequencies in conversation with the present orbital moment.`,
    },
  ];

  return (
    <div className="space-y-0">
      {sections.map((s, i) => (
        <div key={s.title}>
          <div className="py-5" style={{ borderBottom: `1px solid rgba(26,23,20,0.07)` }}>
            <div className="flex items-baseline gap-6">
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "var(--muted-foreground)", minWidth: 16, opacity: 0.5 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="mb-2" style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: "0.9rem", color: "var(--foreground)" }}>
                  {s.title}
                </p>
                {s.body.split("\n\n").map((para, j) => (
                  <p key={j} className="text-sm leading-relaxed mb-2 last:mb-0" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, color: "var(--muted-foreground)" }}>
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

function domDesc(el: string) {
  return { Fire: "ardent urgency and expressive thrust", Earth: "grounded solidity and rhythmic certainty", Air: "harmonic intellect and tonal lightness", Water: "fluid depth and tidal resonance" }[el] ?? "";
}

// ─── SYNASTRY PANEL ──────────────────────────────────────────────────────────

function SynastryPanel({ chart }: { chart: ChartData }) {
  const [partner, setPartner] = useState<BirthData | null>(null);
  const [form, setForm] = useState({ name: "", date: "", time: "12:00", city: CITIES[0].name, lat: CITIES[0].lat, lon: CITIES[0].lon });

  const handleCity = (v: string) => { const c = CITIES.find(c => c.name === v); if (c) setForm(f => ({ ...f, city: c.name, lat: c.lat, lon: c.lon })); };
  const partnerChart = useMemo(() => partner ? buildChart(partner) : null, [partner]);

  if (!partnerChart) {
    return (
      <div className="space-y-8">
        <p className="text-sm leading-relaxed" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, color: "var(--muted-foreground)" }}>
          Enter a second birth chart to generate a synastric duet — two natal compositions overlaid, revealing harmonic resonance or creative tension between souls.
        </p>
        <div className="space-y-6">
          {([
            { label: "Full Name",    field: "name", type: "text", placeholder: "Partner's name"  },
            { label: "Date of Birth",field: "date", type: "date", placeholder: ""                 },
            { label: "Time of Birth",field: "time", type: "time", placeholder: ""                 },
          ] as const).map(({ label, field, type, placeholder }) => (
            <div key={field}>
              <Label>{label}</Label>
              <div className="mt-2 border-b" style={{ borderColor: "rgba(26,23,20,0.2)" }}>
                <input type={type} placeholder={placeholder}
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
              <select value={form.city} onChange={e => handleCity(e.target.value)}
                className="w-full py-2.5 bg-transparent outline-none appearance-none text-sm"
                style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, color: "var(--foreground)" }}>
                {CITIES.map(c => <option key={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => { if (form.name && form.date) setPartner({ ...form }); }}
            className="w-full py-4 text-sm tracking-widest transition-colors"
            style={{ background: "var(--foreground)", color: "var(--primary-foreground)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.14em" }}>
            CAST PARTNER CHART
          </button>
        </div>
      </div>
    );
  }

  const crossAspects = calcAspects([...chart.planets, ...partnerChart.planets.map(p => ({ ...p, name: `P:${p.name}` }))]).filter(a => a.planet1.startsWith("P:") !== a.planet2.startsWith("P:"));
  const pName = partnerChart.birthData.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Label className="block">{chart.birthData.name} × {partnerChart.birthData.name}</Label>
          <p className="mt-2" style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontStyle: "italic", fontSize: "1.1rem", color: "var(--foreground)" }}>
            Synastric Duet
          </p>
        </div>
        <button onClick={() => setPartner(null)} style={{ color: "var(--muted-foreground)", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem" }}>
          <RotateCcw size={14} />
        </button>
      </div>
      <Rule />
      <div className="grid grid-cols-2 gap-6">
        {[
          { label: chart.birthData.name,    key: chart.musicalKey,       mode: chart.mode,        tempo: chart.tempo },
          { label: partnerChart.birthData.name, key: partnerChart.musicalKey, mode: partnerChart.mode, tempo: partnerChart.tempo },
        ].map((d, i) => (
          <div key={i}>
            <Label className="block">{d.label}</Label>
            <p className="mt-1.5" style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: "0.95rem", color: "var(--foreground)" }}>{d.key}</p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: "var(--muted-foreground)" }}>{d.mode} · {d.tempo} BPM</p>
          </div>
        ))}
      </div>
      <Rule />
      <Label>Cross-Chart Aspects — {crossAspects.length} found</Label>
      <div className="space-y-0">
        {crossAspects.slice(0, 9).map((a, i) => (
          <div key={i} className="flex items-center justify-between py-3" style={{ borderBottom: `1px solid rgba(26,23,20,0.06)` }}>
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-1 rounded-full" style={{ background: a.color }} />
              <span className="text-sm" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, color: "var(--foreground)" }}>
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

// ─── TRANSITS PANEL ──────────────────────────────────────────────────────────

function TransitsPanel({ chart }: { chart: ChartData }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const transitChart = useMemo(() => buildChart({ name: "Transits", date: todayStr, time: "12:00", city: "Greenwich", lat: 51.48, lon: 0 }), [todayStr]);
  const cross = useMemo(() =>
    calcAspects([...chart.planets, ...transitChart.planets.map(p => ({ ...p, name: `T:${p.name}` }))]).filter(a => a.planet1.startsWith("T:") !== a.planet2.startsWith("T:")),
  [chart.planets, transitChart.planets]);

  return (
    <div className="space-y-6">
      <div>
        <Label className="block">Current Sky</Label>
        <p className="mt-2" style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontStyle: "italic", fontSize: "1.1rem", color: "var(--foreground)" }}>
          Transit Fusion — {todayStr}
        </p>
        <p className="mt-2 text-sm leading-relaxed" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, color: "var(--muted-foreground)" }}>
          Today's orbital positions sounding against your natal chart. The present cosmos in harmonic conversation with your birth score.
        </p>
      </div>
      <Rule />
      <Label>Planet Positions — Natal vs. Transit</Label>
      <div className="space-y-0">
        {transitChart.planets.slice(0, 8).map(tp => {
          const natal = chart.planets.find(p => p.name === tp.name)!;
          return (
            <div key={tp.name} className="py-3 flex items-start justify-between" style={{ borderBottom: `1px solid rgba(26,23,20,0.06)` }}>
              <div className="flex items-center gap-3">
                <span style={{ color: tp.color, fontSize: "0.95rem", width: 18 }}>{tp.glyph}</span>
                <span style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, fontSize: "0.875rem", color: "var(--foreground)" }}>{tp.name}</span>
              </div>
              <div className="text-right">
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--foreground)" }}>↑ {tp.sign} {tp.signDegree}°</div>
                {natal && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--muted-foreground)" }}>● {natal.sign} {natal.signDegree}°</div>}
              </div>
            </div>
          );
        })}
      </div>
      <Rule />
      <Label>Active Transit Aspects — {cross.length}</Label>
      <div className="space-y-0">
        {cross.slice(0, 7).map((a, i) => (
          <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid rgba(26,23,20,0.04)` }}>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full" style={{ background: a.color }} />
              <span className="text-sm" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, color: "var(--foreground)" }}>
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

// ─── UTILITY ─────────────────────────────────────────────────────────────────

function hexRgb(hex: string) {
  return `${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)}`;
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

type Tab = "score" | "compose" | "report" | "synastry" | "transits";

export default function App() {
  const [chart, setChart]     = useState<ChartData | null>(null);
  const [tab, setTab]         = useState<Tab>("score");
  const [selected, setSelected] = useState<string | null>(null);
  const audio                 = useAudioEngine(chart);

  const handleSubmit = useCallback((b: BirthData) => {
    setChart(buildChart(b)); setTab("score"); setSelected(null);
  }, []);

  const handleReset = () => { audio.stop(); setChart(null); setSelected(null); };

  const tabs: { id: Tab; label: string }[] = [
    { id: "score",    label: "Score"    },
    { id: "compose",  label: "Compose"  },
    { id: "report",   label: "Report"   },
    { id: "synastry", label: "Synastry" },
    { id: "transits", label: "Transits" },
  ];

  // Grain overlay
  const grain = (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 1,
      backgroundImage: "radial-gradient(rgba(26,23,20,0.055) 1px, transparent 1px)",
      backgroundSize: "28px 28px",
    }} />
  );

  if (!chart) {
    return (
      <div className="relative min-h-screen bg-background" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        {grain}
        <div style={{ position: "relative", zIndex: 1 }}>
          <BirthForm onSubmit={handleSubmit} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      {grain}
      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 1 }}>

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid rgba(26,23,20,0.08)` }}>
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
            <button onClick={handleReset}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ fontFamily: "'DM Mono', monospace", color: "var(--muted-foreground)", letterSpacing: "0.08em" }}>
              <RotateCcw size={11} /> New
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 flex flex-col lg:flex-row" style={{ minHeight: 0 }}>

          {/* Chart column */}
          <div className="lg:w-[480px] xl:w-[520px] flex-shrink-0 flex flex-col"
            style={{ borderRight: `1px solid rgba(26,23,20,0.08)` }}>
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10">

              {/* Selected planet callout */}
              {selected && (() => {
                const p = chart.planets.find(pl => pl.name === selected)!;
                return (
                  <div className="w-full mb-6 pb-5" style={{ borderBottom: `1px solid rgba(26,23,20,0.08)` }}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <span style={{ fontSize: "1.6rem", color: p.color }}>{p.glyph}</span>
                        <div>
                          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: "1.2rem", color: "var(--foreground)" }}>{p.name}</div>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--muted-foreground)" }}>
                            {p.sign} {p.signDegree}° · House {p.house} · {p.note} · {p.frequency} Hz
                          </div>
                          <div className="mt-0.5 text-sm italic" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, color: "var(--muted-foreground)" }}>
                            {p.instrument} · {p.timbre}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setSelected(null)} style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "var(--muted-foreground)", marginTop: 4 }}>✕</button>
                    </div>
                  </div>
                );
              })()}

              {/* Chart */}
              <div className="w-full" style={{ maxWidth: 440, aspectRatio: "1" }}>
                <NatalChart chart={chart} selected={selected} active={audio.activePlanet} onSelect={setSelected} />
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
            {/* Tabs */}
            <div className="flex" style={{ borderBottom: `1px solid rgba(26,23,20,0.08)` }}>
              {tabs.map(({ id, label }) => (
                <button key={id} onClick={() => setTab(id)}
                  className="px-5 py-4 text-xs tracking-widest transition-all"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: "0.12em",
                    color: tab === id ? "var(--foreground)" : "var(--muted-foreground)",
                    borderBottom: `2px solid ${tab === id ? "var(--foreground)" : "transparent"}`,
                    marginBottom: -1,
                  }}>
                  {label.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 xl:p-10"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(26,23,20,0.12) transparent" }}>
              {tab === "score"    && <ScorePanel   chart={chart} selected={selected} onSelect={setSelected} />}
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
