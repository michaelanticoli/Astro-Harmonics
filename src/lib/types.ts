// ─── SHARED TYPES ────────────────────────────────────────────────────────────
// These are the core data shapes for the Astro-Harmonics chart engine.
// When migrating to quantumelodic-web-app, reconcile with src/types/astrology.ts
// and src/types/quantumMelodic.ts — the PlanetPosition type here includes
// waveform, instrument, timbre, rhythm, and note fields that QM may lack.

export interface BirthData {
  name: string;
  date: string;
  time: string;
  city: string;
  lat: number;
  lon: number;
}

export interface PlanetPosition {
  name: string;
  glyph: string;
  degree: number;
  sign: string;
  signIndex: number;
  signDegree: number;
  house: number;
  color: string;
  note: string;
  frequency: number;
  instrument: string;
  waveform: OscillatorType;
  mode: string;
  rhythm: string;
  timbre: string;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  musicalInterval: string;
  harmony: "consonant" | "dissonant" | "neutral";
  color: string;
}

export interface ChartData {
  birthData: BirthData;
  planets: PlanetPosition[];
  aspects: Aspect[];
  ascendant: number;
  ascSign: string;
  midheaven: number;
  dominantElement: string;
  musicalKey: string;
  tempo: number;
  timeSignature: string;
  mode: string;
}
