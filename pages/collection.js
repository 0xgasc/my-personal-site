import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useRouter } from "next/router"
import { useApp } from "@/contexts/AppContext"
import { useTranslation } from "@/lib/translations"
import Lightbox from "@/components/gallery/Lightbox"

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
}

// ── Gallery data ──────────────────────────────────────────
const randomGallery = [
  { src: "https://i2.seadn.io/ethereum/0x8b7fb2b5aee1f48e354e5e81605864319ec19039/09367d84cf3a65eae29447b8b8f271/6409367d84cf3a65eae29447b8b8f271.jpeg?w=1000", alt: "the great purge by slimesunday", title: "the great purge — slimesunday", link: "https://opensea.io/item/ethereum/0x8b7fb2b5aee1f48e354e5e81605864319ec19039/8" },
  { src: "https://i2.seadn.io/zora/0xf604c8204c4ca417635080c45f4ace8d0a7cf3ca/9995f9ea5f489e0355e01375828e7f/bc9995f9ea5f489e0355e01375828e7f.jpeg?w=1000", alt: "(don't) Leave me alone by fabrii2k", title: "(don't) Leave me alone — fabrii2k", link: "https://opensea.io/item/zora/0xf604c8204c4ca417635080c45f4ace8d0a7cf3ca/1" },
  { src: "https://i2.seadn.io/zora/0x2e3112987df0b0beb942203701abc0efb6c572d0/32a01b58ee3ce33a0d918c9b27a3dc/4332a01b58ee3ce33a0d918c9b27a3dc.png?w=1000", alt: "a tale about how a dragon feels by thisisgonz", title: "a tale about how a dragon feels — thisisgonz", link: "https://opensea.io/item/zora/0x2e3112987df0b0beb942203701abc0efb6c572d0/21" },
]

// Objkt only serves /artifact (sometimes 50MB+ GIFs) — no built-in
// thumbnails. We route the grid through images.weserv.nl which proxies +
// resizes + reformats on the fly. The lightbox still pulls the original
// /artifact for full animated quality.
const tezosOriginals = [
  { hash: "QmNhHb86j57AQ6RvM1uHzfsBBh7cMoYYpUDyP5PkxbQRBw", alt: "Digital Footprints by Ribela", title: "Digital Footprints — Ribela", link: "https://objkt.com/tokens/KT1Sfvkj5boovQCRRFSroE6SAecPHnLed7uD/11" },
  { hash: "QmXZgkNBU98bUZVhyNnFJeTGAVv44mnCiwo4JZkQgq2Tom", alt: "Jellyfish by Gogolitus", title: "Jellyfish — Gogolitus", link: "https://objkt.com/tokens/KT1PoKNmnMeuf4ReHSYNwhJdELZkMcYKfL6K/43" },
  { hash: "Qme2FDRj7V9PsHu3tVzEcfjCgoDPpbRFLKBnPXGyexRtMF", alt: "GM_ɢᴀʀʙᴀɢᴇ by Slava3ngl", title: "GM_ɢᴀʀʙᴀɢᴇ — Slava3ngl", link: "https://objkt.com/tokens/KT1A9SuKGSj1YYx35kY1LKmHwYRoN3N7Gv51/5" },
]
// Both grid thumbs AND the lightbox "full" image go through weserv. Objkt's
// CDN is flaky for direct /artifact fetches (some hashes can hang for 30+s),
// and weserv has aggressive global caching + can be told to preserve all GIF
// frames via &n=-1 so animated artifacts still animate.
const tezosGallery = tezosOriginals.map((o) => {
  const original = `https://assets.objkt.media/file/assets-003/${o.hash}/artifact`
  const thumb = `https://images.weserv.nl/?url=${encodeURIComponent(original)}&w=600&h=600&fit=cover&output=jpg&q=82&v=2`
  // No output= means weserv keeps the source format (GIF stays animated).
  // Width-only resize avoids weserv's animation-stripping pipeline.
  const full = `https://images.weserv.nl/?url=${encodeURIComponent(original)}&w=1600&v=2`
  return { src: thumb, full, alt: o.alt, title: o.title, link: o.link }
})

