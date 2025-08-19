import { motion } from 'framer-motion'

const ComingSoonPoster = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0f1126] text-white">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/10 blur-3xl" />
        {/* subtle grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),rgba(255,255,255,0)_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(transparent,transparent_31px,rgba(255,255,255,0.06)_32px)] bg-[length:32px_32px] opacity-[0.15]" />
      </div>

      {/* Content */}
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full"
        >
          {/* Badge */}
          <div className="mx-auto mb-6 w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs tracking-wide text-white/80">
            INTELLECTAI • PREVIEW
          </div>

          {/* Heading */}
          <h1 className="font-grotesk-space mx-auto max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-sky-300 bg-clip-text text-transparent">
              Coming Soon
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/70 sm:text-lg">
            We&apos;re building something powerful. A new{' '}
            <span className="text-indigo-300">AI voice</span> and
            <span className="text-sky-300"> content</span> experience crafted for creators. Stay
            tuned.
          </p>

          {/* CTA */}
          <div className="mx-auto mt-8 flex w-full max-w-xl flex-col items-center justify-center gap-3 sm:flex-row">
            <form
              onSubmit={e => e.preventDefault()}
              className="flex w-full flex-1 items-center gap-2 rounded-2xl bg-white/5 p-2 ring-1 ring-white/10 backdrop-blur-sm"
            >
              <input
                type="email"
                placeholder="Enter your email to get notified"
                className="w-full flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none"
                aria-label="Email address"
              />
              <button
                className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                type="submit"
              >
                Notify Me
              </button>
            </form>
            <a
              href="#"
              className="w-full rounded-2xl bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white/90 ring-1 ring-white/10 transition hover:bg-white/10 sm:w-auto"
            >
              Back to Home
            </a>
          </div>

          {/* Feature bullets (optional) */}
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-2 text-xs text-white/60">
            <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
              Real‑time voice chat
            </span>
            <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
              AI suggestions
            </span>
            <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
              Privacy-first
            </span>
          </div>
        </motion.div>

        {/* Footer note */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-widest text-white/40">
          © {new Date().getFullYear()} IntellectAi
        </div>
      </div>
    </div>
  )
}

export default ComingSoonPoster
