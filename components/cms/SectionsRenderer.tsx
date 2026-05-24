"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type React from "react";
import type { Section } from "@/lib/cms/store";

interface Props {
  /** Page slug — `home`, `career`, `experiments`, `collection`, `tip`, or any
   *  custom slug from the `pages` table. */
  page: string;
  /** Initial sections (SSR — avoids a flash). */
  initial?: Section[];
}

/**
 * Fetches `/api/sections/[page]` and renders each section by type.
 * Add a section in /admin/sections and it shows up here automatically.
 */
export default function SectionsRenderer({ page, initial = [] }: Props) {
  const [sections, setSections] = useState<Section[]>(initial);
  useEffect(() => {
    let cancel = false;
    fetch(`/api/sections/${encodeURIComponent(page)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancel) return;
        if (Array.isArray(json?.sections)) setSections(json.sections as Section[]);
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, [page]);

  if (!sections.length) return null;

  return (
    <div className="space-y-6 mt-6">
      {sections.map((s) => (
        <SectionRender key={s.id} section={s} />
      ))}
    </div>
  );
}

function asStr(v: unknown, d = ""): string {
  return typeof v === "string" ? v : d;
}
function asNum(v: unknown, d = 0): number {
  return typeof v === "number" ? v : d;
}

function SectionRender({ section }: { section: Section }) {
  const d = section.data ?? {};
  switch (section.type) {
    case "heading": {
      const level = Math.min(3, Math.max(1, asNum(d.level, 2)));
      const Tag = (`h${level}` as unknown) as keyof React.JSX.IntrinsicElements;
      return <Tag>{asStr(d.text, "Heading")}</Tag>;
    }
    case "paragraph":
      return <p className="leading-relaxed whitespace-pre-wrap">{asStr(d.text)}</p>;
    case "image": {
      const src = asStr(d.src);
      if (!src) return null;
      // eslint-disable-next-line @next/next/no-img-element
      return (
        <img
          src={src}
          alt={asStr(d.alt, "")}
          className="w-full rounded-xl"
          style={{ border: "1px solid var(--border-subtle)" }}
        />
      );
    }
    case "link": {
      const href = asStr(d.href, "#");
      const label = asStr(d.label, href);
      const external = href.startsWith("http");
      if (external) {
        return (
          <a href={href} target="_blank" rel="noreferrer" className="underline">
            {label} ↗
          </a>
        );
      }
      return (
        <Link href={href} className="underline">
          {label}
        </Link>
      );
    }
    case "divider":
      return <hr style={{ borderColor: "var(--border-subtle)" }} />;
    case "embed":
      return (
        <iframe
          src={asStr(d.src)}
          title={asStr(d.title, "embed")}
          className="w-full rounded-xl"
          style={{
            border: "1px solid var(--border-subtle)",
            height: asNum(d.height, 480),
          }}
          loading="lazy"
          allowFullScreen
        />
      );
    case "gallery": {
      const items = Array.isArray(d.items) ? (d.items as Array<Record<string, unknown>>) : [];
      if (!items.length) return null;
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((it, i) => {
            const src = asStr(it.src);
            if (!src) return null;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt={asStr(it.alt, "")}
                className="w-full aspect-square object-cover rounded-lg"
                style={{ border: "1px solid var(--border-subtle)" }}
              />
            );
          })}
        </div>
      );
    }
    case "raw_html":
      return (
        <div
          dangerouslySetInnerHTML={{ __html: asStr(d.html) }}
        />
      );
    case "counter":
      return (
        <Counter
          from={asNum(d.from, 0)}
          to={asNum(d.to, 100)}
          suffix={asStr(d.suffix, "")}
          prefix={asStr(d.prefix, "")}
          durationMs={asNum(d.durationMs, 1500)}
          label={asStr(d.label, "")}
        />
      );
    case "two_column":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            {asStr(d.leftHeading) && <h3>{asStr(d.leftHeading)}</h3>}
            <p className="whitespace-pre-wrap leading-relaxed">{asStr(d.leftText)}</p>
          </div>
          <div className="space-y-2">
            {asStr(d.rightHeading) && <h3>{asStr(d.rightHeading)}</h3>}
            <p className="whitespace-pre-wrap leading-relaxed">{asStr(d.rightText)}</p>
          </div>
        </div>
      );
    case "accordion": {
      const items = Array.isArray(d.items) ? (d.items as Array<Record<string, unknown>>) : [];
      return (
        <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
          {items.map((it, i) => (
            <details
              key={i}
              className="py-3 group"
              style={{ borderTop: i === 0 ? `1px solid var(--border-subtle)` : undefined }}
            >
              <summary className="cursor-pointer font-medium select-none flex items-center justify-between">
                {asStr(it.q, "Question")}
                <span className="text-xs opacity-50 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-2 leading-relaxed whitespace-pre-wrap opacity-80">{asStr(it.a)}</p>
            </details>
          ))}
        </div>
      );
    }
    case "cta_button": {
      const href = asStr(d.href, "#");
      const label = asStr(d.label, "Click me");
      const external = href.startsWith("http");
      const style: React.CSSProperties = {
        display: "inline-block",
        padding: "14px 28px",
        background: "var(--accent)",
        color: "var(--bg-primary)",
        borderRadius: 999,
        fontWeight: 600,
        textDecoration: "none",
        boxShadow: "var(--shadow-md)",
      };
      if (external) {
        return (
          <a href={href} target="_blank" rel="noreferrer" style={style}>
            {label} ↗
          </a>
        );
      }
      return (
        <Link href={href} style={style}>
          {label}
        </Link>
      );
    }
    case "video_player": {
      const src = asStr(d.src);
      if (!src) return null;
      return (
        <video
          src={src}
          poster={asStr(d.poster) || undefined}
          controls={d.controls !== false}
          autoPlay={Boolean(d.autoplay)}
          muted={Boolean(d.muted)}
          loop={Boolean(d.loop)}
          playsInline
          className="w-full rounded-xl"
          style={{ border: "1px solid var(--border-subtle)" }}
        />
      );
    }
    default:
      return null;
  }
}

/** Animated number counter for `counter` section type. */
function Counter({
  from,
  to,
  prefix,
  suffix,
  durationMs,
  label,
}: {
  from: number;
  to: number;
  prefix: string;
  suffix: string;
  durationMs: number;
  label: string;
}) {
  const [value, setValue] = useState(from);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    function step(now: number) {
      const t = Math.min(1, (now - start) / Math.max(50, durationMs));
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [from, to, durationMs]);
  const display = Number.isFinite(value) ? Math.round(value).toLocaleString() : String(value);
  return (
    <div className="text-center py-4">
      <div className="font-bold text-4xl tabular-nums" style={{ color: "var(--accent)" }}>
        {prefix}
        {display}
        {suffix}
      </div>
      {label && <div className="text-sm opacity-70 mt-1">{label}</div>}
    </div>
  );
}
