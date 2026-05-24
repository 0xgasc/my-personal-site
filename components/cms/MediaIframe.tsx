"use client";

import { useMedia } from "@/lib/cms/clientFetcher";

interface Props {
  mediaKey: string;
  defaultSrc: string;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * <iframe> with a CMS hook — same as MediaImage but for embeds.
 */
export default function MediaIframe({
  mediaKey,
  defaultSrc,
  title,
  className,
  style,
}: Props) {
  const { url } = useMedia(mediaKey, defaultSrc);
  return (
    <iframe
      src={url}
      title={title ?? mediaKey}
      className={className}
      style={style}
      loading="lazy"
      allowFullScreen
    />
  );
}
