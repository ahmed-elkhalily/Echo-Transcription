# Echo

> A local-first, browser-based dashboard that captures live microphone input,
> transcribes speech in real time, and visualizes conversational analytics —
> sentiment, talk-time, pace, and buzzword detection. **Nothing leaves the
> device.**

Week 1 project from the [4-Week Advanced Frontend Sprint](../projects%20and%20ideas).
Built under a 1-hour-a-day constraint, leaning on Claude Code for heavy lifting.

---

## Status

Early scaffolding. The Claude Design prototype is in [`prototype/`](./prototype)
and is fully interactive (mock data, animated meter, streaming utterances).
The production Vite + React + TypeScript port is in [`src/`](./src) and currently
ships an empty placeholder screen — components, hooks, and the worker are next.

## Quick start

```bash
cd echo
npm install
npm run dev          # → http://localhost:5173
```

To view the original Claude Design prototype:

```bash
cd echo/prototype
python3 -m http.server 4173
# → http://localhost:4173/index.html
```

(The prototype must be served over HTTP because it loads `.jsx` files via
Babel at runtime; opening `index.html` from disk fails.)

## What you'll see when it's done

| Surface | Behaviour |
|---|---|
| **Mic control bar** | Start/stop button, 28-bar animated level meter, rec timer, live WPM |
| **Transcript feed** | Scrolling utterance list, per-line sentiment dot, inline buzzword highlights, new-arrival slide-in |
| **Sentiment timeline** | Smoothed Catmull-Rom SVG line over a ±5 band, animated point ping on newest sample |
| **Buzzword panel** | 6 user-watched phrases with magnitude bars and a green flash on match |
| **Stats strip** | WPM · talk-time · longest pause · unique words |
| **Session switcher** | Past sessions with date + inline sentiment sparkline preview |

## Tech stack

- **Vite + React 18 + TypeScript** — fast HMR, strict types
- **Tailwind CSS** — `echo-*` palette tokens pre-wired in `tailwind.config.js`
- **Web Audio API** — `getUserMedia` + `AnalyserNode` for mic capture and the level meter
- **Web Speech API** — `SpeechRecognition` for free in-browser transcription
- **Web Workers** — sentiment scoring + buzzword matching off the main thread (`vite.config.ts` sets `worker.format: 'es'`)
- **Dexie.js** — IndexedDB wrapper for local-first session persistence
- **Recharts** — sentiment timeline chart

## Project structure

```
echo/
├── index.html              # Vite entry
├── package.json
├── tailwind.config.js      # echo palette + IBM Plex fonts
├── tsconfig.json
├── vite.config.ts
├── prototype/              # Original Claude Design prototype (CDN React + Babel)
│   ├── index.html
│   ├── data.jsx
│   ├── viz.jsx
│   ├── panels.jsx
│   └── app.jsx
└── src/
    ├── App.tsx             # Dashboard root
    ├── main.tsx
    ├── index.css           # Tailwind + keyframes (slideInUp, buzzFlash, recPulse, pointPulse)
    ├── components/         # MicCapture, TranscriptFeed, SentimentChart, BuzzwordPanel, StatsBar
    ├── hooks/              # useMicrophone, useTranscription, useSessions
    ├── workers/            # analytics.worker.ts
    ├── db/                 # Dexie schema
    └── lib/                # AFINN-165 sentiment scorer
```

## Daily plan

| Day | Goal |
|---|---|
| 1 | Spec, Vite scaffold, Tailwind palette, Dexie schema, empty UI shell |
| 2 | `useMicrophone` + `useTranscription` hooks; transcript feed renders live |
| 3 | Web Worker for sentiment scoring; sessions persist to IndexedDB |
| 4 | Sentiment chart + buzzword UX + stats strip + keyboard shortcut |
| 5 | Edge cases, a11y pass, perf check, deploy to Vercel |

## Browser support

The Web Speech API is **Chrome / Edge only**. Safari and Firefox will see a
clean "unsupported browser" state — no crash. Mic permission denied is also
handled explicitly; the recorder will not throw on `NotAllowedError`.

## Definition of done

- Live deployed URL
- Mic → transcription → sentiment → persistence loop works end-to-end
- Sessions persist across page reloads
- At least one buzzword visibly triggers
- README with run instructions and a screenshot or GIF
