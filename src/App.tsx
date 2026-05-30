import { ECHO } from './lib/palette'
import { fmtMMSS } from './lib/format'
import { useDemoStream } from './hooks/useDemoStream'
import { MicBar } from './components/MicBar'
import { Panel } from './components/Panel'
import { TranscriptFeed } from './components/TranscriptFeed'
import { SentimentChart } from './components/SentimentChart'
import { BuzzwordPanel } from './components/BuzzwordPanel'
import { StatsBar } from './components/StatsBar'

export default function App() {
  const stream = useDemoStream()

  return (
    // On large screens the dashboard is a fixed-height grid with internal
    // scrolling; below `lg` it stacks and the whole surface scrolls.
    <div className="h-full overflow-y-auto overflow-x-hidden lg:overflow-hidden" style={{ background: ECHO.bg, color: ECHO.text }}>
      <div className="flex flex-col gap-3 p-3 sm:p-4 min-h-full lg:h-full">
        {/* top: mic control bar */}
        <MicBar active={stream.active} onToggle={stream.toggle} recSec={stream.recSec} wpm={stream.wpm} />

        {/* body */}
        <div className="flex-1 min-h-0 grid gap-3 grid-cols-1 lg:grid-cols-[minmax(340px,40%)_1fr]">
          {/* left: transcript feed */}
          <Panel
            title="Transcript · live"
            className="h-[55vh] lg:h-auto"
            right={
              <span className="font-mono text-[10px] flex items-center gap-1.5" style={{ color: ECHO.faint }}>
                <span
                  className="rec-dot w-1.5 h-1.5 rounded-full"
                  style={{ background: stream.active ? ECHO.accent : ECHO.faint }}
                />
                {stream.utterances.length} utterances
              </span>
            }
          >
            <TranscriptFeed utterances={stream.utterances} partial={stream.partial} />
          </Panel>

          {/* right column */}
          <div className="flex flex-col gap-3 min-h-0">
            <Panel
              title="Sentiment · −5…+5"
              className="flex-1 min-h-[220px]"
              right={
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px]" style={{ color: ECHO.faint }}>
                    ~3 min
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: ECHO.muted }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: ECHO.accent }} />
                    now
                  </span>
                </div>
              }
              bodyClass="px-1.5 py-1.5"
            >
              <SentimentChart points={stream.sentPoints} />
            </Panel>

            <Panel
              title="Buzzwords"
              right={
                <span className="font-mono text-[10px]" style={{ color: ECHO.faint }}>
                  watching 6
                </span>
              }
            >
              <BuzzwordPanel counts={stream.counts} flashKey={stream.flashKey} lastMatched={stream.lastMatched} />
            </Panel>

            <section
              className="shrink-0 rounded-[5px] border h-[92px]"
              style={{ background: ECHO.panel, borderColor: ECHO.border }}
            >
              <StatsBar
                wpm={stream.wpm}
                talk={fmtMMSS(stream.recSec)}
                pause={stream.longestPause}
                unique={stream.uniqueWords}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
