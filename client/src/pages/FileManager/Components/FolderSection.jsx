// src/pages/Folder/Components/FolderSection.jsx
import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import moment from 'moment-timezone'
import { motion } from 'motion/react'

const FolderSection = ({ isLoading }) => {
  const { repos } = useSelector(state => state.Repos)
  const { user } = useSelector(state => state.auth)
  const [sortType, setSortType] = useState('timestamp') // timestamp | ascending | descending

  // memoized sorting
  const sortedRepos = useMemo(() => {
    if (!repos) return []
    const arr = [...repos]
    switch (sortType) {
      case 'ascending':
        arr.sort((a, b) => a.repo_name.localeCompare(b.repo_name))
        break
      case 'descending':
        arr.sort((a, b) => b.repo_name.localeCompare(a.repo_name))
        break
      case 'timestamp':
      default:
        arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
    }
    return arr
  }, [repos, sortType])

  return (
    <section className="w-full min-h-screen md:px-[1.5vw] sm:px-[2vw] xs:px-[2.5vw] md:py-[6vw] sm:py-[9vw] xs:py-[14vw] ">
      {/* Header row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between md:gap-[1.5vw] sm:gap-[2vw] xs:gap-[2.5vw] md:mb-[1.5vw] sm:mb-[2vw] xs:mb-[2.5vw]">
        <h3 className="md:text-[2.1vw] sm:text-[3.1vw] xs:text-[4.6vw] font-bold font-grotesk-space">
          Project Folders
        </h3>

        <div className="flex items-center md:gap-[1.5vw] sm:gap-[2vw] xs:gap-[2.5vw] w-full md:w-auto">
          <Link
            to={'/file-manager/create-repo'}
            className="inline-flex items-center md:gap-[1vw] sm:gap-[1.5vw] xs:gap-[2vw] bg-green-600 hover:bg-green-700 text-white font-semibold md:px-[1.5vw] sm:px-[2vw] xs:px-[2.5vw] md:py-[0.7vw] sm:py-[1.2vw] xs:py-[1.7vw] md:rounded-[0.6vw] sm:rounded-[1.1vw] xs:rounded-[1.6vw] md:text-[1.15vw] sm:text-[2.15vw] xs:text-[3.65vw] shadow-sm transition"
          >
            Create Repo
          </Link>

          <div className="">
            <select
              id="sort"
              value={sortType}
              onChange={e => setSortType(e.target.value)}
              className="bg-[#071225] border border-[#1b2a44] text-white md:px-[1.5vw] sm:px-[2vw] xs:px-[2.5vw] md:py-[0.7vw] sm:py-[1.2vw] xs:py-[1.7vw] md:rounded-[0.6vw] sm:rounded-[1.1vw] xs:rounded-[1.6vw] md:text-[1.15vw] sm:text-[2.15vw] xs:text-[3.65vw] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="timestamp">Timestamp</option>
              <option value="ascending">Ascending</option>
              <option value="descending">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Container */}
      <div className="md:rounded-[1vw] sm:rounded-[1.5vw] xs:rounded-[2vw] bg-[rgba(10,15,25,0.6)] backdrop-blur-sm border border-[#12203b] shadow-lg overflow-hidden">
        {/* List header */}
        <div className="flex items-center justify-between md:px-[1.5vw] sm:px-[2vw] xs:px-[2.5vw] md:py-[1.2vw] sm:py-[1.7vw] xs:py-[2.7vw] border-b border-[#12203b]">
          <div className="flex items-center md:gap-[1vw] sm:gap-[1.5vw] xs:gap-[2vw]">
            <img
              src="/images/FileManager/folderImage.png"
              alt=""
              className="md:w-[2vw] md:h-[2vw] sm:w-[4vw] sm:h-[4vw] xs:w-[6vw] xs:h-[6vw] object-contain"
            />
            <span className="md:text-[1.2vw] sm:text-[2.2vw] xs:text-[3.7vw] md:text-base font-semibold text-white/90">
              Project Directories
            </span>
          </div>
        </div>

        {/* Content */}
        <div>
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center md:gap-[1vw] sm:gap-[1.5vw] xs:gap-[2vw] animate-pulse"
                >
                  <div className="w-12 h-12 bg-gray-700 rounded-md" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded w-48 mb-2" />
                    <div className="h-3 bg-gray-700 rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-[#12203b]">
              {sortedRepos?.length === 0 && (
                <div className="md:p-[5vw] sm:p-[6vw] xs:p-[7vw] text-center text-white/70 md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw]">
                  No repositories found.
                </div>
              )}

              {sortedRepos?.map((f, idx) => {
                const createdAt = moment(f.created_at).tz('Asia/Karachi').fromNow()
                return (
                  <motion.div
                    key={f.id || idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between md:px-[1.5vw] sm:px-[2vw] xs:px-[2.5vw] md:py-[1.2vw] sm:py-[1.7vw] xs:py-[2.7vw]"
                  >
                    <div className="flex items-center md:gap-[1vw] sm:gap-[1.5vw] xs:gap-[2vw]">
                      <img
                        src="/images/FileManager/folderImage.png"
                        alt=""
                        className="md:w-[2vw] md:h-[2vw] sm:w-[4vw] sm:h-[4vw] xs:w-[6vw] xs:h-[6vw] object-contain"
                      />
                      <Link
                        to={`/file-manager/${f.id}/${user?.firstName}${user?.lastName}-${user?.id}/${f.repo_name}`}
                        className="md:text-[1.2vw] sm:text-[2.2vw] xs:text-[3.7vw] md:text-base font-semibold text-white hover:text-indigo-300 transition truncate max-w-[60vw] md:max-w-[40vw]"
                        title={f.repo_name}
                      >
                        {f.repo_name}
                      </Link>
                    </div>

                    <div className="flex items-center md:gap-[1vw] sm:gap-[1.5vw] xs:gap-[2vw]">
                      <time className="md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-white/60">
                        {createdAt}
                      </time>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default FolderSection
