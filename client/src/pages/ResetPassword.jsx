// src/pages/auth/ResetPassword.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { motion } from 'motion/react'
import { FiCopy, FiCheck, FiExternalLink, FiEye, FiEyeOff } from 'react-icons/fi'

/**
 * Elegant glassmorphic ResetPassword
 *
 * - Two modes: request (email) and set-new (token present)
 * - Keep backend endpoints the same: /password/request and /password/reset
 * - Visual improvements while keeping logic intact
 */

const backendUrl = import.meta.env.VITE_BACKEND_URL || ''

const calcPasswordStrength = pwd => {
  let score = 0
  if (!pwd) return { score, label: 'Very weak' }
  if (pwd.length >= 8) score += 1
  if (/[A-Z]/.test(pwd)) score += 1
  if (/[0-9]/.test(pwd)) score += 1
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1
  const label = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'][score]
  return { score, label }
}

const StrengthBar = ({ score = 0 }) => {
  const width = `${(score / 4) * 100}%`
  const bg =
    score >= 4
      ? 'bg-emerald-400'
      : score >= 3
      ? 'bg-yellow-400'
      : score >= 2
      ? 'bg-orange-400'
      : 'bg-red-400'
  return (
    <div className="w-full bg-white/6 rounded h-2 overflow-hidden">
      <div style={{ width }} className={`h-2 ${bg} transition-all duration-300`} />
    </div>
  )
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  // request reset form
  const {
    register: registerReq,
    handleSubmit: handleSubmitReq,
    formState: { errors: reqErrors, isDirty: reqDirty },
    reset: resetReq,
  } = useForm({ mode: 'onBlur' })

  // set new password form
  const {
    register: registerNew,
    handleSubmit: handleSubmitNew,
    watch: watchNew,
    formState: { errors: newErrors, isDirty: newDirty },
    reset: resetNew,
  } = useForm({ mode: 'onBlur' })

  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const pwdValue = watchNew('password') || ''
  const { score, label: pwdLabel } = useMemo(() => calcPasswordStrength(pwdValue), [pwdValue])

  // --- API functions (same endpoints, update if needed) ---
  const requestReset = async payload => {
    const res = await axios.post(`${backendUrl}/password/request`, payload, {
      withCredentials: true,
    })
    return res.data
  }
  const confirmReset = async payload => {
    const res = await axios.post(`${backendUrl}/password/reset`, payload, {
      withCredentials: true,
    })
    return res.data
  }

  const requestResetMutation = useMutation({ mutationFn: requestReset })
  const confirmResetMutation = useMutation({ mutationFn: confirmReset })

  const onRequest = data => {
    requestResetMutation.mutate(data, {
      onSuccess: res => {
        toast.success(res.message || 'Reset email sent', { position: 'top-right', theme: 'dark' })
        resetReq()
      },
      onError: err => {
        const msg = err?.response?.data?.message || 'Failed to send reset email'
        toast.error(msg, { position: 'top-right', theme: 'dark' })
      },
    })
  }

  const onSetNew = data => {
    if (!token) {
      toast.error('Missing token in URL', { position: 'top-right', theme: 'dark' })
      return
    }
    const payload = { token, password: data.password }
    confirmResetMutation.mutate(payload, {
      onSuccess: res => {
        toast.success(res.message || 'Password updated', { position: 'top-right', theme: 'dark' })
        resetNew()
        setTimeout(() => navigate('/login'), 1100)
      },
      onError: err => {
        const msg = err?.response?.data?.message || 'Failed to reset password'
        toast.error(msg, { position: 'top-right', theme: 'dark' })
      },
    })
  }

  const handleCopyLink = async link => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      toast.success('Link copied', { position: 'top-right', theme: 'dark' })
      setTimeout(() => setCopied(false), 1400)
    } catch {
      toast.error('Copy failed', { position: 'top-right', theme: 'dark' })
    }
  }

  // optional dev link returned by backend (helpful during testing)
  const devResetLink = requestResetMutation.data?.resetLink

  return (
    <div className="min-h-screen w-full bg-gradient-to-b flex items-center justify-center overflow-hidden">
      <ToastContainer />
      {/* background blobs (glassy theme) */}
      <div className="pointer-events-none w-full min-h-full absolute inset-0 -z-10 overflow-hidden  p-6">
        <div className="absolute -top-40 -left-36 h-96 w-96 rounded-full bg-indigo-600/18 blur-3xl" />
        <div className="absolute -bottom-28 -right-36 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/6 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-4xl mx-auto rounded-2xl  bg-transparent"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 place-items-center">
          {/* LEFT: decorative / tips */}
          <aside className="hidden md:flex flex-col gap-6 p-8 bg-[linear-gradient(180deg,rgba(15,17,38,0.7),rgba(15,17,38,0.5))] border-r border-[#12203b] backdrop-blur-sm">
            <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80 w-fit">
              INTELLECTAI • SECURITY
            </div>

            <h3 className="text-2xl md:text-[1.7rem] font-exo-space font-bold text-indigo-200">
              Reset your password
            </h3>

            <p className="text-sm text-white/70 max-w-xs">
              Forgot your password? Enter your email and we’ll send a secure reset link. If you
              already received a token, open this page with <code>?token=YOUR_TOKEN</code>.
            </p>

            <div className="w-full h-48 rounded-xl overflow-hidden ring-1 ring-white/6">
              <img
                src="/images/securit.webp"
                alt="security illustration"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-xs text-white/60">
              <strong>Tips</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside text-white/60">
                <li>Use a unique password with 8+ characters.</li>
                <li>Include uppercase, numbers and symbols.</li>
                <li>Store passwords in a secure manager.</li>
              </ul>
            </div>
          </aside>

          {/* RIGHT: forms */}
          <main className="p-6 md:p-8 bg-[rgba(15,17,38,0.7)] backdrop-blur-md border border-[#12203b] w-full">
            <div className="mb-4">
              <h2 className="text-lg md:text-xl font-exo-space font-bold text-white">
                {token ? 'Set a new password' : 'Reset password'}
              </h2>
              <p className="text-sm text-white/60 mt-1">
                {token
                  ? 'Enter and confirm a strong new password.'
                  : 'We’ll send you a secure reset link.'}
              </p>
            </div>

            {!token ? (
              <form onSubmit={handleSubmitReq(onRequest)} className="space-y-4" noValidate>
                <label className="text-xs text-white/60 block">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  {...registerReq('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                  })}
                  aria-invalid={reqErrors.email ? 'true' : 'false'}
                  className="w-full px-4 py-2 rounded-lg bg-[#081022] border border-[#1b2a44] text-white outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                {reqErrors.email && (
                  <div className="text-xs text-red-400">{reqErrors.email.message}</div>
                )}

                <div className="flex gap-3 items-center">
                  <button
                    type="submit"
                    disabled={requestResetMutation.isLoading || !reqDirty}
                    className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition ${
                      requestResetMutation.isLoading
                        ? 'bg-indigo-500/70 cursor-wait'
                        : 'bg-indigo-600 hover:bg-indigo-500'
                    } text-white`}
                  >
                    {requestResetMutation.isLoading ? 'Sending…' : 'Send reset link'}
                  </button>

                  <Link to="/login" className="text-sm text-indigo-300 hover:underline">
                    Back to sign in
                  </Link>
                </div>

                {/* Dev: show reset link if returned by backend */}
                {devResetLink && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 bg-[rgba(255,255,255,0.02)] border border-[#15314a] rounded-md p-3"
                  >
                    <div className="text-xs text-white/60 mb-2">Reset link (dev)</div>
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm text-white/80">{devResetLink}</div>
                      <div className="ml-auto flex gap-2">
                        <button
                          onClick={() => handleCopyLink(devResetLink)}
                          className="px-3 py-1 rounded-md bg-indigo-600 text-white"
                        >
                          {copied ? (
                            <>
                              <FiCheck /> Copied
                            </>
                          ) : (
                            <>
                              <FiCopy /> Copy
                            </>
                          )}
                        </button>
                        <a
                          href={devResetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-md border border-white/10 text-white/80"
                        >
                          <FiExternalLink /> Open
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </form>
            ) : (
              <form onSubmit={handleSubmitNew(onSetNew)} className="space-y-4" noValidate>
                <div>
                  <label className="text-xs text-white/60 block mb-1">New password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      {...registerNew('password', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Minimum 8 characters' },
                      })}
                      aria-invalid={newErrors.password ? 'true' : 'false'}
                      className="w-full px-4 py-2 rounded-lg bg-[#081022] border border-[#1b2a44] text-white outline-none focus:ring-2 focus:ring-indigo-500 transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-2 text-white/60"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {newErrors.password && (
                    <div className="text-xs text-red-400 mt-1">{newErrors.password.message}</div>
                  )}

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1">
                      <StrengthBar score={score} />
                    </div>
                    <div className="w-24 text-xs text-white/60 text-right">{pwdLabel}</div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/50">
                    <div className={pwdValue.length >= 8 ? 'text-white/80' : ''}>
                      • 8+ characters
                    </div>
                    <div className={/[A-Z]/.test(pwdValue) ? 'text-white/80' : ''}>• Uppercase</div>
                    <div className={/[0-9]/.test(pwdValue) ? 'text-white/80' : ''}>• Number</div>
                    <div className={/[^A-Za-z0-9]/.test(pwdValue) ? 'text-white/80' : ''}>
                      • Symbol
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/60 block mb-1">Confirm password</label>
                  <input
                    id="confirm"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    {...registerNew('confirm', {
                      required: 'Please confirm password',
                      validate: value => value === pwdValue || 'Passwords do not match',
                    })}
                    aria-invalid={newErrors.confirm ? 'true' : 'false'}
                    className="w-full px-4 py-2 rounded-lg bg-[#081022] border border-[#1b2a44] text-white outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  {newErrors.confirm && (
                    <div className="text-xs text-red-400 mt-1">{newErrors.confirm.message}</div>
                  )}
                </div>

                <div className="flex gap-3 items-center">
                  <button
                    type="submit"
                    disabled={confirmResetMutation.isLoading || !newDirty}
                    className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition ${
                      confirmResetMutation.isLoading
                        ? 'bg-indigo-500/70 cursor-wait'
                        : 'bg-indigo-600 hover:bg-indigo-500'
                    } text-white`}
                  >
                    {confirmResetMutation.isLoading ? 'Updating…' : 'Set new password'}
                  </button>

                  <Link to="/login" className="text-sm text-indigo-300 hover:underline">
                    Back to sign in
                  </Link>
                </div>
              </form>
            )}
          </main>
        </div>
      </motion.div>
    </div>
  )
}
