// QuestionsSection.jsx
import React, { useState, useMemo, useId } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { FaPlus, FaMinus } from 'react-icons/fa'
import { FiCopy, FiSearch } from 'react-icons/fi'

const QUESTIONS = [
  {
    question: 'What is Openup Content Writing Tool?',
    ans: 'Once you know your audience, choose a topic that will resonate with them. Look for trending topics in your industry or address common questions or challenges your audience may be facing.',
  },
  {
    question: 'How do I start a new project?',
    ans: 'Click "Create New" in the repositories area, pick a template (or empty repo), and add your files. Use the upload or editor to add content quickly.',
  },
  {
    question: 'Is my data private?',
    ans: 'Yes — we provide private repos that are visible only to you (or teams you invite). For public sharing use the share link generated per folder or file.',
  },
  {
    question: 'How does AI suggestions work?',
    ans: 'AI suggestions appear per-file as inline suggestions. Click a suggested block to preview and accept changes. Suggestions are cached to improve speed.',
  },
  {
    question: 'How do I delete a repository?',
    ans: 'Open repo settings, click Delete Repository and confirm by typing DELETE. Deletion is permanent — please export anything important first.',
  },
]

export default function QuestionsSection() {
  const [openIndex, setOpenIndex] = useState(0)
  const [query, setQuery] = useState('')
  const uid = useId()

  const filtered = useMemo(() => {
    if (!query.trim()) return QUESTIONS
    const q = query.toLowerCase()
    return QUESTIONS.filter(
      item => item.question.toLowerCase().includes(q) || item.ans.toLowerCase().includes(q)
    )
  }, [query])

  const toggleFAQ = index => {
    setOpenIndex(prev => (prev === index ? null : index))
  }

  const handleCopy = async text => {
    try {
      await navigator.clipboard.writeText(text)
      // small ephemeral toast
      const el = document.createElement('div')
      el.textContent = 'Copied'
      Object.assign(el.style, {
        position: 'fixed',
        right: '18px',
        bottom: '18px',
        zIndex: 9999,
        padding: '8px 12px',
        borderRadius: '999px',
        background: 'rgba(17,24,39,0.95)',
        color: 'white',
        boxShadow: '0 6px 20px rgba(63,62,237,0.12)',
        fontSize: '13px',
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI"',
      })
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 1100)
    } catch {
      // copy fail: ignore
    }
  }

  return (
    <div className="relative w-full h-full xs:px-3 md:px-6 overflow-auto sidebar-scrollbar md:py-[50px] sm:py-[40px] xs:py-[30px]">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-36 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-28 -right-36 h-96 w-96 rounded-full bg-fuchsia-500/12 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1100px] min-h-screen py-[4.5vw]">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-6 px-4"
        >
          <div className="mx-auto mb-4 w-fit rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs tracking-wide text-white/80">
            FAQ • Help Center
          </div>

          <h2 className="text-[3.3vw] md:text-[2.6vw] lg:text-[2.1vw] font-grotesk-space font-bold text-white leading-tight">
            Questions about OpenUp? We’ve got answers.
          </h2>

          <p className="mt-3 text-[1.1vw] md:text-[0.95vw] text-white/70 max-w-2xl mx-auto">
            If you don’t find what you’re looking for, reach out — we’re happy to help.
          </p>
        </motion.div>

        {/* search + controls */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.36 }}
          className="flex items-center gap-3 max-w-2xl mx-auto mb-6 px-4"
        >
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
              <FiSearch />
            </span>
            <input
              aria-label="Search FAQs"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search questions, keywords or topics..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgba(10,15,25,0.55)] border border-[#12203b] text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <button
            onClick={() => {
              setQuery('')
              setOpenIndex(0)
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
          >
            Reset
          </button>
        </motion.div>

        {/* grid content: left list (scrollable) + right help panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
          {/* left list column - make scrollable with safe max height */}
          <motion.div initial="hidden" animate="visible" className="space-y-3">
            <AnimatePresence initial={false}>
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[#12203b] p-6 text-center text-white/60"
                >
                  No results. Try different keywords.
                </motion.div>
              ) : (
                filtered.map((item, idx) => {
                  const isOpen = openIndex === idx
                  const itemId = `${uid}-faq-${idx}`
                  return (
                    <motion.div
                      key={`${item.question}-${idx}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[#12203b] overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-3 cursor-pointer">
                        <button
                          aria-controls={itemId}
                          aria-expanded={!!isOpen}
                          onClick={() => toggleFAQ(idx)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              toggleFAQ(idx)
                            }
                          }}
                          className="flex-1 text-left flex items-center gap-3 focus:outline-none"
                        >
                          <div className="w-12 h-12 flex items-center justify-center rounded bg-[rgba(255,255,255,0.03)] border border-[#1f2b44] shrink-0">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                                isOpen
                                  ? 'bg-indigo-500 text-white rotate-45'
                                  : 'bg-white/5 text-white/80'
                              }`}
                              aria-hidden
                            >
                              <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M12 5v14M5 12h14" />
                              </svg>
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div className="font-semibold text-sm md:text-base text-white truncate">
                              {item.question}
                            </div>
                            <div className="text-xs text-white/60 mt-1 hidden md:block">
                              {item.ans.slice(0, 88)}
                              {item.ans.length > 88 ? '…' : ''}
                            </div>
                          </div>
                        </button>

                        <div className="flex items-center gap-2 ml-3">
                          <button
                            onClick={() => handleCopy(item.question + ' — ' + item.ans)}
                            title="Copy question & answer"
                            className="p-2 rounded-md bg-white/5 hover:bg-white/10 text-white/80 transition"
                          >
                            <FiCopy />
                          </button>

                          <motion.button
                            aria-label={isOpen ? 'Collapse' : 'Expand'}
                            onClick={() => toggleFAQ(idx)}
                            className="p-2 rounded-md bg-white/5 hover:bg-white/10 text-white/80 transition"
                            whileTap={{ scale: 0.96 }}
                          >
                            <motion.span
                              animate={{ rotate: isOpen ? 45 : 0 }}
                              transition={{ duration: 0.25 }}
                              className="inline-block"
                            >
                              {isOpen ? <FaMinus /> : <FaPlus />}
                            </motion.span>
                          </motion.button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.section
                            id={itemId}
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div className="px-4 pb-4 pt-2 text-[1.02vw] md:text-sm text-white/80">
                              {item.ans}
                            </div>
                          </motion.section>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </motion.div>

          {/* right column — extra help / tips (keeps small height and scroll within) */}
          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[#12203b] p-6"
            style={{ maxHeight: 'calc(100vh - 28vh)', overflow: 'auto' }}
          >
            <h4 className="text-sm text-indigo-200 font-semibold mb-3">Need more help?</h4>
            <p className="text-white/70 text-sm mb-4">
              If your question isn't answered here you can:
            </p>

            <ul className="space-y-3 text-sm text-white/70">
              <li>• Open a support ticket via the Help page.</li>
              <li>• Join our Discord for live community support.</li>
              <li>
                • Email us at <span className="text-indigo-300">support@intellectai.example</span>
              </li>
            </ul>

            <div className="mt-6">
              <button className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                Contact Support
              </button>
            </div>

            <div className="mt-6 text-xs text-white/60">
              Tip: use the search above (try keywords like “template”, “delete”, “privacy”).
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  )
}
