import { useState } from "react"
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

// ── Photography data ───────────────────────────────────────
const coinedMoments = [
  {
    src: "https://scontent-iad4-1.choicecdn.com/-/rs:fill:2000:2666/g:ce/f:webp/aHR0cHM6Ly9tYWdpYy5kZWNlbnRyYWxpemVkLWNvbnRlbnQuY29tL2lwZnMvYmFmeWJlaWRmbDM0dHlxZWh2eXhhbnJ5M3R5bHB0N2dmcmN0bmJoeW5xaWNjMmZhMjdxZndyNXh2dG0",
    alt: "Photography artwork Higher",
    title: "higher",
    link: "https://zora.co/collect/zora:0x2000c459b2b41d0311c9f57518d4a69294268590/4?referrer=0xd573becb6a6b0a0d43065d468d07787ca65daf8a",
  },
  {
    src: "https://scontent-iad4-1.choicecdn.com/-/rs:fill:2000:2614/g:ce/f:webp/aHR0cHM6Ly9tYWdpYy5kZWNlbnRyYWxpemVkLWNvbnRlbnQuY29tL2lwZnMvYmFmeWJlaWc0ZHRqZGd3d2FoeGwycHRzNXZsbGoyeng0d3Z1emM3ZGNqNGl2Y3Uyc3V1ejZvbG5majQ",
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

const stretchStudies = [
  { src: "https://arweave.net/cISz_3-jt60B7F1vMPUFbfO-03pRx33hn3fjr8T7PV4", alt: "Stretch Study 1 — bound blight", title: "bound blight" },
  { src: "https://arweave.net/Fle1sUx_Ms8RSs4-KvjcDwlij8GWUKR-WAG2cM1NvII", alt: "Stretch Study 2 — is fearr ar domhan", title: "is fearr ar domhan" },
  { src: "https://arweave.net/NiUDZK_LNI5XhpYWeYyzUTq4EgotCfry7r3LuvqcJqg", alt: "Stretch Study 3 — dreams", title: "dreams" },
]

export default function Photography() {
  const { darkMode, language } = useApp()
  const t = useTranslation(language)
  const [lightboxOpen, setLightboxOpen] = useState(null)

  const openLightbox = (items, index) => {
    setLightboxOpen({ items, index })
  }

  return (
    <motion.div
      className="w-full"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {/* Bespoke Applications */}
      <motion.h2 variants={fadeUp} className="text-xl font-semibold mb-3">
        {t.experiments.bespokeApps}
      </motion.h2>
      <motion.p variants={fadeUp} className="mb-4">
        {t.experiments.bespokeDesc}{" "}
        <a
          href="https://offsetworks.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline underline-offset-2"
        >
          offset works
        </a>
      </motion.p>
      <motion.div variants={fadeUp} className="w-full mb-12">
        <iframe
          src="https://offsetworks.xyz/#work"
          className="w-full rounded-xl border shadow-lg"
          style={{ height: "500px", width: "100%" }}
          title="Offset Works"
        />
      </motion.div>

      {/* Coined Moments */}
      <motion.h2 variants={fadeUp} className="text-xl font-semibold mb-3">
        {t.experiments.coinedMoments}
      </motion.h2>
      <motion.p variants={fadeUp} className={`mb-6 max-w-3xl text-sm leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
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

      {/* Stretch Studies */}
      <motion.h2 variants={fadeUp} className="text-xl font-semibold mb-3">
        {t.experiments.stretchStudies}
      </motion.h2>
      <motion.p variants={fadeUp} className={`mb-6 max-w-3xl text-sm leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        {t.experiments.stretchDesc}
      </motion.p>

      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-6 max-w-3xl">
        {stretchStudies.map((item, i) => (
          <motion.button
            key={item.src}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openLightbox(stretchStudies, i)}
            className="group relative overflow-hidden rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <Image
              src={item.src}
              alt={item.alt}
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

      {/* Minting note */}
      <motion.p
        variants={fadeUp}
        className={`text-sm italic mb-8 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
      >
        {t.experiments.mintingSoon}
      </motion.p>

      {/* Music Section */}
      <motion.h2 variants={fadeUp} className="text-xl font-semibold mb-3">
        {t.experiments.music}
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className={`text-sm italic mb-10 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
      >
        {t.experiments.comingSoon}
      </motion.p>

      {/* Back link */}
      <motion.div variants={fadeUp}>
        <button
          onClick={() => window.history.back()}
          className="text-blue-600 underline underline-offset-2 cursor-pointer"
        >
          {t.experiments.goBack}
        </button>
      </motion.div>

      {/* Lightbox */}
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
