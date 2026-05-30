// Studio-control-room palette + sentiment color mapping.
//
// Tailwind owns the static `echo-*` tokens (see tailwind.config.js). This object
// exists for the cases Tailwind classes handle awkwardly: SVG gradients/strokes,
// dynamic per-sentiment fills, and glow box-shadows that are computed at runtime.

export const ECHO = {
  bg: '#0A0A0B',
  panel: '#0F0F11',
  panel2: '#131316',
  border: '#1C1C20',
  hair: 'rgba(255,255,255,0.055)',
  text: '#E6E6E8',
  muted: '#76767C',
  faint: '#4A4A50',
  accent: '#31E0A0',
  accentDim: 'rgba(49,224,160,0.12)',
  neg: '#E2604A',
  negDim: 'rgba(226,96,74,0.14)',
  warn: '#E0A33A',
} as const

/** Map a sentiment score (−5…+5) onto the warm-red → gray → green scale. */
export function sentColor(s: number): string {
  if (s >= 1.5) return '#31E0A0'
  if (s >= 0.5) return '#7FCF9E'
  if (s > -0.5) return '#76767C'
  if (s > -1.5) return '#D89A6A'
  return '#E2604A'
}

/** Faint row-background tint keyed to sentiment polarity. */
export function sentTint(s: number): string {
  if (s >= 1.5) return 'rgba(49,224,160,0.10)'
  if (s <= -1.5) return 'rgba(226,96,74,0.10)'
  if (s <= -0.5) return 'rgba(224,163,58,0.07)'
  return 'transparent'
}
