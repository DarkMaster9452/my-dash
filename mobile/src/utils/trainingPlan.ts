// ── 10km Training Plan: May 10 → June 13, 2026 (34 days) ─────────────────────
// Assumes: beginner-intermediate base, targeting sub-60min 10km
// Principle: progressive overload → taper → race day

export type WorkoutType = 'rest' | 'easy' | 'tempo' | 'intervals' | 'long' | 'race' | 'cross';

export interface Workout {
  date: string;          // YYYY-MM-DD
  dayNum: number;        // 1–34
  type: WorkoutType;
  label: string;
  distanceKm: number;
  durationMin: number;
  description: string;
  tips: string[];
  week: number;          // 1–5
}

const PLAN_RAW: Omit<Workout, 'date' | 'dayNum'>[] = [
  // ── WEEK 1: Base Building (May 10–16) ─────────────────────────────────────
  { week:1, type:'easy',      label:'Easy Run',        distanceKm:3,   durationMin:25,  description:'Comfortable pace, can hold a full conversation. Focus on form.', tips:['Run at 60–65% max HR','Land mid-foot','Relax your shoulders'] },
  { week:1, type:'rest',      label:'Rest / Walk',     distanceKm:0,   durationMin:0,   description:'Active rest. A 20-minute walk is perfect.', tips:['Stretch hip flexors','Hydrate well','Sleep 7–8h'] },
  { week:1, type:'easy',      label:'Easy Run',        distanceKm:3.5, durationMin:30,  description:'Same easy effort. Try a new route to stay motivated.', tips:['Focus on breathing rhythm','Slow down if you feel tight'] },
  { week:1, type:'cross',     label:'Cross-Train',     distanceKm:0,   durationMin:30,  description:'Cycling, swimming, or yoga — anything low-impact.', tips:['Builds aerobic base without impact stress','Foam roll legs after'] },
  { week:1, type:'easy',      label:'Easy Run',        distanceKm:4,   durationMin:35,  description:'Slightly longer. Notice how your body feels at distance.', tips:['Run in the morning for best performance','Eat a light snack 45 min before'] },
  { week:1, type:'rest',      label:'Rest',            distanceKm:0,   durationMin:0,   description:'Full rest day. Let the adaptation happen.', tips:['Sleep is where fitness is built','Stretch quads and calves'] },
  { week:1, type:'long',      label:'Long Run',        distanceKm:5,   durationMin:45,  description:'Your first long run. Very easy pace — this is about time on feet.', tips:['Slowest run of the week','Bring water','Walk if needed — no ego'] },

  // ── WEEK 2: Building (May 17–23) ──────────────────────────────────────────
  { week:2, type:'easy',      label:'Easy Run',        distanceKm:4,   durationMin:35,  description:'Recovery run from Sunday. Keep it genuinely easy.', tips:['Rate your effort 5/10 max','Notice any soreness — address it'] },
  { week:2, type:'rest',      label:'Rest',            distanceKm:0,   durationMin:0,   description:'Rest or gentle yoga.', tips:['10-min hip flexor stretch sequence','Cold water on legs post-run helps'] },
  { week:2, type:'tempo',     label:'Tempo Run',       distanceKm:4,   durationMin:30,  description:'10-min warm-up → 15-min at comfortably hard pace → 5-min cool-down.', tips:['Tempo = "comfortably hard" (7/10 effort)','You can speak 2–3 word phrases only','This builds lactate threshold'] },
  { week:2, type:'cross',     label:'Cross-Train',     distanceKm:0,   durationMin:35,  description:'Cycling or strength: squats, lunges, core work.', tips:['Strong glutes = faster running','3×15 squats, 3×12 lunges'] },
  { week:2, type:'easy',      label:'Easy Run',        distanceKm:5,   durationMin:42,  description:'Mid-week easy run. Progressively feel the distance.', tips:['Add 5-min cool-down walk','Notice your natural cadence'] },
  { week:2, type:'rest',      label:'Rest',            distanceKm:0,   durationMin:0,   description:'Rest. You earned it.', tips:['Refuel well with carbs + protein','Plan your Sunday long run route'] },
  { week:2, type:'long',      label:'Long Run',        distanceKm:6,   durationMin:55,  description:'6km long run at easy pace. A real milestone!', tips:['Run:walk strategy is fine (5min run / 1min walk)','Fueling: small banana before','Map a nice route in Rajec area'] },

  // ── WEEK 3: Quality (May 24–30) ───────────────────────────────────────────
  { week:3, type:'easy',      label:'Recovery Run',    distanceKm:4,   durationMin:35,  description:'Easy shakeout after long run.', tips:['Never hard the day after a long run','Check your shoes — are they worn?'] },
  { week:3, type:'intervals', label:'Intervals',       distanceKm:4,   durationMin:30,  description:'Warm-up 1km → 4× (1km fast + 90s walk/jog) → cool-down 1km.', tips:['Fast = 8–8.5/10 effort','This is the hardest session of the week','Builds speed and VO2 max'] },
  { week:3, type:'rest',      label:'Rest',            distanceKm:0,   durationMin:0,   description:'Rest — intervals are demanding.', tips:['Protein shake or eggs help muscle repair','Foam roll IT band'] },
  { week:3, type:'tempo',     label:'Tempo Run',       distanceKm:5,   durationMin:38,  description:'10-min warm-up → 20-min tempo → 8-min cool-down.', tips:['Hold race-pace feel for 20 minutes','This is key 10km prep','Trust the discomfort'] },
  { week:3, type:'cross',     label:'Cross-Train',     distanceKm:0,   durationMin:40,  description:'Bike or swim. Core strength: planks 3×45s, dead bugs, single-leg bridges.', tips:['Core work prevents injury','Focus on hip stability'] },
  { week:3, type:'easy',      label:'Easy Run',        distanceKm:5,   durationMin:45,  description:'Easy Friday shake-out. Legs should feel springy.', tips:['This is your last hard week','Tomorrow is your longest run yet'] },
  { week:3, type:'long',      label:'Long Run',        distanceKm:8,   durationMin:72,  description:'8km — your longest run! Proof you can run a 10km.', tips:['Easy pace — do not race it','Bring 1 gel or 2 dates at 4km mark','Celebrate this milestone afterward'] },

  // ── WEEK 4: Sharpening (May 31–Jun 6) ─────────────────────────────────────
  { week:4, type:'easy',      label:'Recovery Run',    distanceKm:4,   durationMin:35,  description:'Easy recovery after big long run.', tips:['Your body is adapting hard right now','Sleep extra if you can'] },
  { week:4, type:'intervals', label:'Intervals',       distanceKm:5,   durationMin:38,  description:'Warm-up 1km → 5× (800m fast + 2min jog) → cool-down 1km.', tips:['Fast = target 10km pace','Start conservative — these get hard','Use a running track or flat road'] },
  { week:4, type:'rest',      label:'Rest',            distanceKm:0,   durationMin:0,   description:'Rest.', tips:['Prep your race-day kit this week','Lay out shoes, bib area, playlist'] },
  { week:4, type:'tempo',     label:'Tempo Run',       distanceKm:5,   durationMin:38,  description:'10-min warm-up → 20-min tempo at 10km goal pace → cool-down.', tips:['This should feel like race pace','If it feels easy, you are ready!','If hard, you are still adapting — that is fine'] },
  { week:4, type:'easy',      label:'Easy Run',        distanceKm:4,   durationMin:35,  description:'Easy and relaxed.', tips:['You are now well-trained','Start visualizing race day success'] },
  { week:4, type:'rest',      label:'Rest',            distanceKm:0,   durationMin:0,   description:'Rest.', tips:['Carb-load slightly this week','Pasta, rice, potatoes — fuel the tank'] },
  { week:4, type:'long',      label:'Long Easy Run',   distanceKm:7,   durationMin:62,  description:'7km — slightly shorter to start the taper. Easy effort.', tips:['Shorter than last week intentionally','Taper begins — trust the process','Legs should feel a bit heavy — normal'] },

  // ── WEEK 5: Taper + Race (Jun 7–13) ───────────────────────────────────────
  { week:5, type:'easy',      label:'Easy Run',        distanceKm:4,   durationMin:35,  description:'Easy run. Just maintain fitness, do not build it.', tips:['Resist urge to run more — taper works','Keep routine the same'] },
  { week:5, type:'intervals', label:'Short Strides',   distanceKm:3,   durationMin:25,  description:'Easy 2km → 6× 100m strides at race pace → 1km cool-down.', tips:['Strides keep legs sharp without fatigue','Short and fast — 15-second efforts','2-minute walk between each'] },
  { week:5, type:'rest',      label:'Rest',            distanceKm:0,   durationMin:0,   description:'Rest. Final prep day.', tips:['Lay out all race gear tonight','Eat a normal dinner (pasta or rice)','Set alarm 90 minutes before race'] },
  { week:5, type:'easy',      label:'Shakeout Run',    distanceKm:2,   durationMin:15,  description:'Very light 2km shakeout — just wake up the legs.', tips:['Keep it short and easy','This is not a workout — just movement','Race is in 3 days!'] },
  { week:5, type:'rest',      label:'Rest',            distanceKm:0,   durationMin:0,   description:'Complete rest. Race eve — go to bed early.', tips:['Lay clothes out the night before','Eat carbs for dinner, nothing unusual','Stay off your feet as much as possible'] },
  { week:5, type:'rest',      label:'Rest',            distanceKm:0,   durationMin:0,   description:'Race eve — full rest.', tips:['Light stretching only','Confirm start time and location','Visualize a perfect race'] },
  { week:5, type:'race',      label:'🏁 RACE DAY!',   distanceKm:10,  durationMin:60,  description:'10km Run — Rajec, Slovakia! You are ready. Start conservative, build pace, finish strong.', tips:['Start 10–15s slower than goal pace','Take water at every station','Miles 7–9 are where races are won','Empty the tank on the final km!'] },
];

