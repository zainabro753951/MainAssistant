// AssistantImageSetting.jsx
import React, { useCallback, useEffect, useId, useRef } from 'react'
import { motion } from 'motion/react'

const DEFAULT_IMAGES = [
  '/images/AI Assistant/image1.png',
  '/images/AI Assistant/image2.jpg',
  '/images/AI Assistant/image4.png',
  '/images/AI Assistant/image5.png',
  '/images/AI Assistant/image6.jpeg',
  '/images/AI Assistant/image7.jpeg',
]

export default function AssistantImageSetting({
  AssistantImage,
  setAssistantImage,
  selectedImageIndex,
  setSelectedImageIndex,
  images = DEFAULT_IMAGES,
}) {
  const uid = useId()
  const gridRef = useRef(null)

  // select by index (safe)
  const handleSelect = useCallback(
    idx => {
      if (idx < 0 || idx >= images.length) return
      setAssistantImage(images[idx])
      setSelectedImageIndex(idx)
      // focus the selected button for accessibility
      const btn = gridRef.current?.querySelector(`[data-idx="${idx}"]`)
      btn?.focus()
    },
    [images, setAssistantImage, setSelectedImageIndex]
  )

  // keyboard navigation (arrow keys)
  useEffect(() => {
    const root = gridRef.current
    if (!root) return
    const handleKey = e => {
      const active = document.activeElement
      const isInside = root.contains(active)
      if (!isInside) return
      if (!active.dataset?.idx) return
      const idx = Number(active.dataset.idx)
      let next
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          next = (idx + 1) % images.length
          e.preventDefault()
          handleSelect(next)
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          next = (idx - 1 + images.length) % images.length
          e.preventDefault()
          handleSelect(next)
          break
        case 'Home':
          e.preventDefault()
          handleSelect(0)
          break
        case 'End':
          e.preventDefault()
          handleSelect(images.length - 1)
          break
        default:
          break
      }
    }
    root.addEventListener('keydown', handleKey)
    return () => root.removeEventListener('keydown', handleKey)
  }, [images.length, handleSelect])

  return (
    <section className="w-full">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center md:text-[2rem] text-[1.5rem] font-exo-space font-semibold mb-6"
      >
        Choose a profile image for your{' '}
        <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-sky-300">
          AI assistant
        </span>
      </motion.h2>

      <div
        ref={gridRef}
        role="list"
        aria-label="Assistant images"
        className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mx-auto max-w-6xl px-4"
      >
        {images.map((src, idx) => {
          const isSelected = idx === selectedImageIndex
          return (
            <motion.button
              key={src + idx}
              data-idx={idx}
              role="listitem"
              aria-pressed={isSelected}
              onClick={() => handleSelect(idx)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSelect(idx)
                }
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              whileHover={{ scale: 1.03 }}
              className={`relative rounded-2xl overflow-hidden focus:outline-none focus:ring-4 focus:ring-indigo-400/40 transition transform bg-[rgba(255,255,255,0.02)]
                ${isSelected ? 'ring-4 ring-offset-2 ring-indigo-400/40' : 'ring-0'}
                `}
              style={{ aspectRatio: '4/5' }}
            >
              {/* image */}
              <img
                src={src}
                alt={`Assistant option ${idx + 1}`}
                loading="lazy"
                className="w-full h-full object-cover object-top"
                draggable={false}
              />

              {/* selected overlay */}
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-0 transition-opacity ${
                  isSelected ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  background: 'linear-gradient(180deg, rgba(63,62,237,0.08), rgba(15,17,38,0.15))',
                }}
              />

              {/* selection badge */}
              <div className="absolute left-3 top-3">
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-white/6 text-white/70'
                  }`}
                >
                  {isSelected ? 'Selected' : `Option ${idx + 1}`}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* preview area */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 mx-auto max-w-4xl px-4"
      >
        <div className="rounded-2xl bg-[rgba(10,15,25,0.55)] backdrop-blur-sm border border-[#12203b] p-4 flex items-center gap-4">
          <div className="w-28 h-36 rounded-xl overflow-hidden flex-shrink-0 border border-white/6">
            <img
              src={AssistantImage || images[0]}
              alt="Selected assistant preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm text-white/60">Preview</div>
            <div className="mt-1 font-semibold text-white truncate">
              {`Assistant ${selectedImageIndex != null ? selectedImageIndex + 1 : 1}`}
            </div>
            <div className="text-xs text-white/60 mt-2">
              Tip: You can navigate using{' '}
              <kbd className="px-1 py-0.5 rounded bg-white/6 text-xs">←</kbd>{' '}
              <kbd className="px-1 py-0.5 rounded bg-white/6 text-xs">→</kbd> keys and press{' '}
              <kbd className="px-1 py-0.5 rounded bg-white/6 text-xs">Enter</kbd> to select.
            </div>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={() =>
                navigator.clipboard
                  .writeText(AssistantImage || images[selectedImageIndex || 0])
                  .then(() => {
                    // small inline feedback
                    const el = document.createElement('div')
                    el.textContent = 'Copied'
                    el.style.position = 'fixed'
                    el.style.right = '18px'
                    el.style.bottom = '18px'
                    el.style.padding = '8px 12px'
                    el.style.borderRadius = '999px'
                    el.style.background = 'rgba(17,24,39,0.95)'
                    el.style.color = 'white'
                    el.style.boxShadow = '0 6px 20px rgba(63,62,237,0.12)'
                    document.body.appendChild(el)
                    setTimeout(() => el.remove(), 1100)
                  })
              }
              className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
            >
              Copy URL
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
