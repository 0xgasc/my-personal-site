import Head from 'next/head'
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'

export default function PDFVersion() {
  const { language } = useApp()
  const t = useTranslation(language)

  return (
    <>
      <Head>
        <title>Gabriel Solomon – Personal Site</title>
        <style>{`
          @media print {
            nav, button, .no-print { display: none !important; }
            body { font-size: 11pt; color: #111; background: white; }
            a { color: #111; text-decoration: underline; }
            .print-page { padding: 0; max-width: 100%; }
            .page-break { page-break-before: always; }
            h1 { font-size: 22pt; }
            h2 { font-size: 16pt; }
            h3 { font-size: 13pt; }
          }
        `}</style>
      </Head>

      {/* Hide layout controls when printing */}
      <style jsx global>{`
        @media print {
          .fixed { display: none !important; }
          footer { display: none !important; }
        }
      `}</style>

      <div className="print-page w-full">

        {/* Print button */}
        <div className="no-print mb-8">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save as PDF / Print
          </button>
          <p className="text-sm mt-2 text-gray-500">
            Use your browser&apos;s print dialog → &quot;Save as PDF&quot;
          </p>
        </div>

        {/* ── HOME ── */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{t.home.greeting}</h1>
          <p className="text-lg mb-4">{t.home.welcome}</p>
          <p className="text-lg mb-4">{t.home.intro}</p>
          <p className="text-lg mb-4">
            {t.home.background} {t.home.backgroundLink} {t.home.engineering} {t.home.experimentalWork}.
          </p>
          <p className="text-lg">
            {t.home.collections} {t.home.collectionsLink}{t.home.artTab}
          </p>
        </section>

        <hr className="my-8 border-gray-300" />

        {/* ── CAREER ── */}
        <section className="mb-12 page-break">
          <h2 className="text-2xl font-bold mb-4">{t.career.title}</h2>

          <p className="mb-4 text-justify">
            {t.career.paragraph1}{' '}
            <a href="https://www.uvg.edu.gt/carreras/industrial/" className="text-blue-600 underline">UVG</a>
            {t.career.paragraph1b}{' '}
            <a href="https://en.ufm.edu/maestrias/mba/pensum/" className="text-blue-600 underline">UFM</a>
            {t.career.paragraph1c}{' '}
            <a href="https://www.unic.ac.cy/blockchain" className="text-blue-600 underline">UNIC</a>
            {t.career.paragraph1d}
          </p>

          <p className="mb-4 text-justify">
            {t.career.paragraph2}{' '}
            <a href="https://www.slickcharts.com/symbol/CL" className="text-blue-600 underline">{t.career.manufacturer}</a>{' '}
            {t.career.paragraph2b}
          </p>

          <p className="mb-4 text-justify">
            {t.career.paragraph3}{' '}
            <a href="https://www.augmentir.com/news/augmentir-brings-ai-to-sap-plant-maintenance-with-its-connected-worker-solution" className="text-blue-600 underline">
              {t.career.readMore}
            </a>.
          </p>

          <p className="text-justify">
            {t.career.paragraph4}{' '}
            <a href="https://docs.google.com/document/d/1dADh80WJbSXYeYvpU3jf9qtZU2A-seU1MaD4cu9P6ME/edit?usp=sharing" className="text-blue-600 underline">
              {t.career.myResume}
            </a>.
          </p>
        </section>

        <hr className="my-8 border-gray-300" />

        {/* ── EXPERIMENTS ── */}
        <section className="mb-12 page-break">
          <h2 className="text-2xl font-bold mb-4">Experiments</h2>

          <h3 className="text-lg font-semibold mb-2">{t.experiments.bespokeApps}</h3>
          <p className="mb-2">{t.experiments.bespokeDesc} via <strong>offset works</strong></p>
          <ul className="list-disc list-inside mb-6 space-y-1">
            <li>{t.experiments.umo} – {t.experiments.umoDesc}</li>
            <li>{t.experiments.flyinguate} – {t.experiments.flyinguateDesc}</li>
            <li>{t.experiments.stablepay} – {t.experiments.stablepayDesc}</li>
            <li><a href="https://tiqueteo.xyz" className="text-blue-600 underline">{t.experiments.tiqueteo}</a> – {t.experiments.tiqueteoDesc}</li>
            <li><a href="https://offsetworks.xyz" className="text-blue-600 underline">{t.experiments.offsetWorks}</a> – {t.experiments.offsetWorksDesc}</li>
          </ul>

          <h3 className="text-lg font-semibold mb-2">{t.experiments.coinedMoments}</h3>
          <p className="mb-2">{t.experiments.coinedDesc}</p>
          <ul className="list-disc list-inside mb-6 space-y-1">
            <li>{t.experiments.higher} – <a href="https://zora.co/collect/zora:0x2000c459b2b41d0311c9f57518d4a69294268590/4?referrer=0xd573becb6a6b0a0d43065d468d07787ca65daf8a" className="text-blue-600 underline">{t.experiments.viewCollect}</a></li>
            <li>{t.experiments.rflxns} – <a href="https://zora.co/collect/zora:0x2000c459b2b41d0311c9f57518d4a69294268590/3?referrer=0xd573becb6a6b0a0d43065d468d07787ca65daf8a" className="text-blue-600 underline">{t.experiments.viewCollect}</a></li>
            <li>{t.experiments.atitlan} – <a href="https://rodeo.club/post/0x98e116FDAF8dC4D324BC69FA7aE41f588113D3FC/1" className="text-blue-600 underline">{t.experiments.viewCollectRodeo}</a></li>
          </ul>

          <h3 className="text-lg font-semibold mb-2">{t.experiments.stretchStudies}</h3>
          <p className="mb-2">{t.experiments.stretchDesc}</p>
          <ul className="list-disc list-inside mb-2 space-y-1">
            <li>{t.experiments.boundBlight}</li>
            <li>{t.experiments.isFearr}</li>
            <li>{t.experiments.dreams}</li>
          </ul>
          <p className="text-sm italic mb-6">{t.experiments.mintingSoon}</p>

          <h3 className="text-lg font-semibold mb-2">{t.experiments.music}</h3>
          <p className="text-sm italic">{t.experiments.comingSoon}</p>
        </section>

        <hr className="my-8 border-gray-300" />

        {/* ── COLLECTIONS ── */}
        <section className="mb-12 page-break">
          <h2 className="text-2xl font-bold mb-4">{t.collection.title}</h2>

          <h3 className="text-lg font-semibold mb-1">
            {t.collection.galleryRandom}{' '}
            <a href="https://opensea.io/gallery/0xd573becb6a6b0a0d43065d468d07787ca65daf8a/0ede10101eb1468b9a3978a9da1eca28" className="text-blue-600 underline">(link)</a>
          </h3>
          <p className="mb-4">{t.collection.galleryRandomDesc}</p>

          <h3 className="text-lg font-semibold mb-1">
            {t.collection.galleryEvergreen}{' '}
            <a href="https://objkt.com/curations/objkt/exploring-the-evergreen-b3fe55e2" className="text-blue-600 underline">(link)</a>
          </h3>
          <p className="mb-4">{t.collection.galleryEvergreenDesc}</p>

          <h3 className="text-lg font-semibold mb-1">
            {t.collection.vaultMemetic}{' '}
            <a href="https://opensea.io/0x69c8c2923005d26eaeea9500d7602eff8c81c848" className="text-blue-600 underline">(link)</a>
          </h3>
          <p className="mb-4">{t.collection.vaultMemeticDesc}</p>

          <p className="text-sm">{t.collection.clickImage}</p>
        </section>

        <hr className="my-8 border-gray-300" />

        {/* ── CONTACT / FOOTER ── */}
        <section className="mb-8">
          <p className="text-sm text-gray-500">{t.footer.credits}</p>
        </section>
      </div>
    </>
  )
}
