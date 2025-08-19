// ProjectDetails.jsx
import React, { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import moment from 'moment-timezone'
import {
  FiCopy,
  FiExternalLink,
  FiMoreVertical,
  FiDownload,
  FiFile,
  FiFolder,
} from 'react-icons/fi'
import DeleteRepo from './DeleteRepo'

/**
 * Redesigned ProjectDetails:
 * - two-column responsive layout (list + preview)
 * - URL bar with editable toggle and copy feedback
 * - animated list (stagger), hover accent, select to preview
 * - improved empty-state UI
 *
 * Props expected same as before:
 * items, isLoading, repoId, prefix, goToFolder, openFile, repoName
 */

const ProjectDetails = ({
  items = [],
  isLoading,
  repoId,
  prefix,
  goToFolder,
  openFile,
  repoName,
}) => {
  const [isDeletePopUpOpen, setIsDeletePopUpOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [copied, setCopied] = useState(false)
  const [editableUrl, setEditableUrl] = useState(false)
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const [urlValue, setUrlValue] = useState(
    typeof window !== 'undefined' ? window.location.href : prefix
  )
  const [selected, setSelected] = useState(null) // selected item to preview
  const folders = (items || []).filter(i => i.type === 'folder')
  const files = (items || []).filter(i => i.type === 'file')

  // keep urlValue in sync with current window location if not editing
  React.useEffect(() => {
    if (!editableUrl && typeof window !== 'undefined')
      setUrlValue(`${backendUrl}/repos/${repoId}/push`)
  }, [editableUrl])

  // copy to clipboard with toast + UI state
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(urlValue)
      setCopied(true)
      toast.success('Link copied to clipboard', {
        position: 'top-right',
        theme: 'dark',
        style: { backgroundColor: '#0f1724', border: '1px solid #3f3eed' },
      })
      setTimeout(() => setCopied(false), 1400)
    } catch (err) {
      toast.error('Unable to copy link', { position: 'top-right', theme: 'dark' })
    }
  }

  // quick open in new tab
  const handleOpen = () => {
    window.open(urlValue, '_blank', 'noopener')
  }

  // select first item by default if exists
  React.useEffect(() => {
    if (!selected && (folders.length || files.length)) {
      setSelected(folders[0] ?? files[0])
    }
  }, [folders, files])

  // nice combined list for ordering: folders first
  const combined = useMemo(() => [...folders, ...files], [folders, files])

  // helper: pretty file size
  const prettySize = s => {
    if (!s) return ''
    if (s < 1024) return s + ' B'
    if (s < 1024 * 1024) return (s / 1024).toFixed(1) + ' KB'
    return (s / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <section className=" w-full overflow-auto md:px-[1.5vw] sm:px-[2vw] xs:px-[2.5vw] md:mt-[7vw] sm:mt-[9vw] xs:mt-[14vw]  ">
      <ToastContainer />

      {/* Top controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between md:gap-[1.5vw] sm:gap-[2vw] xs:gap-[2.5vw] md:mb-[1.5vw] sm:mb-[2vw] xs:mb-[2.5vw]">
        <div>
          <h3 className="md:text-[2vw] sm:text-[3vw] xs:text-[4.5vw] font-bold">Project Folders</h3>
          <p className="md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-white/60 md:mt-[0.2vw] sm:mt-[0.7vw] xs:mt-[1.2vw]">
            Repo: <span className="text-indigo-300">{repoName}</span>
          </p>
        </div>

        {/* URL bar + actions */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="w-full lg:w-auto flex md:gap-[1vw] sm:gap-[1.5vw] xs:gap-[2vw] sticky top-0 right-0 h-auto items-center"
        >
          <div className="flex-1 lg:flex-none min-w-0">
            <div className="flex items-center md:gap-[1vw] sm:gap-[1.5vw] xs:gap-[2vw] bg-[rgba(10,15,25,0.55)] backdrop-blur-sm  border border-[#12203b] md:rounded-[0.6vw] sm:rounded-[1.1vw] xs:rounded-[1.6vw] md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.5vw] sm:py-[1vw] xs:py-[1.5vw]">
              <span className="md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-white/60 md:mr-[0.3vw] sm:mr-[0.8vw] xs:mr-[1.3vw] hidden sm:inline">
                Link
              </span>
              <input
                value={urlValue}
                onChange={e => setUrlValue(e.target.value)}
                readOnly={!editableUrl}
                className={`bg-transparent md:text-[1.05vw] sm:text-[2.05vw] xs:text-[3.55vw] text-white/80 outline-none truncate flex-1 ${
                  editableUrl
                    ? 'border-b border-indigo-500 md:pb-[0.3vw] sm:pb-[0.8vw] xs:pb-[1.3vw]'
                    : ''
                }`}
                title={urlValue}
              />
            </div>
          </div>

          <div className="flex items-center md:gap-[0.7vw] sm:gap-[1.2vw] xs:gap-[1.7vw]">
            <button
              onClick={handleCopyUrl}
              className={`inline-flex md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] items-center md:gap-[0.7vw] sm:gap-[1.2vw] xs:gap-[1.7vw] md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.5vw] sm:py-[1vw] xs:py-[1.5vw] md:rounded-[0.6vw] sm:rounded-[2.1vw] xs:rounded-[2.6vw] font-semibold transition ${
                copied ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <FiCopy />
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={() => setIsDeletePopUpOpen(true)}
              className="hidden md:inline-flex md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] items-center md:gap-[0.7vw] sm:gap-[1.2vw] xs:gap-[1.7vw] md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.5vw] sm:py-[1vw] xs:py-[1.5vw] md:rounded-[0.6vw] sm:rounded-[2.1vw] xs:rounded-[2.6vw] bg-red-600 hover:bg-red-700 text-white transition"
            >
              Delete Repo
            </button>
          </div>
        </motion.div>
      </div>

      {/* Main layout: list + preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 md:gap-[1.5vw] sm:gap-[2vw] xs:gap-[2.5vw]">
        {/* Left: list (col-span 2 on large) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36 }}
          className="lg:col-span-2 md:rounded-[1vw] sm:rounded-[1.5vw] xs:rounded-[2vw] bg-[rgba(10,15,25,0.5)] backdrop-blur-sm border  border-[#12203b] shadow-lg overflow-hidden"
        >
          <div className="md:px-[1.3vw] sm:px-[1.8vw] xs:px-[2.3vw] md:py-[1vw] sm:py-[1.5vw] xs:py-[2vw] border-b border-[#12203b] flex items-center justify-between">
            <div className="flex items-center md:gap-[1vw] sm:gap-[1.5vw] xs:gap-[2vw]">
              <FiFolder className="md:w-[1.5vw] md:h-[1.5vw] sm:w-[2vw] sm:h-[2vw] xs:w-[2.5vw] xs:h-[2.5vw] text-white/80" />
              <span className="font-semibold text-white/90 md:text-[1.2vw] sm:text-[2.1vw] xs:text-[3.6vw]">
                Project Directories
              </span>
            </div>
            <div className="md:text-[1.05vw] sm:text-[2.05vw] xs:text-[3.55vw] text-white/60">
              {combined.length} items
            </div>
          </div>

          <div>
            {isLoading ? (
              <div className="md:p-[1.3vw] sm:p-[1.8vw] xs:p-[2.3vw] space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center md:gap-[1vw] sm:gap-[1.5vw] xs:gap-[2vw] animate-pulse md:px-[1.3vw] sm:px-[1.8vw] xs:px-[2.3vw] md:py-[1.1vw] sm:py-[1.6vw] xs:py-[2.1vw]"
                  >
                    <div className="md:w-[4vw] md:h-[4vw] sm:w-[6vw] sm:h-[6vw] xs:w-[8vw] xs:h-[8vw] bg-gray-700 rounded" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded w-48 mb-2" />
                      <div className="h-3 bg-gray-700 rounded w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : combined.length === 0 ? (
              // Empty state inside list container (still show preview column)
              <div className="md:p-[7vw] sm:p-[8vw] xs:p-[9vw] flex flex-col items-center md:gap-[1.2vw] sm:gap-[1.7vw] xs:gap-[2.2vw]">
                <p className="text-white/70 md:text-[1.05vw] sm:text-[2.05vw] xs:text-[3.55vw]">
                  This folder is empty — try uploading or sharing the link.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#12203b]">
                {combined.map((item, idx) => {
                  const isFolder = item.type === 'folder'
                  const isSelected = selected && selected.key === item.key
                  return (
                    <motion.div
                      key={item.key || idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, delay: idx * 0.03 }}
                      whileHover={{ scale: 1.01 }}
                      onClick={e => {
                        e.stopPropagation()
                        setSelected(item)
                        if (isFolder) goToFolder(item.name)
                      }}
                      className={`flex items-center justify-between md:px-[1.3vw] sm:px-[1.8vw] xs:px-[2.3vw] md:py-[1.1vw] sm:py-[1.6vw] xs:py-[2.1vw] cursor-pointer select-none ${
                        isSelected
                          ? 'bg-[rgba(63,62,237,0.06)] border-l-4 border-indigo-500'
                          : 'hover:bg-[rgba(255,255,255,0.02)]'
                      }`}
                    >
                      <div className="flex items-center md:gap-[1.4vw] sm:gap-[1.9vw] xs:gap-[2.4vw] ">
                        <div className="flex items-center justify-center md:w-[4vw] md:h-[4vw] sm:w-[6vw] sm:h-[6vw] xs:w-[8vw] xs:h-[8vw] md:rounded-[0.5vw] sm:rounded-[1vw] xs:rounded-[1.5vw] bg-[rgba(255,255,255,0.03)] border border-[#1f2b44]">
                          {isFolder ? (
                            <FiFolder className="md:w-[1.5vw] md:h-[1.5vw] sm:w-[3.5vw] sm:h-[3.5vw] xs:w-[5.5vw] xs:h-[5.5vw] text-indigo-300" />
                          ) : (
                            <FiFile className="md:w-[1.5vw] md:h-[1.5vw] sm:w-[3.5vw] sm:h-[3.5vw] xs:w-[5.5vw] xs:h-[5.5vw] text-sky-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] md:text-base">
                            {item.name}
                          </div>
                          <div className="md:text-[0.9vw] sm:text-[1.9vw] xs:text-[3.4vw] text-white/60">
                            {moment(item.lastModified).tz('Asia/Karachi').fromNow()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center md:gap-[1vw] sm:gap-[1.5vw] xs:gap-[2vw]">
                        <div className="md:text-[0.9vw] sm:text-[1.9vw] xs:text-[3.4vw] text-white/60 hidden sm:inline">
                          {isFolder ? 'Folder' : prettySize(item.size)}
                        </div>
                        <div className="relative">
                          <button className="md:p-[0.5vw] sm:p-[1vw] xs:p-[1.5vw] md:rounded-[0.5vw] sm:rounded-[1vw] xs:rounded-[1.5vw] hover:bg-white/5 transition text-white/70">
                            <FiMoreVertical />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: preview/details */}
        <motion.aside
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36 }}
          className="md:rounded-[1vw] sm:rounded-[1.5vw] xs:rounded-[2vw] bg-[rgba(10,15,25,0.55)] backdrop-blur-sm border border-[#12203b] shadow-lg md:p-[1.2vw] sm:p-[1.7vw] xs:p-[2.2vw]"
        >
          {selected ? (
            <div className="flex flex-col md:gap-[1vw] sm:gap-[1.5vw] xs:gap-[2vw]">
              <div className="flex items-center md:gap-[1vw] sm:gap-[1.5vw] xs:gap-[2vw]">
                <div className="md:w-[4.5vw] md:h-[4.5vw] sm:w-[6.5vw] sm:h-[6.5vw] xs:w-[8.5vw] xs:h-[8.5vw] flex items-center justify-center md:rounded-[0.5vw] sm:rounded-[1vw] xs:rounded-[1.5vw] bg-[rgba(255,255,255,0.03)] border border-[#1f2b44]">
                  {selected.type === 'folder' ? (
                    <FiFolder className="md:w-[1.5vw] md:h-[1.5vw] sm:w-[3.5vw] sm:h-[3.5vw] xs:w-[5.5vw] xs:h-[5.5vw] text-indigo-300" />
                  ) : (
                    <FiFile className="md:w-[1.5vw] md:h-[1.5vw] sm:w-[3.5vw] sm:h-[3.5vw] xs:w-[5.5vw] xs:h-[5.5vw] text-sky-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold md:text-[1.3vw] sm:text-[2.3vw] xs:text-[3.8vw] truncate">
                    {selected.name}
                  </div>
                  <div className="md:text-[0.9vw] sm:text-[1.9vw] xs:text-[3.4vw] text-white/60">
                    {moment(selected.lastModified).tz('Asia/Karachi').format('lll')}
                  </div>
                </div>
              </div>

              <div className="md:text-[1.05vw] sm:text-[2.05vw] xs:text-[3.55vw] text-white/70">
                <strong className="text-white/90">Path:</strong>
                <div className="md:mt-[0.2vw] sm:mt-[0.7vw] xs:mt-[1.2vw] break-all md:text-[0.9vw] sm:text-[1.9vw] xs:text-[3.4vw] text-white/70">
                  {selected.key || prefix + '/' + selected.name}
                </div>
              </div>

              <div className="flex md:gap-[0.7vw] sm:gap-[1.2vw] xs:gap-[1.7vw] md:mt-[0.4vw] sm:mt-[0.9vw] xs:mt-[1.4vw]">
                {selected.type === 'file' && (
                  <button
                    onClick={() => openFile(selected.name)}
                    className="inline-flex items-center md:gap-[0.7vw] sm:gap-[1.2vw] xs:gap-[1.7vw] md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.5vw] sm:py-[1vw] xs:py-[1.5vw] md:rounded-[0.7vw] sm:rounded-[1.2vw] xs:rounded-[1.7vw] bg-indigo-600 hover:bg-indigo-500 text-white md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw]"
                  >
                    <FiDownload /> Open / Download
                  </button>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      window.location.origin + '/' + (selected.key || selected.name)
                    )
                    toast.success('File path copied', { position: 'top-right', theme: 'dark' })
                  }}
                  className="inline-flex items-center md:gap-[0.7vw] sm:gap-[1.2vw] xs:gap-[1.7vw] md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.5vw] sm:py-[1vw] xs:py-[1.5vw] md:rounded-[0.7vw] sm:rounded-[1.2vw] xs:rounded-[1.7vw] border border-white/10 text-white/90 hover:bg-white/5 md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw]"
                >
                  <FiCopy /> Copy Path
                </button>
              </div>

              <div className="md:text-[0.9vw] sm:text-[1.9vw] xs:text-[3.4vw] text-white/60 md:mt-[0.4vw] sm:mt-[0.9vw] xs:mt-[1.4vw]">
                <strong>Size:</strong> {selected.size ? prettySize(selected.size) : '—'}
              </div>
            </div>
          ) : (
            <div className="text-center text-white/70 py-12">
              <div className="md:text-[1.35vw] sm:text-[2.35vw] xs:text-[3.85vw] font-semibold">
                Select a file or folder
              </div>
              <div className="md:mt-[0.4vw] sm:mt-[0.9vw] xs:mt-[1.4vw] md:text-[1.05vw] sm:text-[2.05vw] xs:text-[3.55vw]">
                Click an item on the left to preview details and actions.
              </div>
            </div>
          )}
        </motion.aside>
      </div>

      {/* Delete modal */}
      <DeleteRepo
        repoName={repoName}
        isDeletePopUpOpen={isDeletePopUpOpen}
        setDeleteConfirm={setDeleteConfirm}
        deleteConfirm={deleteConfirm}
        onDelete={async () => {
          if (deleteConfirm === 'DELETE') {
            try {
              const backendUrl = import.meta.env.VITE_BACKEND_URL
              const response = await axios.delete(
                `${backendUrl}/repos/delete/${repoId}/${repoName}`,
                { withCredentials: true }
              )
              toast.success(response.data.message || 'Repository deleted successfully!', {
                position: 'top-right',
                theme: 'dark',
              })
              setTimeout(() => (window.location.href = '/file-manager'), 1200)
            } catch (err) {
              toast.error(err?.response?.data?.message || 'Failed to delete repository!', {
                position: 'top-right',
                theme: 'dark',
              })
            }
          } else {
            toast.warn('Type DELETE to confirm deletion!')
          }
        }}
        onClose={() => setIsDeletePopUpOpen(false)}
      />
    </section>
  )
}

// small helper used in map
function prettySize(s) {
  if (!s) return ''
  if (s < 1024) return s + ' B'
  if (s < 1024 * 1024) return (s / 1024).toFixed(1) + ' KB'
  return (s / (1024 * 1024)).toFixed(2) + ' MB'
}

export default ProjectDetails
