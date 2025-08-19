import React, { useRef, useEffect, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { motion } from 'motion/react'

const CodeViewer = ({ code, language, loading, filename = 'file' }) => {
  const codeRef = useRef()
  const [copied, setCopied] = useState(false)
  const [activeLine, setActiveLine] = useState(null)
  const [activeTab, setActiveTab] = useState('code') // 'code' or 'suggestions'

  const copyToClipboard = () => {
    if (!codeRef.current) return
    const fullText =
      activeTab === 'code'
        ? code.map(lineObj => lineObj.line).join('\n')
        : code
            .flatMap((lineObj, i) =>
              lineObj.suggestions.map(
                s => `Line ${i + 1}: ${s.suggestion}\n   Reason: ${s.comment}`
              )
            )
            .join('\n\n')

    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  useEffect(() => {
    if (codeRef.current) codeRef.current.scrollTop = 0
  }, [code, activeTab])

  const renderCodeView = () => (
    <SyntaxHighlighter
      language={language}
      style={vscDarkPlus}
      showLineNumbers
      wrapLines
      lineProps={lineNumber => ({
        className: `code-line ${
          code[lineNumber - 1]?.suggestions?.length ? 'has-suggestions' : ''
        } ${activeLine === lineNumber ? 'active-line' : ''}`,
        onClick: () => {
          if (code[lineNumber - 1]?.suggestions?.length) {
            setActiveLine(activeLine === lineNumber ? null : lineNumber)
            setActiveTab('suggestions')
          }
        },
      })}
      customStyle={{
        backgroundColor: '#0f1626',
        padding: '1vw',
        borderRadius: '1rem',
        fontFamily: '"Fira Code", monospace',
        fontSize: '0.95rem',
        minHeight: '60vh',
        margin: 0,
      }}
      lineNumberStyle={{
        color: '#6e7681',
        minWidth: '2.5em',
        paddingRight: '1em',
        userSelect: 'none',
      }}
    >
      {code.map(l => l.line).join('\n') || '// No code to display'}
    </SyntaxHighlighter>
  )

  const renderSuggestionsView = () => (
    <div className="suggestions-view space-y-4">
      {code.flatMap((lineObj, index) =>
        lineObj.suggestions.map((suggestion, sIndex) => {
          const match = suggestion?.suggestion?.match(/^```(\w+)/)
          const detectedLang = match ? match[1] : language || 'plaintext'
          const cleanCode = suggestion?.suggestion?.replace(/^```[a-z]*\s*|\s*```$/gi, '')

          return (
            <div
              key={`${index}-${sIndex}`}
              className="suggestion-item rounded-md overflow-hidden shadow-sm"
            >
              <div className="suggestion-header flex items-center justify-between md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.5vw] sm:py-[1vw] xs:py-[1.5vw] bg-[#15162a]">
                <span className="md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-white/80">
                  Line {index + 1}
                </span>
                <span className="md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-indigo-300">
                  Suggestion
                </span>
              </div>

              <div className="md:p-[1vw] sm:p-[1.5vw] xs:p-[2vw] bg-[#0f1626]">
                <SyntaxHighlighter
                  language={detectedLang}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '0.5rem',
                    background: '#0e1220',
                    borderRadius: '0.25rem',
                    fontSize: '0.85rem',
                  }}
                >
                  {cleanCode}
                </SyntaxHighlighter>

                <div className="mt-2 md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-white/70">
                  <strong>Reason:</strong> {suggestion.comment}
                </div>
              </div>
            </div>
          )
        })
      )}

      {code.every(line => line.suggestions.length === 0) && (
        <div className="no-suggestions md:p-[1.8vw] sm:p-[2.3vw] xs:p-[2.8vw] text-center text-white/60">
          No suggestions available
        </div>
      )}
    </div>
  )

  return (
    <div className="code-editor-container w-full">
      <div className="editor-header flex items-center justify-between md:mb-[1.3vw] sm:mb-[1.8vw] xs:mb-[2.3vw]">
        <div className="editor-tabs flex items-center md:gap-[1vw] sm:gap-[1.5vw] xs:gap-[2vw]">
          <button
            className={`tab md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.3vw] sm:py-[0.8vw] xs:py-[1.3vw] md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] md:rounded-[0.5vw] sm:rounded-[1vw] xs:rounded-[1.5vw] ${
              activeTab === 'code' ? 'bg-[#121428] text-white' : 'bg-transparent text-white/70'
            }`}
            onClick={() => setActiveTab('code')}
          >
            {filename}
          </button>
          <button
            className={`tab md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.3vw] sm:py-[0.8vw] xs:py-[1.3vw] md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] md:rounded-[0.5vw] sm:rounded-[1vw] xs:rounded-[1.5vw] ${
              activeTab === 'suggestions'
                ? 'bg-[#121428] text-white'
                : 'bg-transparent text-white/70'
            }`}
            onClick={() => setActiveTab('suggestions')}
          >
            Suggestions
          </button>
        </div>

        <div className="flex items-center md:gap-[1vw] sm:gap-[1.5vw] xs:gap-[2vw]">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={copyToClipboard}
            className={`copy-button md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.3vw] sm:py-[0.8vw] xs:py-[1.3vw] md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] md:rounded-[0.5vw] sm:rounded-[1vw] xs:rounded-[1.5vw] rounded ${
              copied ? 'bg-green-600 text-white' : 'bg-[#202233] text-white/80'
            }`}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </motion.button>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay md:p-[1.8vw] sm:p-[2.3vw] xs:p-[2.8vw] rounded bg-[rgba(16,18,32,0.6)] text-white/80">
          <div
            className="loader mb-2"
            style={{
              width: 36,
              height: 36,
              border: '3px solid rgba(50,50,70,0.7)',
              borderTopColor: '#6366f1',
              borderRadius: '999px',
              animation: 'spin 1s linear infinite',
            }}
          />
          <div>Analyzing code...</div>
        </div>
      )}

      <div
        ref={codeRef}
        className={`code-content ${loading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        {activeTab === 'code' ? renderCodeView() : renderSuggestionsView()}
      </div>

      <style jsx>{`
        .code-editor-container {
          position: relative;
          width: 100%;
        }
        .editor-header {
          background: transparent;
          padding: 0 0 0.5rem 0;
        }
        .tab {
          border: 1px solid transparent;
        }
        .tab:hover {
          opacity: 0.95;
        }
        .copy-button {
          border: none;
        }
        .loading-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

export default CodeViewer
