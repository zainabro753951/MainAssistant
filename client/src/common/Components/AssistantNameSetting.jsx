// AssistantNameSetting.jsx
import React, { useMemo } from 'react'
import { motion } from 'motion/react'

export default function AssistantNameSetting({
  AssistantImage,
  assistantName = '',
  setAssistantName,
  maxLength = 30,
}) {
  const charsLeft = useMemo(
    () => Math.max(0, maxLength - (assistantName?.length || 0)),
    [assistantName, maxLength]
  )

  return (
    <section className="w-full mt-8">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center md:text-[2rem] text-[1.5rem] font-exo-space font-semibold mb-6"
      >
        Name your{' '}
        <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-sky-300">
          AI assistant
        </span>
      </motion.h2>

      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-2xl bg-[rgba(10,15,25,0.55)] backdrop-blur-sm border border-[#12203b] p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 w-full md:w-44 md:h-56 rounded-xl overflow-hidden border border-white/6">
            <img
              src={AssistantImage}
              alt="Assistant preview"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="flex-1 min-w-0">
            <label htmlFor="assistant_name" className="text-xs text-white/60 block mb-2">
              Assistant Name
            </label>

            <div className="relative">
              <input
                id="assistant_name"
                type="text"
                value={assistantName}
                onChange={e => setAssistantName(e.target.value.slice(0, maxLength))}
                placeholder="E.g. Nova"
                className="w-full px-4 py-3 rounded-lg bg-[#081022] border border-[#1b2a44] text-white outline-none focus:ring-2 focus:ring-indigo-500 transition"
                aria-describedby="assistant-name-hint"
              />
              <div
                id="assistant-name-hint"
                className="absolute right-3 top-3 text-xs text-white/50"
                aria-hidden
              >
                {charsLeft} left
              </div>
            </div>

            <p className="mt-3 text-sm text-white/60">
              Pick a friendly name your audience will remember. Avoid special characters for better
              display.
            </p>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  // quick sample names to fill
                  const samples = ['Nova', 'Iris', 'Echo', 'Sol', 'Mira']
                  setAssistantName(samples[Math.floor(Math.random() * samples.length)])
                }}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 transition"
              >
                Random suggestion
              </button>

              <button
                type="button"
                onClick={() => {
                  setAssistantName('')
                }}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 transition"
              >
                Clear
              </button>

              <div className="ml-auto text-sm text-white/60">Preview will update live</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
