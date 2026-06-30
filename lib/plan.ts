// lib/plan.ts ─ typy, parser a meta pre tréningový plán

export type DayType = "intervals" | "tempo" | "easy" | "long" | "rest" | "cross";

export interface Day {
  type: DayType;
  title: string;
  detail: string;
  km: number;
  pace: string | null;
  tip: string;
}

export interface Plan {
  weekNumber: number;
  focus: string;
  intro: string;
  days: Day[]; // presne 7
}

export const DAY_FULL = ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota", "Nedeľa"];
export const DAY_SHORT = ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"];

// Zjednodušený typ pre týždenný pás: beh / regen / sila
export type SimpleKind = "run" | "rest" | "cross";
export function simpleKind(t: DayType): SimpleKind {
  if (t === "rest") return "rest";
  if (t === "cross") return "cross";
  return "run";
}
export const SIMPLE_META: Record<SimpleKind, { label: string; color: string; glyph: string }> = {
  run:   { label: "Beh",   color: "#FF5722", glyph: "🏃" },
  rest:  { label: "Regen", color: "#546E7A", glyph: "🛌" },
  cross: { label: "Sila",  color: "#5C6BC0", glyph: "💪" },
};

export const META: Record<DayType, { label: string; color: string; glyph: string }> = {
  intervals: { label: "Intervaly",   color: "#FF5722", glyph: "⚡" },
  tempo:     { label: "Tempo",       color: "#FFB300", glyph: "▲" },
  easy:      { label: "Voľný beh",   color: "#26A69A", glyph: "○" },
  long:      { label: "Dlhý beh",    color: "#7E57C2", glyph: "⟶" },
  rest:      { label: "Regenerácia", color: "#546E7A", glyph: "△" },
  cross:     { label: "Sila",        color: "#5C6BC0", glyph: "✕" },
};

const VALID: DayType[] = ["intervals", "tempo", "easy", "long", "rest", "cross"];

/**
 * Rozparsuje text plánu. Akceptuje:
 *  1) čistý JSON
 *  2) JSON obalený v ```json ... ``` fences
 *  3) JSON kdekoľvek v texte (vytiahne prvý { ... } blok)
 * Vracia { plan } alebo { error }.
 */
export function parsePlan(raw: string): { plan?: Plan; error?: string } {
  if (!raw || !raw.trim()) return { error: "Pole je prázdne — vlož text plánu." };

  let text = raw.trim().replace(/```json/gi, "").replace(/```/g, "").trim();

  // ak je okolo JSONu iný text, vytiahni prvý vyvážený { ... }
  if (!text.startsWith("{")) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end < start) {
      return { error: "Nenašiel som plán. Skopíruj celý blok, ktorý ti coach poslal." };
    }
    text = text.slice(start, end + 1);
  }

  let obj: any;
  try {
    obj = JSON.parse(text);
  } catch {
    return { error: "Plán sa nedá prečítať (chyba formátu). Skopíruj ho znova, celý." };
  }

  if (!obj.days || !Array.isArray(obj.days)) {
    return { error: "Plánu chýba zoznam dní." };
  }
  if (obj.days.length !== 7) {
    return { error: `Plán musí mať 7 dní, má ${obj.days.length}.` };
  }

  const days: Day[] = obj.days.map((d: any, i: number) => {
    const type: DayType = VALID.includes(d.type) ? d.type : "easy";
    return {
      type,
      title: String(d.title ?? DAY_FULL[i]),
      detail: String(d.detail ?? ""),
      km: Number(d.km) || 0,
      pace: d.pace ? String(d.pace) : null,
      tip: String(d.tip ?? ""),
    };
  });

  const plan: Plan = {
    weekNumber: Number(obj.weekNumber) || 1,
    focus: String(obj.focus ?? "Tréningový týždeň"),
    intro: String(obj.intro ?? ""),
    days,
  };
  return { plan };
}

export function paceToSeconds(p: string | null): number | null {
  if (!p || !p.includes(":")) return null;
  const [m, s] = p.split(":").map(Number);
  return m * 60 + s;
}
export function secondsToPace(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Ukážkový plán (Týždeň 1) — zobrazí sa, kým nevložíš vlastný
export const SAMPLE_PLAN: Plan = {
  weekNumber: 1,
  focus: "Budovanie bázy",
  intro: "Prvý týždeň. Nabehávame rytmus a staviame motor. Nezačíname najťažším — telo si zvyká.",
  days: [
    { type: "rest", title: "Regenerácia", detail: "Voľno alebo 20 min chôdza a strečing.", km: 0, pace: null, tip: "Odpočinok je súčasť tréningu." },
    { type: "intervals", title: "10 × 500m intervaly", detail: "Rozklus 1 km → 10 × 500m @ 4:05/km s 1 min klusom medzi → výklus 1 km.", km: 7, pace: "4:05", tip: "Udrž rovnaké tempo na 1. aj 10. úseku." },
    { type: "easy", title: "Voľný beh 5 km", detail: "5 km @ 5:20/km. Pomaly, dýchaš nosom.", km: 5, pace: "5:20", tip: "Má ti to pripadať trápne pomalé — to je správne." },
    { type: "cross", title: "Sila / cross", detail: "Žiadny beh. 30 min sila: drepy, výpady, core.", km: 0, pace: null, tip: "Silné nohy = menej zranení." },
    { type: "tempo", title: "Tempo 25 min", detail: "25 min @ 4:30/km súvislo, comfortable hard.", km: 6, pace: "4:30", tip: "Trénuje laktátový prah — kľúč k rýchlejšiemu 5k." },
    { type: "rest", title: "Regenerácia", detail: "Úplné voľno pred dlhým behom.", km: 0, pace: null, tip: "Dobrý spánok = lepší dlhý beh." },
    { type: "long", title: "Dlhý beh 8 km", detail: "8 km @ 5:20/km, posledný km môžeš zrýchliť.", km: 8, pace: "5:20", tip: "Najdôležitejší beh týždňa pre vytrvalosť." },
  ],
};
