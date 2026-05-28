// ─────────────────────────────────────────────────────────────────────────
// Echo — Dashboard orchestrator: state, live simulation loop, layout, scaling
// ─────────────────────────────────────────────────────────────────────────
const { useState: useS, useEffect: useE, useRef: useR, useMemo } = React;

function buildInitialCounts() {
  const c = {};
  BUZZWORDS.forEach(w => c[w] = 0);
  SCRIPT.forEach(u => (u.buzz || []).forEach(w => c[w] = (c[w] || 0) + 1));
  return c;
}

function Dashboard() {
  const [active, setActive]   = useS(true);
  const [recSec, setRecSec]   = useS(119);
  const [utterances, setUtts] = useS(
    SCRIPT.map((u, i) => ({ id: 'h' + i, ...u }))
  );
  const [partial, setPartial] = useS(null);
  const [counts, setCounts]   = useS(buildInitialCounts);
  const [lastMatched, setLast]= useS('low-hanging fruit');
  const [flashKey, setFlash]  = useS(1);
  const [wpm, setWpm]         = useS(128);

  const recRef  = useR(recSec);
  const idRef   = useR(SCRIPT.length);
  const liveRef = useR(0);
  useE(() => { recRef.current = recSec; }, [recSec]);

  // rec timer
  useE(() => {
    if (!active) return;
    const id = setInterval(() => setRecSec(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [active]);

  // wpm jitter
  useE(() => {
    if (!active) return;
    const id = setInterval(() => setWpm(118 + Math.floor(Math.random() * 22)), 2200);
    return () => clearInterval(id);
  }, [active]);

  // live utterance stream (type-in + commit)
  useE(() => {
    if (!active) return;
    let cancelled = false;
    const timers = [];
    const wait = (ms) => new Promise(r => timers.push(setTimeout(r, ms)));

    (async function run() {
      while (!cancelled) {
        await wait(1700 + Math.random() * 1300);
        if (cancelled) return;
        const line = LIVE_LINES[liveRef.current % LIVE_LINES.length];
        liveRef.current++;
        const words = line.text.split(' ');
        for (let k = 1; k <= words.length; k++) {
          if (cancelled) return;
          setPartial(words.slice(0, k).join(' '));
          await wait(60 + Math.random() * 70);
        }
        await wait(280);
        if (cancelled) return;
        setPartial(null);
        const t = recRef.current;
        setUtts(prev => [...prev, { id: 'u' + (idRef.current++), t, s: line.s, text: line.text, buzz: line.buzz }]);
        if (line.buzz && line.buzz.length) {
          const w = line.buzz[0];
          setCounts(c => ({ ...c, [w]: (c[w] || 0) + 1 }));
          setLast(w);
          setFlash(k => k + 1);
        }
      }
    })();

    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [active]);

  const sentPoints = useMemo(() => utterances.map(u => ({ t: u.t, s: u.s })), [utterances]);

  // derived stats
  const uniqueWords = useMemo(() => {
    const set = new Set();
    utterances.forEach(u => u.text.toLowerCase().replace(/[^a-z\s']/g, '').split(/\s+/).forEach(w => w && set.add(w)));
    return set.size;
  }, [utterances]);

  const longestPause = useMemo(() => {
    let max = 0;
    for (let i = 1; i < utterances.length; i++) {
      const gap = utterances[i].t - utterances[i - 1].t;
      if (gap > max) max = gap;
    }
    return fmtMMSS(max);
  }, [utterances]);

  return (
    <div className="w-full h-full flex flex-col gap-3 p-4"
         style={{ background: ECHO.bg, color: ECHO.text }}>

      {/* top: mic control bar */}
      <MicBar active={active} onToggle={() => setActive(a => !a)} recSec={recSec} wpm={wpm} />

      {/* body */}
      <div className="flex-1 min-h-0 grid gap-3" style={{ gridTemplateColumns: '40% 1fr' }}>

        {/* left: transcript feed */}
        <Panel title="Transcript · live"
               right={
                 <span className="mono text-[10px] flex items-center gap-1.5" style={{ color: ECHO.faint }}>
                   <span className="rec-dot w-1.5 h-1.5 rounded-full" style={{ background: active ? ECHO.accent : ECHO.faint }} />
                   {utterances.length} utterances
                 </span>
               }
               bodyClass="min-h-0">
          <TranscriptFeed utterances={utterances} partial={partial} />
        </Panel>

        {/* right column */}
        <div className="flex flex-col gap-3 min-h-0">

          <Panel title="Sentiment · −5…+5"
                 className="flex-1"
                 right={
                   <div className="flex items-center gap-3">
                     <span className="mono text-[10px]" style={{ color: ECHO.faint }}>~3 min</span>
                     <span className="flex items-center gap-1.5 mono text-[10px]" style={{ color: ECHO.muted }}>
                       <span className="w-2 h-2 rounded-full" style={{ background: ECHO.accent }} />now
                     </span>
                   </div>
                 }
                 bodyClass="px-1.5 py-1.5">
            <SentimentChart points={sentPoints} />
          </Panel>

          <Panel title="Buzzwords"
                 right={<span className="mono text-[10px]" style={{ color: ECHO.faint }}>watching 6</span>}>
            <BuzzwordPanel counts={counts} flashKey={flashKey} lastMatched={lastMatched} />
          </Panel>

          <section className="shrink-0 rounded-[5px] border h-[92px]"
                   style={{ background: ECHO.panel, borderColor: ECHO.border }}>
            <StatsStrip wpm={wpm} talk={fmtMMSS(recSec)} pause={longestPause} unique={uniqueWords} />
          </section>
        </div>
      </div>
    </div>
  );
}

// ── fixed 1440×900 stage, scaled to fit viewport, letterboxed on black ──────
function Stage() {
  const [vp, setVp] = useS({ s: 1, w: window.innerWidth, h: window.innerHeight });
  useE(() => {
    const fit = () => {
      const w = window.innerWidth, h = window.innerHeight;
      setVp({ s: Math.min(w / 1440, h / 900), w, h });
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  const left = (vp.w - 1440 * vp.s) / 2;
  const top  = (vp.h - 900 * vp.s) / 2;
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#000' }}>
      <div style={{ position: 'absolute', left, top, width: 1440, height: 900,
                    transform: `scale(${vp.s})`, transformOrigin: 'top left' }}>
        <Dashboard />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Stage />);
