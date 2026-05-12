"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Chapter } from "@/data/chapters";

interface ChapterCardProps {
  chapter: Chapter;
  index: number;
}

const CARD_ROTATIONS = [-4, 3, -2, 5, -3];

function TropicalDecor() {
  return (
    <svg
      className="absolute bottom-10 right-3 opacity-20 pointer-events-none"
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
    >
      <path d="M24 4 C24 4 8 12 8 28 C8 36 16 42 24 44 C32 42 40 36 40 28 C40 12 24 4 24 4Z" fill="#2a9d8f" />
      <path d="M14 20 C14 20 6 16 4 8 C10 10 16 14 14 20Z" fill="#2a9d8f" />
      <path d="M34 20 C34 20 42 16 44 8 C38 10 32 14 34 20Z" fill="#2a9d8f" />
    </svg>
  );
}

function RanchDecor() {
  return (
    <svg
      className="absolute bottom-10 right-3 opacity-20 pointer-events-none"
      width="52"
      height="52"
      viewBox="0 0 52 52"
      fill="none"
    >
      {/* Longhorn silhouette */}
      <ellipse cx="26" cy="30" rx="14" ry="8" fill="#d97706" />
      <path d="M12 22 C6 18 4 10 8 8 C10 14 14 18 12 22Z" fill="#d97706" />
      <path d="M40 22 C46 18 48 10 44 8 C42 14 38 18 40 22Z" fill="#d97706" />
      <circle cx="26" cy="22" r="6" fill="#d97706" />
      {/* Stars */}
      <path d="M6 6 L7 4 L8 6 L6.5 5 L7.5 5Z" fill="#d97706" />
      <path d="M44 6 L45 4 L46 6 L44.5 5 L45.5 5Z" fill="#d97706" />
    </svg>
  );
}

export default function ChapterCard({ chapter, index }: ChapterCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 });

  const baseRot = CARD_ROTATIONS[index % CARD_ROTATIONS.length];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative cursor-pointer"
      initial={{ opacity: 0, y: 50, rotate: baseRot }}
      whileInView={{ opacity: 1, y: 0, rotate: baseRot }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.12, duration: 0.6, ease: [0.25, 0, 0, 1] }}
      whileHover={{
        rotate: 0,
        zIndex: 20,
        transition: { type: "spring", stiffness: 240, damping: 22 },
      }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/chapters/${chapter.slug}`}>
        {/* Tape decoration */}
        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 tape z-20" />

        {/* Polaroid card */}
        <div
          className="polaroid select-none"
          style={{ width: 240, maxWidth: "100%" }}
        >
          {/* Photo */}
          <div className="relative overflow-hidden bg-ink" style={{ aspectRatio: "3/4" }}>
            <Image
              src={chapter.coverPhoto.src}
              alt={chapter.coverPhoto.alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="240px"
            />
            {/* Chapter theme tint overlay */}
            <div
              className="absolute inset-0 opacity-20 mix-blend-multiply"
              style={{ backgroundColor: chapter.theme.primaryColor }}
            />
            {/* Decorative element */}
            {chapter.theme.decorative === "tropical" && <TropicalDecor />}
            {chapter.theme.decorative === "ranch" && <RanchDecor />}
          </div>

          {/* Caption area */}
          <div className="pt-2 pb-1 px-1">
            <p
              className="text-ink text-center leading-tight"
              style={{ fontFamily: "var(--font-caveat)", fontSize: 19 }}
            >
              {chapter.title}
            </p>
            <p
              className="text-center mt-1 opacity-60"
              style={{
                fontFamily: "var(--font-courier)",
                color: "#3d2314",
                fontSize: 10,
                letterSpacing: "0.08em",
              }}
            >
              {chapter.location.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Glow on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-sm"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          style={{
            background: `radial-gradient(ellipse at center, ${chapter.theme.primaryColor}22 0%, transparent 70%)`,
            filter: "blur(16px)",
            transform: "scale(1.1) translateZ(-1px)",
          }}
        />
      </Link>
    </motion.div>
  );
}
