import React from 'react'
import { useState } from 'react'
import { useSelector } from 'react-redux'

const EmptyRepo = ({ repoId }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const { repos } = useSelector(state => state.Repos)
  console.log(repos)

  const [copied, setCopied] = useState(false)
  const fullUrl = `${backendUrl}/repos/${repoId}/push`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // 2 seconds feedback
    } catch (err) {
      console.error('Failed to copy!', err)
    }
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-center md:pt-[5vw] sm:pt-[10vw] xs:pt-[15vw]">
      <div className="w-[75%] h-[75%] border-[1.5px] border-dashed border-gray-600 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 md:text-[1.5vw] sm:text-[2.5vw] xs:text-[4vw] text-center">
          This folder is empty.
        </p>
        <div className="flex items-center gap-2">
          <p className="text-gray-400 underline md:text-[1vw] sm:text-[1.5vw] xs:text-[2.5vw] break-all">
            {fullUrl}
          </p>
          <button
            onClick={handleCopy}
            className="ml-2 px-3 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 flex items-center gap-1 text-sm"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmptyRepo
