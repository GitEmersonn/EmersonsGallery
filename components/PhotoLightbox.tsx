"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { Photo } from "@/data/chapters";
import FilmStrip from "./FilmStrip";

interface PhotoLightboxProps {
  photos: Photo[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function PhotoLightbox({
  photos,
  activeIndex,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  const photo = photos[activeIndex];

  const handlePrev = useCallback(() => {
    onNavigate((activeIndex - 1 + photos.length) % photos.length);
  }, [activeIndex, photos.length, onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate((activeIndex + 1) % photos.length);
  }, [activeIndex, photos.length, onNavigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlePrev, handleNext, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: "rgba(10, 6, 2, 0.97)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          style={{ fontFamily: "var(--font-courier)", color: "#c4a882", fontSize: 13 }}
        >
          {String(activeIndex + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
        </span>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
          style={{ color: "#c4a882" }}
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Main image area */}
      <div
        className="flex-1 flex items-center justify-center relative min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev button */}
        <button
          onClick={handlePrev}
          className="absolute left-3 z-10 w-11 h-11 flex items-center justify-center rounded-full border transition-all hover:bg-white/10"
          style={{ borderColor: "rgba(196,168,130,0.3)", color: "#c4a882" }}
          aria-label="Previous photo"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Photo */}
        <AnimatePresence mode="wait">
          <motion.div
            key={photo.id}
            className="flex flex-col items-center h-full w-full px-16"
            initial={{ opacity: 0, scale: 0.97, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.97, x: -20 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
          >
            {/* The photo */}
            <div
              className="relative w-full h-full"
              style={{
                maxWidth:
                  photo.orientation === "portrait"
                    ? "min(55vw, calc((100vh - 160px) * 2/3))"
                    : photo.orientation === "square"
                    ? "min(85vw, calc(100vh - 160px))"
                    : "min(90vw, calc((100vh - 160px) * 3/2))",
              }}
            >
              <div
                className="relative w-full overflow-hidden"
                style={{
                  aspectRatio:
                    photo.orientation === "portrait"
                      ? "2/3"
                      : photo.orientation === "square"
                      ? "1/1"
                      : "3/2",
                  maxHeight: "calc(100vh - 160px)",
                }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 90vw"
                  priority
                />
              </div>

              {/* Caption */}
              {photo.caption && (
                <p
                  className="text-center mt-3 opacity-70"
                  style={{
                    fontFamily: "var(--font-caveat)",
                    color: "#c4a882",
                    fontSize: 18,
                  }}
                >
                  {photo.caption}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next button */}
        <button
          onClick={handleNext}
          className="absolute right-3 z-10 w-11 h-11 flex items-center justify-center rounded-full border transition-all hover:bg-white/10"
          style={{ borderColor: "rgba(196,168,130,0.3)", color: "#c4a882" }}
          aria-label="Next photo"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Film strip at bottom */}
      <div
        className="flex-shrink-0 mt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <FilmStrip
          photos={photos}
          activeIndex={activeIndex}
          onSelect={onNavigate}
        />
      </div>
    </motion.div>
  );
}
