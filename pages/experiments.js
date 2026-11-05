import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { stagger, fadeUp } from "@/lib/motion"
import { useApp } from "@/contexts/AppContext"
import { useTranslation } from "@/lib/translations"
import Lightbox from "@/components/gallery/Lightbox"

// ── Static: coined moments ────
// Self-hosted copies of the on-chain originals (Zora IPFS / Base Arweave);
// the marketplace CDNs that used to serve them went dead.
const coinedMoments = [
  {
    src: "/coined/higher.jpg",
    alt: "Photography artwork Higher",
    title: "higher",
    link: "https://zora.co/collect/zora:0x2000c459b2b41d0311c9f57518d4a69294268590/4?referrer=0xd573becb6a6b0a0d43065d468d07787ca65daf8a",
  },
  {
    src: "/coined/rflxns.jpg",
    alt: "Photography artwork rflxns",
    title: "rflxns",
    link: "https://zora.co/collect/zora:0x2000c459b2b41d0311c9f57518d4a69294268590/3?referrer=0xd573becb6a6b0a0d43065d468d07787ca65daf8a",
  },
  {
    src: "/coined/atitlan.jpg",
    alt: "atitlán 12.22.24",
    title: "atitlán 12.22.24",
    link: "https://rodeo.club/post/0x98e116FDAF8dC4D324BC69FA7aE41f588113D3FC/1",
  },
]

// Shown when the portfolio_items table has nothing published for a section.
// Stretch studies are resized copies; the full-size originals stay on Arweave (link).
const fallbackProjects = (t) => [
  {
    id: "umo",
    title: t.experiments.umo,
    description: t.experiments.umoDesc,
    link: "https://umo.livemoments.online/songs",
    src: "https://offsetworks.xyz/images/umo-screenshot.jpg",
  },
  {
    id: "flyin",
    title: t.experiments.flyinguate,
    description: t.experiments.flyinguateDesc,
    link: "https://flyinguate.com/",
    src: "https://offsetworks.xyz/images/flyin-screenshot.jpg",
  },
  {
    id: "stablepay",
    title: t.experiments.stablepay,
    description: t.experiments.stablepayDesc,
    link: "https://stablepay-nine.vercel.app/",
    src: "https://offsetworks.xyz/images/stablepay-screenshot.png",
  },
  {
    id: "tiqueteo",
    title: t.experiments.tiqueteo,
    description: t.experiments.tiqueteoDesc,
    link: "https://www.tiqueteo.xyz/",
    src: "https://offsetworks.xyz/images/tiqueteo-screenshot.jpg",
  },
]

const fallbackStretchStudies = [
  {
    id: "bound-blight",
    src: "/stretch/bound-blight.jpg",
    link: "https://arweave.net/cISz_3-jt60B7F1vMPUFbfO-03pRx33hn3fjr8T7PV4",
    title: "bound blight",
  },
  {
    id: "is-fearr",
    src: "/stretch/is-fearr.jpg",
    link: "https://arweave.net/Fle1sUx_Ms8RSs4-KvjcDwlij8GWUKR-WAG2cM1NvII",
    title: "is fearr ar domhan",
  },
  {
    id: "dreams",
    src: "/stretch/dreams.jpg",
    link: "https://arweave.net/NiUDZK_LNI5XhpYWeYyzUTq4EgotCfry7r3LuvqcJqg",
    title: "dreams",
  },
]

function usePortfolioItems(type) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch(`/api/portfolio/public?type=${type}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.items) setItems(json.items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [type])
  return { items, loading }
}

export default function Experiments() {
  const { darkMode, language } = useApp()
  const t = useTranslation(language)
  const [lightboxOpen, setLightboxOpen] = useState(null)

  const { items: dbProjects } = usePortfolioItems("project")
  const { items: dbStretch } = usePortfolioItems("stretch_study")
  const { items: music } = usePortfolioItems("music")
  const projects = dbProjects.length > 0 ? dbProjects : fallbackProjects(t)
  const stretchStudies = dbStretch.length > 0 ? dbStretch : fallbackStretchStudies

  const openLightbox = (items, index) => setLightboxOpen({ items, index })

  const muted = darkMode ? "text-gray-400" : "text-gray-600"

  return (
    <motion.div className="w-full" variants={stagger} initial="hidden" animate="visible">
      <motion.h2 variants={fadeUp} className="text-xl font-semibold mb-3">
        {t.experiments.bespokeApps}
      </motion.h2>
      <motion.p variants={fadeUp} className={`mb-6 text-sm leading-relaxed ${muted}`}>
        {t.experiments.bespokeDesc}
      </motion.p>

      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {projects.map((p) => (
          <a
            key={p.id}
            href={p.link || undefined}
            target="_blank"
            rel="noreferrer"
            className={`plain group overflow-hidden border transition-colors duration-150 ${
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
              {p.description && <p className={`text-xs leading-relaxed ${muted}`}>{p.description}</p>}
            </div>
          </a>
        ))}
      </motion.div>

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
            whileHover={{ opacity: 0.85 }}
            whileTap={{ opacity: 0.7 }}
            onClick={() => openLightbox(coinedMoments, i)}
            className="group relative overflow-hidden focus:outline-none"
            style={{ border: "1px solid var(--border-subtle)" }}
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={400}
              height={500}
              className="w-full aspect-[3/4] object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-black/60">
              <span className="block text-left text-xs truncate" style={{ color: "#f2f1ee" }}>
                {item.title}
              </span>
            </div>
          </motion.button>
        ))}
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-xl font-semibold mb-3">
        {t.experiments.stretchStudies}
      </motion.h2>
      <motion.p variants={fadeUp} className={`mb-6 max-w-3xl text-sm leading-relaxed ${muted}`}>
        {t.experiments.stretchDesc}
      </motion.p>

      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-12 max-w-3xl">
        {stretchStudies.map((item, i) => (
          <motion.button
            key={item.id}
            whileHover={{ opacity: 0.85 }}
            whileTap={{ opacity: 0.7 }}
            onClick={() =>
              openLightbox(
                stretchStudies.map((s) => ({ src: s.src, alt: s.title, title: s.title, link: s.link })),
                i,
              )
            }
            className="group relative overflow-hidden focus:outline-none"
            style={{ border: "1px solid var(--border-subtle)" }}
          >
            <Image
              src={item.src}
              alt={item.title}
              width={400}
              height={400}
              className="w-full aspect-square object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-black/60">
              <span className="block text-left text-xs truncate" style={{ color: "#f2f1ee" }}>
                {item.title}
              </span>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {music.length > 0 && (
        <>
          <motion.h2 variants={fadeUp} className="text-xl font-semibold mb-3">
            {t.experiments.music}
          </motion.h2>
          <motion.div variants={fadeUp} className="space-y-4 mb-10">
            {music.map((item) =>
              item.src ? (
                <div key={item.id} className="overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
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
                  className="flex items-center gap-3 px-4 py-3 transition-colors duration-150"
                  style={{ border: "1px solid var(--border-subtle)", background: "var(--glass-bg)" }}
                >
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    {item.description && <p className={`text-xs ${muted}`}>{item.description}</p>}
                  </div>
                  {item.link && <span className="ml-auto text-xs opacity-50">↗</span>}
                </a>
              ),
            )}
          </motion.div>
        </>
      )}

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
