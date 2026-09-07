"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Chapter } from "@/data/chapters";
import { usePerfMode } from "@/hooks/usePerfMode";

/**
 * Chapters as pages from a photo album.
 *
 * The one layout here that inverts the palette: every other design puts pale
 * text over a dark photograph, where this mounts the print on aged paper and
 * writes underneath it in ink. Against the near-black page the sheets read as
 * physical objects, which is the point.
 *
 * Full-width sheets on a phone, two to a spread from md. Nothing is measured
 * in fixed pixels.
 */

const PAPER = "#e8d4b0";
const PAPER_LIT = "#f2e3c8";
const INK = "#3d2314";
const MOUNT = "rgba(38,22,8,0.62)";

const PAGE_TILT = [-0.7, 0.5, -0.4, 0.8, -0.6, 0.35];

/** Gummed photo corner — the print tucks into it */
function PhotoCorner({ at }: { at: "tl" | "tr" | "bl" | "br" }) {
  const size = 17;
  const edges: Record<string, React.CSSProperties> = {
    tl: { top: 0, left: 0, borderTop: `${size}px solid ${MOUNT}`, borderRight: `${size}px solid transparent` },
    tr: { top: 0, right: 0, borderTop: `${size}px solid ${MOUNT}`, borderLeft: `${size}px solid transparent` },
    bl: { bottom: 0, left: 0, borderBottom: `${size}px solid ${MOUNT}`, borderRight: `${size}px solid transparent` },
    br: { bottom: 0, right: 0, borderBottom: `${size}px solid ${MOUNT}`, borderLeft: `${size}px solid transparent` },
  };
  return (
    <span
      aria-hidden
      className="absolute z-20 pointer-events-none"
      style={{ width: 0, height: 0, ...edges[at] }}
    />
  );
}

function AlbumPage({
  chapter,
  index,
  lite,
  onHover,
  onLeave,
}: {
  chapter: Chapter;
  index: number;
  lite: boolean;
  onHover?: () => void;
  onLeave?: () => void;
}) {
  const { primaryColor, tagline } = chapter.theme;
  const tilt = lite ? 0 : PAGE_TILT[index % PAGE_TILT.length];
  const no = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, rotate: tilt }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.6, delay: lite ? 0 : (index % 2) * 0.07, ease: [0.25, 0, 0, 1] }}
      whileHover={
        lite ? undefined : { rotate: 0, y: -6, transition: { type: "spring", stiffness: 220, damping: 20 } }
      }
    >
      <Link
        href={`/chapters/${chapter.slug}`}
        className="group relative block"
        aria-label={`Open ${chapter.title} — ${chapter.photos.length} frames`}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      >
        {/* Edges of the prints stacked underneath. The clearest signal that a
            sheet opens onto something is showing that there is more beneath it,
            and unlike hover it reads on any device. */}
        <span
          aria-hidden
          className="absolute left-2 right-2 top-2 bottom-[-7px] -z-10 transition-all duration-500 group-hover:bottom-[-11px]"
          style={{ backgroundColor: "#d6bf95", boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}
        />
        <span
          aria-hidden
          className="absolute left-4 right-4 top-4 bottom-[-13px] -z-20 transition-all duration-500 group-hover:bottom-[-20px]"
          style={{ backgroundColor: "#c2ab77" }}
        />

        {/* The sheet */}
        <div
          className="relative px-4 pt-4 pb-5 sm:px-5 sm:pt-5 sm:pb-6"
          style={{
            backgroundColor: PAPER,
            backgroundImage:
              "radial-gradient(ellipse at 22% 14%, rgba(255,255,255,0.55) 0%, transparent 52%), radial-gradient(ellipse at 84% 90%, rgba(120,80,40,0.16) 0%, transparent 58%)",
            boxShadow: "0 12px 34px rgba(0,0,0,0.52), 0 2px 6px rgba(0,0,0,0.3)",
          }}
        >
          {/* Pencil annotations along the top of the sheet */}
          <div
            className="flex items-center justify-between mb-3"
            style={{ fontFamily: "var(--font-courier)", fontSize: 9, letterSpacing: "0.18em", color: INK }}
          >
            <span style={{ opacity: 0.55 }}>No. {no}</span>
            <span style={{ opacity: 0.4 }}>{chapter.date.toUpperCase()}</span>
          </div>

          {/* The mounted print */}
          <div className="relative w-full aspect-[4/5] overflow-hidden" style={{ backgroundColor: "#0b0704" }}>
            <Image
              src={chapter.coverPhoto.src}
              alt={chapter.coverPhoto.alt}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              style={{ objectPosition: chapter.coverPosition ?? "center" }}
              sizes="(max-width: 768px) 92vw, 44vw"
            />
            {/* Age wash over the print, clearing on hover */}
            <div
              className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0"
              style={{ background: `linear-gradient(155deg, ${primaryColor}24, rgba(61,35,20,0.34))` }}
            />
            <PhotoCorner at="tl" />
            <PhotoCorner at="tr" />
            <PhotoCorner at="bl" />
            <PhotoCorner at="br" />
          </div>

          {/* Written up underneath, the way a caption is */}
          <div className="pt-3.5">
            <h3
              className="leading-tight"
              style={{
                fontFamily: "var(--font-caveat)",
                fontSize: "clamp(23px, 4.4vw, 29px)",
                color: INK,
              }}
            >
              {chapter.title}
            </h3>
            <p
              className="mt-0.5 italic"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: 15,
                color: INK,
                opacity: 0.62,
              }}
            >
              {tagline}
            </p>

            <div className="flex items-center justify-between gap-3 mt-2.5">
              <span
                className="truncate"
                style={{
                  fontFamily: "var(--font-courier)",
                  fontSize: 8.5,
                  letterSpacing: "0.18em",
                  color: INK,
                  opacity: 0.5,
                }}
              >
                {chapter.location.toUpperCase()} · {chapter.photos.length} FRAMES
              </span>

              {/* Always visible, because there is no hover on a phone: the sheet
                  has to say it opens without being pointed at. */}
              <span
                className="shrink-0 inline-flex items-center gap-1.5 px-2 py-1 transition-colors duration-300"
                style={{
                  border: `1px solid ${primaryColor}66`,
                  backgroundColor: `${primaryColor}14`,
                  fontFamily: "var(--font-courier)",
                  fontSize: 8,
                  letterSpacing: "0.2em",
                  color: INK,
                }}
              >
                OPEN
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-0.5">
                  <path d="M1 9 L9 1 M4 1 h5 v5" stroke={primaryColor} strokeWidth="1.4"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </div>

          {/* Lit edge along the top, so the sheet catches light */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ backgroundColor: PAPER_LIT, opacity: 0.7 }}
          />
        </div>
      </Link>
    </motion.div>
  );
}

export default function ChapterAlbum({
  chapters,
  onHoverChapter,
  onLeaveChapter,
}: {
  chapters: Chapter[];
  onHoverChapter?: (c: Chapter) => void;
  onLeaveChapter?: () => void;
}) {
  const lite = usePerfMode();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-x-12 md:gap-y-14 w-full max-w-4xl mx-auto px-2">
      {chapters.map((chapter, i) => (
        <AlbumPage
          key={chapter.id}
          chapter={chapter}
          index={i}
          lite={lite}
          onHover={() => onHoverChapter?.(chapter)}
          onLeave={() => onLeaveChapter?.()}
        />
      ))}
    </div>
  );
}
