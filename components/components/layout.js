import { useState } from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      
      {/* Main content */}
      <div className="flex-grow p-8 max-w-3xl mx-auto">
        {children}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 p-4 text-center text-sm text-gray-500">
        credits: GS - 2025
      </footer>

      {/* Sidebar toggle button on right */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 right-4 z-50 p-2 rounded-md bg-gray-200 hover:bg-gray-300 focus:outline-none"
        aria-label="Toggle menu"
      >
        {/* Simple burger icon: 3 bars */}
        <div className="w-6 h-0.5 bg-gray-700 mb-1"></div>
        <div className="w-6 h-0.5 bg-gray-700 mb-1"></div>
        <div className="w-6 h-0.5 bg-gray-700"></div>
      </button>

      {/* Sidebar component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  )
}
