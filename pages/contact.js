import { motion } from "framer-motion";
import { stagger, fadeUp } from "@/lib/motion";
import { useApp } from "@/contexts/AppContext";
import { useTranslation } from "@/lib/translations";

const SOCIAL_DEFS = [
  { key: "email", labelKey: "emailLabel", href: (v) => `mailto:${v}` },
  { key: "github", labelKey: "githubLabel", href: (v) => `https://github.com/${v.replace(/^@/, "")}` },
  { key: "linkedin", labelKey: "linkedinLabel", href: (v) => (/^https?:/.test(v) ? v : `https://www.linkedin.com/in/${v.replace(/^@/, "")}`) },
  { key: "twitter", labelKey: "twitterLabel", href: (v) => `https://x.com/${v.replace(/^@/, "")}` },
  { key: "farcaster", labelKey: "farcasterLabel", href: (v) => `https://warpcast.com/${v.replace(/^@/, "")}` },
  { key: "instagram", labelKey: "instagramLabel", href: (v) => `https://instagram.com/${v.replace(/^@/, "")}` },
  { key: "telegram", labelKey: "telegramLabel", href: (v) => `https://t.me/${v.replace(/^@/, "")}` },
];

export default function Contact() {
  const { language } = useApp();
  const t = useTranslation(language);
  const c = t.contact ?? {};
  const links = SOCIAL_DEFS.filter((s) => c[s.key]);

  return (
    <motion.div className="w-full" variants={stagger} initial="hidden" animate="visible">
      <h1 className="text-2xl mb-2">{c.heading}</h1>
      <p className="mb-8 leading-relaxed">{c.subtext}</p>

      <dl className="text-sm" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        {links.map((s) => (
          <div
            key={s.key}
            className="flex items-baseline gap-6 py-3"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <dt className="w-24 shrink-0" style={{ color: "var(--text-muted)" }}>
              {c[s.labelKey]?.toLowerCase()}
            </dt>
            <dd className="min-w-0 break-all">
              <a href={s.href(c[s.key])} target={s.key === "email" ? undefined : "_blank"} rel="noreferrer">
                {c[s.key]}
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}
