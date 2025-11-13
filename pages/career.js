import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'

export default function Career() {
  const { darkMode, language } = useApp()
  const t = useTranslation(language)

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6">{t.career.title}</h1>

      <p className="mb-8 text-justify">
        {t.career.paragraph1}{" "}
        <a
          href="https://www.uvg.edu.gt/carreras/industrial/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          UVG
        </a>
        {t.career.paragraph1b}{" "}
        <a
          href="https://en.ufm.edu/maestrias/mba/pensum/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          UFM
        </a>
        {t.career.paragraph1c}{" "}
        <a
          href="https://www.unic.ac.cy/blockchain"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          UNIC
        </a>
        {t.career.paragraph1d}
      </p>

      <p className="mb-8 text-justify">
        {t.career.paragraph2}{" "}
        <a
          href="https://www.slickcharts.com/symbol/CL"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {t.career.manufacturer}
        </a>{" "}
        {t.career.paragraph2b}
      </p>

      <p className="mb-8 text-justify">
        {t.career.paragraph3}{" "}
        <a
          href="https://www.augmentir.com/news/augmentir-brings-ai-to-sap-plant-maintenance-with-its-connected-worker-solution"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {t.career.readMore}
        </a>
        .
      </p>

      <p className="mb-8 text-justify">
        {t.career.paragraph4}{" "}
        <a
          href="https://docs.google.com/document/d/1dADh80WJbSXYeYvpU3jf9qtZU2A-seU1MaD4cu9P6ME/edit?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {t.career.myResume}
        </a>
        .
      </p>

      <button
        onClick={() => window.history.back()}
        className="text-blue-600 underline cursor-pointer"
      >
        {t.career.goBack}
      </button>
    </div>
  )
}
