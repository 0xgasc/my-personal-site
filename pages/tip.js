import { useState, useEffect } from 'react'
import Script from 'next/script'
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'

const MERCHANT_ID =
  process.env.NEXT_PUBLIC_STABLEPAY_MERCHANT_ID ?? 'cmn979jnf0000110ntpw8x6fi'
const STABLEPAY_API = 'https://stablepay-nine.vercel.app'

const CHAIN_LABELS = {
  ETHEREUM_MAINNET: 'Ethereum',
  ARBITRUM_MAINNET: 'Arbitrum',
  BASE_MAINNET: 'Base',
  POLYGON_MAINNET: 'Polygon',
  BNB_MAINNET: 'BNB Chain',
  SOLANA_MAINNET: 'Solana',
}

export default function Tip() {
  const { darkMode, language } = useApp()
  const t = useTranslation(language)
  const [selected, setSelected] = useState(null)
  const [widgetReady, setWidgetReady] = useState(false)
  const [error, setError] = useState(null)
  const [merchant, setMerchant] = useState(null)
  const [showManual, setShowManual] = useState(false)
  const [copied, setCopied] = useState(null)

  // Poll for widget global as a safety net.
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

  // Fetch merchant + wallet info upfront so manual fallback is always available.
  useEffect(() => {
    let cancel = false
    fetch(`${STABLEPAY_API}/api/embed/chains?merchantId=${MERCHANT_ID}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (!cancel && data) setMerchant(data) })
      .catch(() => {})
    return () => { cancel = true }
  }, [])

  const tiers = [
    { emoji: '☕', amount: 5,   key: 'coffee' },
    { emoji: '🍕', amount: 10,  key: 'slice' },
    { emoji: '🍽️', amount: 25,  key: 'meal' },
    { emoji: '🚀', amount: 100, key: 'rocket' },
  ]
  const formatAmount = (a) => `$${a.toFixed(2)}`

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
        onCancel: () => console.log('[stablepay] cancelled'),
        onError: (err) => {
          console.error('[stablepay] widget error', err)
          setError(err?.message ?? 'Payment failed inside widget')
        },
      })
    } catch (err) {
      console.error('[stablepay] threw', err)
      setError(err instanceof Error ? err.message : 'Unable to open checkout')
    }
  }

  function copy(text, label) {
    navigator.clipboard?.writeText(text)
      .then(() => { setCopied(label); setTimeout(() => setCopied(null), 1500) })
      .catch(() => setError('Copy failed — long-press to select.'))
  }

  // Manual wallet panel — works even if the widget is dead.
  const renderManual = () => {
    if (!merchant?.wallets?.length) {
      return (
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Loading wallet info…
        </p>
      )
    }
    return (
      <div className="flex flex-col gap-2">
        {merchant.wallets.map((w) => (
          <div
            key={w.chain}
            className={`p-3 rounded-lg border ${
              darkMode ? 'border-gray-700 bg-gray-800/40' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                {CHAIN_LABELS[w.chain] ?? w.chain}
              </span>
              <span className="text-[10px] opacity-60">
                {w.supportedTokens.join(' · ')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-[11px] font-mono break-all flex-1 leading-tight">
                {w.address}
              </code>
              <button
                onClick={() => copy(w.address, w.chain)}
                className={`text-[10px] px-2 py-1 rounded border whitespace-nowrap ${
                  darkMode
                    ? 'border-gray-700 hover:border-gray-500'
                    : 'border-gray-300 hover:border-gray-500'
                }`}
              >
                {copied === w.chain ? '✓' : 'copy'}
              </button>
            </div>
          </div>
        ))}
        {selected && (
          <p className={`text-xs text-center mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Send <span className="font-semibold">{formatAmount(selected.amount)}</span> of USDC or USDT — any chain above.
          </p>
        )}
      </div>
    )
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
          className="text-sm underline mb-6 opacity-70 hover:opacity-100"
          style={{ color: 'var(--accent)' }}
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
              {widgetReady ? '💳 Pay with Crypto (widget)' : 'Loading payment widget…'}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${
              darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
            }`}>USDC / USDT</span>
          </button>

          <button
            onClick={() => setShowManual((v) => !v)}
            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
              darkMode
                ? 'border-gray-700 bg-gray-800/50 hover:border-blue-500'
                : 'border-gray-200 bg-gray-50 hover:border-blue-500'
            }`}
          >
            <span className="font-medium">
              {showManual ? '▼' : '▸'} 🪙 Send manually to wallet
            </span>
            <span className="text-xs opacity-70">
              {merchant?.wallets?.length ?? '…'} chains
            </span>
          </button>

          {showManual && renderManual()}
        </div>

        {error && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            darkMode ? 'bg-red-900/30 border border-red-800 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <div className="font-semibold mb-1">Widget error:</div>
            <div className="text-xs">{error}</div>
            <div className="text-xs mt-2 opacity-80">
              Use the manual option above — wallet addresses work directly.
            </div>
          </div>
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
          className="text-sm underline opacity-70 hover:opacity-100"
          style={{ color: 'var(--accent)' }}
        >
          {t.tip.goBack}
        </button>
      </div>
    </div>
  )
}
