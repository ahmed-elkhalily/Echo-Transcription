interface SparkProps {
  values: number[]
  w?: number
  h?: number
  color?: string
}

/** Tiny inline sparkline for the session switcher previews. */
export function Spark({ values, w = 56, h = 16, color = '#76767C' }: SparkProps) {
  const max = 5
  const min = -5
  const x = (i: number) => (i / (values.length - 1)) * w
  const y = (v: number) => h - ((v - min) / (max - min)) * h
  const d = values.map((v, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  return (
    <svg width={w} height={h} className="block shrink-0">
      <path d={d} fill="none" stroke={color} strokeWidth="1.25" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
