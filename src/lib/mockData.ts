// Mock session list for the switcher.
//
// Session persistence (Dexie/IndexedDB) is a later increment; until then the
// switcher shows this static set. The live transcript, sentiment, buzzwords,
// and stats are all real (see useTranscription + useAnalytics).

import type { Session } from './types'

/** Past sessions for the switcher — `spark` is a tiny sentiment sequence. */
export const SESSIONS: Session[] = [
  { id: 's1', name: 'standup · platform', date: 'today 09:14', active: true, spark: [1, 2, 2, -3, -2, 1, 2, -1, 0, 3, -2, 0, 2, 1] },
  { id: 's2', name: 'design crit · meter', date: 'yest 16:02', spark: [2, 3, 1, 2, 0, -1, 2, 3, 2, 1, 2, 0, 1, 2] },
  { id: 's3', name: '1:1 · with priya', date: 'yest 11:30', spark: [0, 1, -2, -3, -1, 0, 1, 2, 1, 0, -1, 1, 2, 1] },
  { id: 's4', name: 'incident retro', date: 'mon 14:45', spark: [-2, -3, -4, -2, -1, 0, 1, -1, 0, 1, 2, 1, 0, 1] },
  { id: 's5', name: 'roadmap sync', date: 'mon 10:00', spark: [1, 1, 2, 2, 1, 0, 1, 2, 3, 2, 1, 2, 1, 2] },
]
