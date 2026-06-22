/* eslint-disable */
import { useEffect, useMemo, useState } from 'react'

// ── Static fallback translations ─────────────────────────
// These are the defaults; any /api/content/public override wins on render.
export const translations = {
  EN: {
    home: {
      greeting: "",
      welcome: "Welcome to my personal site.",
      intro: "I'm a creative explorer, passionate about building things and sharing ideas.",
      background: "I have a",
      backgroundLink: "background",
      engineering: "in engineering and I'm passionate about using public decentralized technologies to pursue",
      experimentalWork: "experimental work",
      collections: "I also enjoy collecting digital artifacts across multiple blockchains. You can explore my curated",
      collectionsLink: "collections and galleries",
      artTab: ". I've also linked some art you may find enjoyable via ArtTab below.",
    },
    career: {
      title: "Career & Education",
      paragraph1: "With a background in Industrial Engineering from",
      paragraph1b: ", an MBA from",
      paragraph1c: ", and ongoing studies in Blockchain and Digital Currency at",
      paragraph1d: ", I've shaped my path around technology, operations, and systems thinking.",
      paragraph2: "I work at the intersection of industrial design and modern technology. Recently, I supported a global",
      manufacturer: "manufacturer",
      paragraph2b: "in rethinking its operations strategy and digital tooling approach.",
      paragraph3: "I also partnered with a startup developing AI tools for frontline teams. Together, we built an integration that overlays intelligent guidance onto SAP Plant Maintenance, helping factory workers navigate complex procedures in real time. You can",
      readMore: "read more here",
      paragraph4: "I'm especially interested in how emerging tools like AI and connected systems can enable smarter, safer, and more adaptive environments. If you would like to learn more, here is",
      myResume: "my resume",
      goBack: "← Go back",
    },
    experiments: {
      bespokeApps: "selected works",
      bespokeDesc: "a small portfolio of recent apps, experiments, and prototypes",
      umo: "UMO Live Moment Archive",
      umoDesc: "live music repository for the best band in the world (DEMO)",
      flyinguate: "FlyinGuate",
      flyinguateDesc: "helicopter ride sharing app in Guatemala",
      stablepay: "Stablepay",
      stablepayDesc: "enabling crypto payment rails using stablecoins for global business",
      tiqueteo: "tiqueteo.xyz",
      tiqueteoDesc: "p2p ticket swapping platform",
      offsetWorks: "Offset Works",
      offsetWorksDesc: "boutique design and development studio for startups and creatives",
      coinedMoments: "coined moments:",
      coinedDesc: "i explore light, story, and composition through photography — from street shots to abstract scenes. Here's some of my latest pieces on Zora:",
      higher: "higher",
      rflxns: "rflxns",
      atitlan: "atitlán 12.22.24",
      viewCollect: "View and Collect on Zora",
      viewCollectRodeo: "View and Collect on Rodeo",
      stretchStudies: "stretch studies:",
      stretchDesc: "a series of quick, experimental shots exploring form and texture made from living moments.",
      boundBlight: "bound blight",
      isFearr: "is fearr ar domhan",
      dreams: "dreams",
      mintingSoon: "minting soon on a custom manifold contract.",
      music: "music:",
      comingSoon: "coming soon...",
      goBack: "← Go back",
    },
    collection: {
      title: "Digital Articles",
      galleryRandom: "gallery: random collectibles – post 2022",
      galleryRandomDesc: "after the 2021 mania and shakeout in the crypto assets market, artists and builders deployed multiple interesting smart contracts and artworks into Ethereum layer 2 ecosystem. This gallery shows some of my favorite ones.",
      galleryEvergreen: "gallery: exploring the evergreen",
      galleryEvergreenDesc: "my tezos journey, documented in this small curation",
      vaultMemetic: "vault: memetic artifacts",
      vaultMemeticDesc: "tokens that I love because of their relatable and global memetic value.",
      goBack: "← Go Back",
      clickImage: "Click any image to view it on OpenSea or its source.",
    },
    tip: {
      title: "Tip Me",
      subtitle: "If you enjoy my work, consider buying me a coffee. Every bit of support helps fuel new projects and experiments.",
      coffee: "A coffee",
      meal: "A meal",
      custom: "Custom amount",
      chooseMethod: "Choose payment method",
      thankYou: "Thank you for your support!",
      note: "All tips go directly toward building open-source tools and creative experiments.",
      goBack: "← Go back",
    },
    nav: {
      home: "Home",
      background: "Background",
      collection: "Collection",
      experiments: "Experiments",
      tip: "Tip Me",
      contact: "Contact",
      tests: "Tests",
      close: "Close ×",
    },
    lightbox: {
      loading: "loading…",
      falling: "falling back to thumb…",
      cannotLoad: "Image couldn't load.",
      viewOnChain: "View on chain ↗",
    },
    footer: { credits: "credits: GS - 2026" },
    contact: {
      heading: "Let's connect",
      subtext: "Always down to talk ideas, projects, or anything in between.",
      email: "",
      github: "",
      twitter: "",
      farcaster: "",
      instagram: "",
      telegram: "",
      emailLabel: "Email",
      githubLabel: "GitHub",
      twitterLabel: "Twitter / X",
      farcasterLabel: "Farcaster",
      instagramLabel: "Instagram",
      telegramLabel: "Telegram",
      goBack: "← Go back",
    },
  },
}
// Mirror EN into other langs as fallback (overrides take precedence).
translations.ES = JSON.parse(JSON.stringify(translations.EN))
translations.PT = JSON.parse(JSON.stringify(translations.EN))
translations.FR = JSON.parse(JSON.stringify(translations.EN))

