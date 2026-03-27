import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'

export default function Tip() {
  const { darkMode, language } = useApp()
  const t = useTranslation(language)

  const tiers = [
    { emoji: '☕', amount: '$3', key: 'coffee' },
    { emoji: '🍕', amount: '$5', key: 'slice' },
    { emoji: '🍽️', amount: '$10', key: 'meal' },
    { emoji: '🚀', amount: '$25', key: 'rocket' },
  ]

  return (
    <div className="w-full max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t.tip.title}</h1>
      <p className={`mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {t.tip.subtitle}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {tiers.map((tier) => (
          <button
            key={tier.key}
            disabled
            className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all cursor-not-allowed opacity-70 ${
              darkMode
                ? 'border-gray-700 bg-gray-800/50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <span className="text-3xl mb-2">{tier.emoji}</span>
            <span className="text-lg font-semibold">{tier.amount}</span>
            <span className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t.tip[tier.key]}
            </span>
          </button>
        ))}
      </div>

      <div className={`text-center p-4 rounded-lg border ${
        darkMode
          ? 'border-gray-700 bg-gray-800/30 text-gray-400'
          : 'border-gray-200 bg-gray-50 text-gray-500'
      }`}>
        <p className="text-sm">{t.tip.comingSoon}</p>
      </div>

      <div className={`mt-8 text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        <p>{t.tip.note}</p>
      </div>

      <div className="mt-8">
        <button
          onClick={() => window.history.back()}
          className="text-blue-600 underline cursor-pointer"
        >
          {t.tip.goBack}
        </button>
      </div>
    </div>
  )
}
