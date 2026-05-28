import { useState, useEffect, useRef } from 'react'
import Script from 'next/script'
import { motion } from 'framer-motion'
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'

const MERCHANT_ID =
  process.env.NEXT_PUBLIC_STABLEPAY_MERCHANT_ID ?? 'cmn979jnf0000110ntpw8x6fi'

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
  const [customMode, setCustomMode] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [widgetReady, setWidgetReady] = useState(false)
  const [error, setError] = useState(null)
  const customRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.StablePay) { setWidgetReady(true); return }
    const id = setInterval(() => {
      if (window.StablePay) { setWidgetReady(true); clearInterval(id) }
    }, 200)
    return () => clearInterval(id)
  }, [])

  function openCheckout(amount, label) {
    setError(null)
    if (!window.StablePay) {
      setError('Payment widget still loading — try again in a moment.')
      return
    }
    if (amount < 1) {
      setError('Minimum amount is $1.')
      return
    }
    try {
      window.StablePay.checkout({
        merchantId: MERCHANT_ID,
        amount,
        productName: `Tip — ${label}`,
        theme: darkMode ? 'dark' : 'light',
        onSuccess: () => {
          setCustomMode(false)
          setCustomAmount('')
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

  function handleTier(tier) {
    const label = `${t.tip?.[tier.label] ?? tier.label} ($${tier.amount})`
    openCheckout(tier.amount, label)
  }

  function handleCustom() {
    const amount = parseFloat(customAmount) || 0
    openCheckout(amount, `$${amount.toFixed(2)}`)
  }

  function enterCustom() {
    setCustomMode(true)
    setCustomAmount('')
    setError(null)
    setTimeout(() => customRef.current?.focus(), 50)
  }

  const muted = darkMode ? 'text-gray-400' : 'text-gray-600'
  const mutedFaint = darkMode ? 'text-gray-500' : 'text-gray-400'

  return (
    <motion.div
      className="w-full max-w-lg mx-auto"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <Script
        src="https://wetakestables.shop/checkout-widget.js"
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
            onClick={() => handleTier(tier)}
            disabled={!widgetReady}
            className="flex items-center gap-4 px-5 py-5 rounded-xl border transition-all cursor-pointer group"
            style={{
              borderColor: 'var(--border-subtle)',
              background: 'var(--glass-bg)',
              opacity: widgetReady ? 1 : 0.5,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.background = 'var(--glass-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)'
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

        {!customMode ? (
          <button
            onClick={enterCustom}
            disabled={!widgetReady}
            className="flex items-center gap-4 px-5 py-5 rounded-xl border transition-all cursor-pointer group"
            style={{
              borderColor: 'var(--border-subtle)',
              background: 'var(--glass-bg)',
              opacity: widgetReady ? 1 : 0.5,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.background = 'var(--glass-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)'
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
            <span className={`text-sm ${mutedFaint}`}>$...</span>
          </button>
        ) : (
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-xl border"
            style={{ borderColor: 'var(--accent)', background: 'var(--glass-bg)' }}
          >
            <span className={`text-lg font-medium ${muted}`}>$</span>
            <input
              ref={customRef}
              type="number"
              min="1"
              step="1"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCustom() }}
              placeholder="0"
              className={`flex-1 text-xl font-bold bg-transparent outline-none ${
                darkMode ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-300'
              }`}
              style={{ appearance: 'textfield' }}
            />
            <button
              onClick={handleCustom}
              disabled={!customAmount || parseFloat(customAmount) < 1}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-30"
              style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
            >
              Pay
            </button>
            <button
              onClick={() => setCustomMode(false)}
              className={`text-xs ${mutedFaint} hover:opacity-100`}
            >
              cancel
            </button>
          </div>
        )}
      </motion.div>

      {!widgetReady && (
        <motion.p variants={fadeUp} className={`text-xs text-center mb-4 ${mutedFaint}`}>
          Loading payment widget...
        </motion.p>
      )}

      {error && (
        <motion.div
          variants={fadeUp}
          className={`p-3 rounded-xl text-xs mb-4 ${
            darkMode ? 'bg-red-900/20 border border-red-800/50 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {error}
        </motion.div>
      )}

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
