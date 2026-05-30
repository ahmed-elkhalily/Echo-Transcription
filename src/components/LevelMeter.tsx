import { useEffect, useRef } from 'react'

interface LevelMeterProps {
  active: boolean
  bars?: number
}

/**
 * Mic level meter: vertical bars driven by a smoothed random walk.
 *
 * Stand-in animation until a real AnalyserNode feeds it. The render loop mutates
 * bar heights/colors imperatively via refs to stay off the React commit path.
 */
export function LevelMeter({ active, bars = 28 }: LevelMeterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const state = useRef({ levels: new Array<number>(bars).fill(0.06), env: 0.4, t: 0 })

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const st = state.current
      st.t += 0.06
      // slow speech "envelope" — rises and falls like phrases
      const target = active
        ? 0.35 + 0.45 * Math.abs(Math.sin(st.t * 0.9)) + 0.12 * Math.sin(st.t * 4.3)
        : 0.05
      st.env += (target - st.env) * 0.12
      const el = ref.current
      if (el) {
        const kids = el.children
        const n = kids.length
        for (let i = 0; i < n; i++) {
          // center-weighted: middle bars taller, like a real spectrum
          const d = 1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2)
          const shape = 0.35 + 0.65 * d
          const jitter = active ? 0.55 + 0.45 * Math.random() : 0.4
          const v = Math.max(0.05, Math.min(1, st.env * shape * jitter))
          st.levels[i] += (v - st.levels[i]) * 0.45
          const h = st.levels[i]
          const bar = kids[i] as HTMLElement
          bar.style.height = h * 100 + '%'
          // hot bars glow toward the accent
          bar.style.background = h > 0.7 ? '#31E0A0' : h > 0.42 ? '#1f9c72' : '#2a2a30'
          bar.style.boxShadow = h > 0.7 ? '0 0 6px rgba(49,224,160,0.55)' : 'none'
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  return (
    <div ref={ref} className="flex items-end gap-[3px] h-9 w-full">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-[1px] transition-[height] duration-75"
          style={{ height: '6%', background: '#2a2a30', minWidth: 2 }}
        />
      ))}
    </div>
  )
}
