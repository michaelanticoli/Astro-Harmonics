// ─── BIRTH FORM ───────────────────────────────────────────────────────────────
// Editorial-style birth-data entry form (name, date, time, city).
// The masthead and esoteric diagram are included so the component renders as
// a full landing page — extract just the <form> block if you need an inline
// version in quantumelodic-web-app.
//
// Migration note for quantumelodic-web-app:
//   • Replace CITIES dropdown with a geocoding input (the QM BirthDataForm
//     already does this via a city-search API).
//   • Swap Fraunces/Work Sans/DM Mono font references with QM font variables.
//   • Replace hardcoded hex colours with `var(--foreground)` etc. from QM CSS.

import React, { useState } from "react";
import type { BirthData } from "../lib/types";
import { CITIES, INK } from "../lib/astroConstants";
import { toRad } from "../lib/astroEngine";
import { Label } from "./Typography";

export function BirthForm({ onSubmit }: { onSubmit: (d: BirthData) => void }) {
  const [form, setForm] = useState({
    name: "",
    date: "1990-06-21",
    time: "14:30",
    city: CITIES[0].name,
    lat:  CITIES[0].lat,
    lon:  CITIES[0].lon,
  });
  const [err, setErr] = useState("");

  const handleCity = (v: string) => {
    const c = CITIES.find(c => c.name === v);
    if (c) setForm(f => ({ ...f, city: c.name, lat: c.lat, lon: c.lon }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setErr("Name required"); return; }
    if (!form.date)         { setErr("Date required"); return; }
    setErr("");
    onSubmit({ ...form });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      {/* Masthead */}
      <header className="px-8 pt-10 pb-0 flex items-start justify-between">
        <div>
          <div
            className="text-xs tracking-widest"
            style={{ fontFamily: "'DM Mono', monospace", color: "var(--muted-foreground)", letterSpacing: "0.18em" }}
          >
            ASTRO·HARMONICS
          </div>
        </div>
        <div
          className="text-xs text-right"
          style={{ fontFamily: "'DM Mono', monospace", color: "var(--muted-foreground)", opacity: 0.5 }}
        >
          fig. I — natal chart composer
        </div>
      </header>

      {/* Main composition */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left — display type */}
        <div className="lg:w-1/2 flex flex-col justify-between px-8 pt-16 pb-12">
          <div>
            <h1
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 300,
                fontSize: "clamp(3.5rem, 9vw, 7.5rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.02em",
                color: "var(--foreground)",
              }}
            >
              Your<br />
              Cosmos<br />
              <em style={{ fontStyle: "italic", fontWeight: 200 }}>Composed.</em>
            </h1>
            <p
              className="mt-8 max-w-sm leading-relaxed"
              style={{ fontWeight: 300, fontSize: "0.95rem", color: "var(--muted-foreground)" }}
            >
              Enter your birth data. Your natal chart is translated into a living musical
              composition — each planet's orbital frequency rendered as pitch, timbre, rhythm, and mode.
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
                    <line
                      x1={100 + 62 * Math.cos(a)} y1={100 + 62 * Math.sin(a)}
                      x2={100 + 92 * Math.cos(a)} y2={100 + 92 * Math.sin(a)}
                      stroke={INK} strokeWidth="0.5"
                    />
                    <line
                      x1={100 + 37 * Math.cos(a)} y1={100 + 37 * Math.sin(a)}
                      x2={100 + 63 * Math.cos(a)} y2={100 + 63 * Math.sin(a)}
                      stroke={INK} strokeWidth="0.3" strokeDasharray="1,3"
                    />
                  </g>
                );
              })}
              {Array.from({ length: 4 }, (_, i) => {
                const a = toRad(i * 90);
                return (
                  <line
                    key={i}
                    x1={100 + 40 * Math.cos(a)} y1={100 + 40 * Math.sin(a)}
                    x2={100 - 40 * Math.cos(a)} y2={100 - 40 * Math.sin(a)}
                    stroke={INK} strokeWidth="0.3" strokeOpacity="0.5"
                  />
                );
              })}
              <text x="100" y="104" textAnchor="middle" fontSize="8" fill={INK} fontFamily="'DM Mono', monospace">⊕</text>
            </svg>
          </div>
        </div>

        {/* Right — form */}
        <div
          className="lg:w-1/2 flex items-center justify-center px-8 py-16 lg:border-l"
          style={{ borderColor: "rgba(26,23,20,0.08)" }}
        >
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-8">
            <div className="space-y-6">
              {([
                { label: "Full Name",     field: "name", type: "text", placeholder: "Given and family name" },
                { label: "Date of Birth", field: "date", type: "date", placeholder: "" },
                { label: "Time of Birth", field: "time", type: "time", placeholder: "" },
              ] as const).map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <Label>{label}</Label>
                  <div className="mt-2 border-b" style={{ borderColor: "rgba(26,23,20,0.2)" }}>
                    <input
                      type={type}
                      placeholder={placeholder}
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
                    style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 300, color: "var(--foreground)" }}
                  >
                    {CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="mt-1.5">
                  <Label>
                    {form.lat > 0 ? `${form.lat.toFixed(2)}°N` : `${Math.abs(form.lat).toFixed(2)}°S`}
                    {" · "}
                    {form.lon > 0 ? `${form.lon.toFixed(2)}°E` : `${Math.abs(form.lon).toFixed(2)}°W`}
                  </Label>
                </div>
              </div>
            </div>

            {err && (
              <p className="text-xs" style={{ fontFamily: "'DM Mono', monospace", color: "#7a2a20" }}>{err}</p>
            )}

            <button
              type="submit"
              className="w-full py-4 text-sm tracking-widest transition-colors"
              style={{
                background: "var(--foreground)",
                color: "var(--primary-foreground)",
                fontFamily: "'DM Mono', monospace",
                letterSpacing: "0.16em",
              }}
            >
              CAST CHART
            </button>

            <p
              className="text-center"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.65rem",
                color: "var(--muted-foreground)",
                opacity: 0.5,
                letterSpacing: "0.08em",
              }}
            >
              Orbital frequencies after Hans Cousto · Simplified ephemeris
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
