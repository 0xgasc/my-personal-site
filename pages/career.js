import { motion } from 'framer-motion'
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'

const stagger = {
  visible: { transition: { staggerChildren: 0.07 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
}

export default function Career() {
  const { darkMode, language } = useApp()
  const t = useTranslation(language)

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={fadeUp}>
        {t.career.title}
      </motion.h1>

      <motion.div variants={fadeUp} className="space-y-5">
        <p>
          {t.career.paragraph1}{' '}
          <a href="https://www.uvg.edu.gt/carreras/industrial/" target="_blank" rel="noopener noreferrer">UVG</a>
          {t.career.paragraph1b}{' '}
          <a href="https://en.ufm.edu/maestrias/mba/pensum/" target="_blank" rel="noopener noreferrer">UFM</a>
          {t.career.paragraph1c}{' '}
          <a href="https://www.unic.ac.cy/blockchain" target="_blank" rel="noopener noreferrer">UNIC</a>
          {t.career.paragraph1d}
        </p>

        <p>
          {t.career.paragraph2}{' '}
          <a href="https://www.slickcharts.com/symbol/CL" target="_blank" rel="noopener noreferrer">
            {t.career.manufacturer}
          </a>{' '}
          {t.career.paragraph2b}
        </p>

        <p>
          {t.career.paragraph3}{' '}
          <a
            href="https://www.augmentir.com/news/augmentir-brings-ai-to-sap-plant-maintenance-with-its-connected-worker-solution"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.career.readMore}
          </a>.
        </p>

        <p>
          {t.career.paragraph4}{' '}
          <a
            href="https://docs.google.com/document/d/1dADh80WJbSXYeYvpU3jf9qtZU2A-seU1MaD4cu9P6ME/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.career.myResume}
          </a>.
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-10">
        <button
          onClick={() => window.history.back()}
          className="btn-ghost"
        >
          ← {t.career.goBack}
        </button>
      </motion.div>
    </motion.div>
  )
}
