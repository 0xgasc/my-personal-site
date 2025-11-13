// components/Sidebar.js
import Link from 'next/link'

const tabs = [
  { name: 'Home', href: '/' },
  { name: 'Background', href: '/career' },
  { name: 'Collection', href: '/collection' },
  { name: 'Experiments', href: '/experiments' },
  { name: 'Contact', href: '/contact' }
]

export default function Sidebar({ isOpen, onClose, darkMode }) {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-64 border-l shadow-lg transform transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } ${
        darkMode
          ? 'bg-gray-900 border-gray-700'
          : 'bg-white border-gray-300'
      }`}
      style={{ zIndex: 40 }}
    >
      <button
        onClick={onClose}
        className={`p-2 m-4 rounded transition-colors ${
          darkMode
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-100'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
        }`}
        aria-label="Close menu"
      >
        Close ×
      </button>
      <nav className="flex flex-col space-y-4 p-4">
        {tabs.map((tab) => (
          <Link key={tab.name} href={tab.href} legacyBehavior>
            <a
              className={`text-lg transition-colors ${
                darkMode
                  ? 'text-gray-200 hover:text-blue-400'
                  : 'text-gray-800 hover:text-blue-600'
              }`}
              onClick={onClose}
            >
              {tab.name}
            </a>
          </Link>
        ))}
      </nav>
    </div>
  )
}
