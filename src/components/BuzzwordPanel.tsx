import { ECHO } from '../lib/palette'
import { BUZZWORDS } from '../lib/buzzwords'
import type { BuzzCounts } from '../lib/types'

interface BuzzwordPanelProps {
  counts: BuzzCounts
  /** Bumped on each match to retrigger the flash animation. */
  flashKey: number
  /** The most recently matched phrase (the row that flashes). */
  lastMatched: string
}

/** Watched phrases with magnitude bars; the latest match flashes green. */
export function BuzzwordPanel({ counts, flashKey, lastMatched }: BuzzwordPanelProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const max = Math.max(1, ...Object.values(counts))
  return (
    <div className="h-full flex flex-col px-3 py-2.5 gap-1.5 overflow-hidden">
      {BUZZWORDS.map((w) => {
        const c = counts[w] || 0
        const flashing = w === lastMatched
        return (
          <div
            key={w + (flashing ? flashKey : '')}
            className={`flex items-center gap-3 px-2.5 h-[34px] rounded-[3px] border ${flashing ? 'buzz-flash' : ''}`}
            style={{ borderColor: ECHO.border, background: ECHO.panel2 }}
          >
            <span className="text-[12.5px] flex-1 truncate" style={{ color: c ? '#d4d4d8' : ECHO.faint }}>
              {w}
            </span>
            {/* mini magnitude bar */}
            <div className="w-14 h-1 rounded-full overflow-hidden shrink-0" style={{ background: '#1d1d22' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${(c / max) * 100}%`, background: c ? ECHO.accent : 'transparent' }}
              />
            </div>
            <span
              className="font-mono text-[13px] tabular-nums w-6 text-right font-semibold"
              style={{ color: c ? ECHO.accent : ECHO.faint }}
            >
              {c}
            </span>
          </div>
        )
      })}
      <div className="mt-auto flex items-center justify-between pt-1.5 border-t" style={{ borderColor: ECHO.hair }}>
        <span className="font-mono text-[10px] tracking-[0.16em] uppercase" style={{ color: ECHO.faint }}>
          matches
        </span>
        <span className="font-mono text-[12px]" style={{ color: ECHO.muted }}>
          {total} total · 6 watched
        </span>
      </div>
    </div>
  )
}