// Assign dates starting May 10, 2026
const START_DATE = new Date('2026-05-10');

export const TRAINING_PLAN: Workout[] = PLAN_RAW.map((w, i) => {
  const d = new Date(START_DATE);
  d.setDate(START_DATE.getDate() + i);
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return { ...w, date: `${yyyy}-${mm}-${dd}`, dayNum: i + 1 };
});

export function getTodayWorkout(): Workout | null {
  const today = new Date().toISOString().slice(0, 10);
  return TRAINING_PLAN.find(w => w.date === today) ?? null;
}

export function getWorkoutsForWeek(week: number): Workout[] {
  return TRAINING_PLAN.filter(w => w.week === week);
}

export function getDaysToRace(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const race  = new Date('2026-06-13');
  return Math.ceil((race.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getCompletedWorkouts(): number {
  const today = new Date().toISOString().slice(0, 10);
  return TRAINING_PLAN.filter(w => w.date < today && w.type !== 'rest').length;
}

export function getTotalKmPlanned(): number {
  return TRAINING_PLAN.reduce((sum, w) => sum + w.distanceKm, 0);
}

export function getWeekSummary(week: number): { totalKm: number; runs: number; restDays: number } {
  const workouts = getWorkoutsForWeek(week);
  return {
    totalKm:  workouts.reduce((s, w) => s + w.distanceKm, 0),
    runs:     workouts.filter(w => w.type !== 'rest' && w.type !== 'cross').length,
    restDays: workouts.filter(w => w.type === 'rest').length,
  };
}

export function getCurrentWeek(): number {
  const today = new Date().toISOString().slice(0, 10);
  const found = TRAINING_PLAN.find(w => w.date === today);
  return found?.week ?? 0;
}

export const WORKOUT_COLORS: Record<WorkoutType, string> = {
  rest:      '#4a5568',
  easy:      '#38bdf8',
  tempo:     '#f59e0b',
  intervals: '#ef4444',
  long:      '#00ff88',
  race:      '#ffd700',
  cross:     '#a78bfa',
};

export const WORKOUT_ICONS: Record<WorkoutType, string> = {
  rest:      '🛌',
  easy:      '🏃',
  tempo:     '⚡',
  intervals: '🔥',
  long:      '🗺️',
  race:      '🏁',
  cross:     '🚴',
};
