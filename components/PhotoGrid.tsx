"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { Photo } from "@/data/chapters";
import PhotoLightbox from "./PhotoLightbox";

interface PhotoGridProps {
  photos: Photo[];
  accentColor?: string;
}

// Seeded rotation for organic polaroid layout
function seedRot(index: number): number {
  const rotations = [-3.5, 2.1, -1.8, 3.2, -2.5, 1.4, -0.8, 2.9, -3.1, 1.7];
  return rotations[index % rotations.length];
}

export default function PhotoGrid({ photos, accentColor }: PhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 px-4 md:px-8">
        {photos.map((photo, i) => {
          const rot = seedRot(i);
          return (
            <motion.div
              key={photo.id}
              className="polaroid mb-6 cursor-pointer inline-block w-full relative group"
              style={{ rotate: rot, transformOrigin: "center bottom" }}
              initial={{ opacity: 0, y: 40, rotate: rot }}
              whileInView={{ opacity: 1, y: 0, rotate: rot }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: (i % 3) * 0.08, duration: 0.5, ease: [0.25, 0, 0, 1] }}
              whileHover={{
                rotate: 0,
                scale: 1.04,
                zIndex: 10,
                boxShadow: "0 20px 40px rgba(0,0,0,0.55), 0 8px 16px rgba(0,0,0,0.4)",
                transition: { type: "spring", stiffness: 260, damping: 22 },
              }}
              onClick={() => setLightboxIndex(i)}
            >
              {/* Tape strip decoration */}
              <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 tape z-10" />

              {/* Photo */}
              <div
                className="relative overflow-hidden bg-aged"
                style={{
                  aspectRatio:
                    photo.orientation === "portrait"
                      ? "2/3"
                      : photo.orientation === "square"
                      ? "1/1"
                      : "3/2",
                }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              {/* Handwritten caption */}
              {photo.caption && (
                <p
                  className="mt-2 text-center leading-tight"
                  style={{
                    fontFamily: "var(--font-caveat)",
                    fontSize: 17,
                    color: accentColor ? "#1a1008" : "#1a1008",
                  }}
                >
                  {photo.caption}
                </p>
              )}
              {/* Accent bottom line on polaroid */}
              {accentColor && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[3px]"
                  style={{
                    background: `linear-gradient(to right, transparent 10%, ${accentColor}55 50%, transparent 90%)`,
                    opacity: 0,
                    transition: "opacity 0.3s",
                  }}
                />
              )}

              {/* Zoom hint on hover */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-ink/0 group-hover:bg-ink/15 transition-colors duration-200"
                style={{ pointerEvents: "none" }}
              >
                <motion.div
                  className="w-10 h-10 rounded-full bg-parchment/90 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  style={{ color: "#1a1008" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M7 5v4M5 7h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <PhotoLightbox
            photos={photos}
            activeIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        )}
      </AnimatePresence>
    </>
  );
}
