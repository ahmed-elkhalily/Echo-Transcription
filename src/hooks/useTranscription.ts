// Real speech-to-text via the Web Speech API.
//
// Produces the committed utterances + live partial that TranscriptFeed renders,
// replacing the demo transcript. Recognition is driven by the mic's recording
// state: when `active` flips true it starts, false it stops. Web Speech runs its
// own audio capture (independent of useMicrophone's AnalyserNode).
//
// Sentiment scoring and buzzword detection are out of scope here — every
// committed line lands with s = 0 until the scorer/worker increment.

import { useEffect, useRef, useState } from 'react'
import type { Utterance } from '../lib/types'

export interface Transcription {
  /** False on Safari/Firefox — the API is Chrome/Edge only. */
  supported: boolean
  /** Final, committed lines. */
  utterances: Utterance[]
  /** In-progress interim text, or null when idle/between phrases. */
  partial: string | null
}

const SR: SpeechRecognitionConstructor | undefined =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined

/**
 * @param active     mirror of the mic recording state — drives start/stop
 * @param getElapsed returns session seconds, used to timestamp committed lines
 */
export function useTranscription(active: boolean, getElapsed: () => number): Transcription {
  const supported = !!SR
  const [utterances, setUtterances] = useState<Utterance[]>([])
  const [partial, setPartial] = useState<string | null>(null)

  // Latest getElapsed without re-arming the start/stop effect.
  const elapsedRef = useRef(getElapsed)
  elapsedRef.current = getElapsed

  const recRef = useRef<SpeechRecognition | null>(null)
  const idRef = useRef(0)
  // Distinguishes a Chrome auto-stop (restart) from a user stop (stay down).
  const wantOnRef = useRef(false)

  useEffect(() => {
    if (!supported || !active) return

    const rec = new SR!()
    recRef.current = rec
    wantOnRef.current = true
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'

    rec.onresult = (ev) => {
      let interim = ''
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const result = ev.results[i]
        const text = result[0].transcript
        if (result.isFinal) {
          const trimmed = text.trim()
          if (trimmed) {
            const t = elapsedRef.current()
            setUtterances((prev) => [...prev, { id: 'tx' + idRef.current++, t, s: 0, text: trimmed }])
          }
        } else {
          interim += text
        }
      }
      setPartial(interim.trim() || null)
    }

    // Chrome ends recognition on silence; restart while the user still wants it.
    rec.onend = () => {
      if (wantOnRef.current) {
        try {
          rec.start()
        } catch {
          // start() throws if called too soon after end — onend will fire again.
        }
      }
    }

    rec.onerror = (ev) => {
      // Transient/expected: keep going (onend handles restart). Others: stay down.
      if (ev.error !== 'no-speech' && ev.error !== 'aborted') {
        wantOnRef.current = false
      }
    }

    try {
      rec.start()
    } catch {
      // already started — ignore
    }

    return () => {
      wantOnRef.current = false
      rec.onresult = null
      rec.onend = null
      rec.onerror = null
      rec.stop()
      recRef.current = null
      setPartial(null)
    }
  }, [active, supported])

  return { supported, utterances, partial }
}
