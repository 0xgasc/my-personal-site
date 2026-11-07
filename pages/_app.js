// pages/_app.js
import { useRouter } from 'next/router'
import { IBM_Plex_Mono } from 'next/font/google'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from '@/components/components/layout'
import { AppProvider } from '@/contexts/AppContext'
import { initOverrides } from '@/lib/translations'
import '@/styles/globals.css'

// Self-hosted and preloaded: no render-blocking Google Fonts request.
// Exposed as a CSS variable on :root so portals (lightbox, modals) get it too.
const plex = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' })
const fontVar = <style jsx global>{`:root { --font-plex: ${plex.style.fontFamily}; }`}</style>

// ── Page transition variants ──────────────────────────────
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.1, ease: 'easeIn' } },
}

export default function App({ Component, pageProps, overrides }) {
  // Seed the translation cache synchronously before any child renders.
  // On SSR this means the HTML already has the right text; on the client
  // this runs before hydration so there is zero flash.
  if (overrides) initOverrides(overrides)

  const router = useRouter()
  const isFullscreen =
    router.pathname.startsWith('/admin') || router.pathname.startsWith('/preview') || router.pathname === '/contentlocker'

  if (isFullscreen) {
    return (
      <AppProvider>
        {fontVar}
        <Component {...pageProps} />
      </AppProvider>
    )
  }

  return (
    <AppProvider>
      {fontVar}
      <Layout>
        <AnimatePresence mode="wait">
          <motion.div
            key={router.asPath}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Component {...pageProps} />
          </motion.div>
        </AnimatePresence>
      </Layout>
    </AppProvider>
  )
}

App.getInitialProps = async ({ ctx }) => {
  // Server-side only: fetch content overrides from DB directly so the
  // rendered HTML already contains the correct CMS text — no client fetch
  // needed, no flash on any visit including the very first one.
  if (typeof window !== 'undefined') return {}
  try {
    const { buildOverrides } = await import('@/lib/content/store')
    const overrides = await buildOverrides()
    return { overrides }
  } catch {
    return {}
  }
}
