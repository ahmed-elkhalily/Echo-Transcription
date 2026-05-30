// Transcript text helpers: buzzword tokenization + word counting.

/** A span of an utterance; `buzz: true` marks a matched buzzword for highlight. */
export interface BuzzPart {
  t: string
  buzz?: boolean
}

/**
 * Split an utterance into spans, flagging buzzword phrases for highlight.
 * Matching is case-insensitive but preserves the original casing in the output.
 */
export function tokenizeBuzz(text: string, buzz?: string[]): BuzzPart[] {
  if (!buzz || !buzz.length) return [{ t: text }]
  let parts: BuzzPart[] = [{ t: text }]
  buzz.forEach((phrase) => {
    const next: BuzzPart[] = []
    parts.forEach((p) => {
      if (p.buzz) {
        next.push(p)
        return
      }
      const lower = p.t.toLowerCase()
      const idx = lower.indexOf(phrase.toLowerCase())
      if (idx === -1) {
        next.push(p)
        return
      }
      if (idx > 0) next.push({ t: p.t.slice(0, idx) })
      next.push({ t: p.t.slice(idx, idx + phrase.length), buzz: true })
      const rest = p.t.slice(idx + phrase.length)
      if (rest) next.push({ t: rest })
    })
    parts = next
  })
  return parts
}

/** Count whitespace-delimited words in a string. */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}
