import { ECHO } from '../lib/palette'
import { fmtClock } from '../lib/format'
import { LevelMeter } from './LevelMeter'
import { SessionSwitcher } from './SessionSwitcher'

interface MicBarProps {
  active: boolean
  onToggle: () => void
  recSec: number
  wpm: number
}

/** Top control bar: start/stop, rec timer, level meter, session switcher. */
export function MicBar({ active, onToggle, recSec, wpm }: MicBarProps) {
  return (
    <div className="flex flex-wrap lg:flex-nowrap items-stretch gap-3 shrink-0">
      {/* start/stop + session timer */}
      <div
        className="flex items-center gap-4 px-4 py-3 rounded-[5px] border shrink-0"
        style={{ background: ECHO.panel, borderColor: ECHO.border }}
      >
        <button
          onClick={onToggle}
          className="group flex items-center gap-3 pl-2 pr-4 h-12 rounded-[4px] border transition-colors"
          style={{
            background: active ? ECHO.negDim : ECHO.accentDim,
            borderColor: active ? 'rgba(226,96,74,0.5)' : 'rgba(49,224,160,0.5)',
          }}
        >
          <span
            className="grid place-items-center w-9 h-9 rounded-[3px]"
            style={{ background: active ? ECHO.neg : ECHO.accent }}
          >
            {active ? (
              <span className="w-3 h-3 rounded-[1px]" style={{ background: '#0A0A0B' }} />
            ) : (
              <span
                className="w-0 h-0"
                style={{
                  borderTop: '7px solid transparent',
                  borderBottom: '7px solid transparent',
                  borderLeft: '11px solid #0A0A0B',
                  marginLeft: 2,
                }}
              />
            )}
          </span>
          <span
            className="font-mono text-[13px] font-semibold tracking-wide"
            style={{ color: active ? ECHO.neg : ECHO.accent }}
          >
            {active ? 'STOP' : 'REC'}
          </span>
        </button>
        <div className="flex flex-col">
          <span
            className="font-mono text-[22px] font-semibold leading-none tracking-tight flex items-center gap-2"
            style={{ color: ECHO.text }}
          >
            {active && <span className="rec-dot w-2 h-2 rounded-full" style={{ background: ECHO.neg }} />}
            {fmtClock(recSec)}
          </span>
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase mt-1.5" style={{ color: ECHO.faint }}>
            {active ? 'recording · local' : 'paused'}
          </span>
        </div>
      </div>

      {/* level meter */}
      <div
        className="flex-1 flex flex-col justify-between gap-3 px-4 py-3 rounded-[5px] border min-w-[200px]"
        style={{ background: ECHO.panel, borderColor: ECHO.border }}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: ECHO.faint }}>
            input · default mic
          </span>
          <span className="font-mono text-[11px]" style={{ color: ECHO.muted }}>
            {wpm}
            <span style={{ color: ECHO.faint }}> wpm</span>
          </span>
        </div>
        <LevelMeter active={active} />
      </div>

      {/* session switcher */}
      <SessionSwitcher />
    </div>
  )
}
