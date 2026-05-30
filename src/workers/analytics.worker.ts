// Analytics worker — sentiment scoring + buzzword matching off the main thread.
//
// Stateless: one committed utterance in, one {s, buzz} out. The main thread
// (useAnalytics) owns aggregation (counts, flash, derived stats).

import { afinn165 } from 'afinn-165'
import { BUZZWORDS } from '../lib/buzzwords'
import type { AnalyzeRequest, AnalyzeResult } from '../lib/types'

const LEX: Record<string, number> = afinn165

/** Mean of matched AFINN word scores, clamped to −5…+5. 0 when nothing matches. */
function scoreText(text: string): number {
  const words = text.toLowerCase().match(/[a-z']+/g)
  if (!words) return 0
  let sum = 0
  let n = 0
  for (const w of words) {
    const v = LEX[w]
    if (v !== undefined) {
      sum += v
      n++
    }
  }
  if (n === 0) return 0
  const avg = sum / n
  return Math.max(-5, Math.min(5, avg))
}

/** Buzzword phrases present verbatim (case-insensitive) in the text. */
function matchBuzz(text: string): string[] {
  const lower = text.toLowerCase()
  return BUZZWORDS.filter((phrase) => lower.includes(phrase.toLowerCase()))
}

self.onmessage = (ev: MessageEvent<AnalyzeRequest>) => {
  const { id, text } = ev.data
  const result: AnalyzeResult = { id, s: scoreText(text), buzz: matchBuzz(text) }
  self.postMessage(result)
}
