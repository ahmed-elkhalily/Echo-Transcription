// Analytics aggregation — bridges the transcript to the analytics worker and
// derives everything the dashboard panels render.
//
// Each newly committed utterance is posted to the worker once; replies enrich
// it with a sentiment score + buzzword hits. Counts, the flash trigger, the
// sentiment series, and the stats strip are all derived here. This is the real
// replacement for the old useDemoStream.

import { useEffect, useMemo, useRef, useState } from 'react'
import { fmtMMSS } from '../lib/format'
import { countWords } from '../lib/text'
import { BUZZWORDS } from '../lib/buzzwords'
import type { AnalyzeResult, BuzzCounts, Utterance } from '../lib/types'

/** WPM is averaged over this trailing window for a responsive "live" pace. */
const WPM_WINDOW_SEC = 30

export interface Analytics {
  utterances: Utterance[]
  counts: BuzzCounts
  lastMatched: string
  flashKey: number
  sentPoints: Array<{ t: number; s: number }>
  wpm: number
  uniqueWords: number
  longestPause: string
}

type ResultMap = Record<string, { s: number; buzz: string[] }>

function emptyCounts(): BuzzCounts {
  const c: BuzzCounts = {}
  BUZZWORDS.forEach((w) => (c[w] = 0))
  return c
}

/**
 * @param raw    committed utterances from useTranscription (s defaults to 0)
 * @param recSec session elapsed seconds, used for the rolling WPM window
 */
export function useAnalytics(raw: Utterance[], recSec: number): Analytics {
  const [results, setResults] = useState<ResultMap>({})
  const [lastMatched, setLastMatched] = useState('')
  const [flashKey, setFlashKey] = useState(0)

  const workerRef = useRef<Worker | null>(null)
  const sentRef = useRef<Set<string>>(new Set())

  // Spin up the worker once; wire result handling.
  useEffect(() => {
    let worker: Worker
    try {
      worker = new Worker(new URL('../workers/analytics.worker.ts', import.meta.url), {
        type: 'module',
      })
    } catch {
      // No worker support → utterances stay neutral (s=0, no buzz). No crash.
      return
    }
    workerRef.current = worker
    worker.onmessage = (ev: MessageEvent<AnalyzeResult>) => {
      const { id, s, buzz } = ev.data
      setResults((prev) => ({ ...prev, [id]: { s, buzz } }))
      if (buzz.length) {
        setLastMatched(buzz[0])
        setFlashKey((k) => k + 1)
      }
    }
    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  // Post each committed utterance to the worker exactly once.
  useEffect(() => {
    const worker = workerRef.current
    if (!worker) return
    for (const u of raw) {
      if (sentRef.current.has(u.id)) continue
      sentRef.current.add(u.id)
      worker.postMessage({ id: u.id, text: u.text })
    }
  }, [raw])

  // Merge worker results back onto the utterances.
  const utterances = useMemo<Utterance[]>(
    () =>
      raw.map((u) => {
        const r = results[u.id]
        return r ? { ...u, s: r.s, buzz: r.buzz } : u
      }),
    [raw, results],
  )

  const counts = useMemo<BuzzCounts>(() => {
    const c = emptyCounts()
    utterances.forEach((u) => (u.buzz || []).forEach((w) => (c[w] = (c[w] || 0) + 1)))
    return c
  }, [utterances])

  const sentPoints = useMemo(() => utterances.map((u) => ({ t: u.t, s: u.s })), [utterances])

  const uniqueWords = useMemo(() => {
    const set = new Set<string>()
    utterances.forEach((u) =>
      u.text
        .toLowerCase()
        .replace(/[^a-z\s']/g, '')
        .split(/\s+/)
        .forEach((w) => w && set.add(w)),
    )
    return set.size
  }, [utterances])

  const longestPause = useMemo(() => {
    let max = 0
    for (let i = 1; i < utterances.length; i++) {
      const gap = utterances[i].t - utterances[i - 1].t
      if (gap > max) max = gap
    }
    return fmtMMSS(max)
  }, [utterances])

  // Rolling WPM: words committed within the trailing window, scaled to a minute.
  const wpm = useMemo(() => {
    if (!utterances.length || recSec <= 0) return 0
    const cutoff = recSec - WPM_WINDOW_SEC
    let words = 0
    for (const u of utterances) {
      if (u.t >= cutoff) words += countWords(u.text)
    }
    const windowSec = Math.max(1, Math.min(WPM_WINDOW_SEC, recSec))
    return Math.round((words / windowSec) * 60)
  }, [utterances, recSec])

  return { utterances, counts, lastMatched, flashKey, sentPoints, wpm, uniqueWords, longestPause }
}
