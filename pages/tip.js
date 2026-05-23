import { useState, useEffect } from 'react'
import Script from 'next/script'
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'

const MERCHANT_ID =
  process.env.NEXT_PUBLIC_STABLEPAY_MERCHANT_ID ?? 'cmn979jnf0000110ntpw8x6fi'

export default function Tip() {
  const { darkMode, language } = useApp()
  const t = useTranslation(language)
  const [selected, setSelected] = useState(null)
  const [widgetReady, setWidgetReady] = useState(false)
  const [error, setError] = useState(null)

  // Confirm widget is loaded once Next's <Script> calls onLoad. Fallback
  // poll guards against races where Script's onLoad fires before window
  // assignment.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.StablePay) { setWidgetReady(true); return }
    const id = setInterval(() => {
      if (window.StablePay) {
        setWidgetReady(true)
        clearInterval(id)
      }
    }, 200)
    return () => clearInterval(id)
  }, [])

  const tiers = [
    { emoji: '☕', amount: 5,   key: 'coffee' },
    { emoji: '🍕', amount: 10,  key: 'slice' },
    { emoji: '🍽️', amount: 25,  key: 'meal' },
    { emoji: '🚀', amount: 100, key: 'rocket' },
  ]

  const formatAmount = (amount) => `$${amount.toFixed(2)}`

  const handleStablepay = () => {
    setError(null)
    if (!window.StablePay) {
      setError('Payment widget still loading — try again in a moment.')
      return
    }
    if (!selected) return
    try {
      window.StablePay.checkout({
        merchantId: MERCHANT_ID,
        amount: selected.amount,
        productName: `Tip Gabriel — ${t.tip[selected.key]}`,
        onSuccess: (data) => {
          console.log('[stablepay] paid', data)
          setSelected(null)
          alert(t.tip.thankYou)
        },
        onCancel: () => {
          console.log('[stablepay] cancelled')
        },
        onError: (err) => {
          console.error('[stablepay] error', err)
          setError(err?.message ?? 'Payment failed')
        },
      })
    } catch (err) {
      console.error('[stablepay] threw', err)
      setError(err instanceof Error ? err.message : 'Unable to open checkout')
    }
  }

  if (selected) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <Script
          src="https://wetakestables.shop/js/stablepay-widget.js"
          strategy="afterInteractive"
          onLoad={() => setWidgetReady(true)}
          onError={() => setError('Failed to load payment widget')}
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
            {t.tip[selected.key]} — {formatAmount(selected.amount)}
          </h2>
        </div>

        <h3 className="text-lg font-semibold mb-4">{t.tip.chooseMethod}</h3>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleStablepay}
            disabled={!widgetReady}
            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              widgetReady ? 'cursor-pointer' : 'cursor-wait opacity-60'
            } ${
              darkMode
                ? 'border-gray-700 bg-gray-800/50 hover:border-green-500 hover:bg-gray-800'
                : 'border-gray-200 bg-gray-50 hover:border-green-500 hover:bg-green-50'
            }`}
          >
            <span className="font-medium">
              {widgetReady ? 'Pay with Crypto' : 'Loading payment widget…'}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${
              darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
            }`}>USDC / USDT</span>
          </button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
        )}

        <div className={`mt-6 text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <p>{t.tip.moreMethodsSoon}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <Script
        src="https://wetakestables.shop/js/stablepay-widget.js"
        strategy="afterInteractive"
        onLoad={() => setWidgetReady(true)}
        onError={() => setError('Failed to load payment widget')}
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
            <span className="text-lg font-semibold">{formatAmount(tier.amount)}</span>
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
