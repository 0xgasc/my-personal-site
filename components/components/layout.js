import { useState } from 'react'
import { useRouter } from 'next/router'
import Sidebar from './Sidebar'
import BackgroundMount from './BackgroundMount'
import SceneCycler from './SceneCycler'
import SectionsRenderer from '@/components/cms/SectionsRenderer'
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'

// Map known top-level routes -> the page key used by /admin/sections.
// Anything not in here falls back to `null` (no CMS sections rendered).
function routeToPageKey(pathname) {
  if (pathname === '/') return 'home'
  // Pages-router catch-all looks like `/[slug]` — the renderer there reads
  // the slug from query and passes it explicitly, so we skip here.
  if (pathname === '/[slug]') return null
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return null
  if (pathname.startsWith('/preview')) return null
  const m = pathname.match(/^\/([a-z0-9-]+)$/)
  return m ? m[1] : null
}

const GLASS_LEVELS = [0.28, 0.10, 0.0]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [glassLevel, setGlassLevel] = useState(0)
  const { language, cycleLanguage, darkMode, setDarkMode } = useApp()
  const t = useTranslation(language)
  const router = useRouter()
  const pageKey = routeToPageKey(router.pathname)

  return (
    <div
      className={`relative min-h-screen flex flex-col font-sans transition-colors duration-500 ${
        darkMode ? 'dark' : 'light'
      }`}
      style={{
        background: darkMode
          ? 'var(--page-gradient), var(--bg-primary)'
          : 'var(--page-gradient), var(--bg-primary)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Background shader layer */}
      <BackgroundMount />

      {/* Top left controls */}
      <div className="fixed top-5 left-5 z-50 flex items-center gap-2">
        <button
          onClick={cycleLanguage}
          className="btn-ghost"
          aria-label="Toggle language"
        >
          {language}
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="btn-ghost"
          aria-label="Toggle dark mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        <SceneCycler darkMode={darkMode} />

        <button
          onClick={() => setGlassLevel((l) => (l + 1) % GLASS_LEVELS.length)}
          className="btn-ghost"
          aria-label="Toggle card opacity"
          title={`Card opacity: ${Math.round(GLASS_LEVELS[glassLevel] * 100)}%`}
        >
          {glassLevel === 0 ? '◑' : glassLevel === 1 ? '◔' : '○'}
        </button>
      </div>

      {/* Main content */}
      <main className="relative z-10 flex-grow flex justify-center px-5 pt-24 pb-12">
        <div className="w-full max-w-3xl">
          <div
            className="glass-card"
            style={{
              background: darkMode
                ? `rgba(8, 12, 22, ${GLASS_LEVELS[glassLevel]})`
                : `rgba(255, 247, 224, ${GLASS_LEVELS[glassLevel]})`,
            }}
          >
            {children}
            {pageKey && <SectionsRenderer page={pageKey} />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex justify-center px-5 pb-8">
        <div
          className="text-center text-xs tracking-wider uppercase"
          style={{ color: 'var(--text-muted)' }}
        >
          <p>{t.footer.credits}</p>
        </div>
      </footer>

      {/* Sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="btn-ghost fixed top-5 right-5 z-50 p-2.5"
        aria-label="Toggle menu"
      >
        <div className="w-5 h-0.5 mb-1 rounded bg-current opacity-60"></div>
        <div className="w-5 h-0.5 mb-1 rounded bg-current opacity-60"></div>
        <div className="w-5 h-0.5 rounded bg-current opacity-60"></div>
      </button>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} darkMode={darkMode} />
    </div>
  )
}
