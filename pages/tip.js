import { useState } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/router'
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'

export default function Tip() {
  const { darkMode, language } = useApp()
  const t = useTranslation(language)
  const router = useRouter()
  const [selected, setSelected] = useState(null)

  const tiers = [
    { emoji: '☕', cents: 3, key: 'coffee' },
    { emoji: '🍕', cents: 5, key: 'slice' },
    { emoji: '🍽️', cents: 10, key: 'meal' },
    { emoji: '🚀', cents: 25, key: 'rocket' },
  ]

  const formatAmount = (cents) => `${cents}¢`

  const handleStablepay = () => {
    if (window.StablePay) {
      window.StablePay.checkout({
        merchantId: 'cmncj71sz00002m3nzy2cth78',
        amount: selected.cents / 100,
        onSuccess: (data) => {
          console.log('Payment confirmed!', data)
          setSelected(null)
          alert(t.tip.thankYou)
        },
        onCancel: () => {
          console.log('Payment cancelled')
        },
      })
    }
  }

  if (selected) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <Script
          src="https://wetakestables.shop/checkout-widget.js"
          strategy="lazyOnload"
        />

        <button
          onClick={() => setSelected(null)}
          className="text-blue-600 underline cursor-pointer mb-6"
        >
          {t.tip.goBack}
        </button>

        <div className={`text-center p-6 rounded-lg border-2 mb-8 ${
          darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <span className="text-4xl">{selected.emoji}</span>
          <h2 className="text-2xl font-bold mt-3">
            {t.tip[selected.key]} — {formatAmount(selected.cents)}
          </h2>
        </div>

        <h3 className="text-lg font-semibold mb-4">{t.tip.chooseMethod}</h3>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleStablepay}
            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
              darkMode
                ? 'border-gray-700 bg-gray-800/50 hover:border-green-500 hover:bg-gray-800'
                : 'border-gray-200 bg-gray-50 hover:border-green-500 hover:bg-green-50'
            }`}
          >
            <span className="font-medium">Pay with Crypto</span>
            <span className={`text-xs px-2 py-1 rounded ${
              darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
            }`}>USDC / USDT</span>
          </button>
        </div>

        <div className={`mt-6 text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <p>{t.tip.moreMethodsSoon}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <Script
        src="https://wetakestables.shop/checkout-widget.js"
        strategy="lazyOnload"
      />

      <h1 className="text-3xl font-bold mb-2">{t.tip.title}</h1>
      <p className={`mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {t.tip.subtitle}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {tiers.map((tier) => (
          <button
            key={tier.key}
            onClick={() => setSelected(tier)}
            className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all cursor-pointer ${
              darkMode
                ? 'border-gray-700 bg-gray-800/50 hover:border-blue-500 hover:bg-gray-800'
                : 'border-gray-200 bg-gray-50 hover:border-blue-500 hover:bg-blue-50'
            }`}
          >
            <span className="text-3xl mb-2">{tier.emoji}</span>
            <span className="text-lg font-semibold">{formatAmount(tier.cents)}</span>
            <span className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t.tip[tier.key]}
            </span>
          </button>
        ))}
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
