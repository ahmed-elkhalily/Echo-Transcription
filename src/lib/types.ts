// Shared domain types for the Echo dashboard.

/** A single committed line of transcript with its sentiment score. */
export interface Utterance {
  id: string
  /** Seconds into the session when this line landed. */
  t: number
  /** Sentiment score on a −5…+5 band. */
  s: number
  text: string
  /** Buzzword phrases matched verbatim within `text` (lowercased match). */
  buzz?: string[]
}

/** A past or active recording session shown in the switcher. */
export interface Session {
  id: string
  name: string
  date: string
  active?: boolean
  /** Tiny sentiment sequence for the inline sparkline preview. */
  spark: number[]
}

/** Match counts keyed by buzzword phrase. */
export type BuzzCounts = Record<string, number>
