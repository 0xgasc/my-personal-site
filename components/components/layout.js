import { useState } from 'react'
import Sidebar from './Sidebar'
import BackgroundMount from './BackgroundMount'
import SceneCycler from './SceneCycler'
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { language, cycleLanguage, darkMode, setDarkMode } = useApp()
  const t = useTranslation(language)

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
          <div className="glass-card">
            {children}
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
