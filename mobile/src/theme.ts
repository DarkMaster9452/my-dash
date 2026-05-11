// ── Design Tokens ─────────────────────────────────────────────────────────────
// Dark glassmorphism — deep navy with luminous accents per section

export const colors = {
  // Backgrounds
  bg:          '#080d1a',
  bgCard:      'rgba(255,255,255,0.06)',
  bgCardHover: 'rgba(255,255,255,0.10)',
  border:      'rgba(255,255,255,0.10)',
  borderBright:'rgba(255,255,255,0.18)',

  // Text
  textPrimary:   '#f0f4ff',
  textSecondary: '#8a9bbf',
  textMuted:     '#4a5568',

  // Section accents
  fitness:  '#00ff88',  // neon green
  spotify:  '#1db954',  // Spotify green
  gmail:    '#ea4335',  // Gmail red
  calendar: '#4285f4',  // Google blue
  notion:   '#a78bfa',  // soft purple
  news:     '#f59e0b',  // amber
  weather:  '#38bdf8',  // sky blue

  // Gradients (start → end)
  gradientFitness:  ['#00ff88', '#00cc6a'] as string[],
  gradientSpotify:  ['#1db954', '#158a3e'] as string[],
  gradientGmail:    ['#ea4335', '#b91c1c'] as string[],
  gradientCalendar: ['#4285f4', '#1d4ed8'] as string[],
  gradientNotion:   ['#a78bfa', '#7c3aed'] as string[],
  gradientWeather:  ['#38bdf8', '#0284c7'] as string[],
  gradientBg:       ['#080d1a', '#0d1530'] as string[],
  gradientCard:     ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)'] as string[],

  // Status
  success: '#22c55e',
  warning: '#f59e0b',
  error:   '#ef4444',
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const radius = {
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  full: 9999,
};

export const typography = {
  h1:    { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2:    { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3:    { fontSize: 18, fontWeight: '600' as const },
  body:  { fontSize: 15, fontWeight: '400' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
  tiny:  { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.5 },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const },
};
