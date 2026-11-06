import { motion } from 'framer-motion'
import { stagger, fadeUp } from '@/lib/motion'
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'
import CareerText from '@/components/components/CareerText'

export default function Career() {
  const { language } = useApp()
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
        <CareerText t={t} />
      </motion.div>

    </motion.div>
  )
}
