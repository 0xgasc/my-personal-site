import { useState } from 'react'
import Sidebar from './Sidebar'
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { language, cycleLanguage, darkMode, setDarkMode } = useApp()
  const t = useTranslation(language)

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} font-sans transition-colors duration-300`}>

      {/* Top left controls */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
        {/* Language toggle */}
        <button
          onClick={cycleLanguage}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            darkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-100'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
          }`}
          aria-label="Toggle language"
        >
          {language}
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            darkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-100'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
          }`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-grow p-8 max-w-3xl mx-auto">
        {children}
      </div>

      {/* Footer */}
      <footer className={`border-t p-4 text-center text-sm ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
        {t.footer.credits}
      </footer>

      {/* Sidebar toggle button on right */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-4 right-4 z-50 p-2 rounded-md transition-colors focus:outline-none ${
          darkMode
            ? 'bg-gray-800 hover:bg-gray-700'
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
        aria-label="Toggle menu"
      >
        {/* Simple burger icon: 3 bars */}
        <div className={`w-6 h-0.5 mb-1 ${darkMode ? 'bg-gray-100' : 'bg-gray-700'}`}></div>
        <div className={`w-6 h-0.5 mb-1 ${darkMode ? 'bg-gray-100' : 'bg-gray-700'}`}></div>
        <div className={`w-6 h-0.5 ${darkMode ? 'bg-gray-100' : 'bg-gray-700'}`}></div>
      </button>

      {/* Sidebar component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} darkMode={darkMode} />
    </div>
  )
}
