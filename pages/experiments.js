import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useApp } from "@/contexts/AppContext"
import { useTranslation } from "@/lib/translations"
import Lightbox from "@/components/gallery/Lightbox"

const stagger = {
  visible: { transition: { staggerChildren: 0.07 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
}

// ── Static: coined moments (blockchain, doesn't change) ────
const coinedMoments = [
  {
    src: "https://scontent-iad4-1.choicecdn.com/-/rs:fill:2000:2666/g:ce/f:webp/aHR0cHM6Ly9tYWdpYy5kZWNlbnRyYWxpemVkLWNvbnRlbnQuY29tL2lwZnMvYmFmeWJlaWRmbDM0dHlxZWh2eXhhbnJ5M3R5bHB0N2dmcmN0bmJoeW5xaWNjMmZhMjdxZndyNXh2dG0",
    alt: "Photography artwork Higher",
    title: "higher",
    link: "https://zora.co/collect/zora:0x2000c459b2b41d0311c9f57518d4a69294268590/4?referrer=0xd573becb6a6b0a0d43065d468d07787ca65daf8a",
  },
  {
    src: "https://scontent-iad4-1.choicecdn.com/-/rs:fill:2000:2614/g:ce/f:webp/aHR0cHM6Ly9tYWdpYy5kZWNlbnRyYWxpemVkLWNvbnRlbnQuY29tL2lwZnMvYmFmeWJlaWc0ZHRqZGd3d2FoeGwycHRzNXZsbGoyeng0d3Z1emM3ZGNqNGl2Y3Uyc3V1ejZvbG5maj0",
    alt: "Photography artwork rflxns",
    title: "rflxns",
    link: "https://zora.co/collect/zora:0x2000c459b2b41d0311c9f57518d4a69294268590/3?referrer=0xd573becb6a6b0a0d43065d468d07787ca65daf8a",
  },
  {
    src: "https://f8n-production-collection-assets.imgix.net/rodeo/8453/0x98e116FDAF8dC4D324BC69FA7aE41f588113D3FC/1/QmYVZaaUQWdoacXDEjJqiSAGRRAQWPiUoMwufMNajq9Yyb/nft.jpeg?auto=format%2Ccompress&q=70&cs=srgb&w=1480&dpr=2&contentHash=ipfs%3A%2F%2FQmYVZaaUQWdoacXDEjJqiSAGRRAQWPiUoMwufMNajq9Yyb&fnd_key=v1",
    alt: "atitlán 12.22.24",
    title: "atitlán 12.22.24",
    link: "https://rodeo.club/post/0x98e116FDAF8dC4D324BC69FA7aE41f588113D3FC/1",
  },
]

function usePortfolioItems(type) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch(`/api/portfolio/public?type=${type}`)
      .then((r) => r.ok ? r.json() : null)
      .then((json) => { if (json?.items) setItems(json.items) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [type])
  return { items, loading }
}

export default function Experiments() {
  const { darkMode, language } = useApp()
  const t = useTranslation(language)
  const [lightboxOpen, setLightboxOpen] = useState(null)

  const { items: projects, loading: loadingProjects } = usePortfolioItems("project")
  const { items: stretchStudies, loading: loadingStretch } = usePortfolioItems("stretch_study")
  const { items: music, loading: loadingMusic } = usePortfolioItems("music")

  const openLightbox = (items, index) => setLightboxOpen({ items, index })

  const muted = darkMode ? "text-gray-400" : "text-gray-600"

  return (
    <motion.div className="w-full" variants={stagger} initial="hidden" animate="visible">

      {/* ── Selected Works ── */}
      <motion.h2 variants={fadeUp} className="text-xl font-semibold mb-3">
        {t.experiments.bespokeApps}
      </motion.h2>
      <motion.p variants={fadeUp} className={`mb-6 text-sm leading-relaxed ${muted}`}>
        {t.experiments.bespokeDesc}
      </motion.p>

      {loadingProjects ? (
        <motion.div variants={fadeUp} className="text-sm text-gray-400 mb-12">Loading…</motion.div>
      ) : projects.length > 0 ? (
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {projects.map((p) => (
            <a
              key={p.id}
              href={p.link || undefined}
              target="_blank"
              rel="noreferrer"
              className={`group rounded-xl overflow-hidden border transition-all duration-200 ${
                p.link ? "cursor-pointer hover:border-gray-500" : "cursor-default"
              }`}
              style={{ borderColor: "var(--border-subtle)", background: "var(--glass-bg)" }}
            >
              {p.src && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={p.src}
                  alt={p.title}
                  className="w-full aspect-video object-cover group-hover:opacity-90 transition-opacity"
                />
              )}
              <div className="p-4">
                <p className="font-medium text-sm mb-1">{p.title}</p>
                {p.description && (
                  <p className={`text-xs leading-relaxed ${muted}`}>{p.description}</p>
                )}
              </div>
            </a>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className={`text-sm italic mb-12 ${muted}`}>
          {t.experiments.comingSoon}
        </motion.div>
      )}

      {/* ── Coined Moments ── */}
      <motion.h2 variants={fadeUp} className="text-xl font-semibold mb-3">
        {t.experiments.coinedMoments}
      </motion.h2>
      <motion.p variants={fadeUp} className={`mb-6 max-w-3xl text-sm leading-relaxed ${muted}`}>
        {t.experiments.coinedDesc}
      </motion.p>

      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-12 max-w-3xl">
        {coinedMoments.map((item, i) => (
          <motion.button
            key={item.src}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openLightbox(coinedMoments, i)}
            className="group relative overflow-hidden rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={400}
              height={500}
              className="w-full aspect-[3/4] object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <p className="text-white text-xs font-medium truncate">{item.title}</p>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* ── Stretch Studies ── */}
      <motion.h2 variants={fadeUp} className="text-xl font-semibold mb-3">
        {t.experiments.stretchStudies}
      </motion.h2>
      <motion.p variants={fadeUp} className={`mb-6 max-w-3xl text-sm leading-relaxed ${muted}`}>
        {t.experiments.stretchDesc}
      </motion.p>

      {loadingStretch ? (
        <motion.div variants={fadeUp} className={`text-sm ${muted} mb-12`}>Loading…</motion.div>
      ) : stretchStudies.length > 0 ? (
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-6 max-w-3xl">
          {stretchStudies.map((item, i) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openLightbox(stretchStudies.map(s => ({ src: s.src, alt: s.title, title: s.title, link: s.link })), i)}
              className="group relative overflow-hidden rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <Image
                src={item.src}
                alt={item.title}
                width={400}
                height={400}
                className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-white text-xs font-medium truncate">{item.title}</p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className={`text-sm italic mb-6 ${muted}`}>
          {t.experiments.mintingSoon}
        </motion.div>
      )}

      {/* ── Music ── */}
      <motion.h2 variants={fadeUp} className="text-xl font-semibold mb-3">
        {t.experiments.music}
      </motion.h2>

      {loadingMusic ? (
        <motion.div variants={fadeUp} className={`text-sm ${muted} mb-10`}>Loading…</motion.div>
      ) : music.length > 0 ? (
        <motion.div variants={fadeUp} className="space-y-4 mb-10">
          {music.map((item) =>
            item.src ? (
              <div key={item.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
                <iframe
                  src={item.src}
                  title={item.title}
                  className="w-full"
                  style={{ height: 166, border: "none" }}
                  loading="lazy"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                />
                {item.title && (
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium">{item.title}</p>
                    {item.description && <p className={`text-xs ${muted}`}>{item.description}</p>}
                  </div>
                )}
              </div>
            ) : (
              <a
                key={item.id}
                href={item.link || undefined}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                style={{ border: "1px solid var(--border-subtle)", background: "var(--glass-bg)" }}
              >
                <span className="text-lg" style={{ color: "var(--accent)" }}>♪</span>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.description && <p className={`text-xs ${muted}`}>{item.description}</p>}
                </div>
                {item.link && <span className="ml-auto text-xs opacity-50">↗</span>}
              </a>
            )
          )}
        </motion.div>
      ) : (
        <motion.p variants={fadeUp} className={`text-sm italic mb-10 ${muted}`}>
          {t.experiments.comingSoon}
        </motion.p>
      )}

      {/* Back */}
      <motion.div variants={fadeUp}>
        <button
          onClick={() => window.history.back()}
          className="text-blue-600 underline underline-offset-2 cursor-pointer"
        >
          {t.experiments.goBack}
        </button>
      </motion.div>

      {lightboxOpen && (
        <Lightbox
          items={lightboxOpen.items}
          initialIndex={lightboxOpen.index}
          onClose={() => setLightboxOpen(null)}
          strings={t.lightbox}
        />
      )}
    </motion.div>
  )
}
