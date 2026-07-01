"use client";

import { useRef, useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useInView,
  useAnimationControls,
} from "framer-motion";
import Image from "next/image";
import { chapters } from "@/data/chapters";
import type { Chapter } from "@/data/chapters";
import ChapterCard from "@/components/ChapterCard";
import BookingForm from "@/components/BookingForm";
import { usePerfMode } from "@/hooks/usePerfMode";

// ─── Deterministic "random" — same on SSR and client ─────────────────────────
function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const BOKEH = Array.from({ length: 7 }, (_, i) => ({
  id: i,
  x: sr(i * 3) * 100,
  y: sr(i * 3 + 1) * 110 - 10,
  size: 55 + sr(i * 3 + 2) * 110,
  dur: 9 + sr(i * 7) * 11,
  delay: sr(i * 5) * 6,
  opacity: 0.018 + sr(i * 2) * 0.045,
  color:
    i % 4 === 0
      ? "212,160,23"   // vintage gold
      : i % 4 === 1
      ? "196,168,130"  // sepia
      : i % 4 === 2
      ? "231,111,81"   // warm coral
      : "244,162,97",  // film orange
}));

// ─── Bokeh background ─────────────────────────────────────────────────────────
function BokehBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {BOKEH.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(${p.color},0.8) 0%, transparent 68%)`,
            filter: "blur(18px)",
            willChange: "transform, opacity",
          }}
          animate={{
            y: [0, -(35 + p.size * 0.15), 0],
            opacity: [p.opacity, p.opacity * 2.2, p.opacity * 0.6, p.opacity],
            scale: [1, 1.08, 0.96, 1],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Aperture Logo — reveal + passive animation ───────────────────────────────
function ApertureLogo({
  size = 72,
  style,
}: {
  size?: number;
  style?: React.CSSProperties;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const inView = useInView(svgRef, { once: true, amount: 0.4 });
  const pupilControls = useAnimationControls();

  const C = 50;
  const R = 44;
  const blades = [0, 60, 120, 180, 240, 300].map((d) => {
    const a1 = (d * Math.PI) / 180;
    const a2 = ((d + 70) * Math.PI) / 180;
    return {
      d,
      x1: C + R * Math.cos(a1),
      y1: C + R * Math.sin(a1),
      x2: C + R * Math.cos(a2),
      y2: C + R * Math.sin(a2),
    };
  });
  const hex = [0, 60, 120, 180, 240, 300]
    .map((d) => {
      const a = (d * Math.PI) / 180;
      return `${C + R * Math.cos(a)},${C + R * Math.sin(a)}`;
    })
    .join(" ");

  // Sequence: reveal finishes (~1.1s), then start pupil pulse
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => {
      pupilControls
        .start({
          scale: [0, 1.25, 1],
          opacity: [0, 0.8, 0.55],
          transition: { duration: 0.5, ease: "easeOut" },
        })
        .then(() => {
          pupilControls.start({
            scale: [1, 1.18, 1],
            opacity: [0.55, 0.78, 0.55],
            transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
          });
        });
    }, 1050);
    return () => clearTimeout(t);
  }, [inView, pupilControls]);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      {/* Outer hexagon — fades/scales in first */}
      <motion.polygon
        points={hex}
        stroke="currentColor"
        strokeWidth="1.5"
        initial={{ opacity: 0, scale: 0.65 }}
        animate={inView ? { opacity: 0.55, scale: 1 } : {}}
        transition={{ duration: 0.55, ease: [0.25, 0, 0, 1] }}
        style={{ transformOrigin: `${C}px ${C}px` }}
      />

      {/* Blades — draw in staggered, then rotate */}
      <motion.g
        style={{ transformOrigin: `${C}px ${C}px` }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 1.2 }}
      >
        {blades.map(({ d, x1, y1, x2, y2 }, i) => (
          <motion.path
            key={d}
            d={`M ${x1} ${y1} L ${x2} ${y2}`}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 0.75 } : {}}
            transition={{ duration: 0.42, delay: 0.12 + i * 0.07, ease: [0.25, 0, 0, 1] }}
          />
        ))}
      </motion.g>

      {/* Lens outer ring — draws in after blades */}
      <motion.circle
        cx={C}
        cy={C}
        r={16}
        stroke="currentColor"
        strokeWidth="1.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={inView ? { pathLength: 1, opacity: 0.7 } : {}}
        transition={{ duration: 0.55, delay: 0.65 }}
      />

      {/* Inner ring — scales in */}
      <motion.circle
        cx={C}
        cy={C}
        r={8}
        stroke="currentColor"
        strokeWidth="1"
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 0.45 } : {}}
        transition={{ duration: 0.35, delay: 0.85, ease: [0.25, 0, 0, 1] }}
        style={{ transformOrigin: `${C}px ${C}px` }}
      />

      {/* Pupil — controlled by useAnimationControls for reveal → pulse sequence */}
      <motion.circle
        cx={C}
        cy={C}
        r={3.5}
        fill="currentColor"
        initial={{ scale: 0, opacity: 0 }}
        animate={pupilControls}
        style={{ transformOrigin: `${C}px ${C}px` }}
      />

      {/* Lens highlight */}
      <motion.circle
        cx={44}
        cy={44}
        r={2.5}
        fill="currentColor"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 0.2 } : {}}
        transition={{ delay: 1.0, duration: 0.4 }}
      />
    </svg>
  );
}

// ─── Shimmer title — static, cursor-proof ────────────────────────────────────
function ShimmerTitle({
  text,
  style,
}: {
  text: string;
  style?: React.CSSProperties;
}) {
  return (
    <h1 className="leading-none tracking-tight" style={style}>
      <span className="shimmer-text">{text}</span>
    </h1>
  );
}

// ─── Gold divider ─────────────────────────────────────────────────────────────
function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-2">
      <div
        className="h-px flex-1 max-w-24"
        style={{ background: "linear-gradient(to right, transparent, #d4a017aa)" }}
      />
      <span style={{ color: "#d4a017", fontSize: 13, opacity: 0.7 }}>✦</span>
      <div
        className="h-px flex-1 max-w-24"
        style={{ background: "linear-gradient(to left, transparent, #d4a017aa)" }}
      />
    </div>
  );
}

// ─── Equipment data ───────────────────────────────────────────────────────────
const equipment = [
  {
    id: "rebel-sl3",
    name: "Canon EOS Rebel SL3",
    type: "Digital DSLR",
    badge: "DIGITAL",
    badgeColor: "#c4a030",
    lenses: [
      "55–250mm f/4 telephoto zoom",
      "15–55mm f/6.5 kit lens",
      "Canon 50mm f/1.8 prime",
      "Canon 50mm macro",
      "Sigma 150–600mm telephoto",
    ],
    icon: (
      <svg viewBox="0 0 100 70" fill="none">
        <rect x="8" y="22" width="84" height="42" rx="5" fill="currentColor" opacity="0.9" />
        <rect x="36" y="10" width="28" height="16" rx="3" fill="currentColor" opacity="0.9" />
        <circle cx="50" cy="43" r="17" stroke="#1a1008" strokeWidth="3" fill="none" />
        <circle cx="50" cy="43" r="10" stroke="#1a1008" strokeWidth="2" fill="none" />
        <circle cx="50" cy="43" r="4" fill="#1a1008" opacity="0.4" />
        <rect x="76" y="26" width="10" height="5" rx="1.5" fill="#1a1008" opacity="0.5" />
        <rect x="10" y="48" width="16" height="10" rx="2" fill="#1a1008" opacity="0.25" />
        <circle cx="18" cy="30" r="3" fill="#1a1008" opacity="0.3" />
      </svg>
    ),
  },
  {
    id: "canon-a1",
    name: "Canon A-1",
    type: "35mm SLR Film",
    badge: "35MM FILM",
    badgeColor: "#c47a30",
    lenses: [],
    icon: (
      <svg viewBox="0 0 100 70" fill="none">
        <rect x="5" y="24" width="90" height="40" rx="4" fill="currentColor" opacity="0.9" />
        <path d="M22 24 L22 14 L78 14 L78 24Z" fill="currentColor" opacity="0.9" />
        <circle cx="50" cy="44" r="15" stroke="#1a1008" strokeWidth="3" fill="none" />
        <circle cx="50" cy="44" r="8" stroke="#1a1008" strokeWidth="1.5" fill="none" />
        <circle cx="50" cy="44" r="3" fill="#1a1008" opacity="0.4" />
        <rect x="78" y="28" width="12" height="5" rx="1.5" fill="#1a1008" opacity="0.4" />
        <rect x="10" y="29" width="14" height="9" rx="2" fill="#1a1008" opacity="0.2" />
        <rect x="5" y="55" width="8" height="9" rx="1" fill="#1a1008" opacity="0.25" />
        <rect x="87" y="55" width="8" height="9" rx="1" fill="#1a1008" opacity="0.25" />
      </svg>
    ),
  },
  {
    id: "polaroid-now",
    name: "Polaroid Now",
    type: "Instant Film",
    badge: "INSTANT",
    badgeColor: "#8b6b4a",
    lenses: ["I-Type film", "600 film compatible"],
    icon: (
      <svg viewBox="0 0 100 80" fill="none">
        <rect x="10" y="8" width="80" height="58" rx="8" fill="currentColor" opacity="0.9" />
        <rect x="18" y="62" width="64" height="14" rx="3" fill="currentColor" opacity="0.75" />
        <rect x="28" y="66" width="44" height="6" rx="2" stroke="#1a1008" strokeWidth="1.5" fill="none" />
        <circle cx="38" cy="30" r="12" stroke="#1a1008" strokeWidth="2.5" fill="none" />
        <circle cx="38" cy="30" r="6" stroke="#1a1008" strokeWidth="1.5" fill="none" />
        <circle cx="38" cy="30" r="2.5" fill="#1a1008" opacity="0.4" />
        <rect x="58" y="22" width="20" height="14" rx="2" stroke="#1a1008" strokeWidth="1.5" fill="none" />
        <circle cx="65" cy="14" r="3" fill="#1a1008" opacity="0.3" />
      </svg>
    ),
  },
];

// ─── Home page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const lite = usePerfMode();
  const heroRef = useRef<HTMLElement>(null);
  const [bgChapter, setBgChapter] = useState<Chapter | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const visited = sessionStorage.getItem("eg-intro");
    if (!visited) {
      sessionStorage.setItem("eg-intro", "1");
      setIsFirstVisit(true);
    }
  }, []);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -70]);
  const heroOpacity = useTransform(scrollY, [0, 380], [1, 0]);

  // Cursor glow — follows mouse across the hero
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const glowY = useSpring(mouseY, { stiffness: 80, damping: 20 });
  const glowLeft = useTransform(glowX, [-0.5, 0.5], ["20%", "80%"]);
  const glowTop = useTransform(glowY, [-0.5, 0.5], ["20%", "80%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (lite) return;
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ position: "relative" }}>
      {/* ─── ANIMATED GRADIENT BACKGROUND ─────────────── */}
      <div className="page-bg-gradient fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
      {/* ─── CHAPTER HOVER BACKGROUND ─────────────────── */}
      <AnimatePresence>
        {bgChapter && (
          <motion.div
            key={bgChapter.id}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Image
              src={bgChapter.coverPhoto.src}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              style={{ opacity: 0.18 }}
            />
            {/* Radial mask — fades hard at all edges */}
            <div className="absolute inset-0" style={{
              background: "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 25%, rgba(13,8,2,0.5) 55%, rgba(13,8,2,0.88) 72%, #0d0802 100%)",
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HERO ────────────────────────────────────── */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ y: heroY, zIndex: 1 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Base dark background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 130% 90% at 50% 65%, rgba(45,31,14,0.85) 0%, rgba(26,16,8,0.8) 55%, rgba(13,8,4,0.7) 100%)",
          }}
        />

        {/* ── First-visit: dark veil that lifts to reveal the hero ── */}
        {isFirstVisit && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "#06040100", zIndex: 8 }}
            initial={{ opacity: 1, backgroundColor: "#060300" }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.8, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
          />
        )}

        {/* ── First-visit: gold scan line sweeps top → bottom ── */}
        {isFirstVisit && (
          <motion.div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              height: 1,
              zIndex: 9,
              background: "linear-gradient(to right, transparent 0%, rgba(212,160,23,0.06) 10%, rgba(212,160,23,0.55) 50%, rgba(212,160,23,0.06) 90%, transparent 100%)",
              boxShadow: "0 0 18px 4px rgba(212,160,23,0.18)",
            }}
            initial={{ top: "0%", opacity: 0 }}
            animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.4, delay: 0.3, ease: "linear", times: [0, 0.05, 0.9, 1] }}
          />
        )}

        {/* ── Bokeh particles ── */}
        {!lite && <BokehBackground />}

        {/* Cursor-following warm glow — skipped on low-end / touch devices */}
        {!lite && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: glowLeft,
              top: glowTop,
              width: 380,
              height: 380,
              x: "-50%",
              y: "-50%",
              background:
                "radial-gradient(circle, rgba(212,160,23,0.08) 0%, transparent 65%)",
              filter: "blur(40px)",
            }}
          />
        )}

        {/* Gold corner brackets */}
        <div className="absolute top-2 left-2 w-14 h-14 pointer-events-none" style={{ borderTop: "1px solid rgba(212,160,23,0.22)", borderLeft: "1px solid rgba(212,160,23,0.22)" }} />
        <div className="absolute top-2 right-2 w-14 h-14 pointer-events-none" style={{ borderTop: "1px solid rgba(212,160,23,0.22)", borderRight: "1px solid rgba(212,160,23,0.22)" }} />
        <div className="absolute bottom-2 left-2 w-14 h-14 pointer-events-none" style={{ borderBottom: "1px solid rgba(212,160,23,0.22)", borderLeft: "1px solid rgba(212,160,23,0.22)" }} />
        <div className="absolute bottom-2 right-2 w-14 h-14 pointer-events-none" style={{ borderBottom: "1px solid rgba(212,160,23,0.22)", borderRight: "1px solid rgba(212,160,23,0.22)" }} />

        {/* ── Content ── */}
        <motion.div
          className="relative z-10 flex flex-col items-center text-center px-6"
          style={{ opacity: heroOpacity }}
        >
          {/* Aperture logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: isFirstVisit ? 1.2 : 0.1, ease: [0.25, 0, 0, 1] }}
            style={{ marginBottom: 32 }}
          >
            <ApertureLogo
              size={72}
              style={{ color: "#d4a017", opacity: 0.7 }}
            />
          </motion.div>

          {/* Eyebrow */}
          <motion.p
            className="mb-5 tracking-[0.4em] text-xs uppercase"
            style={{ fontFamily: "var(--font-courier)", color: "#d4a017", opacity: 0.6 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 0.6, y: 0 }}
            transition={{ duration: 0.7, delay: isFirstVisit ? 1.6 : 0.2 }}
          >
            A Visual Journal
          </motion.p>

          {/* ── Title with magnetic repulsion + shimmer ── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: isFirstVisit ? 2.0 : 0.25, ease: [0.25, 0, 0, 1] }}
          >
            <ShimmerTitle
              text="Emerson's"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(52px, 10vw, 116px)",
                fontWeight: 300,
                letterSpacing: "0.02em",
              }}
            />
            <ShimmerTitle
              text="Gallery"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(52px, 10vw, 116px)",
                fontWeight: 300,
                letterSpacing: "0.08em",
                marginTop: "0.04em",
              }}
            />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="mt-6 max-w-sm leading-relaxed"
            style={{ fontFamily: "var(--font-caveat)", color: "#c4a882", fontSize: 22 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: isFirstVisit ? 2.7 : 0.35 }}
          >
            Capturing your vision with our lens est. 2025
          </motion.p>

          {/* Divider */}
          <motion.div
            className="mt-10 flex items-center gap-4"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.7, delay: isFirstVisit ? 3.1 : 0.45 }}
          >
            <div
              className="h-px w-20"
              style={{ background: "linear-gradient(to right, transparent, #d4a017bb)" }}
            />
            <span style={{ color: "#d4a017", fontSize: 14, opacity: 0.8 }}>✦</span>
            <div
              className="h-px w-20"
              style={{ background: "linear-gradient(to left, transparent, #d4a017bb)" }}
            />
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            className="mt-16 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: isFirstVisit ? 3.6 : 0.7, duration: 0.6 }}
          >
            <p
              style={{
                fontFamily: "var(--font-courier)",
                color: "#d4a017",
                fontSize: 10,
                letterSpacing: "0.22em",
                opacity: 0.42,
              }}
            >
              OPEN THE ALBUM
            </p>
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M5 8l5 5 5-5"
                  stroke="#d4a017"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.42"
                />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Smooth bottom fade — dissolves hero into the page background */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: 280,
            background: "linear-gradient(to bottom, transparent 0%, rgba(13,8,2,0.55) 45%, rgba(10,6,1,0.88) 75%, #0a0601 100%)",
            zIndex: 6,
          }}
        />
      </motion.section>

      {/* ─── CHAPTERS ──────────────────────────────────── */}
      <motion.section
        className="relative py-24 md:py-32"
        style={{ zIndex: 1 }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 100% 50% at 50% 0%, rgba(61,35,20,0.5) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(212,160,23,0.07) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            <p
              className="mb-3 tracking-[0.3em] text-xs uppercase"
              style={{ fontFamily: "var(--font-courier)", color: "#d4a017", opacity: 0.5 }}
            >
              — Contents —
            </p>
            <h2
              className="text-4xl sm:text-5xl font-bold"
              style={{
                fontFamily: "var(--font-playfair)",
                color: "#f5e6c8",
                textShadow: "0 2px 30px rgba(212,160,23,0.2)",
              }}
            >
              Chapters
            </h2>
            <p
              className="mt-3 opacity-60"
              style={{ fontFamily: "var(--font-caveat)", color: "#c4a882", fontSize: 21 }}
            >
              Click to open a chapter
            </p>
            <GoldDivider />
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-10 md:gap-20 py-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            {chapters.map((chapter, i) => (
              <motion.div
                key={chapter.id}
                variants={{
                  hidden: { opacity: 0, y: 40, scale: 0.96 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.25, 0, 0, 1] } },
                }}
              >
                <ChapterCard
                  chapter={chapter}
                  index={i}
                  onHover={() => setBgChapter(chapter)}
                  onLeave={() => setBgChapter(null)}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-20 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-center gap-4 mb-3">
              <div
                className="h-px w-20"
                style={{ background: "linear-gradient(to right, transparent, rgba(196,168,130,0.25))" }}
              />
              <span
                style={{
                  color: "#c4a882",
                  opacity: 0.35,
                  fontFamily: "var(--font-courier)",
                  fontSize: 10,
                  letterSpacing: "0.22em",
                }}
              >
                MORE TO COME
              </span>
              <div
                className="h-px w-20"
                style={{ background: "linear-gradient(to left, transparent, rgba(196,168,130,0.25))" }}
              />
            </div>
            <p
              style={{
                fontFamily: "var(--font-caveat)",
                color: "#c4a882",
                opacity: 0.35,
                fontSize: 18,
              }}
            >
              New chapters added as the journey continues
            </p>
          </motion.div>
        </div>

        {/* Bottom gradient fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{
          height: 120,
          background: "linear-gradient(to bottom, transparent, rgba(10,8,4,0.9))",
          zIndex: 2,
        }} />
      </motion.section>

      {/* ─── EQUIPMENT ─────────────────────────────────── */}
      <motion.section
        className="relative py-24 md:py-32"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.06 }}
        transition={{ duration: 0.75, ease: [0.25, 0, 0, 1] }}
        style={{
          zIndex: 1,
          background: "linear-gradient(to bottom, rgba(26,16,8,0.65) 0%, rgba(34,21,8,0.7) 40%, rgba(26,16,8,0.65) 100%)",
        }}
      >
        {/* Top gradient fade from previous section */}
        <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{
          height: 100,
          background: "linear-gradient(to bottom, rgba(10,8,4,0.85), transparent)",
          zIndex: 2,
        }} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 30%, rgba(180,110,20,0.09) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent 0%, rgba(212,160,23,0.25) 30%, rgba(212,160,23,0.45) 50%, rgba(212,160,23,0.25) 70%, transparent 100%)",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            <p
              className="mb-3 tracking-[0.3em] text-xs uppercase"
              style={{ fontFamily: "var(--font-courier)", color: "#d4a017", opacity: 0.5 }}
            >
              — The Kit —
            </p>
            <h2
              className="text-4xl sm:text-5xl font-bold"
              style={{
                fontFamily: "var(--font-playfair)",
                color: "#f5e6c8",
                textShadow: "0 2px 30px rgba(212,160,23,0.2)",
              }}
            >
              Equipment
            </h2>
            <p
              className="mt-3 opacity-60"
              style={{ fontFamily: "var(--font-caveat)", color: "#c4a882", fontSize: 21 }}
            >
              The tools behind the frames
            </p>
            <GoldDivider />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {equipment.map((item, i) => (
              <motion.div
                key={item.id}
                className="relative group"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.1, duration: 0.55, ease: [0.25, 0, 0, 1] }}
              >
                <div
                  className="relative overflow-hidden p-6 flex flex-col items-center text-center"
                  style={{
                    background: "linear-gradient(135deg, #241608 0%, #1e1208 100%)",
                    border: "1px solid rgba(212,160,23,0.15)",
                    borderRadius: 4,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                    transition: "border-color 0.3s, box-shadow 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(212,160,23,0.35)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 4px 32px rgba(0,0,0,0.5), 0 0 20px rgba(212,160,23,0.06) inset";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(212,160,23,0.15)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 4px 24px rgba(0,0,0,0.4)";
                  }}
                >
                  <span
                    className="mb-5 px-3 py-[3px] text-[9px] tracking-[0.25em] font-medium"
                    style={{
                      fontFamily: "var(--font-courier)",
                      color: item.badgeColor,
                      border: `1px solid ${item.badgeColor}55`,
                      borderRadius: 2,
                    }}
                  >
                    {item.badge}
                  </span>

                  <div className="w-28 h-20 mb-5" style={{ color: item.badgeColor }}>
                    {item.icon}
                  </div>

                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ fontFamily: "var(--font-playfair)", color: "#f5e6c8" }}
                  >
                    {item.name}
                  </h3>

                  <p
                    className="mb-4 opacity-55"
                    style={{
                      fontFamily: "var(--font-courier)",
                      color: "#c4a882",
                      fontSize: 10,
                      letterSpacing: "0.15em",
                    }}
                  >
                    {item.type}
                  </p>

                  {item.lenses.length > 0 && (
                    <ul className="w-full space-y-1">
                      {item.lenses.map((lens) => (
                        <li
                          key={lens}
                          className="flex items-center gap-2 justify-center"
                          style={{
                            fontFamily: "var(--font-caveat)",
                            color: "#c4a882",
                            fontSize: 15,
                            opacity: 0.75,
                          }}
                        >
                          <span style={{ color: item.badgeColor, fontSize: 8, opacity: 0.7 }}>
                            ◆
                          </span>
                          {lens}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Bottom accent sweep */}
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-1/2 transition-all duration-500"
                    style={{
                      background: `linear-gradient(to right, transparent, ${item.badgeColor}, transparent)`,
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent 0%, rgba(212,160,23,0.2) 40%, rgba(212,160,23,0.35) 50%, rgba(212,160,23,0.2) 60%, transparent 100%)",
          }}
        />
      </motion.section>

      {/* ─── BOOKING ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 0.8, ease: [0.25, 0, 0, 1] }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <BookingForm />
      </motion.div>

      {/* ─── FOOTER ────────────────────────────────────── */}
      <motion.footer
        className="relative py-10 px-6 flex flex-col items-center gap-4 text-center border-t"
        style={{ borderColor: "rgba(196,168,130,0.1)", zIndex: 1 }}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.25, 0, 0, 1] }}
      >
        <ApertureLogo
          size={28}
          style={{ color: "#c4a882", opacity: 0.22 }}
        />
        <p
          style={{
            fontFamily: "var(--font-courier)",
            color: "#c4a882",
            opacity: 0.32,
            fontSize: 11,
            letterSpacing: "0.22em",
          }}
        >
          EMERSON&apos;S GALLERY — PHOTOGRAPHY PORTFOLIO
        </p>
        <p
          style={{ fontFamily: "var(--font-caveat)", color: "#c4a882", opacity: 0.22, fontSize: 15 }}
        >
          All images © their respective sessions
        </p>
      </motion.footer>
    </div>
  );
}
