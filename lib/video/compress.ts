"use client";

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  bitrate?: number;
  fps?: number;
  /** Called repeatedly with 0..1 progress while transcoding. */
  onProgress?: (pct: number) => void;
  /** Called once with negotiated target settings before transcode begins. */
  onSettings?: (s: {
    width: number;
    height: number;
    duration: number;
    mimeType: string;
  }) => void;
}

const PREFERRED_MIME_TYPES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
];

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "video/webm";
  for (const t of PREFERRED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return "video/webm";
}

/**
 * Re-encodes a video file to a standard web-friendly target (720p VP9, ~1.5 Mbps,
 * audio stripped) using only browser-native APIs.
 *
 * Method:
 *  1. Load source into a hidden <video>.
 *  2. Draw frames to a target-resolution canvas in an rAF loop.
 *  3. MediaRecorder records canvas.captureStream() into chunks.
 *  4. Concat chunks → single Blob.
 *
 * Real-time only — a 5-minute source takes ~5 minutes. Audio is stripped
 * because backgrounds are always muted.
 */
export async function compressVideo(file: File, opts: CompressOptions = {}): Promise<Blob> {
  const {
    maxWidth = 1280,
    maxHeight = 720,
    bitrate = 1_500_000,
    fps = 30,
    onProgress,
    onSettings,
  } = opts;

  if (typeof MediaRecorder === "undefined") {
    throw new Error("MediaRecorder API not supported in this browser");
  }

  const video = document.createElement("video");
  video.src = URL.createObjectURL(file);
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("Could not decode source video — bad codec?"));
  });

  const srcW = video.videoWidth;
  const srcH = video.videoHeight;
  if (!srcW || !srcH) {
    URL.revokeObjectURL(video.src);
    throw new Error("Source has no playable video stream");
  }
  const scale = Math.min(maxWidth / srcW, maxHeight / srcH, 1);
  const targetW = Math.max(2, Math.round((srcW * scale) / 2) * 2);
  const targetH = Math.max(2, Math.round((srcH * scale) / 2) * 2);
  const duration = isFinite(video.duration) ? video.duration : 0;

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    URL.revokeObjectURL(video.src);
    throw new Error("Canvas 2D unavailable");
  }

  const stream = canvas.captureStream(fps);
  const mimeType = pickMimeType();
  if (onSettings) onSettings({ width: targetW, height: targetH, duration, mimeType });

  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: bitrate });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  // Gather data every 500ms so chunks are bounded and progress is smooth.
  recorder.start(500);

  video.currentTime = 0;
  try {
    await video.play();
  } catch (err) {
    recorder.stop();
    URL.revokeObjectURL(video.src);
    throw new Error("Could not play source video");
  }

  let raf = 0;
  let stopped = false;
  const draw = () => {
    if (stopped) return;
    try {
      ctx.drawImage(video, 0, 0, targetW, targetH);
    } catch {
      // Drawing can throw briefly during seeks — ignore and try next frame.
    }
    if (onProgress && duration > 0) {
      onProgress(Math.min(1, video.currentTime / duration));
    }
    raf = requestAnimationFrame(draw);
  };
  raf = requestAnimationFrame(draw);

  await new Promise<void>((resolve, reject) => {
    video.onended = () => resolve();
    video.onerror = () => reject(new Error("Source video errored mid-transcode"));
  });

  stopped = true;
  cancelAnimationFrame(raf);
  if (recorder.state !== "inactive") recorder.stop();

  await new Promise<void>((resolve) => {
    if (recorder.state === "inactive") {
      // Already stopped; the final dataavailable still fires on some browsers,
      // so wait one tick for it.
      setTimeout(() => resolve(), 50);
    } else {
      recorder.onstop = () => resolve();
    }
  });

  URL.revokeObjectURL(video.src);
  return new Blob(chunks, { type: mimeType });
}
