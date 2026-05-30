// Mock data driving the demo stream.
//
// This stands in for live mic + Web Speech transcription until those land in a
// later pass. SCRIPT is the canned history; LIVE_LINES stream in "live" once the
// history is loaded; SESSIONS populate the switcher.

import type { Session, Utterance } from './types'

/** Phrases the user is watching for. */
export const BUZZWORDS: string[] = [
  'low-hanging fruit',
  'bandwidth',
  'circle back',
  'deep dive',
  'move the needle',
  'synergy',
]

/** Seed line shape: a scripted utterance without an id yet. */
type ScriptLine = Omit<Utterance, 'id'>

/** ~2–3 min PM standup. t = seconds into session, s = sentiment (−5…+5). */
export const SCRIPT: ScriptLine[] = [
  { t: 4, s: 1, text: "Morning. Quick standup, I'll keep it tight." },
  { t: 11, s: 2, text: 'Yesterday I closed out the onboarding flow tickets.' },
  { t: 19, s: 2, text: "We're basically on track for the Thursday cut." },
  { t: 28, s: -3, text: 'One blocker — the transcription worker keeps OOMing under load.' },
  { t: 37, s: -2, text: 'I lost most of the afternoon chasing it, honestly.' },
  { t: 46, s: 1, text: "But there's some low-hanging fruit on the memory side.", buzz: ['low-hanging fruit'] },
  { t: 54, s: 2, text: 'If we cap the buffer we claw back maybe forty percent.' },
  { t: 63, s: -1, text: "I don't have the bandwidth to also take the chart refactor.", buzz: ['bandwidth'] },
  { t: 70, s: 0, text: 'Can someone else grab that one?' },
  { t: 79, s: 3, text: 'Design dropped the new meter spec and it looks great.' },
  { t: 88, s: -2, text: "Risk is the API contract still isn't locked." },
  { t: 96, s: 0, text: "Let's circle back on that right after standup.", buzz: ['circle back'] },
  { t: 105, s: 2, text: 'Net net, cautiously optimistic for the demo.' },
  { t: 113, s: 1, text: "That's me. Handing off." },
]

/** Lines that stream in "live" after the canned history is loaded. */
export const LIVE_LINES: ScriptLine[] = [
  { t: 0, s: 2, text: 'Quick follow-up — staging is green again.' },
  { t: 0, s: 1, text: 'We should deep dive the latency numbers later.', buzz: ['deep dive'] },
  { t: 0, s: 1, text: 'Nothing else blocking on my end right now.' },
  { t: 0, s: -3, text: 'Honestly the flaky integration test is driving me up a wall.' },
  { t: 0, s: 2, text: 'If this lands it genuinely moves the needle on retention.', buzz: ['move the needle'] },
  { t: 0, s: 0, text: 'Okay. Back to it.' },
  { t: 0, s: 1, text: 'Reminder the freeze starts Friday noon.' },
  { t: 0, s: -1, text: 'Still waiting on the security review, mild risk.' },
]

/** Past sessions for the switcher — `spark` is a tiny sentiment sequence. */
export const SESSIONS: Session[] = [
  { id: 's1', name: 'standup · platform', date: 'today 09:14', active: true, spark: [1, 2, 2, -3, -2, 1, 2, -1, 0, 3, -2, 0, 2, 1] },
  { id: 's2', name: 'design crit · meter', date: 'yest 16:02', spark: [2, 3, 1, 2, 0, -1, 2, 3, 2, 1, 2, 0, 1, 2] },
  { id: 's3', name: '1:1 · with priya', date: 'yest 11:30', spark: [0, 1, -2, -3, -1, 0, 1, 2, 1, 0, -1, 1, 2, 1] },
  { id: 's4', name: 'incident retro', date: 'mon 14:45', spark: [-2, -3, -4, -2, -1, 0, 1, -1, 0, 1, 2, 1, 0, 1] },
  { id: 's5', name: 'roadmap sync', date: 'mon 10:00', spark: [1, 1, 2, 2, 1, 0, 1, 2, 3, 2, 1, 2, 1, 2] },
]
