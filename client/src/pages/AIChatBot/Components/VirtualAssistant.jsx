import React, { useState } from 'react'
import { GoHomeFill } from 'react-icons/go'
import { Link } from 'react-router-dom'
import CircleWave from '../../../common/Components/CircleWave'
import GlowingVoiceRings from '../../../common/Components/GlowingRing'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useEffect } from 'react'

const VirtualAssistant = () => {
  const [userInput, setUserInput] = useState('')
  const [aiResponse, setaiResponse] = useState('')
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  console.log(userInput)

  // Creating mutation for posting userInput to the ai
  const { mutate, isSuccess, isError, error, data } = useMutation({
    mutationFn: async prompt => {
      const response = await axios.post(`${backendUrl}/user/text-to-text-gen`, prompt, {
        withCredentials: true,
      })
      return response.data
    },
  })

  useEffect(() => {
    if (userInput.toLocaleLowerCase().includes('hello')) {
      mutate({ prompt: userInput })
    }
  }, [userInput])

  useEffect(() => {
    if (isSuccess) {
      setaiResponse(data?.data?.ai?.response)
      console.log(data?.data?.ai?.response)
    }
    if (isError) {
      console.log(error)
    }
  }, [isSuccess, isError])

  const speak = text => {
    if (!text) return

    // Create a new speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.volume = 1
    utterance.pitch = 1
    utterance.rate = 1

    // Auto-detect Urdu or English
    const isUrdu = /[\u0600-\u06FF]/.test(text)
    utterance.lang = isUrdu ? 'ur-PK' : data?.data?.ai?.lang || 'en-US'

    // Cache for selected voices to maintain consistency
    if (!window.voiceCache) {
      window.voiceCache = {}
    }

    const loadVoicesAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices()

      if (!voices.length) {
        return setTimeout(loadVoicesAndSpeak, 100)
      }

      // Try to find a cached voice first
      if (window.voiceCache[utterance.lang]) {
        utterance.voice = window.voiceCache[utterance.lang]
      } else {
        // Find the best female voice for the language
        const femaleVoices = voices.filter(
          v => v.lang === utterance.lang && v.name.toLowerCase().includes('female')
        )

        // Selection priority:
        // 1. Google's female voice
        // 2. Any female voice in the language
        // 3. First available voice in the language
        const preferredVoice =
          voices.find(
            v =>
              v.lang === utterance.lang &&
              (v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('female'))
          ) ||
          femaleVoices[0] ||
          voices.find(v => v.lang === utterance.lang) ||
          voices[0]

        if (preferredVoice) {
          // Cache the selected voice for future use
          window.voiceCache[utterance.lang] = preferredVoice
          utterance.voice = preferredVoice
          console.log('Selected voice:', preferredVoice.name, 'for language:', utterance.lang)
        }
      }

      // Stop recognition before speaking
      const stopRecognition = () => {
        try {
          if (window.recognitionRef?.current && window.isRecognitionActiveRef?.current) {
            window.isRecognitionActiveRef.current = false
            window.recognitionRef.current.abort()
          }
        } catch (err) {
          console.warn('Failed to stop recognition before speaking:', err)
        }
      }

      stopRecognition()

      // Restart recognition after speech
      utterance.onend = () => {
        console.log('Speech finished. Trying to restart recognition...')
        const tryRestart = (attempt = 0) => {
          if (attempt > 3) return
          try {
            if (window.recognitionRef?.current && !window.isRecognitionActiveRef?.current) {
              window.recognitionRef.current.start()
              window.isRecognitionActiveRef.current = true
            }
          } catch (err) {
            setTimeout(() => tryRestart(attempt + 1), 500 * (attempt + 1))
          }
        }
        setTimeout(() => tryRestart(), 1000)
      }

      // Cancel any ongoing speech before starting new one
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    }

    // Ensure voices are loaded
    if (!window.speechSynthesis.getVoices().length) {
      window.speechSynthesis.onvoiceschanged = loadVoicesAndSpeak
    } else {
      loadVoicesAndSpeak()
    }
  }

  useEffect(() => {
    if (aiResponse) {
      speak(aiResponse)
    }
  }, [aiResponse])
  return (
    <div className="w-full h-screen flex items-center justify-center relative">
      <Link
        to={'/'}
        style={{ boxShadow: '0 0 20px #3f3eed, 0 0 5px inset #3f3eed, 0 0 15px inset #151a24' }}
        className="absolute left-5 top-5 md:w-[3vw] md:h-[3vw] sm:w-[5vw] sm:h-[7vw] xs:w-[9vw] xs:h-[9vw] flex items-center justify-center md:text-[1.3vw] sm:text-[2.3vw] xs:text-[4.8vw]  rounded-full cursor-pointer "
      >
        <GoHomeFill />
      </Link>
      <GlowingVoiceRings setUserInput={setUserInput} />
    </div>
  )
}

export default VirtualAssistant
