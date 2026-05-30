import { sentColor } from '../lib/palette'

interface SentimentChartProps {
  /** Time-ordered samples; only the last N are rendered. */
  points: Array<{ t: number; s: number }>
}

/**
 * Sentiment timeline — a smoothed SVG line over a −5…+5 band.
 *
 * Hand-rolled Catmull-Rom → bezier smoothing with a gradient fill and a pinging
 * ring on the newest sample. `preserveAspectRatio="none"` lets it stretch to fill
 * its responsive container while keeping the internal coordinate math simple.
 */
export function SentimentChart({ points }: SentimentChartProps) {
  const W = 760
  const H = 188
  const padL = 30
  const padR = 14
  const padT = 14
  const padB = 22
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const N = 38
  const data = points.slice(-N)

  const tMin = data.length ? data[0].t : 0
  const tMax = data.length ? Math.max(data[data.length - 1].t, tMin + 1) : 1
  const x = (t: number) => padL + ((t - tMin) / (tMax - tMin)) * innerW
  const y = (s: number) => padT + (1 - (s + 5) / 10) * innerH

  // Catmull-Rom → bezier smoothing
  let path = ''
  let area = ''
  if (data.length) {
    const pts = data.map((d) => [x(d.t), y(d.s)] as const)
    path = `M ${pts[0][0]},${pts[0][1]}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[i + 2] || p2
      const c1x = p1[0] + (p2[0] - p0[0]) / 6
      const c1y = p1[1] + (p2[1] - p0[1]) / 6
      const c2x = p2[0] - (p3[0] - p1[0]) / 6
      const c2y = p2[1] - (p3[1] - p1[1]) / 6
      path += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`
    }
    area = path + ` L ${pts[pts.length - 1][0]},${y(-5)} L ${pts[0][0]},${y(-5)} Z`
  }
  const last = data[data.length - 1]
  const gridY = [5, 2.5, 0, -2.5, -5]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sentArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#31E0A0" stopOpacity="0.20" />
          <stop offset="55%" stopColor="#31E0A0" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#31E0A0" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* zero baseline + gridlines */}
      {gridY.map((g) => (
        <g key={g}>
          <line
            x1={padL}
            y1={y(g)}
            x2={W - padR}
            y2={y(g)}
            stroke={g === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.045)'}
            strokeWidth="1"
            strokeDasharray={g === 0 ? '0' : '2 4'}
          />
          <text x={6} y={y(g) + 3} fill="#4A4A50" fontSize="9" className="font-mono">
            {g > 0 ? '+' + g : g}
          </text>
        </g>
      ))}
      {data.length > 1 && <path d={area} fill="url(#sentArea)" />}
      {data.length > 1 && (
        <path
          d={path}
          fill="none"
          stroke="#31E0A0"
          strokeWidth="1.75"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 3px rgba(49,224,160,0.35))' }}
        />
      )}
      {/* prior points as faint dots */}
      {data.map((d, i) =>
        i < data.length - 1 ? (
          <circle key={i} cx={x(d.t)} cy={y(d.s)} r="1.6" fill={sentColor(d.s)} opacity="0.5" />
        ) : null,
      )}
      {/* newest point: solid dot + pinging ring ("just drawn") */}
      {last && (
        <g>
          <circle
            cx={x(last.t)}
            cy={y(last.s)}
            r="3"
            fill="none"
            stroke="#31E0A0"
            strokeWidth="1.5"
            className="point-ping"
          />
          <circle cx={x(last.t)} cy={y(last.s)} r="3" fill="#0A0A0B" stroke="#31E0A0" strokeWidth="1.75" />
        </g>
      )}
    </svg>
  )
}
