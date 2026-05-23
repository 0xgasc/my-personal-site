// components/Sidebar.js
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'
import { motion, AnimatePresence } from 'framer-motion'

export default function Sidebar({ isOpen, onClose, darkMode }) {
  const router = useRouter()
  const { language } = useApp()
  const t = useTranslation(language)

  const tabs = [
    { name: t.nav.home, href: '/' },
    { name: t.nav.background, href: '/career' },
    { name: t.nav.collection, href: '/collection' },
    { name: t.nav.experiments, href: '/experiments' },
    { name: t.nav.tip, href: '/tip' },
    { name: t.nav.contact, href: '/contact' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-30"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed top-0 right-0 h-full w-72 border-l z-40 backdrop-blur-2xl"
            style={{
              background: 'var(--glass-hover)',
              borderColor: 'var(--border-default)',
            }}
          >
            <div className="flex flex-col h-full p-8">
              {/* Close */}
              <div className="flex justify-end mb-12">
                <button
                  onClick={onClose}
                  className="btn-ghost text-sm"
                  aria-label="Close menu"
                >
                  {t.nav.close}
                </button>
              </div>

              {/* Nav */}
              <nav className="flex flex-col gap-1 flex-1">
                {tabs.map((tab, i) => {
                  const isActive = router.pathname === tab.href
                  return (
                    <motion.div
                      key={tab.name}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i + 0.1, duration: 0.3 }}
                    >
                      <Link href={tab.href} legacyBehavior>
                        <a
                          className="block py-3 px-4 rounded-xl text-base font-medium transition-all duration-200"
                          style={{
                            color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                            background: isActive ? 'var(--accent-subtle)' : 'transparent',
                          }}
                          onClick={onClose}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.color = 'var(--text-primary)'
                              e.currentTarget.style.background = 'var(--glass-hover)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.color = 'var(--text-secondary)'
                              e.currentTarget.style.background = 'transparent'
                            }
                          }}
                        >
                          {tab.name}
                        </a>
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>

              {/* Footer */}
              <div
                className="text-xs tracking-wider uppercase"
                style={{ color: 'var(--text-muted)' }}
              >
                <p>s-o-l-o.fun</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
