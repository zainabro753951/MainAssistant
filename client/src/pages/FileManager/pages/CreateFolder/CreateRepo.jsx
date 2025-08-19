// CreateRepo.jsx (updated: dispatch setRepos on success)
import React, { useEffect, useMemo, useState } from 'react'
import Header from '../../../../common/Components/Header'
import Sidebar from '../../../../common/Components/Sidebar'
import { UseSideBarContext } from '../../../../Context/SideBarOpenProvider'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { FiCheck } from 'react-icons/fi'
import { setRepos } from '../../../../features/Repos'

const backendUrl = import.meta.env.VITE_BACKEND_URL

const slugify = s =>
  s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-+|\-+$/g, '')

const CreateRepo = () => {
  const { isSideBarOpen, setIsSiderOpen } = UseSideBarContext()
  const { register, handleSubmit, watch, formState } = useForm({
    mode: 'onBlur',
    defaultValues: { repoName: '', description: '', visibility: 'private', template: 'empty' },
  })
  const { errors, isDirty } = formState

  const dispatch = useDispatch()
  const existingRepos = useSelector(state => state.Repos?.repos ?? []) // adjust selector if your slice key differs
  const user = useSelector(state => state.auth.user)

  const [createdRepo, setCreatedRepo] = useState(null)

  const repoName = watch('repoName') || ''
  const description = watch('description') || ''
  const visibility = watch('visibility') || 'private'
  const template = watch('template') || 'empty'

  const slug = useMemo(() => (repoName ? slugify(repoName) : ''), [repoName])
  const displayUserPrefix = useMemo(() => {
    if (!user) return 'guest/guest'
    return `${user.firstName || 'user'}${user.lastName || ''}-${user.id}`
  }, [user])

  // mutation to create repo
  const createRepo = async payload => {
    const response = await axios.post(`${backendUrl}/repos`, payload, {
      withCredentials: true,
    })
    return response.data
  }
  const { mutate, isLoading, isSuccess, data, error, isError } = useMutation({
    mutationFn: createRepo,
  })

  useEffect(() => {
    if (isSuccess && data) {
      console.log(data)

      // prepare repo object that will be added to store
      const newRepo = data?.repo ?? {
        id: data.repoId ?? Date.now(),
        repo_name: data.repo_name ?? repoName,
      }

      // 1) if backend returns an entire list, use it
      if (Array.isArray(data.repos)) {
        dispatch(setRepos(data.repos))
      } else {
        // 2) otherwise append (but avoid duplicate ids)
        const filtered = existingRepos.filter(r => String(r.id) !== String(newRepo.id))
        const updated = [...filtered, newRepo]
        dispatch(setRepos(updated))
      }

      setCreatedRepo(newRepo)

      toast.success(data?.message || 'Repository created', {
        position: 'top-right',
        theme: 'dark',
        style: {
          backgroundColor: '#121B32',
          border: '1px solid #3f3eed',
          boxShadow: '0 0 15px #3f3eed',
        },
      })
    }

    if (isError) {
      toast.error(error?.response?.data?.message || 'Failed to create repository', {
        position: 'top-right',
        theme: 'dark',
        style: {
          backgroundColor: '#121B32',
          border: '1px solid #3f3eed',
          boxShadow: '0 0 15px #3f3eed',
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, isError, data])

  const onSubmit = values => {
    const payload = {
      repoName: values.repoName,
      description: values.description,
      visibility: values.visibility,
      template: values.template,
    }
    mutate(payload)
  }

  const repoPreviewUrl = useMemo(() => {
    if (!slug) return ''
    return `/file-manager/NEW/${displayUserPrefix}/${slug}`
  }, [slug, displayUserPrefix])

  const handleCopy = async text => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard', { position: 'top-right', theme: 'dark' })
    } catch {
      toast.error('Copy failed', { position: 'top-right', theme: 'dark' })
    }
  }

  return (
    <>
      <Header setIsSiderOpen={setIsSiderOpen} isSideBarOpen={isSideBarOpen} />
      <ToastContainer />
      <div className="w-full h-screen flex overflow-hidden bg-[#0f1126] text-white">
        <Sidebar isSideBarOpen={isSideBarOpen} />

        <main className="overflow-hidden md:p-[1.5vw] sm:p-[2vw] xs:p-[2.5vw]">
          <div className="w-full md:py-[6vw] sm:py-[9vw] xs:py-[14vw]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="grid grid-cols-1 lg:grid-cols-3 md:gap-[1.7vw] sm:gap-[2.2vw] xs:gap-[2.7vw]"
            >
              <aside className="col-span-1 hidden lg:flex flex-col justify-center md:rounded-[1.5vw] sm:rounded-[2vw] xs:rounded-[2.5vw] bg-[radial-gradient(ellipse_at_top,rgba(63,62,237,0.08),transparent_30%)] md:p-[1.5vw] sm:p-[2vw] xs:p-[2.5vw] border border-[#12203b] shadow-lg">
                <div className="md:mb-[1.4vw] sm:mb-[1.9vw] xs:mb-[2.4vw]">
                  <div className="inline-block md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.3vw] sm:py-[0.8vw] xs:py-[1.3vw] rounded-full bg-white/5 border border-white/10 md:text-[0.9vw] sm:text-[1.9vw] xs:text-[3.4vw] text-white/80">
                    INTELLECTAI • NEW
                  </div>
                </div>
                <h2 className="md:text-[2vw] sm:text-[3vw] xs:text-[4.5vw] md:leading-[2.5vw] sm:leading-[3.5vw] xs:leading-[5vw] font-exo-space font-bold text-white md:mb-[1.3vw] sm:mb-[1.8vw] xs:mb-[2.3vw]">
                  Create a new repository
                </h2>
                <p className="md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-white/70 md:mb-[1.6vw] sm:mb-[2.1vw] xs:mb-[2.6vw]">
                  Create a structured repo and start organizing your project. Choose visibility and
                  a starter template to get going quickly.
                </p>

                <div className="mt-auto md:text-[0.9vw] sm:text-[1.9vw] xs:text-[3.4vw] text-white/60">
                  <div className="md:mb-[1vw] sm:mb-[1.5vw] xs:mb-[2vw]">Quick tips:</div>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Pick a clear repo name (kebab-case friendly).</li>
                    <li>Choose a template to bootstrap files.</li>
                    <li>Keep private repos for sensitive work.</li>
                  </ul>
                </div>
              </aside>

              <section className="col-span-2 md:rounded-[1.5vw] sm:rounded-[2vw] xs:rounded-[2.5vw] bg-[rgba(15,17,38,0.7)] backdrop-blur-sm border border-[#12203b] md:p-[1.5vw] sm:p-[2vw] xs:p-[2.5vw] shadow-xl">
                <div className="flex items-center justify-between md:mb-[1.4vw] sm:mb-[1.9vw] xs:mb-[2.4vw]">
                  <div>
                    <h3 className="md:text-[1.5vw] sm:text-[2.5vw] xs:text-[4vw] font-semibold text-white">
                      Create Repository
                    </h3>
                    <p className="md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-white/60">
                      Fill details to create a new project repository
                    </p>
                  </div>

                  <div className="md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-white/60">
                    {user ? (
                      <div className="text-right">
                        <div className="font-medium text-white/90">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="md:text-[0.9vw] sm:text-[1.9vw] xs:text-[3.4vw]">
                          {user.email}
                        </div>
                      </div>
                    ) : (
                      <div className="text-right">Not signed in</div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label className="md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-white/80 mb-1 block">
                      Repository name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. voter-strategy"
                      className="w-full md:py-[1vw] sm:py-[1.5vw] xs:py-[2vw] md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:rounded-[0.6vw] sm:rounded-[1.1vw] xs:rounded-[1.6vw] md:text-[1.3vw] sm:text-[2.3vw] xs:text-[3.8vw] bg-[#07102a] border border-[#1b2a44] text-white outline-none focus:ring-2 focus:ring-indigo-500"
                      {...register('repoName', {
                        required: 'Repo name is required',
                        minLength: { value: 2, message: 'Too short' },
                      })}
                    />
                    {errors.repoName && (
                      <div className="md:text-[0.9vw] sm:text-[1.9vw] xs:text-[3.4vw] text-red-400 md:mt-[0.4vw] sm:mt-[0.9vw] xs:mt-[1.4vw]">
                        {errors.repoName.message}
                      </div>
                    )}

                    <div className="md:mt-[0.4vw] sm:mt-[0.9vw] xs:mt-[1.4vw] flex items-center md:gap-[1.2vw] sm:gap-[1.7vw] xs:gap-[2.2vw] md:text-[0.9vw] sm:text-[1.9vw] xs:text-[3.4vw] text-white/70">
                      <div className="bg-white/5 px-2 md:py-[0.3vw] sm:py-[0.8vw] xs:py-[1.3vw] rounded-md border border-white/10">
                        {displayUserPrefix}/
                      </div>
                      <div className="bg-white/5 px-2 md:py-[0.3vw] sm:py-[0.8vw] xs:py-[1.3vw] rounded-md border border-white/10">
                        {slug || <span className="text-white/30">your-repo-slug</span>}
                      </div>
                      <div className="ml-3 md:text-[0.9vw] sm:text-[1.9vw] xs:text-[3.4vw] text-white/50">
                        Preview
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-white/80 mb-1 block">
                      Short description (optional)
                    </label>
                    <textarea
                      placeholder="Describe this repository in a sentence"
                      className="w-full px-4 py-3 rounded-md bg-[#07102a] border border-[#1b2a44] text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      rows={3}
                      {...register('description')}
                    />
                  </div>

                  <div className="flex items-center md:gap-[1.2vw] sm:gap-[1.7vw] xs:gap-[2.2vw]">
                    <button
                      type="submit"
                      disabled={isLoading || !isDirty}
                      className={`inline-flex items-center md:gap-[1.2vw] sm:gap-[1.7vw] xs:gap-[2.2vw] px-5 py-3 rounded-xl font-semibold transition ${
                        isLoading
                          ? 'bg-indigo-500/70 cursor-wait'
                          : 'bg-indigo-600 hover:bg-indigo-500'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 00-12 12h4z"
                            ></path>
                          </svg>
                          Creating...
                        </>
                      ) : (
                        'Create New'
                      )}
                    </button>

                    <Link
                      to="/file-manager"
                      className="px-4 py-3 rounded-xl bg-white/5 text-white/90 border border-white/10 hover:bg-white/10"
                    >
                      Cancel
                    </Link>

                    {slug && (
                      <div className="ml-auto md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-white/70 flex items-center gap-2">
                        <div className="bg-white/5 px-2 md:py-[0.3vw] sm:py-[0.8vw] xs:py-[1.3vw] rounded border border-white/10">
                          {displayUserPrefix}/{slug}
                        </div>
                        <button
                          onClick={() => handleCopy(repoPreviewUrl)}
                          className="md:text-[0.9vw] sm:text-[1.9vw] xs:text-[3.4vw] text-white/80 px-2 md:py-[0.3vw] sm:py-[0.8vw] xs:py-[1.3vw] bg-white/5 rounded border border-white/10"
                        >
                          Copy Preview
                        </button>
                      </div>
                    )}
                  </div>
                </form>

                <AnimateSuccessPanel
                  createdRepo={createdRepo}
                  onCopy={handleCopy}
                  basePrefix={displayUserPrefix}
                />
              </section>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  )
}

/* Animated success panel component */
function AnimateSuccessPanel({ createdRepo, onCopy, basePrefix }) {
  console.log(createdRepo)

  if (!createdRepo) return null

  const repoName = createdRepo.repo_name || createdRepo.repoName || 'new-repo'
  const repoId = createdRepo.id || 'NEWID'
  const repoUrl = `${window.location.origin}/file-manager/${repoId}/${basePrefix}/${repoName}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mt-6 rounded-lg border border-green-800 bg-gradient-to-r from-green-900/30 to-transparent p-4"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-600/20 border border-green-600 flex items-center justify-center">
          <FiCheck className="text-green-300 w-6 h-6" />
        </div>
        <div>
          <div className="text-white font-semibold">Repository created</div>
          <div className="md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-white/70">
            Your repository <span className="font-medium text-white/90">{repoName}</span> was
            created successfully.
          </div>

          <div className="mt-3 flex items-center md:gap-[1.2vw] sm:gap-[1.7vw] xs:gap-[2.2vw]">
            <div className="bg-white/5 md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] py-2 rounded border border-white/10 truncate">
              {repoUrl}
            </div>
            <button
              onClick={() => onCopy(repoUrl)}
              className="md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] py-2 rounded bg-green-600 text-white"
            >
              Copy
            </button>
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] py-2 rounded border border-white/10 text-white/90"
            >
              Open
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CreateRepo
