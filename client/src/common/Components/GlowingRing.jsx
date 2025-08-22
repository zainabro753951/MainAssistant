// GlowingVoiceRings.jsx
import React, { useRef, useEffect, useState } from 'react'
import { FiMic, FiMicOff, FiCopy } from 'react-icons/fi'

/**
 * Fixed GlowingVoiceRings:
 * - UI kept the same (glassmorphic card + canvas + controls)
 * - Speech recognition auto-restart only on desktop (mobile requires manual restart)
 * - Exposes window.recognitionRef and window.isRecognitionActiveRef as before
 *
 * Props:
 *  - setUserInput(transcript)  // called on final recognition
 */

const GlowingVoiceRings = ({ setUserInput }) => {
  const wrapperRef = useRef(null)
  const canvasRef = useRef(null)
  const analyserRef = useRef(null)
  const dataArrayRef = useRef(null)

  // recognition refs & state
  const recognitionRef = useRef(null) // holds the SpeechRecognition instance
  const isRunningRef = useRef(false) // true while recognition is running
  const intentionalStopRef = useRef(false) // true when we intentionally stop/abort
  const restartTimeoutRef = useRef(null)

  const [isListening, setIsListening] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [lastTranscript, setLastTranscript] = useState('')

  // Helper: detect mobile devices (used to disable auto-restart on mobile)
  const isMobileDevice = () => /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  /* -------------------------
     Audio analyser setup
     ------------------------- */
  const setupAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      // console.log(audioCtx.state)

      // mobile Safari/Chrome may start suspended; resume on user gesture
      if (audioCtx.state === 'suspended') {
        try {
          await audioCtx.resume()
        } catch (e) {
          // ignore resume errors
        }
      }

      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256

      // Safe connection: source -> analyser only (don't connect analyser to destination)
      source.connect(analyser)

      analyserRef.current = analyser
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
    } catch (err) {
      console.warn('Audio setup failed / permission denied:', err)
      analyserRef.current = null
      dataArrayRef.current = null
    }
  }

  const computeAudioLevelSafe = () => {
    try {
      const analyser = analyserRef.current
      const dataArray = dataArrayRef.current
      if (!analyser || !dataArray) return 0
      analyser.getByteFrequencyData(dataArray)
      let sum = 0
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i]
      const avg = sum / dataArray.length
      return Math.min(1, Math.max(0, avg / 128))
    } catch {
      return 0
    }
  }

  /* -------------------------
     Canvas drawing (keeps UI)
     ------------------------- */
  useEffect(() => {
    let raf = null
    let tick = 0
    const segments = 220
    const rings = [
      { baseRadius: 40, hueOffset: 0, noiseFactor: 5 },
      { baseRadius: 76, hueOffset: 110, noiseFactor: 9 },
      { baseRadius: 110, hueOffset: 220, noiseFactor: 14 },
    ]

    const resizeCanvas = () => {
      const canvas = canvasRef.current
      const parent = wrapperRef.current
      if (!canvas || !parent) return
      const dpr = window.devicePixelRatio || 1
      const rect = parent.getBoundingClientRect()
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = () => {
      const canvas = canvasRef.current
      const parent = wrapperRef.current
      if (!canvas || !parent) {
        raf = requestAnimationFrame(draw)
        return
      }
      const ctx = canvas.getContext('2d')
      const rect = parent.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)
      const cx = rect.width / 2
      const cy = rect.height / 2
      ctx.save()
      ctx.translate(cx, cy)

      const level = computeAudioLevelSafe()
      setAudioLevel(level)

      rings.forEach((ring, rIdx) => {
        const radius = ring.baseRadius + (rect.width < 560 ? -8 : 0)
        const hue = (tick * 0.6 + ring.hueOffset) % 360
        const gradient = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius * 2)
        gradient.addColorStop(0, `hsla(${hue}, 92%, 60%, ${0.07 + rIdx * 0.03})`)
        gradient.addColorStop(1, `hsla(${(hue + 100) % 360}, 92%, 54%, ${0.85 - rIdx * 0.18})`)

        ctx.beginPath()
        for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI * 2
          const pulse = Math.sin(angle * (3 + rIdx * 0.6) + tick * 0.02) * ring.noiseFactor
          const dynamic = pulse * level * (3 + rIdx * 1.2)
          const r = radius + dynamic
          const x = Math.cos(angle) * r
          const y = Math.sin(angle) * r
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.strokeStyle = gradient
        ctx.shadowColor = `hsla(${hue}, 92%, 70%, 0.9)`
        ctx.shadowBlur = 16
        ctx.lineWidth = Math.max(1, 2 - rIdx * 0.3)
        ctx.stroke()
      })

      // center glow
      ctx.beginPath()
      const centerR = 14 + Math.sin(tick * 0.06) * 2 * Math.max(0.4, level)
      ctx.arc(0, 0, centerR, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(63,62,237,${0.06 + level * 0.18})`
      ctx.fill()

      // particles
      const particleCount = rect.width < 560 ? 18 : 36
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + tick * 0.007 * (i % 3 ? 1 : -1)
        const orbit = 92 + Math.sin(tick * 0.01 + i) * 12 * level
        const x = Math.cos(angle) * orbit
        const y = Math.sin(angle) * orbit
        ctx.beginPath()
        ctx.arc(x, y, 1 + (i % 3 ? 0 : 0.6), 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${(tick + i * 9) % 360}, 90%, 80%, ${0.55 - i / particleCount / 2})`
        ctx.fill()
      }

      ctx.restore()
      tick++
      raf = requestAnimationFrame(draw)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    raf = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  /* -------------------------
     Speech recognition lifecycle
     ------------------------- */
  const createRecognitionInstance = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return null
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = navigator.language || 'en-US'
    return recognition
  }

  const startRecognition = async () => {
    // ensure analyser present (permission)
    if (!analyserRef.current) await setupAudio()

    // If an instance exists and is already running, don't start again
    const existing = recognitionRef.current
    if (existing && isRunningRef.current) {
      return
    }

    // if instance exists but not running, try to start it
    if (existing && !isRunningRef.current) {
      intentionalStopRef.current = false
      try {
        existing.start()
        isRunningRef.current = true
        setIsListening(true)
        window.isRecognitionActiveRef = isRunningRef
        return
      } catch (err) {
        // failed starting existing instance: we'll recreate below
        try {
          existing.onresult = null
          existing.onerror = null
          existing.onend = null
        } catch {}
        recognitionRef.current = null
      }
    }

    // create new one
    const recognition = createRecognitionInstance()
    if (!recognition) {
      console.warn('SpeechRecognition not supported')
      return
    }

    // handlers
    recognition.onstart = () => {
      isRunningRef.current = true
      intentionalStopRef.current = false
      setIsListening(true)
      window.isRecognitionActiveRef = isRunningRef
    }

    recognition.onend = () => {
      // only restart if we did not intentionally stop
      isRunningRef.current = false
      setIsListening(false)
      if (intentionalStopRef.current) {
        // intentional stop: do nothing
        return
      }

      // Auto-restart only on desktop (mobile requires manual restart)
      if (!isMobileDevice()) {
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current)
        restartTimeoutRef.current = setTimeout(() => {
          try {
            if (recognitionRef.current) {
              recognitionRef.current.start()
              isRunningRef.current = true
              setIsListening(true)
            } else {
              // create fresh instance
              startRecognition()
            }
          } catch (err) {
            // fallback: create new instance
            recognitionRef.current = null
            startRecognition()
          }
        }, 900)
      }
    }

    recognition.onerror = evt => {
      // treat 'aborted' and permission errors as intentional/no-restart situations
      const err = evt?.error
      if (err === 'aborted' || err === 'not-allowed' || err === 'service-not-allowed') {
        // if we intentionally aborted, do nothing
        isRunningRef.current = false
        setIsListening(false)
        recognitionRef.current = null
        intentionalStopRef.current = false
        return
      }
      // for other errors, attempt to restart gracefully (desktop only)
      console.warn('Speech recognition error:', err)
      isRunningRef.current = false
      setIsListening(false)
      if (!isMobileDevice()) {
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current)
        restartTimeoutRef.current = setTimeout(() => {
          try {
            // try restart same instance
            recognition.start()
            isRunningRef.current = true
            setIsListening(true)
          } catch (e) {
            // replace instance
            recognitionRef.current = null
            startRecognition()
          }
        }, 1000)
      }
    }

    recognition.onresult = event => {
      const last = event?.results?.[event.results.length - 1]
      if (!last) return
      const transcript = last[0]?.transcript?.trim()
      if (last.isFinal && transcript) {
        setLastTranscript(transcript)
        if (typeof setUserInput === 'function') setUserInput(transcript)
      }
    }

    // assign and start
    recognitionRef.current = recognition
    window.recognitionRef = recognitionRef
    window.isRecognitionActiveRef = isRunningRef

    intentionalStopRef.current = false
    try {
      recognition.start()
    } catch (err) {
      // second attempt after tiny delay
      setTimeout(() => {
        try {
          recognition.start()
        } catch (e) {
          console.warn('Failed to start recognition', e)
          recognitionRef.current = null
        }
      }, 700)
    }
  }

  const stopRecognition = () => {
    intentionalStopRef.current = true
    try {
      if (recognitionRef.current && typeof recognitionRef.current.stop === 'function') {
        recognitionRef.current.stop()
      }
    } catch (err) {
      console.warn('stopRecognition error', err)
      try {
        recognitionRef.current && recognitionRef.current.abort && recognitionRef.current.abort()
      } catch {}
    }
    isRunningRef.current = false
    setIsListening(false)
    // do not clear recognitionRef here — leave nulling to further logic only if needed
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }
  }

  /* keep audio level updating for meter */
  useEffect(() => {
    const iv = setInterval(() => {
      setAudioLevel(computeAudioLevelSafe())
    }, 80)
    return () => clearInterval(iv)
  }, [])

  /* init audio & recognition on mount (preserve auto-start behavior) */
  useEffect(() => {
    setupAudio()
    // auto start recognition, but wrapped in try/catch
    try {
      startRecognition()
    } catch (err) {
      console.warn('Auto start recognition failed', err)
    }

    // expose for other modules
    window.recognitionRef = recognitionRef
    window.isRecognitionActiveRef = isRunningRef

    return () => {
      intentionalStopRef.current = true
      try {
        stopRecognition()
      } catch (e) {}
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
      isRunningRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCopy = async () => {
    try {
      if (!lastTranscript) return
      await navigator.clipboard.writeText(lastTranscript)
    } catch (e) {
      console.warn('copy failed', e)
    }
  }

  return (
    <div className="relative w-full flex items-center justify-center p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-600/28 blur-3xl" />
        <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-fuchsia-500/18 blur-3xl" />
      </div>

      <div
        ref={wrapperRef}
        className="relative w-full max-w-4xl rounded-2xl bg-[rgba(10,15,25,0.55)] backdrop-blur-sm border border-[#12203b] shadow-2xl overflow-hidden"
        style={{ minHeight: 320 }}
      >
        <div className="w-full h-64 md:h-80 lg:h-96">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>

        <div className="absolute left-4 right-4 bottom-4 flex items-center gap-3">
          <button
            onClick={() => (isListening ? stopRecognition() : startRecognition())}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
              isListening
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white/5 text-white/90 hover:bg-white/10'
            }`}
            title={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? <FiMicOff /> : <FiMic />}
            <span className="hidden sm:inline">{isListening ? 'Listening' : 'Tap to speak'}</span>
          </button>

          <div className="flex-1 min-w-[120px]">
            <div className="text-xs text-white/60 mb-1">Input level</div>
            <div className="w-full bg-white/4 rounded h-2 overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-indigo-500 to-sky-400 transition-all"
                style={{ width: `${Math.round(audioLevel * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:block text-xs text-white/60 max-w-xs truncate">
              {lastTranscript || 'Say something to create a transcript'}
            </div>
            <button
              onClick={handleCopy}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80"
              title="Copy last transcript"
            >
              <FiCopy />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlowingVoiceRings
