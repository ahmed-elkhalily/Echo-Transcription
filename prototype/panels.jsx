// ─────────────────────────────────────────────────────────────────────────
// Echo — UI panels: mic bar, transcript feed, buzzword panel, stats, sessions
// ─────────────────────────────────────────────────────────────────────────
const { useRef: useRefP, useEffect: useEffectP } = React;

// ── reusable panel shell ────────────────────────────────────────────────────
function Panel({ title, right, children, className = '', bodyClass = '' }) {
  return (
    <section className={`flex flex-col rounded-[5px] border min-h-0 ${className}`}
             style={{ background: ECHO.panel, borderColor: ECHO.border }}>
      <header className="flex items-center justify-between px-3.5 h-9 shrink-0 border-b"
              style={{ borderColor: ECHO.hair }}>
        <h2 className="mono text-[11px] tracking-[0.16em] uppercase font-semibold"
            style={{ color: ECHO.muted }}>{title}</h2>
        {right}
      </header>
      <div className={`flex-1 min-h-0 ${bodyClass}`}>{children}</div>
    </section>
  );
}

// ── Mic control bar ─────────────────────────────────────────────────────────
function MicBar({ active, onToggle, recSec, wpm }) {
  return (
    <div className="flex items-stretch gap-3 h-[88px] shrink-0">
      {/* start/stop + session id */}
      <div className="flex items-center gap-4 px-4 rounded-[5px] border shrink-0"
           style={{ background: ECHO.panel, borderColor: ECHO.border }}>
        <button onClick={onToggle}
                className="group flex items-center gap-3 pl-2 pr-4 h-12 rounded-[4px] border transition-colors"
                style={{
                  background: active ? ECHO.negDim : ECHO.accentDim,
                  borderColor: active ? 'rgba(226,96,74,0.5)' : 'rgba(49,224,160,0.5)',
                }}>
          <span className="grid place-items-center w-9 h-9 rounded-[3px]"
                style={{ background: active ? ECHO.neg : ECHO.accent }}>
            {active
              ? <span className="w-3 h-3 rounded-[1px]" style={{ background: '#0A0A0B' }} />
              : <span className="w-0 h-0" style={{ borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '11px solid #0A0A0B', marginLeft: 2 }} />}
          </span>
          <span className="mono text-[13px] font-semibold tracking-wide"
                style={{ color: active ? ECHO.neg : ECHO.accent }}>
            {active ? 'STOP' : 'REC'}
          </span>
        </button>
        <div className="flex flex-col">
          <span className="mono text-[22px] font-semibold leading-none tracking-tight flex items-center gap-2"
                style={{ color: ECHO.text }}>
            {active && <span className="rec-dot w-2 h-2 rounded-full" style={{ background: ECHO.neg }} />}
            {fmtClock(recSec)}
          </span>
          <span className="mono text-[10px] tracking-[0.18em] uppercase mt-1.5"
                style={{ color: ECHO.faint }}>
            {active ? 'recording · local' : 'paused'}
          </span>
        </div>
      </div>

      {/* level meter */}
      <div className="flex-1 flex flex-col justify-between px-4 py-3 rounded-[5px] border min-w-0"
           style={{ background: ECHO.panel, borderColor: ECHO.border }}>
        <div className="flex items-center justify-between">
          <span className="mono text-[10px] tracking-[0.18em] uppercase" style={{ color: ECHO.faint }}>
            input · default mic
          </span>
          <span className="mono text-[11px]" style={{ color: ECHO.muted }}>
            {wpm}<span style={{ color: ECHO.faint }}> wpm</span>
          </span>
        </div>
        <LevelMeter active={active} />
      </div>

      {/* session switcher */}
      <SessionSwitcher />
    </div>
  );
}

