"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Chapter } from "@/data/chapters";
import { usePerfMode } from "@/hooks/usePerfMode";

/**
 * Chapters presented as frames on a strip of film.
 *
 * The strip is the unit, not the card: sprocket rails run along both edges,
 * frames sit shoulder to shoulder in the gate, and the rebate carries the
 * frame number and title the way edge markings do on real 35mm.
 */

const FILM_BASE = "#251a11"; // the strip itself, a touch lighter than the page
const FILM_HOLE = "#100a06"; // punched sprocket holes
const FILM_ORANGE = "#f4a261";
const FRAMES_PER_STRIP = 5;

const FRAME_W = 172;

function SprocketRail() {
  return (
    <div
      aria-hidden
      className="w-full shrink-0"
      style={{
        height: 18,
        // Rounded-ish holes punched at a regular pitch, centred in the rail
        backgroundImage: `repeating-linear-gradient(to right, ${FILM_HOLE} 0 15px, transparent 15px 36px)`,
        backgroundSize: "100% 9px",
        backgroundPosition: "center",
        backgroundRepeat: "repeat-x",
      }}
    />
  );
}

function FilmFrame({
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
  const frameNo = String(index + 1).padStart(2, "0");
  const { primaryColor, accentColor, tagline } = chapter.theme;

  return (
    <Link
      href={`/chapters/${chapter.slug}`}
      className="group block shrink-0"
      style={{ width: FRAME_W }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: lite ? 0 : index * 0.07, ease: [0.25, 0, 0, 1] }}
      >
        {/* Rebate edge above the gate — frame number and roll marking */}
        <div
          className="flex items-center justify-between px-[2px] pb-[3px]"
          style={{
            fontFamily: "var(--font-courier)",
            fontSize: 8,
            letterSpacing: "0.14em",
            color: FILM_ORANGE,
          }}
        >
          <span style={{ opacity: 0.85 }}>{frameNo}</span>
          <span className="truncate pl-2" style={{ opacity: 0.4 }}>
            {chapter.location.split(",")[0].toUpperCase()}
          </span>
        </div>

        {/* The gate */}
        <div
          className="relative overflow-hidden"
          style={{
            aspectRatio: "2 / 3",
            backgroundColor: "#0b0704",
            outline: `1px solid ${FILM_HOLE}`,
          }}
        >
          <Image
            src={chapter.coverPhoto.src}
            alt={chapter.coverPhoto.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            style={{ objectPosition: chapter.coverPosition ?? "center" }}
            sizes={`${FRAME_W}px`}
          />

          {/* Unhovered frames sit back under a theme wash; hover clears it */}
          <div
            className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0"
            style={{
              background: `linear-gradient(to bottom, ${primaryColor}26, ${FILM_HOLE}b3)`,
            }}
          />

          {/* Tagline rides in from the bottom of the gate on hover */}
          <div
            className="absolute inset-x-0 bottom-0 px-2 pb-2 pt-6 translate-y-2 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100"
            style={{
              background: "linear-gradient(to top, rgba(11,7,4,0.92), transparent)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-courier)",
                fontSize: 9,
                letterSpacing: "0.18em",
                color: accentColor,
              }}
            >
              {tagline.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Rebate edge below the gate — title and frame count */}
        <div className="px-[2px] pt-[5px]">
          <p
            className="truncate leading-tight"
            style={{
              fontFamily: "var(--font-caveat)",
              fontSize: 16,
              color: "#f5e6c8",
              opacity: 0.9,
            }}
          >
            {chapter.title}
          </p>
          <p
            style={{
              fontFamily: "var(--font-courier)",
              fontSize: 8,
              letterSpacing: "0.14em",
              color: FILM_ORANGE,
              opacity: 0.5,
            }}
          >
            {chapter.date.toUpperCase()} · {chapter.photos.length} FR
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

export default function ChapterFilmstrip({
  chapters,
  onHoverChapter,
  onLeaveChapter,
}: {
  chapters: Chapter[];
  onHoverChapter?: (c: Chapter) => void;
  onLeaveChapter?: () => void;
}) {
  const lite = usePerfMode();

  // Break the roll into strips so it reads as film, not an endless scroller
  const strips: Chapter[][] = [];
  for (let i = 0; i < chapters.length; i += FRAMES_PER_STRIP) {
    strips.push(chapters.slice(i, i + FRAMES_PER_STRIP));
  }

  return (
    <div className="flex flex-col items-center gap-10 w-full">
      {strips.map((strip, s) => (
        <motion.div
          key={s}
          className="max-w-full"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.65, delay: lite ? 0 : s * 0.12, ease: [0.25, 0, 0, 1] }}
          style={{
            // A slight tilt per strip, as though laid down by hand
            rotate: lite ? 0 : s % 2 === 0 ? -0.6 : 0.5,
          }}
        >
          <div
            className="overflow-x-auto"
            style={{
              backgroundColor: FILM_BASE,
              boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ minWidth: "fit-content" }}>
              <SprocketRail />
              <div className="flex gap-[6px] px-[6px]">
                {strip.map((chapter, i) => (
                  <FilmFrame
                    key={chapter.id}
                    chapter={chapter}
                    index={s * FRAMES_PER_STRIP + i}
                    lite={lite}
                    onHover={() => onHoverChapter?.(chapter)}
                    onLeave={() => onLeaveChapter?.()}
                  />
                ))}
              </div>
              <SprocketRail />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
