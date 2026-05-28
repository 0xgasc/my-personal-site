import { useState, useEffect, useRef } from 'react'
import Script from 'next/script'
import { motion } from 'framer-motion'
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

const stagger = { visible: { transition: { staggerChildren: 0.08 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
}

const TIERS = [
  { icon: '*', label: 'coffee', amount: 5 },
  { icon: '**', label: 'meal', amount: 15 },
]

export default function Tip() {
  const { darkMode, language } = useApp()
  const t = useTranslation(language)
  const [selected, setSelected] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [widgetReady, setWidgetReady] = useState(false)
  const [error, setError] = useState(null)
  const [merchant, setMerchant] = useState(null)
  const [showManual, setShowManual] = useState(false)
  const [copied, setCopied] = useState(null)
  const customRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.StablePay) { setWidgetReady(true); return }
    const id = setInterval(() => {
      if (window.StablePay) { setWidgetReady(true); clearInterval(id) }
    }, 200)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let cancel = false
    fetch(`${STABLEPAY_API}/api/embed/chains?merchantId=${MERCHANT_ID}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (!cancel && data) setMerchant(data) })
      .catch(() => {})
    return () => { cancel = true }
  }, [])

  const effectiveAmount = selected === 'custom'
    ? parseFloat(customAmount) || 0
    : selected?.amount ?? 0

  const effectiveLabel = selected === 'custom'
    ? `$${effectiveAmount.toFixed(2)}`
    : selected
      ? `${t.tip?.[selected.label] ?? selected.label} — $${selected.amount.toFixed(2)}`
      : ''

  function selectTier(tier) {
    setSelected(tier)
    setError(null)
    setShowManual(false)
  }

  function selectCustom() {
    setSelected('custom')
    setCustomAmount('')
    setError(null)
    setShowManual(false)
    setTimeout(() => customRef.current?.focus(), 50)
  }

  function goBack() {
    if (selected) {
      setSelected(null)
      setError(null)
      setShowManual(false)
    } else {
      window.history.back()
    }
  }

  const handleStablepay = () => {
    setError(null)
    if (!window.StablePay) {
      setError('Payment widget still loading — try again in a moment.')
      return
    }
    if (effectiveAmount < 1) {
      setError('Minimum amount is $1.')
      return
    }
    try {
      window.StablePay.checkout({
        merchantId: MERCHANT_ID,
        amount: effectiveAmount,
        productName: `Tip — ${effectiveLabel}`,
        onSuccess: () => {
          setSelected(null)
          alert(t.tip?.thankYou ?? 'Thank you!')
        },
        onCancel: () => {},
        onError: (err) => {
          setError(err?.message ?? 'Payment failed')
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to open checkout')
    }
  }

  function copy(text, label) {
    navigator.clipboard?.writeText(text)
      .then(() => { setCopied(label); setTimeout(() => setCopied(null), 1500) })
      .catch(() => setError('Copy failed'))
  }

  const muted = darkMode ? 'text-gray-400' : 'text-gray-600'
  const mutedFaint = darkMode ? 'text-gray-500' : 'text-gray-400'
  const cardBorder = darkMode ? 'border-gray-700' : 'border-gray-200'
  const cardBg = darkMode ? 'bg-gray-800/50' : 'bg-gray-50'

  // ── Payment view ──
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
          onClick={goBack}
          className={`text-sm underline mb-8 ${mutedFaint} hover:opacity-100`}
        >
          {t.tip?.goBack ?? 'back'}
        </button>

        <div
          className={`text-center p-8 rounded-xl border mb-8 ${cardBorder} ${cardBg}`}
        >
          <p className="text-3xl font-bold mb-1">
            ${effectiveAmount.toFixed(2)}
          </p>
          <p className={`text-sm ${muted}`}>{effectiveLabel}</p>
        </div>

        {selected === 'custom' && (
          <div className="mb-6">
            <label className={`block text-xs uppercase tracking-widest mb-2 ${mutedFaint}`}>
              Amount (USD)
            </label>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-medium ${muted}`}>$</span>
              <input
                ref={customRef}
                type="number"
                min="1"
                step="1"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="0"
                className={`flex-1 text-2xl font-bold bg-transparent border-b-2 pb-1 outline-none transition-colors ${
                  darkMode
                    ? 'border-gray-600 focus:border-white text-white'
                    : 'border-gray-300 focus:border-gray-900 text-gray-900'
                }`}
                style={{ appearance: 'textfield' }}
              />
            </div>
          </div>
        )}

        <h3 className={`text-xs uppercase tracking-widest mb-4 ${mutedFaint}`}>
          {t.tip?.chooseMethod ?? 'Choose payment method'}
        </h3>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleStablepay}
            disabled={!widgetReady || effectiveAmount < 1}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              widgetReady && effectiveAmount >= 1 ? 'cursor-pointer' : 'cursor-wait opacity-50'
            } ${cardBorder} ${cardBg}`}
            style={{ borderColor: widgetReady ? undefined : 'var(--border-subtle)' }}
            onMouseEnter={(e) => { if (widgetReady) e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '' }}
          >
            <span className="font-medium text-sm">
              {widgetReady ? 'Pay with crypto' : 'Loading widget...'}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${
              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
            }`}>USDC / USDT</span>
          </button>

          <button
            onClick={() => setShowManual((v) => !v)}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${cardBorder} ${cardBg}`}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '' }}
          >
            <span className="font-medium text-sm">
              {showManual ? 'Hide' : 'Show'} wallet addresses
            </span>
            <span className={`text-xs ${mutedFaint}`}>
              {merchant?.wallets?.length ?? '...'} chains
            </span>
          </button>

          {showManual && (
            <div className="flex flex-col gap-2 mt-1">
              {merchant?.wallets?.length ? merchant.wallets.map((w) => (
                <div
                  key={w.chain}
                  className={`p-3 rounded-lg border ${cardBorder} ${cardBg}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${muted}`}>
                      {CHAIN_LABELS[w.chain] ?? w.chain}
                    </span>
                    <span className={`text-[10px] ${mutedFaint}`}>
                      {w.supportedTokens.join(' / ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-[11px] font-mono break-all flex-1 leading-tight">
                      {w.address}
                    </code>
                    <button
                      onClick={() => copy(w.address, w.chain)}
                      className={`text-[10px] px-2 py-1 rounded border whitespace-nowrap ${cardBorder}`}
                    >
                      {copied === w.chain ? 'copied' : 'copy'}
                    </button>
                  </div>
                </div>
              )) : (
                <p className={`text-xs ${mutedFaint}`}>Loading wallet info...</p>
              )}
              {effectiveAmount > 0 && (
                <p className={`text-xs text-center mt-2 ${muted}`}>
                  Send <span className="font-semibold">${effectiveAmount.toFixed(2)}</span> of USDC or USDT on any chain above.
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className={`mt-4 p-3 rounded-xl text-sm ${
            darkMode ? 'bg-red-900/20 border border-red-800/50 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <p className="text-xs">{error}</p>
          </div>
        )}

        <p className={`mt-8 text-center text-xs ${mutedFaint}`}>
          {t.tip?.note ?? 'All tips go directly toward building open-source tools and creative experiments.'}
        </p>
      </div>
    )
  }

  // ── Tier selection view ──
  return (
    <motion.div
      className="w-full max-w-lg mx-auto"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <Script
        src="https://wetakestables.shop/js/stablepay-widget.js"
        strategy="afterInteractive"
        onLoad={() => setWidgetReady(true)}
        onError={() => setError('Failed to load payment widget')}
      />

      <motion.h1 variants={fadeUp} className="text-2xl font-semibold mb-2">
        {t.tip?.title ?? 'Tip Me'}
      </motion.h1>
      <motion.p variants={fadeUp} className={`mb-10 leading-relaxed ${muted}`}>
        {t.tip?.subtitle ?? 'If you enjoy my work, consider buying me a coffee.'}
      </motion.p>

      <motion.div variants={fadeUp} className="flex flex-col gap-3 mb-6">
        {TIERS.map((tier) => (
          <button
            key={tier.label}
            onClick={() => selectTier(tier)}
            className={`flex items-center gap-4 px-5 py-5 rounded-xl border transition-all cursor-pointer group ${cardBorder} ${cardBg}`}
            style={{ background: 'var(--glass-bg)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.background = 'var(--glass-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = ''
              e.currentTarget.style.background = 'var(--glass-bg)'
            }}
          >
            <span
              className="text-lg font-bold w-8 text-center shrink-0"
              style={{ color: 'var(--accent)' }}
            >
              {tier.icon}
            </span>
            <span className="flex-1 text-left">
              <span className="block text-sm font-medium">
                {t.tip?.[tier.label] ?? tier.label}
              </span>
            </span>
            <span className="text-lg font-semibold tabular-nums">
              ${tier.amount}
            </span>
          </button>
        ))}

        <button
          onClick={selectCustom}
          className={`flex items-center gap-4 px-5 py-5 rounded-xl border transition-all cursor-pointer group ${cardBorder} ${cardBg}`}
          style={{ background: 'var(--glass-bg)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.background = 'var(--glass-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = ''
            e.currentTarget.style.background = 'var(--glass-bg)'
          }}
        >
          <span
            className="text-lg font-bold w-8 text-center shrink-0"
            style={{ color: 'var(--accent)' }}
          >
            +
          </span>
          <span className="flex-1 text-left">
            <span className="block text-sm font-medium">
              {t.tip?.custom ?? 'Custom amount'}
            </span>
          </span>
          <span className={`text-sm ${mutedFaint}`}>
            $...
          </span>
        </button>
      </motion.div>

      <motion.p variants={fadeUp} className={`text-xs text-center ${mutedFaint}`}>
        {t.tip?.note ?? 'All tips go directly toward building open-source tools and creative experiments.'}
      </motion.p>

      <motion.div variants={fadeUp} className="mt-8">
        <button
          onClick={() => window.history.back()}
          className={`text-sm underline ${mutedFaint} hover:opacity-100`}
        >
          {t.tip?.goBack ?? 'back'}
        </button>
      </motion.div>
    </motion.div>
  )
}
