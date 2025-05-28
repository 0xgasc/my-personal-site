// components/Sidebar.js
import Link from 'next/link'

const tabs = [
  { name: 'Home', href: '/' },
  { name: 'Automation', href: '/automation' },
  { name: 'Photography', href: '/photography' },
  { name: 'Music', href: '/music' },
  { name: 'Experiments', href: '/experiments' },
  { name: 'Contact', href: '/contact' }
]

export default function Sidebar({ isOpen, onClose }) {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-300 shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ zIndex: 40 }}
    >
      <button
        onClick={onClose}
        className="p-2 m-4 rounded bg-gray-200 hover:bg-gray-300"
        aria-label="Close menu"
      >
        Close ×
      </button>
      <nav className="flex flex-col space-y-4 p-4">
        {tabs.map((tab) => (
          <Link key={tab.name} href={tab.href} legacyBehavior>
            <a
              className="text-lg text-gray-800 hover:text-blue-600"
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
