// pages/_app.js
import { useRouter } from 'next/router'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from '@/components/components/layout'
import { AppProvider } from '@/contexts/AppContext'
import { initOverrides } from '@/lib/translations'
import '@/styles/globals.css'

// ── Page transition variants ──────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] } },
}

export default function App({ Component, pageProps, overrides }) {
  // Seed the translation cache synchronously before any child renders.
  // On SSR this means the HTML already has the right text; on the client
  // this runs before hydration so there is zero flash.
  if (overrides) initOverrides(overrides)

  const router = useRouter()
  const isFullscreen =
    router.pathname.startsWith('/admin') || router.pathname.startsWith('/preview')

  if (isFullscreen) {
    return (
      <AppProvider>
        <Component {...pageProps} />
      </AppProvider>
    )
  }

  return (
    <AppProvider>
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
