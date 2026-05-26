import { motion } from 'framer-motion'
import Link from 'next/link'
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
}

export default function Home() {
  const { language } = useApp()
  const t = useTranslation(language)

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {/* Greeting — only shown when a CMS override is set */}
      {t.home.greeting && (
        <motion.h1 variants={fadeUp}>
          {t.home.greeting}
        </motion.h1>
      )}

      <motion.p
        variants={fadeUp}
        className="text-lg mb-10 leading-relaxed"
      >
        {t.home.welcome} {t.home.intro}
      </motion.p>

      <motion.div
        variants={fadeUp}
        className="space-y-4 mb-12"
      >
        <p className="leading-relaxed">
          {t.home.background}{' '}
          <Link href="/career" className="underline underline-offset-2 decoration-1 hover:decoration-2 transition-all">
            {t.home.backgroundLink}
          </Link>{' '}
          {t.home.engineering}{' '}
          <Link href="/experiments" className="underline underline-offset-2 decoration-1 hover:decoration-2 transition-all">
            {t.home.experimentalWork}
          </Link>.
        </p>

        <p className="leading-relaxed">
          {t.home.collections}{' '}
          <Link href="/collection" className="underline underline-offset-2 decoration-1 hover:decoration-2 transition-all">
            {t.home.collectionsLink}
          </Link>
          {t.home.artTab}
        </p>
      </motion.div>

      {/* ArtTab embed */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl overflow-hidden border"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <iframe
          src="https://arttab.xyz/"
          title="ArtTab Live Preview"
          className="w-full"
          style={{ height: '480px', border: 'none' }}
          loading="lazy"
          allowFullScreen
        />
      </motion.div>
    </motion.div>
  )
}
