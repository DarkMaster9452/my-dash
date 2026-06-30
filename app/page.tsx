"use client";

import { useState, useEffect } from "react";
import {
  Plan, Day, parsePlan, SAMPLE_PLAN, META, SIMPLE_META, simpleKind,
  DAY_FULL, DAY_SHORT, paceToSeconds, secondsToPace,
} from "@/lib/plan";

export default function Home() {
  const [plan, setPlan] = useState<Plan>(SAMPLE_PLAN);
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [open, setOpen] = useState<number>(1);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  // ── load saved state ──
  useEffect(() => {
    try {
      const p = localStorage.getItem("rc:plan");
      if (p) setPlan(JSON.parse(p));
      const d = localStorage.getItem("rc:done");
      if (d) setDone(JSON.parse(d));
    } catch {}
    setLoaded(true);
  }, []);

  const save = (p: Plan, d: Record<string, boolean>) => {
    try {
      localStorage.setItem("rc:plan", JSON.stringify(p));
      localStorage.setItem("rc:done", JSON.stringify(d));
    } catch {}
  };

  const loadPlan = () => {
    const { plan: parsed, error: err } = parsePlan(raw);
    if (err || !parsed) { setError(err || "Neznáma chyba."); return; }
    setError(null);
    setPlan(parsed);
    setDone({});
    save(parsed, {});
    setRaw("");
    setShowPaste(false);
    setOpen(-1);
    setFlash(true);
    setTimeout(() => setFlash(false), 900);
  };

  const toggleDone = (i: number) => {
    const key = `${plan.weekNumber}-${i}`;
    const next = { ...done, [key]: !done[key] };
    setDone(next);
    save(plan, next);
  };

  if (!loaded) return <div style={{ minHeight: "100vh", background: "#0E1116" }} />;

  const totalKm = plan.days.reduce((a, d) => a + d.km, 0);
  const runs = plan.days.filter((d) => d.km > 0).length;
  const restDays = plan.days.filter((d) => d.type === "rest").length;
  const maxKm = Math.max(...plan.days.map((d) => d.km), 1);
  const paces = plan.days.map((d) => paceToSeconds(d.pace)).filter((x): x is number => x !== null);
  const fastest = paces.length ? secondsToPace(Math.min(...paces)) : "—";
  const completed = plan.days.filter((_, i) => done[`${plan.weekNumber}-${i}`]).length;

  return (
    <main style={st.shell}>
      {/* HEADER */}
      <header style={st.header}>
        <div style={{ ...st.bib, ...(flash ? st.bibFlash : {}) }}>
          <div style={st.bibTop}>RUNNING LAB</div>
          <div style={st.bibNum}>{String(plan.weekNumber).padStart(2, "0")}</div>
          <div style={st.bibBot}>MARTIN · TÝŽDEŇ</div>
        </div>
        <div style={st.headRight}>
          <h1 style={st.h1}>{plan.focus}</h1>
          {plan.intro && <p style={st.sub}>{plan.intro}</p>}
        </div>
      </header>

      {/* TÝŽDENNÝ PÁS — prehľad čo v ktorý deň */}
      <section style={st.weekStrip}>
        {plan.days.map((d, i) => {
          const sk = simpleKind(d.type);
          const m = SIMPLE_META[sk];
          const isDone = done[`${plan.weekNumber}-${i}`];
          return (
            <button
              key={i}
              onClick={() => { setOpen(i); document.getElementById(`day-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
              style={{
                ...st.stripCell,
                borderColor: open === i ? m.color : "var(--line)",
                background: open === i ? `${m.color}22` : "var(--card)",
                opacity: isDone ? 0.5 : 1,
              }}
            >
              <span style={st.stripDay}>{DAY_SHORT[i]}</span>
              <span style={st.stripGlyph}>{m.glyph}</span>
              <span style={{ ...st.stripLabel, color: m.color }}>{m.label}</span>
              {d.km > 0 && <span style={st.stripKm}>{d.km}k</span>}
            </button>
          );
        })}
      </section>

      {/* STATY */}
      <section style={st.statStrip}>
        <Stat big={totalKm} unit="km" label="objem" c="#FF5722" />
        <Stat big={runs} unit="" label="behov" c="#FFB300" />
        <Stat big={restDays} unit="" label="regen" c="#7E57C2" />
        <Stat big={`${completed}/7`} unit="" label="splnené" c="#26A69A" />
      </section>

      {/* GRAF OBJEMU */}
      <section style={st.card}>
        <div style={st.cardHead}>OBJEM PODĽA DNÍ · najrýchlejšie {fastest}/km</div>
        <div style={st.chart}>
          {plan.days.map((d, i) => {
            const h = d.km ? Math.max((d.km / maxKm) * 100, 6) : 3;
            const m = META[d.type];
            return (
              <div key={i} style={st.barCol} onClick={() => setOpen(open === i ? -1 : i)}>
                <div style={st.barVal}>{d.km || ""}</div>
                <div className="bar" style={{ ...st.bar, height: `${h}%`, background: m.color, animationDelay: `${i * 0.05}s` }} />
                <div style={st.barDay}>{DAY_SHORT[i]}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* KARTY DNÍ */}
      <section style={st.dayList}>
        {plan.days.map((d, i) => {
          const m = META[d.type];
          const isOpen = open === i;
          const isDone = done[`${plan.weekNumber}-${i}`];
          return (
            <div id={`day-${i}`} key={i} style={{ ...st.dayCard, borderLeftColor: m.color, opacity: isDone ? 0.55 : 1 }}>
              <div style={st.dayMain} onClick={() => setOpen(isOpen ? -1 : i)}>
                <div style={{ ...st.glyph, background: m.color }}>{m.glyph}</div>
                <div style={st.dayInfo}>
                  <div style={st.dayTop}>
                    <span style={st.dayName}>{DAY_FULL[i]}</span>
                    <span style={{ ...st.tag, color: m.color, borderColor: m.color }}>{m.label}</span>
                  </div>
                  <div style={st.dayTitle}>{d.title}</div>
                </div>
                <div style={st.dayRight}>
                  {d.km > 0 && <div style={st.kmBadge}>{d.km}<span style={st.kmUnit}>km</span></div>}
                  {d.pace && <div className="mono" style={st.paceBadge}>{d.pace}/km</div>}
                </div>
              </div>
              {isOpen && (
                <div style={st.expand}>
                  {d.detail && <p style={st.detail}>{d.detail}</p>}
                  {d.tip && <div style={st.tip}><span style={st.tipLabel}>COACH</span>{d.tip}</div>}
                  <button style={{ ...st.doneBtn, ...(isDone ? st.doneActive : {}) }} onClick={() => toggleDone(i)}>
                    {isDone ? "✓ Hotovo" : "Označiť ako hotové"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* PASTE PANEL */}
      <section style={st.pasteCard}>
        {!showPaste ? (
          <button style={st.pasteToggle} onClick={() => setShowPaste(true)}>
            ↻ Načítať nový týždeň
          </button>
        ) : (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={st.pasteHead}>Vlož plán od coacha</div>
            <p style={st.pasteHint}>
              Skopíruj celý blok, ktorý ti coach poslal v chate (formát JSON), a vlož ho sem.
            </p>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder='{ "weekNumber": 2, "focus": "...", "days": [...] }'
              style={st.textarea}
              rows={6}
            />
            {error && <div style={st.error}>{error}</div>}
            <div style={st.pasteBtns}>
              <button style={st.loadBtn} onClick={loadPlan}>Načítať plán</button>
              <button style={st.cancelBtn} onClick={() => { setShowPaste(false); setError(null); }}>Zrušiť</button>
            </div>
          </div>
        )}
      </section>

      <footer style={st.footer}>
        Running Lab · Martin · cieľ 5k · plán sa ukladá v prehliadači
      </footer>
    </main>
  );
}

function Stat({ big, unit, label, c }: { big: string | number; unit: string; label: string; c: string }) {
  return (
    <div style={st.stat}>
      <div style={{ ...st.statBig, color: c }}>{big}<span style={st.statUnit}>{unit}</span></div>
      <div style={st.statLabel}>{label}</div>
    </div>
  );
}

const st: Record<string, React.CSSProperties> = {
  shell: { maxWidth: 760, margin: "0 auto", padding: "28px 16px 50px" },

  header: { display: "flex", gap: 18, marginBottom: 20 },
  bib: { flexShrink: 0, width: 132, background: "#fff", color: "#0E1116", borderRadius: 10, padding: "10px 8px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", border: "3px solid #FF5722", boxShadow: "0 6px 24px rgba(255,87,34,.2)", transition: "transform .4s" },
  bibFlash: { transform: "scale(1.06)" },
  bibTop: { fontSize: 9, letterSpacing: 2, fontWeight: 800, color: "#FF5722" },
  bibNum: { fontSize: 54, fontWeight: 900, lineHeight: 1, letterSpacing: -2 },
  bibBot: { fontSize: 8, letterSpacing: 2, fontWeight: 700, color: "#555" },
  headRight: { display: "flex", flexDirection: "column", justifyContent: "center" },
  h1: { fontSize: 27, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.1 },
  sub: { margin: "8px 0 0", fontSize: 13.5, color: "var(--mut)", lineHeight: 1.5 },

  weekStrip: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 18 },
  stripCell: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 2px", borderRadius: 9, border: "1px solid var(--line)", transition: "all .2s", color: "var(--txt)" },
  stripDay: { fontSize: 11, fontWeight: 800, color: "var(--mut)" },
  stripGlyph: { fontSize: 18, lineHeight: 1 },
  stripLabel: { fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3 },
  stripKm: { fontSize: 10, fontWeight: 700, color: "var(--txt)", fontFamily: "'DM Mono',monospace" },

  statStrip: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 18 },
  stat: { background: "var(--card)", border: "1px solid var(--line)", borderRadius: 10, padding: "12px 10px" },
  statBig: { fontSize: 25, fontWeight: 900, letterSpacing: -1, lineHeight: 1 },
  statUnit: { fontSize: 12, fontWeight: 600, marginLeft: 2, opacity: 0.7 },
  statLabel: { fontSize: 10, color: "var(--mut)", marginTop: 6, letterSpacing: 0.5, textTransform: "uppercase" },

  card: { background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, padding: "16px 16px 10px", marginBottom: 18 },
  cardHead: { fontSize: 11, letterSpacing: 1.5, color: "var(--mut)", fontWeight: 700, marginBottom: 14 },
  chart: { display: "flex", alignItems: "flex-end", gap: 8, height: 130 },
  barCol: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", cursor: "pointer" },
  barVal: { fontSize: 11, fontWeight: 700, marginBottom: 4, height: 14 },
  bar: { width: "100%", borderRadius: "4px 4px 0 0", minHeight: 4, transformOrigin: "bottom", animation: "growBar .5s cubic-bezier(.2,.8,.2,1) both" },
  barDay: { fontSize: 11, color: "var(--mut)", marginTop: 6, fontWeight: 600 },

  dayList: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 },
  dayCard: { background: "var(--card)", border: "1px solid var(--line)", borderLeft: "4px solid", borderRadius: 8, overflow: "hidden", transition: "opacity .3s", scrollMarginTop: 20 },
  dayMain: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer" },
  glyph: { flexShrink: 0, width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", fontWeight: 700 },
  dayInfo: { flex: 1, minWidth: 0 },
  dayTop: { display: "flex", alignItems: "center", gap: 8, marginBottom: 2 },
  dayName: { fontSize: 13, fontWeight: 700 },
  tag: { fontSize: 9, fontWeight: 700, border: "1px solid", borderRadius: 4, padding: "1px 5px", letterSpacing: 0.5, textTransform: "uppercase" },
  dayTitle: { fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  dayRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 },
  kmBadge: { fontSize: 18, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1 },
  kmUnit: { fontSize: 10, fontWeight: 600, marginLeft: 1, opacity: 0.6 },
  paceBadge: { fontSize: 11, color: "var(--mut)", fontWeight: 500 },

  expand: { padding: "0 14px 14px 62px", animation: "fadeUp .3s ease" },
  detail: { margin: "0 0 10px", fontSize: 13, color: "#C4CDD6", lineHeight: 1.6 },
  tip: { background: "var(--ink)", borderRadius: 6, padding: "8px 10px", fontSize: 12, color: "#C4CDD6", lineHeight: 1.5, display: "flex", gap: 8, alignItems: "flex-start" },
  tipLabel: { fontSize: 8, fontWeight: 800, letterSpacing: 1, color: "#FF5722", background: "rgba(255,87,34,.12)", padding: "2px 5px", borderRadius: 3, flexShrink: 0, marginTop: 1 },
  doneBtn: { marginTop: 10, background: "transparent", border: "1px solid var(--line)", color: "var(--mut)", borderRadius: 6, padding: "7px 14px", fontSize: 12, fontWeight: 600, transition: "all .2s" },
  doneActive: { background: "#26A69A", borderColor: "#26A69A", color: "#fff" },

  pasteCard: { marginBottom: 20 },
  pasteToggle: { width: "100%", background: "linear-gradient(135deg,#FF5722,#FF8A50)", color: "#fff", border: "none", borderRadius: 12, padding: 15, fontSize: 15, fontWeight: 800, letterSpacing: 0.3, boxShadow: "0 8px 28px rgba(255,87,34,.32)" },
  pasteHead: { fontSize: 14, fontWeight: 800, marginBottom: 4 },
  pasteHint: { fontSize: 12.5, color: "var(--mut)", lineHeight: 1.5, marginBottom: 10 },
  textarea: { width: "100%", background: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, padding: 12, color: "var(--txt)", fontSize: 12, lineHeight: 1.5, resize: "vertical", outline: "none" },
  error: { background: "rgba(255,87,34,.12)", color: "#FF8A50", padding: "9px 12px", borderRadius: 8, fontSize: 12.5, marginTop: 10 },
  pasteBtns: { display: "flex", gap: 8, marginTop: 12 },
  loadBtn: { flex: 1, background: "#FF5722", color: "#fff", border: "none", borderRadius: 8, padding: "11px", fontSize: 14, fontWeight: 700 },
  cancelBtn: { background: "transparent", color: "var(--mut)", border: "1px solid var(--line)", borderRadius: 8, padding: "11px 18px", fontSize: 14, fontWeight: 600 },

  footer: { textAlign: "center", fontSize: 11, color: "var(--mut)", marginTop: 24, paddingTop: 18, borderTop: "1px solid var(--line)" },
};
