"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { chapters } from "@/data/chapters";
import type { Chapter } from "@/data/chapters";

const WORLD_GEO = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const US_GEO   = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const CHAPTER_COORDS: Record<string, [number, number]> = {
  "key-west-wedding": [-81.78, 24.55],
  "wharton-texas":    [-96.27, 29.20],
  "uh-21-garage":     [-95.37, 29.75],
  "houston-skyline":  [-95.38, 29.78],
};

const INIT_CENTER: [number, number] = [-90, 27];
const INIT_ZOOM = 3.8;

export default function ChapterMap() {
  const router  = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom,   setZoom]   = useState(INIT_ZOOM);
  const [center, setCenter] = useState<[number, number]>(INIT_CENTER);
  const [hovered, setHovered] = useState<Chapter | null>(null);
  const [cardPos,  setCardPos]  = useState<{ x: number; y: number } | null>(null);

  // Block d3-zoom wheel events outside the center zone so the page can scroll normally
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      const rect = el.getBoundingClientRect();
      const relY = e.clientY - rect.top;
      // Only allow zoom in the middle 40% vertically
      const inZone = relY > rect.height * 0.30 && relY < rect.height * 0.70;
      if (!inZone) {
        e.stopPropagation(); // Stops d3 from seeing it — page scrolls normally
      }
    };
    el.addEventListener("wheel", handler, { capture: true, passive: false });
    return () => el.removeEventListener("wheel", handler, { capture: true });
  }, []);

  const handleMarkerEnter = useCallback(
    (chapter: Chapter, e: React.MouseEvent) => {
      setHovered(chapter);
      if (wrapRef.current) {
        const rect = wrapRef.current.getBoundingClientRect();
        setCardPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    },
    []
  );

  return (
    <div ref={wrapRef} className="relative w-full overflow-hidden" style={{
      height: "58vh", minHeight: 420, maxHeight: 660,
      WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 9%, black 91%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 70%, transparent 100%)",
      WebkitMaskComposite: "destination-in",
      maskImage: "linear-gradient(to right, transparent 0%, black 9%, black 91%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 70%, transparent 100%)",
      maskComposite: "intersect",
    }}>

      {/* Hidden SVG filter defs */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="cmap-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="5" result="b1" />
            <feGaussianBlur stdDeviation="2" result="b2" />
            <feMerge>
              <feMergeNode in="b1" />
              <feMergeNode in="b2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Map */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: INIT_CENTER, scale: 420 }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <ZoomableGroup
          center={center}
          zoom={zoom}
          minZoom={1}
          maxZoom={20}
          onMoveEnd={({ zoom: z, coordinates }) => {
            setZoom(z);
            setCenter(coordinates as [number, number]);
          }}
        >
          {/* Ocean — dark aged parchment sea */}
          <rect x="-20000" y="-20000" width="40000" height="40000" fill="#100b02" />

          {/* World landmasses — warm sepia */}
          <Geographies geography={WORLD_GEO}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography key={geo.rsmKey} geography={geo}
                  fill="#2e1b06" stroke="rgba(195,130,45,0.5)" strokeWidth={0.6}
                  style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
                />
              ))
            }
          </Geographies>

          {/* US state borders — lighter amber lines */}
          <Geographies geography={US_GEO}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography key={geo.rsmKey} geography={geo}
                  fill="#3a2208" stroke="rgba(212,155,55,0.65)" strokeWidth={0.45}
                  style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
                />
              ))
            }
          </Geographies>

          {/* Chapter pins — flag style */}
          {chapters.map((chapter) => {
            const coords = CHAPTER_COORDS[chapter.slug];
            if (!coords) return null;
            const active = hovered?.id === chapter.id;
            const color  = chapter.theme.primaryColor;
            const pole   = active ? 24 : 19;
            const fw     = active ? 14 : 11;
            const fh     = active ? 9  : 7;
            return (
              <Marker key={chapter.id} coordinates={coords}
                onClick={() => router.push(`/chapters/${chapter.slug}`)}
                onMouseEnter={(e) => handleMarkerEnter(chapter, e as unknown as React.MouseEvent)}
                onMouseLeave={() => { setHovered(null); setCardPos(null); }}
                style={{ cursor: "pointer" }}
              >
                {/* Inverse-scale so pins stay the same size at any zoom level */}
                <g transform={`scale(${1 / zoom})`}>
                {/* Ground pulse */}
                <motion.circle r={6} fill="none" stroke={color} strokeWidth={0.8}
                  opacity={0.3}
                  animate={{ r: [4, 9, 4], opacity: [0.3, 0.04, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Base anchor dot */}
                <circle r={2.2} fill={color} filter="url(#cmap-glow)" opacity={0.9} />
                <circle r={1} fill="white" opacity={0.8} />

                {/* Pole */}
                <line x1={0} y1={0} x2={0} y2={-pole}
                  stroke={color} strokeWidth={1.4} strokeLinecap="round" opacity={0.9} />

                {/* Flag body — pentagon shape (notched right edge) */}
                <path
                  d={`M 0 ${-pole} L ${fw} ${-pole} L ${fw + 3} ${-pole + fh / 2} L ${fw} ${-pole + fh} L 0 ${-pole + fh} Z`}
                  fill={color} opacity={0.92}
                />

                {/* Subtle stripe across flag */}
                <line
                  x1={2} y1={-pole + fh / 2}
                  x2={fw - 1} y2={-pole + fh / 2}
                  stroke="rgba(255,255,255,0.3)" strokeWidth={0.7}
                />

                {/* Top-of-pole finial dot */}
                <circle cx={0} cy={-pole} r={1.2} fill={color} opacity={0.9} />
                </g>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>


      {/* Zoom controls */}
      <div className="absolute bottom-16 right-8 flex flex-col gap-1" style={{ zIndex: 10 }}>
        {([
          { icon: <svg width="12" height="12" viewBox="0 0 12 12"><line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, fn: () => setZoom(z => Math.min(z * 1.5, 22)) },
          { icon: <svg width="12" height="12" viewBox="0 0 12 12"><line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, fn: () => setZoom(z => Math.max(z / 1.5, 1)) },
          { icon: <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.2" fill="none"/><circle cx="6" cy="6" r="1.2" fill="currentColor"/></svg>, fn: () => { setZoom(INIT_ZOOM); setCenter(INIT_CENTER); } },
        ] as { icon: React.ReactNode; fn: () => void }[]).map(({ icon, fn }, i) => (
          <button key={i} onClick={fn}
            className="w-8 h-8 flex items-center justify-center transition-all hover:border-amber-600/50"
            style={{
              background: "rgba(15,10,4,0.82)",
              border: "1px solid rgba(212,160,23,0.2)",
              borderRadius: 3,
              color: "#d4a017",
              backdropFilter: "blur(10px)",
            }}
          >{icon}</button>
        ))}
      </div>

      {/* Hint */}
      <p className="absolute bottom-16 left-8 text-[10px] tracking-[0.2em] uppercase pointer-events-none"
        style={{ fontFamily: "var(--font-courier)", color: "#c4a882", opacity: 0.3, zIndex: 5 }}
      >
        Scroll to zoom · drag to pan
      </p>

      {/* Hover card — positions near cursor */}
      <AnimatePresence>
        {hovered && cardPos && (
          <motion.div
            key={hovered.id}
            className="absolute pointer-events-none"
            style={{
              zIndex: 20,
              left: cardPos.x > 400 ? cardPos.x - 280 : cardPos.x + 20,
              top: Math.max(10, cardPos.y - 180),
              width: 260,
            }}
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ duration: 0.18, ease: [0.25, 0, 0, 1] }}
          >
            <div style={{
              background: "rgba(12,7,1,0.96)",
              border: `1px solid ${hovered.theme.primaryColor}50`,
              borderRadius: 6,
              overflow: "hidden",
              boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px ${hovered.theme.primaryColor}18, 0 0 40px ${hovered.theme.primaryColor}12`,
              backdropFilter: "blur(16px)",
            }}>
              {/* Photo */}
              <div className="relative" style={{ height: 148 }}>
                <Image src={hovered.coverPhoto.src} alt={hovered.title}
                  fill className="object-cover" sizes="260px" />
                {/* Film grain overlay */}
                <div className="absolute inset-0" style={{
                  background: `linear-gradient(to bottom, rgba(12,7,1,0.1) 0%, rgba(12,7,1,0.75) 100%)`,
                  mixBlendMode: "multiply",
                }} />
                {/* Chapter number badge */}
                <div className="absolute top-3 right-3 px-2 py-0.5"
                  style={{
                    background: "rgba(12,7,1,0.75)",
                    border: `1px solid ${hovered.theme.primaryColor}40`,
                    borderRadius: 2,
                    fontFamily: "var(--font-courier)",
                    fontSize: 9,
                    color: hovered.theme.primaryColor,
                    letterSpacing: "0.15em",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {hovered.photos.length} FRAMES
                </div>
              </div>
              {/* Info */}
              <div className="px-4 pt-3 pb-4">
                <p className="text-[10px] tracking-[0.2em] uppercase mb-1"
                  style={{ fontFamily: "var(--font-courier)", color: hovered.theme.primaryColor, opacity: 0.7 }}>
                  {hovered.location} · {hovered.date}
                </p>
                <p className="font-semibold leading-tight mb-1"
                  style={{ fontFamily: "var(--font-playfair)", color: "#f5e6c8", fontSize: 17 }}>
                  {hovered.title}
                </p>
                <p className="opacity-55 mb-3"
                  style={{ fontFamily: "var(--font-caveat)", color: "#c4a882", fontSize: 14 }}>
                  {hovered.theme.tagline}
                </p>
                {/* Divider */}
                <div className="h-px w-full mb-3" style={{ background: `${hovered.theme.primaryColor}20` }} />
                <p className="text-[10px] tracking-[0.22em] uppercase flex items-center gap-2"
                  style={{ fontFamily: "var(--font-courier)", color: hovered.theme.primaryColor, opacity: 0.65 }}>
                  <span>Open chapter</span>
                  <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                    <path d="M1 4h12M9 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
