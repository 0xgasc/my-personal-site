# Gabriel's Personal Site

Personal portfolio site built with Next.js, featuring multi-language support and dark mode.

**Live Site:** [https://www.s-o-l-o.fun](https://www.s-o-l-o.fun)

## Features

### 🌍 Multi-Language Support
- **4 Languages:** English (EN), Spanish (ES), Portuguese (PT), French (FR)
- Click the language toggle (top left) to cycle through languages
- All content is fully translated including navigation, pages, and UI elements
- Preferences saved to localStorage

### 🌙 Dark Mode
- Toggle between light and dark themes
- Sun/moon icon (top left, next to language toggle)
- Applies to all pages, containers, and modals
- Smooth color transitions
- Preference persists across sessions

### 📄 Pages
- **Home** - Introduction and overview
- **Career** - Professional background and education
- **Experiments** - Bespoke applications and creative projects
  - UMO Live Moment Archive (DEMO) - live music repository
  - FlyinGuate - helicopter ridesharing in Guatemala
  - Stablepay - crypto payment rails using stablecoins
  - tiqueteo.xyz - p2p ticket swapping platform
- **Collection** - Digital art galleries and NFT collections
  - Random collectibles (post-2022)
  - Tezos journey curation
  - Memetic artifacts vault

### 🛠 Technical Details
- **Framework:** Next.js 15.3.2
- **Styling:** Tailwind CSS
- **Translation System:** Custom implementation in `/lib/translations.js`
- **State Management:** React Context API (`/contexts/AppContext.js`)
- **Image Optimization:** Mix of Next.js Image and native img tags (for IPFS content)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Adding New Translations

To add or modify translations:

1. Edit `/lib/translations.js`
2. Add your translation keys under the appropriate language sections (EN, ES, PT, FR)
3. Use the translation in your component:

```javascript
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'

export default function MyComponent() {
  const { language } = useApp()
  const t = useTranslation(language)

  return <h1>{t.mySection.title}</h1>
}
```

## Project Structure

```
├── components/
│   └── components/
│       ├── layout.js          # Main layout with toggles
│       └── Sidebar.js         # Navigation sidebar
├── contexts/
│   └── AppContext.js          # Global state (language, dark mode)
├── lib/
│   └── translations.js        # All translation strings
├── pages/
│   ├── index.js              # Home page
│   ├── career.js             # Career/education page
│   ├── experiments.js        # Projects/photography page
│   └── collection.js         # NFT galleries page
└── styles/
    └── globals.css           # Global styles
```

## Deploy on Vercel

Currently deployed at [https://www.s-o-l-o.fun](https://www.s-o-l-o.fun)

Connected to GitHub - automatic deployments on push to main branch.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
