import { useState } from 'react'
import { ECHO } from '../lib/palette'
import { SESSIONS } from '../lib/mockData'
import { Spark } from './Spark'

/** Top-right session picker; opens a dropdown of recent sessions on click. */
export function SessionSwitcher() {
  const [open, setOpen] = useState(false)
  const active = SESSIONS.find((s) => s.active) || SESSIONS[0]
  return (
    <div className="relative shrink-0 w-full sm:w-[232px]" onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full h-full flex flex-col justify-center gap-2 px-3.5 py-3 rounded-[5px] border text-left transition-colors"
        style={{ background: ECHO.panel, borderColor: ECHO.border }}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: ECHO.faint }}>
            session
          </span>
          <span className="font-mono text-[10px]" style={{ color: ECHO.faint }}>
            {open ? '▴' : '▾'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-medium truncate" style={{ color: ECHO.text }}>
              {active.name}
            </span>
            <span className="font-mono text-[10px] mt-0.5" style={{ color: ECHO.muted }}>
              {active.date}
            </span>
          </div>
          <Spark values={active.spark} color={ECHO.accent} />
        </div>
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+6px)] w-[280px] z-30 rounded-[6px] border overflow-hidden"
          style={{ background: ECHO.panel2, borderColor: ECHO.border, boxShadow: '0 18px 40px rgba(0,0,0,0.55)' }}
        >
          <div
            className="px-3 py-2 border-b font-mono text-[10px] tracking-[0.16em] uppercase flex justify-between"
            style={{ borderColor: ECHO.hair, color: ECHO.faint }}
          >
            <span>recent sessions</span>
            <span>{SESSIONS.length}</span>
          </div>
          {SESSIONS.map((s) => (
            <button
              key={s.id}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 border-b text-left transition-colors hover:bg-white/[0.03]"
              style={{ borderColor: ECHO.hair }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: s.active ? ECHO.accent : ECHO.faint }}
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-[12.5px] truncate" style={{ color: s.active ? ECHO.text : '#bcbcc2' }}>
                    {s.name}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: ECHO.faint }}>
                    {s.date}
                  </span>
                </div>
              </div>
              <Spark values={s.spark} color={s.active ? ECHO.accent : ECHO.muted} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
