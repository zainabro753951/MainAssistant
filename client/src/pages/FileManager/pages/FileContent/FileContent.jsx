import React, { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import Header from '../../../../common/Components/Header'
import Sidebar from '../../../../common/Components/Sidebar'
import { UseSideBarContext } from '../../../../Context/SideBarOpenProvider'
import { setFileContent } from '../../../../features/Repos'
import CodeViewer from './Components/CodeViewer'
import { motion } from 'motion/react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { FiCopy } from 'react-icons/fi'
import { IoMdOpen } from 'react-icons/io'

const languageMap = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  cs: 'csharp',
  rb: 'ruby',
  php: 'php',
  vue: 'vue',
  html: 'html',
  css: 'css',
  scss: 'scss',
  sass: 'sass',
  less: 'less',
  json: 'json',
  xml: 'xml',
  yml: 'yaml',
  yaml: 'yaml',
  md: 'markdown',
  sh: 'bash',
  bat: 'bat',
  go: 'go',
  rs: 'rust',
  dart: 'dart',
  kt: 'kotlin',
  swift: 'swift',
  r: 'r',
  pl: 'perl',
  sql: 'sql',
  graphql: 'graphql',
  styl: 'stylus',
  lua: 'lua',
  jsx: 'jsx',
  tsx: 'tsx',
  twig: 'twig',
  blade: 'blade',
  svelte: 'svelte',
}