const vaultGallery = [
  { src: "https://art-blocks-explorations-mainnet.s3.amazonaws.com/12686.png", alt: "Friendship Bracelet by Alexis Andre and Snowfro", title: "Friendship Bracelet — Alexis Andre + Snowfro", link: "https://opensea.io/item/ethereum/0x942bc2d3e7a589fe5bd4a5c6ef9727dfd82f5c8a/12686" },
  { src: "https://i2.seadn.io/ethereum/0x8585103b49286a40d61f4c8286aab516601f6786/1c88d763ca63bd325e7c8b6bc864644c.jpeg?w=1000", alt: "Fiat Dude by Alejandro Peters", title: "Fiat Dude — Alejandro Peters", link: "https://opensea.io/item/ethereum/0x8585103b49286a40d61f4c8286aab516601f6786/18" },
  { src: "https://i2.seadn.io/ethereum/0x232a68a51d6e07357ae025d2a459c16077327102/d8ec1c65324b53f9cbeca81514d63b/02d8ec1c65324b53f9cbeca81514d63b.gif?w=1000", alt: "Max Pain v2 by Alpha Centaury Kid", title: "Max Pain v2 — Alpha Centaury Kid", link: "https://opensea.io/item/ethereum/0x232a68a51d6e07357ae025d2a459c16077327102/14" },
  { src: "https://raw2.seadn.io/ethereum/0x33fd426905f149f8376e227d0c9d3340aad17af1/579216d77a7580dd8cf08db689324f/10579216d77a7580dd8cf08db689324f.jpeg", alt: "Uncle Seize, 6529er", title: "Uncle Seize — 6529er", link: "https://opensea.io/item/ethereum/0x33fd426905f149f8376e227d0c9d3340aad17af1/3" },
  { src: "https://i2.seadn.io/ethereum/0x68930072647a0d79e601d5ee3914833ae9148247/463e210b12cfda412a6f84ef12d74801.png?w=1000", alt: "Wavelength by Kaleb Johnston", title: "Wavelength — Kaleb Johnston", link: "https://opensea.io/item/ethereum/0x68930072647a0d79e601d5ee3914833ae9148247/878" },
  { src: "https://i2.seadn.io/ethereum/0x33fd426905f149f8376e227d0c9d3340aad17af1/870b0bfc37bd9e6294fb2d955aad2d/df870b0bfc37bd9e6294fb2d955aad2d.jpeg?w=1000", alt: "Sgt Pepe by Ars0nic", title: "Sgt Pepe — Ars0nic", link: "https://opensea.io/item/ethereum/0x33fd426905f149f8376e227d0c9d3340aad17af1/37" },
]

export default function Collection() {
  const router = useRouter()
  const { darkMode, language } = useApp()
  const t = useTranslation(language)
  const [lightboxOpen, setLightboxOpen] = useState(null)

  const openLightbox = (items, index) => {
    setLightboxOpen({ items, index })
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={fadeUp}>
        {t.collection.title}
      </motion.h1>
      <motion.p
        variants={fadeUp}
        className="section-label mt-2 mb-8"
      >
        {t.collection.clickImage}
      </motion.p>

      {/* Gallery: Random Collectibles */}
      <motion.section variants={fadeUp} className="mb-12">
        <div className="flex items-baseline gap-3 mb-1">
          <h2>{t.collection.galleryRandom}</h2>
          <a
            href="https://opensea.io/gallery/0xd573becb6a6b0a0d43065d468d07787ca65daf8a/0ede10101eb1468b9a3978a9da1eca28"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs opacity-60 hover:opacity-100 transition-opacity"
          >
            OpenSea ↗
          </a>
        </div>
        <p className="text-sm mb-5 opacity-60 leading-relaxed">
          {t.collection.galleryRandomDesc}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {randomGallery.map((item, i) => (
            <motion.button
              key={item.src}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openLightbox(randomGallery, i)}
              className="gallery-item"
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={400}
                height={400}
                className="w-full aspect-square object-cover"
              />
              <div className="overlay" />
              <div className="caption">
                <p className="text-white text-xs font-medium truncate">{item.title}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Gallery: Tezos Evergreen */}
      <motion.section variants={fadeUp} className="mb-12">
        <div className="flex items-baseline gap-3 mb-1">
          <h2>{t.collection.galleryEvergreen}</h2>
          <a
            href="https://objkt.com/curations/objkt/exploring-the-evergreen-b3fe55e2"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs opacity-60 hover:opacity-100 transition-opacity"
          >
            Objkt ↗
          </a>
        </div>
        <p className="text-sm mb-5 opacity-60 leading-relaxed">
          {t.collection.galleryEvergreenDesc}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {tezosGallery.map((item, i) => (
            <motion.button
              key={item.src}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openLightbox(tezosGallery, i)}
              className="gallery-item"
            >
              <img
                src={item.src}
                alt={item.alt}
                className="w-full aspect-square object-cover"
              />
              <div className="overlay" />
              <div className="caption">
                <p className="text-white text-xs font-medium truncate">{item.title}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Vault: Memetic Artifacts */}
      <motion.section variants={fadeUp} className="mb-12">
        <div className="flex items-baseline gap-3 mb-1">
          <h2>{t.collection.vaultMemetic}</h2>
          <a
            href="https://opensea.io/0x69c8c2923005d26eaeea9500d7602eff8c81c848"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs opacity-60 hover:opacity-100 transition-opacity"
          >
            OpenSea ↗
          </a>
        </div>
        <p className="text-sm mb-5 opacity-60 leading-relaxed">
          {t.collection.vaultMemeticDesc}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {vaultGallery.map((item, i) => (
            <motion.button
              key={item.src}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openLightbox(vaultGallery, i)}
              className="gallery-item"
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={400}
                height={400}
                className="w-full aspect-square object-cover"
              />
              <div className="overlay" />
              <div className="caption">
                <p className="text-white text-xs font-medium truncate">{item.title}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>

      <motion.div variants={fadeUp}>
        <button
          onClick={() => router.back()}
          className="btn-ghost"
        >
          ← {t.collection.goBack}
        </button>
      </motion.div>

      {lightboxOpen && (
        <Lightbox
          items={lightboxOpen.items}
          initialIndex={lightboxOpen.index}
          onClose={() => setLightboxOpen(null)}
        />
      )}
    </motion.div>
  )
}
