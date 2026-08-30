"use client";

/**
 * next/image loader that hands resizing to Cloudinary instead of to Next.
 *
 * Every photograph in this portfolio is an unmodified camera original — the
 * Dallas frames alone are ~9.9 MB at 4000x6000. With the built-in optimizer,
 * Next has to pull that entire original from Cloudinary before it can produce
 * a 1080px thumbnail, on every cold request and for every distinct width.
 *
 * Rewriting the URL instead means Cloudinary does the work at its own CDN
 * edge and the browser fetches ~230 KB. Nothing large ever crosses our server.
 *
 * Non-Cloudinary sources are returned untouched, so local assets still work.
 */

type ImageLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

const UPLOAD_MARKER = "/image/upload/";

export default function cloudinaryLoader({ src, width }: ImageLoaderProps): string {
  const at = src.indexOf(UPLOAD_MARKER);
  if (!src.startsWith("https://res.cloudinary.com/") || at === -1) return src;

  const head = src.slice(0, at + UPLOAD_MARKER.length);
  const tail = src.slice(at + UPLOAD_MARKER.length);

  const transform = [
    "f_auto", // AVIF/WebP negotiated from the browser's Accept header
    "q_auto", // perceptual quality — beats a fixed q_75 on these files
    `w_${width}`, // the width next/image actually asked for
    "c_limit", // scale down only; never upscale past the original
  ].join(",");

  return `${head}${transform}/${tail}`;
}
