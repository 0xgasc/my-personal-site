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
      paragraph1: "Con formación en Ingeniería Industrial de",
      paragraph1b: ", un MBA de",
      paragraph1c: ", y estudios en curso en Blockchain y Moneda Digital en",
      paragraph1d: ", he trazado mi camino alrededor de la tecnología, operaciones y pensamiento sistémico.",
      paragraph2: "Trabajo en la intersección del diseño industrial y la tecnología moderna. Recientemente, apoyé a un",
      manufacturer: "fabricante",
      paragraph2b: "global en repensar su estrategia de operaciones y enfoque de herramientas digitales.",
      paragraph3: "También me asocié con una startup que desarrolla herramientas de IA para equipos de primera línea. Juntos, construimos una integración que superpone orientación inteligente sobre SAP Plant Maintenance, ayudando a trabajadores de fábrica a navegar procedimientos complejos en tiempo real. Puedes",
      readMore: "leer más aquí",
      paragraph4: "Me interesa especialmente cómo herramientas emergentes como la IA y los sistemas conectados pueden habilitar entornos más inteligentes, seguros y adaptables. Si quieres saber más, aquí está",
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
      email: "",
      github: "",
      twitter: "",
      farcaster: "",
      instagram: "",
      telegram: "",
      emailLabel: "Correo",
      githubLabel: "GitHub",
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
      paragraph1: "Com formação em Engenharia Industrial pela",
      paragraph1b: ", um MBA pela",
      paragraph1c: ", e estudos em andamento em Blockchain e Moeda Digital na",
      paragraph1d: ", tracei meu caminho ao redor de tecnologia, operações e pensamento sistêmico.",
      paragraph2: "Trabalho na interseção do design industrial e tecnologia moderna. Recentemente, apoiei um",
      manufacturer: "fabricante",
      paragraph2b: "global a repensar sua estratégia de operações e abordagem de ferramentas digitais.",
      paragraph3: "Também me associei a uma startup que desenvolve ferramentas de IA para equipes de linha de frente. Juntos, construímos uma integração que sobrepõe orientação inteligente ao SAP Plant Maintenance, ajudando trabalhadores de fábrica a navegar procedimentos complexos em tempo real. Você pode",
      readMore: "ler mais aqui",
      paragraph4: "Estou especialmente interessado em como ferramentas emergentes como IA e sistemas conectados podem viabilizar ambientes mais inteligentes, seguros e adaptáveis. Se quiser saber mais, aqui está",
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
      email: "",
      github: "",
      twitter: "",
      farcaster: "",
      instagram: "",
      telegram: "",
      emailLabel: "E-mail",
      githubLabel: "GitHub",
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
      paragraph1: "Avec une formation en Génie Industriel de",
      paragraph1b: ", un MBA de",
      paragraph1c: ", et des études en cours en Blockchain et Monnaie Numérique à",
      paragraph1d: ", j'ai tracé mon chemin autour de la technologie, des opérations et de la pensée systémique.",
      paragraph2: "Je travaille à l'intersection du design industriel et de la technologie moderne. Récemment, j'ai accompagné un",
      manufacturer: "fabricant",
      paragraph2b: "mondial dans la refonte de sa stratégie d'opérations et de son approche d'outillage numérique.",
      paragraph3: "Je me suis aussi associé à une startup développant des outils d'IA pour les équipes de terrain. Ensemble, nous avons construit une intégration qui superpose un guidage intelligent sur SAP Plant Maintenance, aidant les ouvriers à naviguer des procédures complexes en temps réel. Vous pouvez",
      readMore: "en lire plus ici",
      paragraph4: "Je suis particulièrement intéressé par la façon dont des outils émergents comme l'IA et les systèmes connectés peuvent permettre des environnements plus intelligents, sûrs et adaptables. Si vous souhaitez en savoir plus, voici",
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
      email: "",
      github: "",
      twitter: "",
      farcaster: "",
      instagram: "",
      telegram: "",
      emailLabel: "E-mail",
      githubLabel: "GitHub",
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
