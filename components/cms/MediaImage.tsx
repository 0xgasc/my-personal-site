"use client";

import { useMedia } from "@/lib/cms/clientFetcher";

interface Props {
  /** Stable identifier used to find an override in the media table. */
  mediaKey: string;
  /** Fallback src if no override is set. */
  defaultSrc: string;
  defaultAlt?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * <img> with a CMS hook. Renders the override URL from
 * /api/media/public if one exists, otherwise the default src.
 */
export default function MediaImage({
  mediaKey,
  defaultSrc,
  defaultAlt = "",
  className,
  style,
}: Props) {
  const { url, alt } = useMedia(mediaKey, defaultSrc, defaultAlt);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className={className} style={style} />;
}
