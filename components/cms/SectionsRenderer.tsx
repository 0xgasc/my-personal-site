"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    default:
      return null;
  }
}
