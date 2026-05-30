import type { ReactNode } from 'react'
import { ECHO } from '../lib/palette'

interface PanelProps {
  title: string
  right?: ReactNode
  children: ReactNode
  className?: string
  bodyClass?: string
}

/** Reusable bordered panel shell with a mono uppercase header. */
export function Panel({ title, right, children, className = '', bodyClass = '' }: PanelProps) {
  return (
    <section
      className={`flex flex-col rounded-[5px] border min-h-0 ${className}`}
      style={{ background: ECHO.panel, borderColor: ECHO.border }}
    >
      <header
        className="flex items-center justify-between px-3.5 h-9 shrink-0 border-b"
        style={{ borderColor: ECHO.hair }}
      >
        <h2
          className="font-mono text-[11px] tracking-[0.16em] uppercase font-semibold"
          style={{ color: ECHO.muted }}
        >
          {title}
        </h2>
        {right}
      </header>
      <div className={`flex-1 min-h-0 ${bodyClass}`}>{children}</div>
    </section>
  )
}
