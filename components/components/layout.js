import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import BackgroundMount from './BackgroundMount'
import SceneCycler from './SceneCycler'
import SectionsRenderer from '@/components/cms/SectionsRenderer'
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'

// Map known top-level routes -> the page key used by /admin/sections.
function routeToPageKey(pathname) {
  if (pathname === '/') return 'home'
  // The catch-all page renders its own sections from the slug.
  if (pathname === '/[slug]') return null
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return null
  if (pathname.startsWith('/preview')) return null
  const m = pathname.match(/^\/([a-z0-9-]+)$/)
  return m ? m[1] : null
}

export default function Layout({ children }) {
  const { language, cycleLanguage, darkMode, setDarkMode } = useApp()
  const t = useTranslation(language)
  const router = useRouter()
  const pageKey = routeToPageKey(router.pathname)

  // Signed-in owner sees an "edit" shortcut; visitors never do.
  const [isAdmin, setIsAdmin] = useState(false)
  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setIsAdmin(Boolean(j?.admin)))
      .catch(() => {})
  }, [])

  const nav = [
    { name: t.nav.home, href: '/' },
    { name: t.nav.background, href: '/career' },
    { name: t.nav.collection, href: '/collection' },
    { name: t.nav.experiments, href: '/experiments' },
    { name: t.nav.tip, href: '/tip' },
    { name: t.nav.guestbook, href: '/guestbook' },
    { name: t.nav.contact, href: '/contact' },
  ]

  return (
    <div className={`relative min-h-screen flex flex-col ${darkMode ? 'dark' : 'light'}`}>
      <BackgroundMount />

      <main className="relative z-10 flex-grow flex justify-center px-5 pt-10 pb-12 max-sm:pt-5">
        <div className="w-full max-w-3xl">
          <div className="glass-card">
            <header className="site-head">
              <nav className="site-nav">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={router.pathname === item.href ? 'page' : undefined}
                  >
                    {item.name.toLowerCase()}
                  </Link>
                ))}
              </nav>
              <div className="site-tools">
                <button onClick={cycleLanguage} aria-label="Change language">
                  {language.toLowerCase()}
                </button>
                <button onClick={() => setDarkMode(!darkMode)} aria-label="Toggle dark mode">
                  {darkMode ? 'light' : 'dark'}
                </button>
                <SceneCycler darkMode={darkMode} />
                {isAdmin && <Link href="/admin/guestbook" className="plain" style={{ color: 'var(--text-secondary)' }}>edit</Link>}
              </div>
            </header>
            {children}
            {pageKey && <SectionsRenderer page={pageKey} />}
          </div>
        </div>
      </main>

      <footer className="relative z-10 flex justify-center px-5 pb-8">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.footer.credits}</p>
      </footer>
    </div>
  )
}
