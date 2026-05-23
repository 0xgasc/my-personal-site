// pages/_app.js
import { useRouter } from 'next/router'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from '@/components/components/layout'
import { AppProvider } from '@/contexts/AppContext'
import '@/styles/globals.css'

// ── Page transition variants ──────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] } },
}

export default function App({ Component, pageProps }) {
  const router = useRouter()
  // Admin + preview pages render their own chrome. Don't wrap them in the
  // public site Layout, which would leak the lang/dark/burger buttons + the
  // background FX canvas + the ArtTab iframe onto fullscreen pages.
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
