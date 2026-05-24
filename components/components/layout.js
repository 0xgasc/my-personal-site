import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Sidebar from './Sidebar'
import BackgroundMount from './BackgroundMount'
import SceneCycler from './SceneCycler'
import SectionsRenderer from '@/components/cms/SectionsRenderer'
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'

// matchMedia hook — defaults to false on SSR so initial paint matches.
// On client, listens and re-renders when the device crosses 768px.
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(mql.matches)
    update()
    if (mql.addEventListener) mql.addEventListener('change', update)
    else mql.addListener(update)
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', update)
      else mql.removeListener(update)
    }
  }, [])
  return isMobile
}

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

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { language, cycleLanguage, darkMode, setDarkMode } = useApp()
  const t = useTranslation(language)
  const router = useRouter()
  const pageKey = routeToPageKey(router.pathname)
  const isMobile = useIsMobile()

  // Inline styles win over !important issues / Safari cache quirks. On
  // mobile, force a solid card background + drop backdrop-filter so the
  // FX layer can't bleed through and text stays crisp.
  const glassStyle = isMobile
    ? {
        background: darkMode ? '#0a0f1d' : '#fffaee',
        color: darkMode ? '#eef1f9' : '#0e2233',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        border: darkMode
          ? '1px solid rgba(180, 200, 240, 0.18)'
          : '1px solid rgba(14, 34, 51, 0.16)',
      }
    : undefined

  return (
    <div className={`relative min-h-screen flex flex-col font-sans transition-colors duration-500 ${
      darkMode ? 'dark' : 'light'
    }`}>
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
      </div>

      {/* Main content */}
      <main className="relative z-10 flex-grow flex justify-center px-5 pt-24 pb-12">
        <div className="w-full max-w-3xl">
          <div className="glass-card" style={glassStyle}>
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
