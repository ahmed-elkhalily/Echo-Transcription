// Demo stream — reproduces the prototype's simulated recording session.
//
// This is a deliberate stand-in for the future useMicrophone + useTranscription
// hooks (real Web Audio + Web Speech). It owns all the live state the dashboard
// renders, so swapping in real capture later means replacing this one hook while
// the component tree stays put.

import { useEffect, useMemo, useRef, useState } from 'react'
import { fmtMMSS } from '../lib/format'
import { BUZZWORDS, LIVE_LINES, SCRIPT } from '../lib/mockData'
import type { BuzzCounts, Utterance } from '../lib/types'

function buildInitialCounts(): BuzzCounts {
  const c: BuzzCounts = {}
  BUZZWORDS.forEach((w) => (c[w] = 0))
  SCRIPT.forEach((u) => (u.buzz || []).forEach((w) => (c[w] = (c[w] || 0) + 1)))
  return c
}

export interface DemoStream {
  active: boolean
  toggle: () => void
  recSec: number
  utterances: Utterance[]
  partial: string | null
  counts: BuzzCounts
  lastMatched: string
  flashKey: number
  wpm: number
  sentPoints: Array<{ t: number; s: number }>
  uniqueWords: number
  longestPause: string
}

export function useDemoStream(): DemoStream {
  const [active, setActive] = useState(true)
  const [recSec, setRecSec] = useState(119)
  const [utterances, setUtts] = useState<Utterance[]>(() =>
    SCRIPT.map((u, i) => ({ id: 'h' + i, ...u })),
  )
  const [partial, setPartial] = useState<string | null>(null)
  const [counts, setCounts] = useState<BuzzCounts>(buildInitialCounts)
  const [lastMatched, setLast] = useState('low-hanging fruit')
  const [flashKey, setFlash] = useState(1)
  const [wpm, setWpm] = useState(128)

  const recRef = useRef(recSec)
  const idRef = useRef(SCRIPT.length)
  const liveRef = useRef(0)
  useEffect(() => {
    recRef.current = recSec
  }, [recSec])

  // rec timer
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setRecSec((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [active])

  // wpm jitter
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setWpm(118 + Math.floor(Math.random() * 22)), 2200)
    return () => clearInterval(id)
  }, [active])

  // live utterance stream (type-in + commit)
  useEffect(() => {
    if (!active) return
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const wait = (ms: number) => new Promise<void>((r) => timers.push(setTimeout(r, ms)))

    void (async function run() {
      while (!cancelled) {
        await wait(1700 + Math.random() * 1300)
        if (cancelled) return
        const line = LIVE_LINES[liveRef.current % LIVE_LINES.length]
        liveRef.current++
        const words = line.text.split(' ')
        for (let k = 1; k <= words.length; k++) {
          if (cancelled) return
          setPartial(words.slice(0, k).join(' '))
          await wait(60 + Math.random() * 70)
        }
        await wait(280)
        if (cancelled) return
        setPartial(null)
        const t = recRef.current
        setUtts((prev) => [
          ...prev,
          { id: 'u' + idRef.current++, t, s: line.s, text: line.text, buzz: line.buzz },
        ])
        if (line.buzz && line.buzz.length) {
          const w = line.buzz[0]
          setCounts((c) => ({ ...c, [w]: (c[w] || 0) + 1 }))
          setLast(w)
          setFlash((k) => k + 1)
        }
      }
    })()

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [active])

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

  return {
    active,
    toggle: () => setActive((a) => !a),
    recSec,
    utterances,
    partial,
    counts,
    lastMatched,
    flashKey,
    wpm,
    sentPoints,
    uniqueWords,
    longestPause,
  }
}
