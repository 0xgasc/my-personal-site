import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useTranslation } from "@/lib/translations";

const stagger = { visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

const SOCIAL_DEFS = [
  { key: "email",     labelKey: "emailLabel",     icon: "✉",  href: (v) => `mailto:${v}` },
  { key: "github",    labelKey: "githubLabel",     icon: "⌥",  href: (v) => `https://github.com/${v.replace(/^@/, "")}` },
  { key: "twitter",   labelKey: "twitterLabel",    icon: "𝕏",  href: (v) => `https://x.com/${v.replace(/^@/, "")}` },
  { key: "farcaster", labelKey: "farcasterLabel",  icon: "◈",  href: (v) => `https://warpcast.com/${v.replace(/^@/, "")}` },
  { key: "instagram", labelKey: "instagramLabel",  icon: "◎",  href: (v) => `https://instagram.com/${v.replace(/^@/, "")}` },
  { key: "telegram",  labelKey: "telegramLabel",   icon: "↗",  href: (v) => `https://t.me/${v.replace(/^@/, "")}` },
];

export default function Contact() {
  const { darkMode, language } = useApp();
  const t = useTranslation(language);
  const c = t.contact ?? {};

  const links = SOCIAL_DEFS.filter((s) => c[s.key]);

  return (
    <motion.div
      className="w-full"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={fadeUp} className="text-2xl font-semibold mb-2">
        {c.heading}
      </motion.h1>

      <motion.p
        variants={fadeUp}
        className="mb-10 leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {c.subtext}
      </motion.p>

      {links.length > 0 ? (
        <motion.div variants={fadeUp} className="flex flex-col gap-3 mb-12">
          {links.map((s) => (
            <a
              key={s.key}
              href={s.href(c[s.key])}
              target={s.key === "email" ? undefined : "_blank"}
              rel="noreferrer"
              className="flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 group"
              style={{
                border: "1px solid var(--border-subtle)",
                background: "var(--glass-bg)",
                color: "var(--text-primary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--glass-hover)";
                e.currentTarget.style.borderColor = "var(--border-default)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--glass-bg)";
                e.currentTarget.style.borderColor = "var(--border-subtle)";
              }}
            >
              <span
                className="text-lg w-7 text-center shrink-0"
                style={{ color: "var(--accent)" }}
              >
                {s.icon}
              </span>
              <span className="flex-1">
                <span
                  className="block text-xs uppercase tracking-widest mb-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {c[s.labelKey]}
                </span>
                <span className="text-sm font-medium">{c[s.key]}</span>
              </span>
              <span
                className="text-xs opacity-0 group-hover:opacity-50 transition-opacity"
                style={{ color: "var(--text-muted)" }}
              >
                ↗
              </span>
            </a>
          ))}
        </motion.div>
      ) : (
        <motion.p
          variants={fadeUp}
          className="mb-12 text-sm italic"
          style={{ color: "var(--text-muted)" }}
        >
          Contact links coming soon.
        </motion.p>
      )}

      <motion.div variants={fadeUp}>
        <button
          onClick={() => window.history.back()}
          className="text-sm underline underline-offset-2 cursor-pointer"
          style={{ color: "var(--text-muted)" }}
        >
          {c.goBack}
        </button>
      </motion.div>
    </motion.div>
  );
}
