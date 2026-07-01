// ─── ASTRO-HARMONICS CONSTANTS ───────────────────────────────────────────────
// Zodiac signs, planet definitions, aspect rules, reference cities, note names,
// and rhythmic descriptors — the complete musical-astrological data layer.
//
// Migration note for quantumelodic-web-app:
//   Compare PLANETS_RAW against src/data/baseTonics.json. The fields
//   `waveform`, `instrument`, and `timbre` are unique to this repo. The
//   `ZODIAC` entries carry `mode` and `noteBase` not present in QM's data.
//   Merge these fields into QM's planet data rather than replacing it.

// ─── Design-system ink colour ─────────────────────────────────────────────────
// Used for SVG strokes, borders, and text in the editorial light theme.
// On dark themes swap to the CSS variable: var(--foreground).
export const INK   = "#1a1714";
export const FAINT = "rgba(26,23,20,0.08)";

// ─── Zodiac signs ─────────────────────────────────────────────────────────────
export const ZODIAC = [
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
] as const;

// ─── Planet definitions ────────────────────────────────────────────────────────
// `baseFreq` is the Cousto/Kepler orbital frequency (Hz).
// `waveform` drives the Web Audio oscillator type for each planet's voice.
export const PLANETS_RAW = [
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
] as const;

// ─── Aspect definitions ────────────────────────────────────────────────────────
// `harmony` maps to Recharts/QM colour classes; `dash` is the SVG stroke-dasharray.
export const ASPECT_DEFS = [
  { name: "Conjunction", degrees: 0,   orb: 8, musicalInterval: "Unison",      harmony: "neutral"   as const, dash: "none" },
  { name: "Sextile",     degrees: 60,  orb: 6, musicalInterval: "Minor 3rd",   harmony: "consonant" as const, dash: "none" },
  { name: "Square",      degrees: 90,  orb: 8, musicalInterval: "Minor 7th",   harmony: "dissonant" as const, dash: "4,3"  },
  { name: "Trine",       degrees: 120, orb: 8, musicalInterval: "Perfect 5th", harmony: "consonant" as const, dash: "none" },
  { name: "Quincunx",    degrees: 150, orb: 3, musicalInterval: "Tritone",     harmony: "dissonant" as const, dash: "2,4"  },
  { name: "Opposition",  degrees: 180, orb: 8, musicalInterval: "Octave",      harmony: "neutral"   as const, dash: "8,3"  },
] as const;

// ─── Reference cities ─────────────────────────────────────────────────────────
// Placeholder list for the city-of-birth dropdown.
// In quantumelodic-web-app, replace with a geocoding API call.
export const CITIES = [
  { name: "New York, USA",          lat: 40.7128,  lon: -74.0060  },
  { name: "Los Angeles, USA",       lat: 34.0522,  lon: -118.2437 },
  { name: "Chicago, USA",           lat: 41.8781,  lon: -87.6298  },
  { name: "London, UK",             lat: 51.5074,  lon: -0.1278   },
  { name: "Paris, France",          lat: 48.8566,  lon: 2.3522    },
  { name: "Berlin, Germany",        lat: 52.5200,  lon: 13.4050   },
  { name: "Amsterdam, Netherlands", lat: 52.3676,  lon: 4.9041    },
  { name: "Stockholm, Sweden",      lat: 59.3293,  lon: 18.0686   },
  { name: "Copenhagen, Denmark",    lat: 55.6761,  lon: 12.5683   },
  { name: "Oslo, Norway",           lat: 59.9139,  lon: 10.7522   },
  { name: "Helsinki, Finland",      lat: 60.1699,  lon: 24.9384   },
  { name: "Tokyo, Japan",           lat: 35.6762,  lon: 139.6503  },
  { name: "Mumbai, India",          lat: 19.0760,  lon: 72.8777   },
  { name: "Sydney, Australia",      lat: -33.8688, lon: 151.2093  },
  { name: "São Paulo, Brazil",      lat: -23.5505, lon: -46.6333  },
  { name: "Mexico City, Mexico",    lat: 19.4326,  lon: -99.1332  },
  { name: "Toronto, Canada",        lat: 43.6532,  lon: -79.3832  },
  { name: "Cairo, Egypt",           lat: 30.0444,  lon: 31.2357   },
] as const;

// ─── Musical helpers ──────────────────────────────────────────────────────────
export const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export const RHYTHMS = [
  "Quarter notes — driving pulse",
  "Half notes — sustained breath",
  "Eighth notes — forward motion",
  "Dotted quarter — uneven lilt",
  "Triplets — rolling compound",
  "Sixteenth notes — rapid detail",
  "Whole notes — vast expansion",
  "Syncopated — off-balance thrust",
  "Ostinato — fixed repetition",
  "Polyrhythm — layered strata",
  "Free time — unmeasured float",
  "Marcato — deliberate accent",
] as const;

// ─── Element descriptions ─────────────────────────────────────────────────────
export const ELEMENT_DESCRIPTIONS: Record<string, string> = {
  Fire:  "ardent urgency and expressive thrust",
  Earth: "grounded solidity and rhythmic certainty",
  Air:   "harmonic intellect and tonal lightness",
  Water: "fluid depth and tidal resonance",
};
