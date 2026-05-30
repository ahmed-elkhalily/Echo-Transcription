import { ECHO } from '../lib/palette'

interface StatProps {
  value: string | number
  unit?: string
  label: string
  accent?: boolean
}

function Stat({ value, unit, label, accent }: StatProps) {
  return (
    <div className="flex-1 flex flex-col justify-center px-4 border-r last:border-r-0" style={{ borderColor: ECHO.hair }}>
      <div className="flex items-baseline gap-1">
        <span
          className="font-mono text-[26px] font-semibold leading-none tabular-nums"
          style={{ color: accent ? ECHO.accent : ECHO.text }}
        >
          {value}
        </span>
        {unit && (
          <span className="font-mono text-[11px]" style={{ color: ECHO.faint }}>
            {unit}
          </span>
        )}
      </div>
      <span className="font-mono text-[9.5px] tracking-[0.16em] uppercase mt-2" style={{ color: ECHO.muted }}>
        {label}
      </span>
    </div>
  )
}

interface StatsBarProps {
  wpm: number
  talk: string
  pause: string
  unique: number
}

/** Bottom-row stats strip: pace · talk-time · longest pause · unique words. */
export function StatsBar({ wpm, talk, pause, unique }: StatsBarProps) {
  return (
    <div className="flex h-full">
      <Stat value={wpm} unit="wpm" label="pace" accent />
      <Stat value={talk} label="talk-time" />
      <Stat value={pause} label="longest pause" />
      <Stat value={unique} label="unique words" />
    </div>
  )
}