// ── Session switcher (top-right, opens on hover/click) ──────────────────────
function SessionSwitcher() {
  const [open, setOpen] = React.useState(false);
  const active = SESSIONS.find(s => s.active) || SESSIONS[0];
  return (
    <div className="relative shrink-0" style={{ width: 232 }}
         onMouseLeave={() => setOpen(false)}>
      <button onClick={() => setOpen(o => !o)}
              className="w-full h-full flex flex-col justify-center gap-2 px-3.5 rounded-[5px] border text-left transition-colors"
              style={{ background: ECHO.panel, borderColor: ECHO.border }}>
        <div className="flex items-center justify-between">
          <span className="mono text-[10px] tracking-[0.18em] uppercase" style={{ color: ECHO.faint }}>
            session
          </span>
          <span className="mono text-[10px]" style={{ color: ECHO.faint }}>
            {open ? '▴' : '▾'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-medium truncate" style={{ color: ECHO.text }}>
              {active.name}
            </span>
            <span className="mono text-[10px] mt-0.5" style={{ color: ECHO.muted }}>{active.date}</span>
          </div>
          <Spark values={active.spark} color={ECHO.accent} />
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] w-[280px] z-30 rounded-[6px] border overflow-hidden"
             style={{ background: ECHO.panel2, borderColor: ECHO.border, boxShadow: '0 18px 40px rgba(0,0,0,0.55)' }}>
          <div className="px-3 py-2 border-b mono text-[10px] tracking-[0.16em] uppercase flex justify-between"
               style={{ borderColor: ECHO.hair, color: ECHO.faint }}>
            <span>recent sessions</span><span>{SESSIONS.length}</span>
          </div>
          {SESSIONS.map(s => (
            <button key={s.id}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 border-b text-left transition-colors hover:bg-white/[0.03]"
                    style={{ borderColor: ECHO.hair }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: s.active ? ECHO.accent : ECHO.faint }} />
                <div className="flex flex-col min-w-0">
                  <span className="text-[12.5px] truncate"
                        style={{ color: s.active ? ECHO.text : '#bcbcc2' }}>{s.name}</span>
                  <span className="mono text-[10px]" style={{ color: ECHO.faint }}>{s.date}</span>
                </div>
              </div>
              <Spark values={s.spark} color={s.active ? ECHO.accent : ECHO.muted} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Transcript feed ─────────────────────────────────────────────────────────
function TranscriptFeed({ utterances, partial }) {
  const scrollRef = useRefP(null);
  useEffectP(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [utterances.length, partial]);

  return (
    <div ref={scrollRef} className="feed-scroll h-full overflow-y-auto px-3.5 py-3">
      <div className="flex flex-col gap-px">
        {utterances.map((u, i) => {
          const fresh = i >= utterances.length - 1;
          const parts = tokenizeBuzz(u.text, u.buzz);
          return (
            <div key={u.id}
                 className={`group flex gap-3 px-2 py-2 rounded-[3px] ${fresh ? 'arrive' : ''}`}
                 style={{ background: sentTint(u.s) }}>
              <span className="mono text-[10.5px] pt-[3px] tabular-nums shrink-0 w-[42px]"
                    style={{ color: ECHO.faint }}>{fmtMMSS(u.t)}</span>
              <span className="w-1.5 h-1.5 rounded-full mt-[7px] shrink-0"
                    style={{ background: sentColor(u.s), boxShadow: `0 0 6px ${sentColor(u.s)}55` }} />
              <p className="text-[13.5px] leading-[1.5] flex-1" style={{ color: '#d4d4d8' }}>
                {parts.map((p, j) => p.buzz
                  ? <span key={j} className="mono text-[12.5px] px-1 py-px rounded-[2px] font-medium"
                          style={{ background: ECHO.accentDim, color: ECHO.accent,
                                   boxShadow: 'inset 0 0 0 1px rgba(49,224,160,0.3)' }}>{p.t}</span>
                  : <span key={j}>{p.t}</span>)}
              </p>
            </div>
          );
        })}
        {partial && (
          <div className="flex gap-3 px-2 py-2">
            <span className="mono text-[10.5px] pt-[3px] shrink-0 w-[42px]" style={{ color: ECHO.faint }}>···</span>
            <span className="w-1.5 h-1.5 rounded-full mt-[7px] shrink-0" style={{ background: ECHO.faint }} />
            <p className="text-[13.5px] leading-[1.5] flex-1 italic" style={{ color: ECHO.muted }}>
              {partial}<span className="inline-block w-[7px] h-[15px] ml-0.5 align-middle rec-dot"
                             style={{ background: ECHO.accent, verticalAlign: '-2px' }} />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Buzzword panel ──────────────────────────────────────────────────────────
function BuzzwordPanel({ counts, flashKey, lastMatched }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...Object.values(counts));
  return (
    <div className="h-full flex flex-col px-3 py-2.5 gap-1.5 overflow-hidden">
      {BUZZWORDS.map(w => {
        const c = counts[w] || 0;
        const flashing = w === lastMatched;
        return (
          <div key={w + (flashing ? flashKey : '')}
               className={`flex items-center gap-3 px-2.5 h-[34px] rounded-[3px] border ${flashing ? 'buzz-flash' : ''}`}
               style={{ borderColor: ECHO.border, background: ECHO.panel2 }}>
            <span className="text-[12.5px] flex-1 truncate"
                  style={{ color: c ? '#d4d4d8' : ECHO.faint }}>{w}</span>
            {/* mini magnitude bar */}
            <div className="w-14 h-1 rounded-full overflow-hidden shrink-0" style={{ background: '#1d1d22' }}>
              <div className="h-full rounded-full" style={{ width: `${(c / max) * 100}%`, background: c ? ECHO.accent : 'transparent' }} />
            </div>
            <span className="mono text-[13px] tabular-nums w-6 text-right font-semibold"
                  style={{ color: c ? ECHO.accent : ECHO.faint }}>{c}</span>
          </div>
        );
      })}
      <div className="mt-auto flex items-center justify-between pt-1.5 border-t"
           style={{ borderColor: ECHO.hair }}>
        <span className="mono text-[10px] tracking-[0.16em] uppercase" style={{ color: ECHO.faint }}>matches</span>
        <span className="mono text-[12px]" style={{ color: ECHO.muted }}>{total} total · 6 watched</span>
      </div>
    </div>
  );
}

// ── Stats strip ─────────────────────────────────────────────────────────────
function Stat({ value, unit, label, accent }) {
  return (
    <div className="flex-1 flex flex-col justify-center px-4 border-r last:border-r-0"
         style={{ borderColor: ECHO.hair }}>
      <div className="flex items-baseline gap-1">
        <span className="mono text-[26px] font-semibold leading-none tabular-nums"
              style={{ color: accent ? ECHO.accent : ECHO.text }}>{value}</span>
        {unit && <span className="mono text-[11px]" style={{ color: ECHO.faint }}>{unit}</span>}
      </div>
      <span className="mono text-[9.5px] tracking-[0.16em] uppercase mt-2" style={{ color: ECHO.muted }}>{label}</span>
    </div>
  );
}
function StatsStrip({ wpm, talk, pause, unique }) {
  return (
    <div className="flex h-full">
      <Stat value={wpm} unit="wpm" label="pace" accent />
      <Stat value={talk} label="talk-time" />
      <Stat value={pause} label="longest pause" />
      <Stat value={unique} label="unique words" />
    </div>
  );
}

Object.assign(window, {
  Panel, MicBar, SessionSwitcher, TranscriptFeed, BuzzwordPanel, StatsStrip, Stat,
});
