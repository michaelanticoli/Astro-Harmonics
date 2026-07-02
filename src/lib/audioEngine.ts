// ─── AUDIO ENGINE ─────────────────────────────────────────────────────────────
// Web Audio-based synth with per-planet voice parameters and a shared
// delay/feedback reverb chain.
//
// Migration note for quantumelodic-web-app:
//   Compare with src/utils/tonePlayer.ts and src/utils/proceduralAudio.ts.
//   This hook is self-contained (no Tone.js dependency), using the raw Web
//   Audio API.  The hook drives sequenced playback through `play`/`stop`
//   and reports the currently-active planet for waveform visualiser animation.

import { useRef, useState, useCallback, useEffect } from "react";
import type { ChartData } from "./types";

// ─── Low-level note player (internal) ────────────────────────────────────────
function playNote(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  waveform: OscillatorType,
  dur: number,
  vol = 0.22,
): void {
  const osc    = ctx.createOscillator();
  const gain   = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = waveform;
  osc.frequency.value = freq;
  filter.type = "lowpass";
  filter.frequency.value = Math.min(freq * 5, 3500);

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + 0.05);
  gain.gain.setValueAtTime(vol * 0.7, now + 0.15);
  gain.gain.linearRampToValueAtTime(0, now + dur - 0.05);

  osc.connect(filter).connect(gain).connect(dest);
  osc.start(now);
  osc.stop(now + dur);
}

// ─── React hook ───────────────────────────────────────────────────────────────
export interface AudioEngineReturn {
  play: () => void;
  stop: () => void;
  isPlaying: boolean;
  activePlanet: string | null;
  volume: number;
  setVolume: (v: number) => void;
}

export function useAudioEngine(chart: ChartData | null): AudioEngineReturn {
  const ctxRef    = useRef<AudioContext | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [isPlaying,    setPlaying] = useState(false);
  const [activePlanet, setActive]  = useState<string | null>(null);
  const [volume,       setVolume]  = useState(0.7);
  const volRef = useRef(volume);
  useEffect(() => { volRef.current = volume; }, [volume]);

  const stop = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    ctxRef.current?.close();
    ctxRef.current = null;
    setPlaying(false);
    setActive(null);
  }, []);

  const play = useCallback(() => {
    if (!chart) return;
    if (ctxRef.current) { stop(); return; }

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = volRef.current;

    const delay = ctx.createDelay(1.0);
    const fb    = ctx.createGain();
    delay.delayTime.value = 0.25;
    fb.gain.value         = 0.22;

    master.connect(ctx.destination);
    master.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    fb.connect(ctx.destination);

    setPlaying(true);

    const durOpts = [1, 0.5, 1.5, 0.75, 2, 0.5];
    let ms = 100;
    const seq: { p: typeof chart.planets[number]; d: number }[] = [];
    for (let c = 0; c < 3; c++) {
      for (let i = 0; i < chart.planets.length; i++) {
        seq.push({ p: chart.planets[i], d: durOpts[(i + c * 3) % durOpts.length] });
      }
    }

    seq.forEach(({ p, d }) => {
      const dur = (d * 60000 / chart.tempo) / 1000;
      const t = setTimeout(() => {
        setActive(p.name);
        playNote(ctx, master, p.frequency, p.waveform, dur, 0.3 * volRef.current);
        if (["Saturn", "Pluto", "Jupiter"].includes(p.name)) {
          playNote(ctx, master, p.frequency / 2, "sine", dur * 1.3, 0.1 * volRef.current);
        }
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
