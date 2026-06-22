import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'

const stagger = { visible: { transition: { staggerChildren: 0.08 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
}

const LOCKER_ID = 'iJDTJ0oGpJoH'

export default function Tests() {
  const { darkMode, language } = useApp()
  const t = useTranslation(language)

  useEffect(() => {
    const existing = document.querySelector(`script[src*="contentlocker.xyz"]`)
    if (existing) return
    const s = document.createElement('script')
    s.src = `https://contentlocker.xyz/js/${LOCKER_ID}`
    s.async = true
    document.body.appendChild(s)
    return () => { s.remove() }
  }, [])

  return (
    <motion.div
      className="w-full"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={fadeUp} className="text-2xl font-semibold mb-2">
        Tests
      </motion.h1>

      <motion.p
        variants={fadeUp}
        className="mb-8 leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        Exclusive content locked behind a paywall.
      </motion.p>

      {/* Content locker mounts its overlay inside this div */}
      <motion.div variants={fadeUp} className="mb-12">
        <div id="cl-locked-content"></div>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-6">
        <div
          className="p-6 rounded-sm"
          style={{
            border: '1px solid var(--border-subtle)',
            background: 'var(--glass-bg)',
          }}
        >
          <h2 className="text-lg font-semibold mb-3">Premium Content</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            This is a test of the content locker integration. The content below
            is gated and requires payment to unlock. Once unlocked, you get
            full access to the material.
          </p>
          <div className="mt-4 space-y-3">
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              Here is the secret content you unlocked. Thanks for supporting the work.
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              More exclusive drops coming soon.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <button
          onClick={() => window.history.back()}
          className="text-sm underline underline-offset-2 cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          {t.tip?.goBack ?? 'back'}
        </button>
      </motion.div>
    </motion.div>
  )
}
