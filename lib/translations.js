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
      p1a: "I'm an industrial engineer (",
      p1b: ") with an MBA (",
      p1c: "), finishing an MSc in Blockchain and Decentralized Ledger Technology at the ",
      unic: "University of Nicosia",
      p1d: " in 2026.",
      p2: "I spent ten years at Colgate-Palmolive, from 2016 to 2026, turning manufacturing and logistics operations into software: from one plant to a global program for 15,000 users that saved over $10M. Along the way I partnered with a startup building AI tools for frontline teams, and we built an integration that brings guidance into SAP Plant Maintenance",
      readMore: "read more here",
      p3a: "Since 2025 I've run ",
      p3b: ", a small studio where I build and operate products end to end: payment tools used by merchants in the US, Europe and Latin America, ",
      p3c: ", and ",
      p3d: ", a fan archive for Unknown Mortal Orchestra.",
      p4: "If you'd like to learn more, here is",
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
      email: "gasolomonc@gmail.com",
      github: "0xgasc",
      linkedin: "",
      twitter: "",
      farcaster: "",
      instagram: "",
      telegram: "",
      emailLabel: "Email",
      githubLabel: "GitHub",
      linkedinLabel: "LinkedIn",
      twitterLabel: "Twitter / X",
      farcasterLabel: "Farcaster",
      instagramLabel: "Instagram",
      telegramLabel: "Telegram",
      goBack: "← Go back",
    },
  },
  ES: {
    home: {
      greeting: "",
      welcome: "Bienvenido a mi sitio personal.",
      intro: "Soy un explorador creativo, apasionado por construir cosas y compartir ideas.",
      background: "Tengo formación en",
      backgroundLink: "ingeniería",
      engineering: "y me apasiona usar tecnologías públicas descentralizadas para desarrollar",
      experimentalWork: "trabajo experimental",
      collections: "También disfruto coleccionar artefactos digitales en múltiples blockchains. Puedes explorar mis",
      collectionsLink: "colecciones y galerías",
      artTab: ". También he enlazado algo de arte que podrías disfrutar vía ArtTab abajo.",
    },
    career: {
      title: "Carrera y Educación",
      p1a: "Soy ingeniero industrial (",
      p1b: ") con un MBA (",
      p1c: "), y en 2026 termino un MSc en Blockchain y Tecnología de Registros Descentralizados en la ",
      unic: "Universidad de Nicosia",
      p1d: ".",
      p2: "Pasé diez años en Colgate-Palmolive, de 2016 a 2026, convirtiendo operaciones de manufactura y logística en software: de una sola planta a un programa global para 15,000 usuarios que ahorró más de $10M. En el camino me asocié con una startup que desarrolla herramientas de IA para equipos de primera línea, y construimos una integración que lleva orientación a SAP Plant Maintenance",
      readMore: "leer más aquí",
      p3a: "Desde 2025 dirijo ",
      p3b: ", un pequeño estudio donde construyo y opero productos de principio a fin: herramientas de pago que usan comercios en Estados Unidos, Europa y América Latina, ",
      p3c: " y ",
      p3d: ", un archivo de fans de Unknown Mortal Orchestra.",
      p4: "Si quieres saber más, aquí está",
      myResume: "mi currículum",
      goBack: "← Volver",
    },
    experiments: {
      bespokeApps: "trabajos seleccionados",
      bespokeDesc: "un pequeño portafolio de apps, experimentos y prototipos recientes",
      umo: "UMO Live Moment Archive",
      umoDesc: "repositorio de música en vivo para la mejor banda del mundo (DEMO)",
      flyinguate: "FlyinGuate",
      flyinguateDesc: "app de viajes en helicóptero compartido en Guatemala",
      stablepay: "Stablepay",
      stablepayDesc: "habilitando rieles de pago cripto usando stablecoins para negocios globales",
      tiqueteo: "tiqueteo.xyz",
      tiqueteoDesc: "plataforma de intercambio de boletos p2p",
      offsetWorks: "Offset Works",
      offsetWorksDesc: "estudio boutique de diseño y desarrollo para startups y creativos",
      coinedMoments: "momentos acuñados:",
      coinedDesc: "exploro la luz, la historia y la composición a través de la fotografía — desde tomas callejeras hasta escenas abstractas. Aquí algunas de mis últimas piezas en Zora:",
      higher: "higher",
      rflxns: "rflxns",
      atitlan: "atitlán 12.22.24",
      viewCollect: "Ver y coleccionar en Zora",
      viewCollectRodeo: "Ver y coleccionar en Rodeo",
      stretchStudies: "stretch studies:",
      stretchDesc: "una serie de tomas rápidas y experimentales explorando forma y textura hechas de momentos vividos.",
      boundBlight: "bound blight",
      isFearr: "is fearr ar domhan",
      dreams: "dreams",
      mintingSoon: "próximamente en un contrato personalizado de manifold.",
      music: "música:",
      comingSoon: "próximamente...",
      goBack: "← Volver",
    },
    collection: {
      title: "Artículos Digitales",
      galleryRandom: "galería: coleccionables aleatorios – post 2022",
      galleryRandomDesc: "después de la manía de 2021 y la sacudida del mercado de criptoactivos, artistas y constructores desplegaron múltiples contratos inteligentes y obras interesantes en el ecosistema de capa 2 de Ethereum. Esta galería muestra algunos de mis favoritos.",
      galleryEvergreen: "galería: explorando lo perenne",
      galleryEvergreenDesc: "mi viaje en tezos, documentado en esta pequeña curaduría",
      vaultMemetic: "bóveda: artefactos meméticos",
      vaultMemeticDesc: "tokens que amo por su valor memético global y relatable.",
      goBack: "← Volver",
      clickImage: "Haz clic en cualquier imagen para verla en OpenSea o su fuente.",
    },
    tip: {
      title: "Propina",
      subtitle: "Si disfrutas mi trabajo, considera invitarme un café. Cada aporte ayuda a impulsar nuevos proyectos y experimentos.",
      coffee: "Un café",
      meal: "Una comida",
      custom: "Monto personalizado",
      chooseMethod: "Elige método de pago",
      thankYou: "¡Gracias por tu apoyo!",
      note: "Todas las propinas van directamente a construir herramientas open-source y experimentos creativos.",
      goBack: "← Volver",
    },
    nav: {
      home: "Inicio",
      background: "Trayectoria",
      collection: "Colección",
      experiments: "Experimentos",
      tip: "Propina",
      contact: "Contacto",
      tests: "Tests",
      close: "Cerrar ×",
    },
    lightbox: {
      loading: "cargando…",
      falling: "volviendo a miniatura…",
      cannotLoad: "No se pudo cargar la imagen.",
      viewOnChain: "Ver on-chain ↗",
    },
    footer: { credits: "créditos: GS - 2026" },
    contact: {
      heading: "Conectemos",
      subtext: "Siempre dispuesto a hablar de ideas, proyectos o lo que sea.",
      email: "gasolomonc@gmail.com",
      github: "0xgasc",
      linkedin: "",
      twitter: "",
      farcaster: "",
      instagram: "",
      telegram: "",
      emailLabel: "Correo",
      githubLabel: "GitHub",
      linkedinLabel: "LinkedIn",
      twitterLabel: "Twitter / X",
      farcasterLabel: "Farcaster",
      instagramLabel: "Instagram",
      telegramLabel: "Telegram",
      goBack: "← Volver",
    },
  },
  PT: {
    home: {
      greeting: "",
      welcome: "Bem-vindo ao meu site pessoal.",
      intro: "Sou um explorador criativo, apaixonado por construir coisas e compartilhar ideias.",
      background: "Tenho formação em",
      backgroundLink: "engenharia",
      engineering: "e sou apaixonado por usar tecnologias públicas descentralizadas para desenvolver",
      experimentalWork: "trabalho experimental",
      collections: "Também gosto de colecionar artefatos digitais em múltiplas blockchains. Você pode explorar minhas",
      collectionsLink: "coleções e galerias",
      artTab: ". Também linkei algumas obras de arte que você pode gostar via ArtTab abaixo.",
    },
    career: {
      title: "Carreira e Educação",
      p1a: "Sou engenheiro industrial (",
      p1b: ") com MBA (",
      p1c: "), e em 2026 concluo um MSc em Blockchain e Tecnologia de Registro Descentralizado na ",
      unic: "Universidade de Nicósia",
      p1d: ".",
      p2: "Passei dez anos na Colgate-Palmolive, de 2016 a 2026, transformando operações de manufatura e logística em software: de uma única fábrica a um programa global para 15.000 usuários que economizou mais de US$ 10 milhões. Nesse caminho, me associei a uma startup que desenvolve ferramentas de IA para equipes de linha de frente, e construímos uma integração que leva orientação ao SAP Plant Maintenance",
      readMore: "leia mais aqui",
      p3a: "Desde 2025 dirijo a ",
      p3b: ", um pequeno estúdio onde construo e opero produtos de ponta a ponta: ferramentas de pagamento usadas por comerciantes nos EUA, na Europa e na América Latina, o ",
      p3c: " e o ",
      p3d: ", um arquivo de fãs do Unknown Mortal Orchestra.",
      p4: "Se quiser saber mais, aqui está",
      myResume: "meu currículo",
      goBack: "← Voltar",
    },
    experiments: {
      bespokeApps: "trabalhos selecionados",
      bespokeDesc: "um pequeno portfólio de apps, experimentos e protótipos recentes",
      umo: "UMO Live Moment Archive",
      umoDesc: "repositório de música ao vivo para a melhor banda do mundo (DEMO)",
      flyinguate: "FlyinGuate",
      flyinguateDesc: "app de passeios de helicóptero compartilhados na Guatemala",
      stablepay: "Stablepay",
      stablepayDesc: "habilitando trilhos de pagamento cripto usando stablecoins para negócios globais",
      tiqueteo: "tiqueteo.xyz",
      tiqueteoDesc: "plataforma de troca de ingressos p2p",
      offsetWorks: "Offset Works",
      offsetWorksDesc: "estúdio boutique de design e desenvolvimento para startups e criativos",
      coinedMoments: "momentos cunhados:",
      coinedDesc: "exploro luz, história e composição através da fotografia — de fotos de rua a cenas abstratas. Aqui estão algumas das minhas últimas peças na Zora:",
      higher: "higher",
      rflxns: "rflxns",
      atitlan: "atitlán 12.22.24",
      viewCollect: "Ver e colecionar na Zora",
      viewCollectRodeo: "Ver e colecionar na Rodeo",
      stretchStudies: "stretch studies:",
      stretchDesc: "uma série de fotos rápidas e experimentais explorando forma e textura feitas de momentos vividos.",
      boundBlight: "bound blight",
      isFearr: "is fearr ar domhan",
      dreams: "dreams",
      mintingSoon: "em breve em um contrato personalizado da manifold.",
      music: "música:",
      comingSoon: "em breve...",
      goBack: "← Voltar",
    },
    collection: {
      title: "Artigos Digitais",
      galleryRandom: "galeria: colecionáveis aleatórios – pós 2022",
      galleryRandomDesc: "após a mania de 2021 e o abalo no mercado de criptoativos, artistas e construtores implantaram múltiplos contratos inteligentes e obras interessantes no ecossistema de camada 2 do Ethereum. Esta galeria mostra alguns dos meus favoritos.",
      galleryEvergreen: "galeria: explorando o perene",
      galleryEvergreenDesc: "minha jornada no tezos, documentada nesta pequena curadoria",
      vaultMemetic: "cofre: artefatos meméticos",
      vaultMemeticDesc: "tokens que amo pelo seu valor memético global e relatable.",
      goBack: "← Voltar",
      clickImage: "Clique em qualquer imagem para vê-la no OpenSea ou sua fonte.",
    },
    tip: {
      title: "Gorjeta",
      subtitle: "Se você curte meu trabalho, considere me pagar um café. Cada apoio ajuda a impulsionar novos projetos e experimentos.",
      coffee: "Um café",
      meal: "Uma refeição",
      custom: "Valor personalizado",
      chooseMethod: "Escolha o método de pagamento",
      thankYou: "Obrigado pelo seu apoio!",
      note: "Todas as gorjetas vão diretamente para construir ferramentas open-source e experimentos criativos.",
      goBack: "← Voltar",
    },
    nav: {
      home: "Início",
      background: "Trajetória",
      collection: "Coleção",
      experiments: "Experimentos",
      tip: "Gorjeta",
      contact: "Contato",
      tests: "Tests",
      close: "Fechar ×",
    },
    lightbox: {
      loading: "carregando…",
      falling: "voltando para miniatura…",
      cannotLoad: "Não foi possível carregar a imagem.",
      viewOnChain: "Ver on-chain ↗",
    },
    footer: { credits: "créditos: GS - 2026" },
    contact: {
      heading: "Vamos conectar",
      subtext: "Sempre aberto para conversar sobre ideias, projetos ou qualquer coisa.",
      email: "gasolomonc@gmail.com",
      github: "0xgasc",
      linkedin: "",
      twitter: "",
      farcaster: "",
      instagram: "",
      telegram: "",
      emailLabel: "E-mail",
      githubLabel: "GitHub",
      linkedinLabel: "LinkedIn",
      twitterLabel: "Twitter / X",
      farcasterLabel: "Farcaster",
      instagramLabel: "Instagram",
      telegramLabel: "Telegram",
      goBack: "← Voltar",
    },
  },
  FR: {
    home: {
      greeting: "",
      welcome: "Bienvenue sur mon site personnel.",
      intro: "Je suis un explorateur créatif, passionné par la construction et le partage d'idées.",
      background: "J'ai une formation en",
      backgroundLink: "ingénierie",
      engineering: "et je suis passionné par l'utilisation de technologies publiques décentralisées pour poursuivre un",
      experimentalWork: "travail expérimental",
      collections: "J'aime aussi collectionner des artefacts numériques sur plusieurs blockchains. Vous pouvez explorer mes",
      collectionsLink: "collections et galeries",
      artTab: ". J'ai aussi lié de l'art que vous pourriez apprécier via ArtTab ci-dessous.",
    },
    career: {
      title: "Carrière et Formation",
      p1a: "Je suis ingénieur industriel (",
      p1b: ") titulaire d'un MBA (",
      p1c: "), et je termine en 2026 un MSc en Blockchain et technologies de registres décentralisés à l'",
      unic: "Université de Nicosie",
      p1d: ".",
      p2: "J'ai passé dix ans chez Colgate-Palmolive, de 2016 à 2026, à transformer des opérations de fabrication et de logistique en logiciels : d'une seule usine à un programme mondial pour 15 000 utilisateurs qui a permis d'économiser plus de 10 millions de dollars. En chemin, je me suis associé à une startup qui développe des outils d'IA pour les équipes de terrain, et nous avons construit une intégration qui apporte un guidage dans SAP Plant Maintenance",
      readMore: "en lire plus ici",
      p3a: "Depuis 2025, je dirige ",
      p3b: ", un petit studio où je conçois et exploite des produits de bout en bout : des outils de paiement utilisés par des commerçants aux États-Unis, en Europe et en Amérique latine, ",
      p3c: " et ",
      p3d: ", une archive de fans d'Unknown Mortal Orchestra.",
      p4: "Si vous souhaitez en savoir plus, voici",
      myResume: "mon CV",
      goBack: "← Retour",
    },
    experiments: {
      bespokeApps: "travaux sélectionnés",
      bespokeDesc: "un petit portfolio d'apps, expériences et prototypes récents",
      umo: "UMO Live Moment Archive",
      umoDesc: "dépôt de musique live pour le meilleur groupe du monde (DÉMO)",
      flyinguate: "FlyinGuate",
      flyinguateDesc: "app de tours en hélicoptère partagés au Guatemala",
      stablepay: "Stablepay",
      stablepayDesc: "rails de paiement crypto utilisant des stablecoins pour le commerce mondial",
      tiqueteo: "tiqueteo.xyz",
      tiqueteoDesc: "plateforme d'échange de billets p2p",
      offsetWorks: "Offset Works",
      offsetWorksDesc: "studio boutique de design et développement pour startups et créatifs",
      coinedMoments: "moments frappés :",
      coinedDesc: "j'explore la lumière, l'histoire et la composition à travers la photographie — des clichés de rue aux scènes abstraites. Voici quelques-unes de mes dernières pièces sur Zora :",
      higher: "higher",
      rflxns: "rflxns",
      atitlan: "atitlán 12.22.24",
      viewCollect: "Voir et collectionner sur Zora",
      viewCollectRodeo: "Voir et collectionner sur Rodeo",
      stretchStudies: "stretch studies :",
      stretchDesc: "une série de photos rapides et expérimentales explorant la forme et la texture à partir de moments vécus.",
      boundBlight: "bound blight",
      isFearr: "is fearr ar domhan",
      dreams: "dreams",
      mintingSoon: "bientôt disponible sur un contrat manifold personnalisé.",
      music: "musique :",
      comingSoon: "bientôt...",
      goBack: "← Retour",
    },
    collection: {
      title: "Articles Numériques",
      galleryRandom: "galerie : collectibles aléatoires – post 2022",
      galleryRandomDesc: "après la folie de 2021 et le bouleversement du marché des cryptoactifs, artistes et bâtisseurs ont déployé de multiples contrats intelligents et œuvres intéressantes dans l'écosystème de couche 2 d'Ethereum. Cette galerie montre quelques-uns de mes favoris.",
      galleryEvergreen: "galerie : explorer le pérenne",
      galleryEvergreenDesc: "mon parcours sur tezos, documenté dans cette petite curation",
      vaultMemetic: "coffre : artefacts mémétiques",
      vaultMemeticDesc: "des tokens que j'aime pour leur valeur mémétique mondiale et relatable.",
      goBack: "← Retour",
      clickImage: "Cliquez sur n'importe quelle image pour la voir sur OpenSea ou sa source.",
    },
    tip: {
      title: "Pourboire",
      subtitle: "Si vous appréciez mon travail, pensez à m'offrir un café. Chaque soutien aide à alimenter de nouveaux projets et expériences.",
      coffee: "Un café",
      meal: "Un repas",
      custom: "Montant personnalisé",
      chooseMethod: "Choisissez le mode de paiement",
      thankYou: "Merci pour votre soutien !",
      note: "Tous les pourboires vont directement à la construction d'outils open-source et d'expériences créatives.",
      goBack: "← Retour",
    },
    nav: {
      home: "Accueil",
      background: "Parcours",
      collection: "Collection",
      experiments: "Expériences",
      tip: "Pourboire",
      contact: "Contact",
      tests: "Tests",
      close: "Fermer ×",
    },
    lightbox: {
      loading: "chargement…",
      falling: "retour à la miniature…",
      cannotLoad: "Impossible de charger l'image.",
      viewOnChain: "Voir on-chain ↗",
    },
    footer: { credits: "crédits : GS - 2026" },
    contact: {
      heading: "Connectons-nous",
      subtext: "Toujours partant pour discuter d'idées, de projets ou de n'importe quoi.",
      email: "gasolomonc@gmail.com",
      github: "0xgasc",
      linkedin: "",
      twitter: "",
      farcaster: "",
      instagram: "",
      telegram: "",
      emailLabel: "E-mail",
      githubLabel: "GitHub",
      linkedinLabel: "LinkedIn",
      twitterLabel: "Twitter / X",
      farcasterLabel: "Farcaster",
      instagramLabel: "Instagram",
      telegramLabel: "Telegram",
      goBack: "← Retour",
    },
  },
}

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
