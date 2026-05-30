// Real microphone capture — the production replacement for the demo mic layer.
//
// Owns the full getUserMedia lifecycle: permission, MediaStream, AudioContext,
// and an AnalyserNode. Exposes a level reader the LevelMeter polls on its own
// RAF loop (no per-frame React state) and a real elapsed-recording timer.
//
// Transcription/sentiment still come from useDemoStream; this hook only handles
// capture + the level meter, and runs as an independent lifecycle.

import { useCallback, useEffect, useRef, useState } from 'react'

/** Where the mic currently is in its lifecycle. */
export type MicStatus =
  | 'idle' // not yet started, or stopped cleanly
  | 'requesting' // getUserMedia prompt in flight
  | 'recording' // capturing live audio
  | 'denied' // user blocked the mic (NotAllowedError)
  | 'no-device' // no input device present (NotFoundError)
  | 'unsupported' // browser has no getUserMedia
  | 'error' // anything else

export interface Microphone {
  status: MicStatus
  /** Convenience flag: status === 'recording'. */
  active: boolean
  /** Real elapsed recording seconds. */
  recSec: number
  /** Start if idle/stopped, stop if recording. */
  toggle: () => void
  /** Human-readable detail for the error states (null otherwise). */
  errorMsg: string | null
  /** Smoothed 0..1 RMS of the current frame. Safe to call every animation frame. */
  getLevel: () => number
}

const supported = () =>
  typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

export function useMicrophone(): Microphone {
  const [status, setStatus] = useState<MicStatus>(() => (supported() ? 'idle' : 'unsupported'))
  const [recSec, setRecSec] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Audio graph lives in refs — none of it should trigger re-renders.
  const streamRef = useRef<MediaStream | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const bufRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const levelRef = useRef(0) // smoothed RMS, persists across frames

  const teardown = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    analyserRef.current = null
    bufRef.current = null
    levelRef.current = 0
    const ctx = ctxRef.current
    ctxRef.current = null
    // close() may reject if already closed during a fast stop/unmount — ignore.
    ctx?.close().catch(() => {})
  }, [])

  const stop = useCallback(() => {
    teardown()
    setStatus('idle')
  }, [teardown])

  const start = useCallback(async () => {
    if (!supported()) {
      setStatus('unsupported')
      return
    }
    setErrorMsg(null)
    setStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new Ctx()
      ctxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.6
      source.connect(analyser)
      analyserRef.current = analyser
      bufRef.current = new Uint8Array(analyser.fftSize)

      setRecSec(0)
      setStatus('recording')
    } catch (err) {
      teardown()
      const name = err instanceof DOMException ? err.name : ''
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setStatus('denied')
        setErrorMsg('Microphone access blocked')
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setStatus('no-device')
        setErrorMsg('No microphone found')
      } else {
        setStatus('error')
        setErrorMsg(err instanceof Error ? err.message : 'Could not start microphone')
      }
    }
  }, [teardown])

  const toggle = useCallback(() => {
    if (status === 'recording') stop()
    else if (status !== 'requesting' && status !== 'unsupported') void start()
  }, [status, start, stop])

  // Real recording timer — ticks only while capturing.
  useEffect(() => {
    if (status !== 'recording') return
    const id = setInterval(() => setRecSec((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [status])

  // Release the device when the component tree unmounts.
  useEffect(() => teardown, [teardown])

  const getLevel = useCallback(() => {
    const analyser = analyserRef.current
    const buf = bufRef.current
    if (!analyser || !buf) return 0
    analyser.getByteTimeDomainData(buf)
    // RMS of the 128-centered waveform → 0..1.
    let sum = 0
    for (let i = 0; i < buf.length; i++) {
      const v = (buf[i] - 128) / 128
      sum += v * v
    }
    const rms = Math.sqrt(sum / buf.length)
    // Lift quiet speech into a visible range, then smooth.
    const target = Math.min(1, rms * 3.2)
    levelRef.current += (target - levelRef.current) * 0.3
    return levelRef.current
  }, [])

  return {
    status,
    active: status === 'recording',
    recSec,
    toggle,
    errorMsg,
    getLevel,
  }
}
