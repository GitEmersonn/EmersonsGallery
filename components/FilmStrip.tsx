"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Photo } from "@/data/chapters";

interface FilmStripProps {
  photos: Photo[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export default function FilmStrip({
  photos,
  activeIndex,
  onSelect,
}: FilmStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);

  // Scroll active frame into view
  const scrollToFrame = (index: number) => {
    const strip = stripRef.current;
    if (!strip) return;
    const frame = strip.children[index] as HTMLElement;
    if (frame) {
      frame.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

  const handleSelect = (index: number) => {
    onSelect(index);
    scrollToFrame(index);
  };

  return (
    <div className="relative select-none">
      {/* Film edge top */}
      <div className="flex items-center gap-2 bg-[#111] px-3 py-[5px]">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="film-hole opacity-80" />
        ))}
      </div>

      {/* Film frames */}
      <div
        ref={stripRef}
        className="flex gap-1 bg-[#1a1a1a] overflow-x-auto px-3 py-2 scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {photos.map((photo, i) => (
          <motion.button
            key={photo.id}
            onClick={() => handleSelect(i)}
            className="relative flex-shrink-0 overflow-hidden cursor-pointer"
            style={{ width: 72, height: 52 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover"
              sizes="72px"
            />
            {/* Active frame highlight */}
            <motion.div
              className="absolute inset-0 border-2"
              style={{
                borderColor: activeIndex === i ? "#d4a017" : "transparent",
                backgroundColor:
                  activeIndex === i
                    ? "transparent"
                    : "rgba(26,16,8,0.45)",
              }}
              animate={{
                borderColor: activeIndex === i ? "#d4a017" : "transparent",
                backgroundColor:
                  activeIndex === i
                    ? "transparent"
                    : "rgba(26,16,8,0.45)",
              }}
              transition={{ duration: 0.2 }}
            />
            {/* Frame number */}
            <span
              className="absolute bottom-[2px] right-[4px] text-[8px] leading-none opacity-60"
              style={{ fontFamily: "var(--font-courier)", color: "#f5e6c8" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Film edge bottom */}
      <div className="flex items-center gap-2 bg-[#111] px-3 py-[5px]">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="film-hole opacity-80" />
        ))}
      </div>
    </div>
  );
}
