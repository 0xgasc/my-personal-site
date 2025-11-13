import Link from 'next/link'
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'

export default function Home() {
  const { darkMode, language } = useApp()
  const t = useTranslation(language)

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-6">{t.home.greeting}</h1>

      <p className="text-lg mb-6" style={{ textAlign: 'justify' }}>
        {t.home.welcome}
      </p>

      <p className="text-lg mb-6" style={{ textAlign: 'justify' }}>
        {t.home.intro}
      </p>

      <p className="text-lg mb-6" style={{ textAlign: 'justify' }}>
        {t.home.background}{' '}
        <Link href="/career" className="text-blue-600 underline">
          {t.home.backgroundLink}
        </Link>{' '}
        {t.home.engineering}{' '}
        <Link href="/experiments" className="text-blue-600 underline">
          {t.home.experimentalWork}
        </Link>
        .
      </p>

      <p className="text-lg mb-12" style={{ textAlign: 'justify' }}>
        {t.home.collections}{' '}
        <Link href="/collection" className="text-blue-600 underline">
          {t.home.collectionsLink}
        </Link>
        {t.home.artTab}
      </p>

      <div className={`rounded-lg overflow-hidden border shadow-lg max-w-4xl mx-auto ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
        <iframe
          src="https://arttab.xyz/"
          title="ArtTab Live Preview"
          className="w-full"
          style={{ height: '500px', border: 'none' }}
          loading="lazy"
          allowFullScreen
        />
      </div>
    </div>
  )
}
