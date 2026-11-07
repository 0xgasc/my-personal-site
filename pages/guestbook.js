import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { stagger, fadeUp } from "@/lib/motion"
import { useApp } from "@/contexts/AppContext"
import { useTranslation } from "@/lib/translations"
import Lightbox from "@/components/gallery/Lightbox"

export default function Guestbook() {
  const { language } = useApp()
  const t = useTranslation(language)
  const g = t.guestbook
  const [entries, setEntries] = useState(null)
  const [open, setOpen] = useState(null)

  useEffect(() => {
    fetch("/api/guestbook")
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((j) => setEntries(j.entries ?? []))
      .catch(() => setEntries([]))
  }, [])

  const items = (entries ?? []).map((e) => ({
    src: e.imageUrl,
    alt: `${e.name} — ${g.remixOf} ${e.piece.title}`,
    title: `${e.name} · ${g.remixOf} ${e.piece.title}`,
    link: e.piece.link || undefined,
  }))

  return (
    <motion.div className="w-full" variants={stagger} initial="hidden" animate="visible">
      <motion.h1 variants={fadeUp} className="text-2xl mb-6">
        {g.title}
      </motion.h1>

      {entries && entries.length === 0 && (
        <motion.p variants={fadeUp} className="text-sm leading-relaxed">
          {g.empty.split(/(collection|colección|coleção|experiments|experimentos|expériences)/).map((part, i) =>
            /^(collection|colección|coleção)$/.test(part) ? (
              <Link key={i} href="/collection">{part}</Link>
            ) : /^(experiments|experimentos|expériences)$/.test(part) ? (
              <Link key={i} href="/experiments">{part}</Link>
            ) : (
              part
            ),
          )}
        </motion.p>
      )}

      {entries && entries.length > 0 && (
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {entries.map((e, i) => (
            <figure key={e.id} className="m-0">
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="block w-full overflow-hidden focus:outline-none hover:opacity-90 transition-opacity"
                style={{ border: "1px solid var(--border-subtle)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.imageUrl} alt={items[i].alt} loading="lazy" className="w-full aspect-square object-cover" />
              </button>
              <figcaption className="mt-2 text-xs leading-relaxed">
                <span style={{ color: "var(--text-primary)" }}>{e.name}</span>
                <span style={{ color: "var(--text-muted)" }}> · {g.remixOf} {e.piece.title}</span>
                {e.note && <span className="block mt-0.5" style={{ color: "var(--text-secondary)" }}>{e.note}</span>}
              </figcaption>
            </figure>
          ))}
        </motion.div>
      )}

      {open !== null && (
        <Lightbox items={items} initialIndex={open} onClose={() => setOpen(null)} strings={t.lightbox} />
      )}
    </motion.div>
  )
}
