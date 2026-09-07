"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Chapter } from "@/data/chapters";
import { usePerfMode } from "@/hooks/usePerfMode";

/**
 * Chapters as entries down the spine of a journal.
 *
 * Vertical by construction, so it is mobile-native for free — no horizontal
 * scroller, no fixed widths, and roughly twice as many chapters per screen as
 * the full-bleed stack. Every chapter already carries a date, so the spine has
 * something real to order it by, and the masthead already calls the site a
 * visual journal.
 *
 * Phone: one column with the rule down the left. From md the rule moves to the
 * centre and entries alternate sides.
 */

const GOLD = "#d4a017";
const PAPER = "#e8d4b0";
const PARCHMENT = "#f5e6c8";

/** Node on the rule — an open diamond that fills on hover */
function SpineNode({ tint }: { tint: string }) {
  return (
    <span
      aria-hidden
      className="block w-[11px] h-[11px] rotate-45 transition-colors duration-400"
      style={{
        border: `1.5px solid ${tint}`,
        backgroundColor: "#0d0802",
        boxShadow: `0 0 0 4px #0d0802`,
      }}
    />
  );
}

function TimelineEntry({
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
  const left = index % 2 === 0; // which side of the centre rule, from md up

  return (
    <motion.li
      className={[
        "relative pl-11 pb-12 md:pb-16 md:w-1/2 md:pl-0",
        left ? "md:pr-12 md:text-right" : "md:ml-auto md:pl-12",
      ].join(" ")}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay: lite ? 0 : 0.05, ease: [0.25, 0, 0, 1] }}
    >
      {/* Node, pinned to the rule — left edge on a phone, inner edge from md */}
      <span
        className={[
          "absolute top-1 left-[10px] md:left-auto",
          left ? "md:right-[-5.5px]" : "md:left-[-5.5px]",
        ].join(" ")}
      >
        <SpineNode tint={accentColor} />
      </span>

      <Link
        href={`/chapters/${chapter.slug}`}
        className="group block"
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      >
        {/* Dateline on the rule */}
        <div
          className={`flex items-baseline gap-2 mb-2 ${left ? "md:justify-end" : ""}`}
          style={{ fontFamily: "var(--font-courier)", fontSize: 10, letterSpacing: "0.22em" }}
        >
          <span style={{ color: GOLD, opacity: 0.85 }}>{chapter.date.toUpperCase()}</span>
          <span style={{ color: PAPER, opacity: 0.3 }}>·</span>
          <span style={{ color: accentColor, opacity: 0.7 }}>{no}</span>
        </div>

        {/* Plate */}
        <div
          className="relative w-full overflow-hidden aspect-[4/3] mb-3"
          style={{
            backgroundColor: "#0b0704",
            border: `1px solid ${PAPER}1f`,
            boxShadow: "0 8px 24px rgba(0,0,0,0.42)",
          }}
        >
          <Image
            src={chapter.coverPhoto.src}
            alt={chapter.coverPhoto.alt}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            style={{ objectPosition: chapter.coverPosition ?? "center" }}
            sizes="(max-width: 768px) 88vw, 42vw"
          />
          <div
            className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0"
            style={{ background: `linear-gradient(160deg, ${primaryColor}2e, rgba(8,5,1,0.55))` }}
          />
        </div>

        <h3
          className="leading-tight mb-1"
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(19px, 3.6vw, 25px)",
            color: PARCHMENT,
            fontWeight: 600,
          }}
        >
          {chapter.title}
        </h3>

        <p
          className="mb-1.5"
          style={{ fontFamily: "var(--font-caveat)", fontSize: 17, color: PAPER, opacity: 0.72 }}
        >
          {tagline}
        </p>

        <p
          style={{
            fontFamily: "var(--font-courier)",
            fontSize: 9,
            letterSpacing: "0.18em",
            color: PAPER,
            opacity: 0.45,
          }}
        >
          {chapter.location.toUpperCase()} · {chapter.photos.length} FRAMES
        </p>
      </Link>
    </motion.li>
  );
}

export default function ChapterTimeline({
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
    <div className="relative w-full max-w-4xl mx-auto px-1">
      {/* The rule itself — draws down once the list comes into view */}
      <motion.span
        aria-hidden
        className="absolute top-0 bottom-0 w-px left-[15px] md:left-1/2"
        style={{
          background: `linear-gradient(to bottom, transparent, ${GOLD}55 6%, ${GOLD}55 94%, transparent)`,
          transformOrigin: "top",
        }}
        initial={lite ? false : { scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 1.1, ease: [0.25, 0, 0, 1] }}
      />

      <ul className="relative md:flex md:flex-col">
        {chapters.map((chapter, i) => (
          <TimelineEntry
            key={chapter.id}
            chapter={chapter}
            index={i}
            lite={lite}
            onHover={() => onHoverChapter?.(chapter)}
            onLeave={() => onLeaveChapter?.()}
          />
        ))}
      </ul>
    </div>
  );
}
