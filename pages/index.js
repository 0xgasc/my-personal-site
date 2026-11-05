import { motion } from 'framer-motion'
import { stagger, fadeUp } from '@/lib/motion'
import Link from 'next/link'
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'


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
        className="overflow-hidden border"
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