// ── Remote overrides (CMS) ───────────────────────────────
const LS_KEY = 'solo_content_overrides'

let overridesPromise = null
// Seed from localStorage so the correct text is available on first render
// (no flash from static fallback). Falls back to empty if nothing cached.
let overridesCache = (() => {
  if (typeof window === 'undefined') return { EN: {}, ES: {}, PT: {}, FR: {} }
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : { EN: {}, ES: {}, PT: {}, FR: {} }
  } catch {
    return { EN: {}, ES: {}, PT: {}, FR: {} }
  }
})()
const subscribers = new Set()

/** Called by _app.getInitialProps with SSR-fetched overrides so the
 *  module-level cache is correct before any component renders. */
export function initOverrides(data) {
  if (!data) return
  overridesCache = data
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)) } catch {}
  subscribers.forEach((cb) => cb())
}

function loadOverrides() {
  if (overridesPromise) return overridesPromise
  if (typeof window === 'undefined') return Promise.resolve(overridesCache)
  overridesPromise = fetch('/api/content/public')
    .then((r) => (r.ok ? r.json() : null))
    .then((json) => {
      if (json?.overrides) {
        overridesCache = json.overrides
        try { localStorage.setItem(LS_KEY, JSON.stringify(json.overrides)) } catch {}
        subscribers.forEach((cb) => cb())
      }
      return overridesCache
    })
    .catch(() => overridesCache)
  return overridesPromise
}

// Deep merge: source wins.
function deepMerge(base, src) {
  if (typeof src !== 'object' || src === null) return src
  if (typeof base !== 'object' || base === null) base = {}
  const out = Array.isArray(base) ? [...base] : { ...base }
  for (const k of Object.keys(src)) out[k] = deepMerge(out[k], src[k])
  return out
}

export function useTranslation(language) {
  const lang = translations[language] ? language : 'EN'
  const [tick, setTick] = useState(0)

  useEffect(() => {
    loadOverrides().then(() => setTick((t) => t + 1))
    const cb = () => setTick((t) => t + 1)
    subscribers.add(cb)
    return () => subscribers.delete(cb)
  }, [])

  return useMemo(() => {
    return deepMerge(translations[lang], overridesCache[lang] ?? {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, tick])
}
