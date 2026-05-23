import Head from "next/head";
import { useEffect, useState } from "react";
import ClipsPlayer from "@/components/background/ClipsPlayer";
import DitherOverlay from "@/components/background/DitherOverlay";
import { withAdminAuth } from "@/lib/admin/withAdminAuth";
import { getClip } from "@/lib/clips/store";
import type { Clip, BlendMode } from "@/lib/clips/types";

interface Props {
  initialClip: Clip;
}

export const getServerSideProps = withAdminAuth<Props>(async (ctx) => {
  const id = ctx.params?.id;
  if (typeof id !== "string") return { notFound: true as const };
  const clip = await getClip(id);
  if (!clip) return { notFound: true as const };
  return { props: { initialClip: JSON.parse(JSON.stringify(clip)) } };
});

/**
 * Standalone single-clip preview. Renders exactly one clip (not weighted-
 * picked from a list) so an editor can see this clip's behavior in
 * isolation. Used standalone OR embedded inside iframes for the side-by-
 * side mobile/desktop preview in the editor.
 *
 * Polls the clip every 1s so slider tweaks in the editor tab show here
 * within a second without manual refresh.
 */
export default function ClipPreviewPage({ initialClip }: Props) {
  const [clip, setClip] = useState<Clip>(initialClip);
  const [active, setActive] = useState<Clip | null>(initialClip);

  useEffect(() => {
    let cancel = false;
    const id = setInterval(async () => {
      try {
        const r = await fetch(`/api/admin/clips/${initialClip.id}`);
        if (!r.ok) return;
        const j = (await r.json()) as { clip: Clip };
        if (!cancel && j.clip) {
          setClip(j.clip);
          setActive(j.clip);
        }
      } catch {
        // silent
      }
    }, 1000);
    return () => {
      cancel = true;
      clearInterval(id);
    };
  }, [initialClip.id]);

  return (
    <>
      <Head>
        <title>{`Preview · ${clip.name}`}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          overflow: "hidden",
        }}
      >
        <ClipsPlayer
          clips={[clip]}
          zIndex={-2}
          onActiveClipChange={(c) => setActive(c)}
        />
        <DitherOverlay
          zIndex={-1}
          blendMode={(active?.fxBlendMode ?? "overlay") as React.CSSProperties["mixBlendMode"]}
          opacity={active?.fxDitherIntensity ?? 1}
        />
      </div>
    </>
  );
}