const FileContent = () => {
  const { repoId, userBucket, repoName, '*': restPath } = useParams()

  const { pathname } = useLocation()
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const dispatch = useDispatch()
  const { fileContents } = useSelector(state => state.Repos)
  const { isSideBarOpen, setIsSiderOpen } = UseSideBarContext()

  const [state, setState] = useState({
    codeLines: [],
    aiSuggestions: [],
    language: 'text',
    loading: true,
    error: false,
  })

  // UI states for copy bar
  const [copied, setCopied] = useState(false)
  const [editable, setEditable] = useState(false)
  const [urlValue, setUrlValue] = useState('')

  // compute file path & language
  const filePath = decodeURIComponent(
    pathname.replace(`file-view/${repoId}/${userBucket}/${repoName}`, '').replace(/^\/+/, '')
  )

  const filename = filePath.split('/').pop() || repoName

  const prefix = `${userBucket}/${repoName}/${restPath}`
  const fileExt = filePath.split('.').pop()
  const language = languageMap[fileExt] || 'text'

  useEffect(() => {
    // init url value
    if (typeof window !== 'undefined') setUrlValue(window.location.href)
  }, [pathname])

  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        // Check cache first
        const cached = fileContents[prefix]
        if (cached?.fetched) {
          return setState(prev => ({
            ...prev,
            ...cached,
            language,
            loading: false,
          }))
        }
        console.log(prefix)

        const { data } = await axios.get(`${backendUrl}/repos/file-content/${prefix}`, {
          withCredentials: true,
        })

        let parsedSuggestions = []
        if (typeof data.aiSuggestions === 'string') {
          try {
            parsedSuggestions = JSON.parse(
              data.aiSuggestions.replace(/^```json\s*/, '').replace(/\s*```$/, '')
            )
          } catch (e) {
            console.error('Failed to parse AI suggestions:', e)
          }
        } else if (Array.isArray(data.aiSuggestions)) {
          parsedSuggestions = data.aiSuggestions
        }

        const payload = {
          prefix,
          codeLines: data.fileContent?.split('\n') || [],
          aiSuggestions: parsedSuggestions,
          fetched: true,
        }

        dispatch(setFileContent(payload))
        setState(prev => ({
          ...prev,
          ...payload,
          language,
          loading: false,
        }))
      } catch (error) {
        console.error(error)
        setState(prev => ({ ...prev, error: true, loading: false }))
      }
    }

    fetchFileContent()
  }, [backendUrl, dispatch, fileContents, language, prefix])

  const mergedCode = state.codeLines.map((line, idx) => ({
    line,
    suggestions: state.aiSuggestions.filter(s => s.lineNumber === idx + 1),
  }))

  // Copy / Open handlers for URL bar
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(urlValue)
      setCopied(true)
      toast.success('Link copied to clipboard!', {
        position: 'top-right',
        theme: 'dark',
        style: {
          backgroundColor: '#0f1724',
          border: '1px solid #3f3eed',
          boxShadow: '0 0 12px rgba(63,62,237,0.12)',
        },
      })
      setTimeout(() => setCopied(false), 1400)
    } catch (err) {
      toast.error('Failed to copy link', { position: 'top-right', theme: 'dark' })
    }
  }

  const handleOpen = () => {
    window.open(urlValue, '_blank', 'noopener')
  }

  return (
    <>
      <ToastContainer />
      <Header setIsSiderOpen={setIsSiderOpen} isSideBarOpen={isSideBarOpen} />
      <div className="w-full h-screen inline-flex overflow-hidden">
        <Sidebar isSideBarOpen={isSideBarOpen} />

        <main className="flex-1 overflow-auto md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[6vw] sm:py-[9vw] xs:py-[14vw] bg-[#071225]">
          {/* URL bar / file info */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className=" w-full md:mb-[1.5vw] sm:mb-[2vw] xs:mb-[2.5vw] flex flex-col md:flex-row items-start md:items-center md:gap-[1vw] sm:gap-[1.5vw] xs:gap-[2vw] justify-between"
          >
            <div>
              <h2 className="md:text-[1.7vw] sm:text-[2.7vw] xs:text-[4.2vw]  font-semibold text-white">
                {filename}
              </h2>
              <p className="md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-white/60 md:mt-[0.3vw] sm:mt-[0.8vw] xs:mt-[1.3vw]">
                Viewing file — {prefix}
              </p>
            </div>

            <div className="w-full md:w-auto flex items-center md:gap-[1.2vw] sm:gap-[1.7vw] xs:gap-[2.2vw]">
              <div className="flex-1 md:flex-none min-w-0">
                <div className="flex items-center md:gap-[1vw] sm:gap-[1.5vw] xs:gap-[2vw] bg-[rgba(10,15,25,0.55)] backdrop-blur-sm  border border-[#12203b] md:rounded-[0.6vw] sm:rounded-[1.1vw] xs:rounded-[1.6vw] md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.5vw] sm:py-[1vw] xs:py-[1.5vw]">
                  <span className="md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-white/60 md:mr-[0.3vw] sm:mr-[0.8vw] xs:mr-[1.3vw] hidden sm:inline">
                    Link
                  </span>
                  <input
                    value={urlValue}
                    onChange={e => setUrlValue(e.target.value)}
                    className={`bg-transparent md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-white/80 outline-none truncate flex-1 `}
                    title={urlValue}
                  />
                </div>
              </div>

              <button
                onClick={handleCopy}
                className={`inline-flex md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] items-center md:gap-[0.7vw] sm:gap-[1.2vw] xs:gap-[1.7vw] md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.5vw] sm:py-[1vw] xs:py-[1.5vw] md:rounded-[0.6vw] sm:rounded-[1.1vw] xs:rounded-[1.6vw] font-semibold transition ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <FiCopy />
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleOpen}
                className="inline-flex items-center md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] md:gap-[0.7vw] sm:gap-[1.2vw] xs:gap-[1.7vw] md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.5vw] sm:py-[1vw] xs:py-[1.5vw] md:rounded-[0.6vw] sm:rounded-[1.1vw] xs:rounded-[1.6vw] border border-white/10 text-white/90 hover:bg-white/5"
              >
                <IoMdOpen />
                Open
              </button>
            </div>
          </motion.div>

          {/* Content area */}
          <div>
            {state.loading && (
              <div className="text-white/60 md:mb-[1.4vw] sm:mb-[1.9vw] xs:mb-[2.4vw]">
                Loading file content...
              </div>
            )}

            {/* If error or no content, show empty message + copy/open CTA */}
            {state.error || state.codeLines.length === 0 ? (
              <div className="md:rounded-[1.5vw] sm:rounded-[2vw] xs:rounded-[2.5vw] bg-[rgba(10,15,25,0.5)] backdrop-blur-sm border border-[#12203b] shadow-lg p-8 text-center">
                <p className="text-white/70 md:mb-[1.4vw] sm:mb-[1.9vw] xs:mb-[2.4vw]">
                  {state.error
                    ? 'AI suggestions unavailable. Showing original code (if any).'
                    : 'This file appears to be empty.'}
                </p>
              </div>
            ) : (
              <CodeViewer
                code={mergedCode}
                language={state.language}
                loading={state.loading}
                filename={filename}
              />
            )}
          </div>
        </main>
      </div>
    </>
  )
}

export default FileContent
