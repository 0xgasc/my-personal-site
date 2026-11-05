import { useState, useEffect, useRef } from 'react'
import Script from 'next/script'
import { motion } from 'framer-motion'
import { stagger, fadeUp } from '@/lib/motion'
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'

const MERCHANT_ID =
  process.env.NEXT_PUBLIC_STABLEPAY_MERCHANT_ID ?? 'cmn979jnf0000110ntpw8x6fi'

const TIERS = [
  { label: 'coffee', amount: 5 },
  { label: 'meal', amount: 15 },
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

  function openCustomCheckout() {
    setError(null)
    const amount = parseFloat(customAmount) || 0
    if (amount < 0.05) { setError('Minimum amount is $0.05.'); return }
    if (!window.StablePay) { setError('Payment widget still loading.'); return }
    try {
      window.StablePay.checkout({
        merchantId: MERCHANT_ID,
        amount,
        productName: `Tip — $${amount.toFixed(2)}`,
        theme: darkMode ? 'dark' : 'light',
        onSuccess: () => {
          setCustomMode(false)
          setCustomAmount('')
          alert(t.tip?.thankYou ?? 'Thank you!')
        },
        onCancel: () => {},
        onError: (err) => setError(err?.message ?? 'Payment failed'),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to open checkout')
    }
  }

  function handleWidgetTier(tier) {
    setError(null)
    if (!window.StablePay) { setError('Payment widget still loading.'); return }
    try {
      window.StablePay.checkout({
        merchantId: MERCHANT_ID,
        amount: tier.amount,
        productName: `Tip — ${t.tip?.[tier.label] ?? tier.label} ($${tier.amount})`,
        theme: darkMode ? 'dark' : 'light',
        onSuccess: () => alert(t.tip?.thankYou ?? 'Thank you!'),
        onCancel: () => {},
        onError: (err) => setError(err?.message ?? 'Payment failed'),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to open checkout')
    }
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
      className="w-full"
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

      <motion.div variants={fadeUp} className="flex flex-col mb-6 text-sm" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        {TIERS.map((tier) => (
          <button
            key={tier.label}
            onClick={() => handleWidgetTier(tier)}
            disabled={!widgetReady}
            className="row-btn"
            style={{ opacity: widgetReady ? 1 : 0.5 }}
          >
            <span className="flex-1 text-left">{t.tip?.[tier.label] ?? tier.label}</span>
            <span className="tabular-nums">${tier.amount}</span>
          </button>
        ))}

        {!customMode ? (
          <button
            onClick={enterCustom}
            className="row-btn"
          >
            <span className="flex-1 text-left">{t.tip?.custom ?? 'Custom amount'}</span>
            <span style={{ color: 'var(--text-muted)' }}>$</span>
          </button>
        ) : (
          <div
            className="flex items-center gap-3 py-3"
            style={{ borderBottom: '1px solid var(--border-default)' }}
          >
            <span className={`text-lg font-medium ${muted}`}>$</span>
            <input
              ref={customRef}
              type="number"
              min="0.05"
              step="0.01"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') openCustomCheckout() }}
              placeholder="0"
              className={`flex-1 text-base bg-transparent outline-none ${
                darkMode ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-300'
              }`}
              style={{ appearance: 'textfield' }}
            />
            <button
              onClick={openCustomCheckout}
              disabled={!widgetReady || !customAmount || parseFloat(customAmount) < 0.05}
              className="px-4 py-1.5 text-sm transition-opacity disabled:opacity-30"
              style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
            >
              {widgetReady ? 'Pay' : '...'}
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

      {error && (
        <motion.div
          variants={fadeUp}
          className={`p-3 text-xs mb-4 ${
            darkMode ? 'bg-red-900/20 border border-red-800/50 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {error}
        </motion.div>
      )}

      <motion.p variants={fadeUp} className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {t.tip?.note ?? 'All tips go directly toward building open-source tools and creative experiments.'}
      </motion.p>

    </motion.div>
  )
}
