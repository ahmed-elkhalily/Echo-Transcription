import { useEffect, useRef } from 'react'
import { ECHO, sentColor, sentTint } from '../lib/palette'
import { fmtMMSS } from '../lib/format'
import { tokenizeBuzz } from '../lib/text'
import type { Utterance } from '../lib/types'

interface TranscriptFeedProps {
  utterances: Utterance[]
  /** In-progress (not yet committed) line being "typed" in. */
  partial: string | null
}

/** Scrolling utterance list with per-line sentiment dots + buzzword highlights. */
export function TranscriptFeed({ utterances, partial }: TranscriptFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [utterances.length, partial])

  return (
    <div ref={scrollRef} className="feed-scroll h-full overflow-y-auto px-3.5 py-3">
      <div className="flex flex-col gap-px">
        {utterances.map((u, i) => {
          const fresh = i >= utterances.length - 1
          const parts = tokenizeBuzz(u.text, u.buzz)
          return (
            <div
              key={u.id}
              className={`group flex gap-3 px-2 py-2 rounded-[3px] ${fresh ? 'arrive' : ''}`}
              style={{ background: sentTint(u.s) }}
            >
              <span
                className="font-mono text-[10.5px] pt-[3px] tabular-nums shrink-0 w-[42px]"
                style={{ color: ECHO.faint }}
              >
                {fmtMMSS(u.t)}
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full mt-[7px] shrink-0"
                style={{ background: sentColor(u.s), boxShadow: `0 0 6px ${sentColor(u.s)}55` }}
              />
              <p className="text-[13.5px] leading-[1.5] flex-1 min-w-0 break-words" style={{ color: '#d4d4d8' }}>
                {parts.map((p, j) =>
                  p.buzz ? (
                    <span
                      key={j}
                      className="font-mono text-[12.5px] px-1 py-px rounded-[2px] font-medium"
                      style={{
                        background: ECHO.accentDim,
                        color: ECHO.accent,
                        boxShadow: 'inset 0 0 0 1px rgba(49,224,160,0.3)',
                      }}
                    >
                      {p.t}
                    </span>
                  ) : (
                    <span key={j}>{p.t}</span>
                  ),
                )}
              </p>
            </div>
          )
        })}
        {partial && (
          <div className="flex gap-3 px-2 py-2">
            <span className="font-mono text-[10.5px] pt-[3px] shrink-0 w-[42px]" style={{ color: ECHO.faint }}>
              ···
            </span>
            <span className="w-1.5 h-1.5 rounded-full mt-[7px] shrink-0" style={{ background: ECHO.faint }} />
            <p className="text-[13.5px] leading-[1.5] flex-1 min-w-0 break-words italic" style={{ color: ECHO.muted }}>
              {partial}
              <span
                className="inline-block w-[7px] h-[15px] ml-0.5 align-middle rec-dot"
                style={{ background: ECHO.accent, verticalAlign: '-2px' }}
              />
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
