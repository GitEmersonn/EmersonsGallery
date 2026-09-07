"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Chapter } from "@/data/chapters";
import { usePerfMode } from "@/hooks/usePerfMode";

/**
 * Chapters as a stack of full-bleed plates.
 *
 * The filmstrip this replaces was a landscape idea in a portrait viewport: a
 * fixed 172px frame five across is 2.4x a phone, so it needed a horizontal
 * scroller and a swipe hint to explain itself. Nothing here has a fixed pixel
 * width. One chapter spans the screen on a phone and the photograph is finally
 * the size it deserves; two sit side by side from md up.
 *
 * The album detailing — corner mounts, the tagline in Caveat, an aged edge —
 * is borrowed from the polaroid vocabulary already on the site, so this reads
 * as part of the journal rather than a generic card stack.
 */

const PAPER = "#e8d4b0";
const PARCHMENT = "#f5e6c8";

/** Photo-corner mount, as on an album page */
function CornerMount({ at, tint }: { at: "tl" | "tr" | "bl" | "br"; tint: string }) {
  const pos = {
    tl: "top-3 left-3 border-t border-l",
    tr: "top-3 right-3 border-t border-r",
    bl: "bottom-3 left-3 border-b border-l",
    br: "bottom-3 right-3 border-b border-r",
  }[at];
  return (
    <div
      aria-hidden
      className={`absolute w-7 h-7 sm:w-9 sm:h-9 pointer-events-none z-20 ${pos}`}
      style={{ borderColor: tint, opacity: 0.5 }}
    />
  );
}

function ChapterPlate({
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
  const { primaryColor, accentColor, tagline } = chapter.theme;
  const no = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      // Odd plates drop half a step on wide screens so the two columns read as
      // a stack being laid down rather than a grid.
      className={index % 2 === 1 ? "md:mt-20" : ""}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay: lite ? 0 : (index % 2) * 0.08, ease: [0.25, 0, 0, 1] }}
    >
      <Link
        href={`/chapters/${chapter.slug}`}
        className="group block relative"
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      >
        <div
          className="relative w-full overflow-hidden aspect-[3/4] sm:aspect-[4/5]"
          style={{
            backgroundColor: "#0b0704",
            boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
            border: `1px solid ${PAPER}22`,
          }}
        >
          <Image
            src={chapter.coverPhoto.src}
            alt={chapter.coverPhoto.alt}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            style={{ objectPosition: chapter.coverPosition ?? "center" }}
            sizes="(max-width: 768px) 100vw, 46vw"
          />

          {/* Theme wash, lifting on hover */}
          <div
            className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-40"
            style={{ background: `linear-gradient(150deg, ${primaryColor}22, transparent 60%)` }}
          />
          {/* Legibility scrim under the caption */}
          <div
            className="absolute inset-x-0 bottom-0 h-3/5 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(8,5,1,0.92) 0%, rgba(8,5,1,0.6) 34%, transparent 100%)",
            }}
          />

          <CornerMount at="tl" tint={PAPER} />
          <CornerMount at="tr" tint={PAPER} />
          <CornerMount at="bl" tint={PAPER} />
          <CornerMount at="br" tint={PAPER} />

          {/* Caption */}
          <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-7 sm:px-8 sm:pb-9">
            <div className="flex items-center gap-2 mb-2">
              <span
                style={{
                  fontFamily: "var(--font-courier)",
                  fontSize: 10,
                  letterSpacing: "0.24em",
                  color: accentColor,
                  opacity: 0.9,
                }}
              >
                {no}
              </span>
              <span className="h-px w-6" style={{ backgroundColor: accentColor, opacity: 0.5 }} />
              <span
                className="truncate"
                style={{
                  fontFamily: "var(--font-courier)",
                  fontSize: 10,
                  letterSpacing: "0.22em",
                  color: accentColor,
                  opacity: 0.8,
                }}
              >
                {chapter.location.toUpperCase()}
              </span>
            </div>

            <h3
              className="leading-[1.05] mb-2"
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(26px, 6vw, 40px)",
                color: PARCHMENT,
                fontWeight: 600,
                textShadow: "0 2px 24px rgba(0,0,0,0.5)",
              }}
            >
              {chapter.title}
            </h3>

            <p
              className="mb-3"
              style={{ fontFamily: "var(--font-caveat)", fontSize: 19, color: PAPER, opacity: 0.82 }}
            >
              {tagline}
            </p>

            {/* Rule that draws across on hover, then the meta line */}
            <div className="flex items-center gap-3">
              <span
                className="h-px w-8 origin-left transition-transform duration-500 group-hover:scale-x-[2.4]"
                style={{ backgroundColor: accentColor, opacity: 0.65 }}
              />
              <span
                style={{
                  fontFamily: "var(--font-courier)",
                  fontSize: 9.5,
                  letterSpacing: "0.2em",
                  color: PAPER,
                  opacity: 0.6,
                }}
              >
                {chapter.date.toUpperCase()} · {chapter.photos.length} FRAMES
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ChapterStack({
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-14 w-full max-w-5xl mx-auto px-1">
      {chapters.map((chapter, i) => (
        <ChapterPlate
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
