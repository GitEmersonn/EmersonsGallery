"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useMotionValue, useSpring } from "framer-motion";
import type { Chapter } from "@/data/chapters";
import { chapters as allChapters } from "@/data/chapters";
import PhotoGrid from "@/components/PhotoGrid";

// ─── Shared helpers ────────────────────────────────────────────────────────────

const CARD_ROTS = [-3.5, 2.8, -2, 4, -3];

// ─── Cursor repulsor — wraps any decorative element; cursor pushes it away ────

function CursorRepulsor({
  children,
  maxPush = 22,
  maxRotation = 18,
  className = "",
  style,
}: {
  children: React.ReactNode;
  maxPush?: number;
  maxRotation?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rawRotate = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 280, damping: 16, mass: 0.7 });
  const springY = useSpring(rawY, { stiffness: 280, damping: 16, mass: 0.7 });
  const springRotate = useSpring(rawRotate, { stiffness: 260, damping: 18, mass: 0.7 });

  useEffect(() => {
    let rafId: number | null = null;
    let pendingX = 0, pendingY = 0, pendingMX = 0, pendingMY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      pendingX = e.clientX;
      pendingY = e.clientY;
      pendingMX = e.movementX;
      pendingMY = e.movementY;
      if (rafId !== null) return; // already scheduled, skip
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = pendingX - cx;
        const dy = pendingY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = Math.max(rect.width, rect.height) * 1.4;

        if (dist < radius && dist > 0) {
          const speed = Math.sqrt(pendingMX * pendingMX + pendingMY * pendingMY);
          const normalizedSpeed = Math.min(speed / 12, 1);
          const proximity = 1 - dist / radius;
          const force = proximity * (0.3 + normalizedSpeed * 0.7);
          rawX.set((-dx / dist) * maxPush * force);
          rawY.set((-dy / dist) * maxPush * force);
          rawRotate.set(Math.sign(pendingMX) * maxRotation * force);
        } else {
          rawX.set(0);
          rawY.set(0);
          rawRotate.set(0);
        }
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [rawX, rawY, rawRotate, maxPush, maxRotation]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ ...style, x: springX, y: springY, rotate: springRotate }}
    >
      {children}
    </motion.div>
  );
}

// ─── Key West SVG elements ─────────────────────────────────────────────────────

function KWPalmTree({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 120 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M58 280 C55 240 50 200 53 160 C56 120 54 80 57 40"
        stroke="#2dd4bf"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.65"
      />
      <path d="M57 42 C30 30 5 40 2 60 C20 48 42 52 57 55" fill="#2dd4bf" opacity="0.7" />
      <path d="M57 42 C80 20 110 25 115 45 C95 36 72 44 57 55" fill="#2dd4bf" opacity="0.65" />
      <path d="M57 42 C45 10 55 -10 72 5 C65 18 60 34 57 55" fill="#2dd4bf" opacity="0.6" />
      <path d="M57 42 C20 50 8 75 18 90 C28 70 44 58 57 55" fill="#2dd4bf" opacity="0.55" />
      <path d="M57 42 C90 55 105 78 96 92 C84 72 68 60 57 55" fill="#2dd4bf" opacity="0.55" />
      <circle cx="57" cy="58" r="5" fill="#fb7185" opacity="0.6" />
      <circle cx="63" cy="55" r="4" fill="#fb7185" opacity="0.5" />
    </svg>
  );
}

function KWHibiscus({
  className = "",
  size = 80,
  opacity = 0.7,
}: {
  className?: string;
  size?: number;
  opacity?: number;
}) {
  const PETALS = [0, 72, 144, 216, 288];
  return (
    // Outer: gentle idle sway — like a flower in a coastal breeze
    <motion.div
      className={className}
      style={{ width: size, height: size }}
      animate={{ rotate: [0, 14, 0, -14, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Inner SVG: petals bloom staggered on viewport enter, close on exit */}
      <motion.svg
        viewBox="0 0 80 80"
        width={size}
        height={size}
        fill="none"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.45 }}
        variants={{
          hidden: { transition: { staggerChildren: 0.055, staggerDirection: -1 } },
          visible: { transition: { staggerChildren: 0.055 } },
        }}
      >
        {PETALS.map((deg) => (
          <g key={deg} transform={`rotate(${deg} 40 40)`}>
            <motion.ellipse
              cx="40" cy="20" rx="10" ry="18"
              fill="#fb7185"
              variants={{
                hidden: { scale: 0, opacity: 0 },
                visible: {
                  scale: 1, opacity,
                  transition: { type: "spring", stiffness: 220, damping: 13 },
                },
              }}
              style={{ transformOrigin: "40px 40px" }}
            />
          </g>
        ))}
        {/* Stamen — pops in after petals */}
        <motion.circle cx="40" cy="40" r="9" fill="#fcd34d"
          variants={{
            hidden: { scale: 0, opacity: 0 },
            visible: { scale: 1, opacity: 0.85, transition: { type: "spring", stiffness: 300, damping: 16 } },
          }}
          style={{ transformOrigin: "40px 40px" }}
        />
        <motion.circle cx="40" cy="40" r="4" fill="#fb7185"
          variants={{
            hidden: { scale: 0, opacity: 0 },
            visible: { scale: 1, opacity: 0.9, transition: { duration: 0.18 } },
          }}
          style={{ transformOrigin: "40px 40px" }}
        />
        <line x1="40" y1="31" x2="40" y2="22" stroke="#fcd34d" strokeWidth="1.5" opacity="0.7" />
      </motion.svg>
    </motion.div>
  );
}

function KWWaves({
  className = "",
  color = "#2dd4bf",
  opacity1 = 0.3,
  opacity2 = 0.18,
}: {
  className?: string;
  color?: string;
  opacity1?: number;
  opacity2?: number;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 800 60"
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        d="M0 30 C80 10 160 50 240 30 C320 10 400 50 480 30 C560 10 640 50 720 30 C760 20 780 25 800 30 L800 60 L0 60Z"
        fill={color}
        opacity={opacity1}
      />
      <path
        d="M0 40 C60 25 130 55 200 40 C270 25 340 55 400 40 C470 25 540 55 600 40 C680 25 740 55 800 40 L800 60 L0 60Z"
        fill={color}
        opacity={opacity2}
      />
    </svg>
  );
}

function KWShell({ className = "" }: { className?: string }) {
  return (
    // Idle: gently rocks like it's being rolled by the tide
    <motion.div
      className={className}
      animate={{ rotate: [-12, 12, -12] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "center bottom" }}
    >
      {/* Reveal: spirals in from a tiny point — shells grow in spirals */}
      <motion.svg
        width="36" height="36" viewBox="0 0 50 50" fill="none"
        initial={{ scale: 0.1, rotate: -220, opacity: 0 }}
        whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ type: "spring", stiffness: 160, damping: 14 }}
        style={{ transformOrigin: "25px 25px" }}
      >
        <path d="M25 45 C10 40 5 25 10 12 C15 0 35 0 40 12 C45 25 40 40 25 45Z"
          stroke="#fb7185" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M25 45 C25 30 20 15 25 8" stroke="#fb7185" strokeWidth="1" opacity="0.5" />
        <path d="M25 45 C20 32 12 20 16 12" stroke="#fb7185" strokeWidth="1" opacity="0.4" />
        <path d="M25 45 C30 32 38 20 34 12" stroke="#fb7185" strokeWidth="1" opacity="0.4" />
      </motion.svg>
    </motion.div>
  );
}

function KeyWestHeroDecor() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Right palm — grows up from ground, then sways */}
      <motion.div
        className="absolute bottom-0 right-0"
        initial={{ opacity: 0, y: 55 }}
        whileInView={{ opacity: 0.45, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.0, delay: 0.3, ease: [0.25, 0, 0, 1] }}
      >
        <motion.div
          animate={{ rotate: [-2.5, 2.5, -2.5] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 100%" }}
        >
          <KWPalmTree style={{ width: 90, height: 220 }} />
        </motion.div>
      </motion.div>

      {/* Left palm — slightly later, sways opposite phase */}
      <motion.div
        className="absolute bottom-0 left-4"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 0.28, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.0, delay: 0.48, ease: [0.25, 0, 0, 1] }}
      >
        <motion.div
          animate={{ rotate: [1.5, -1.5, 1.5] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          style={{ transformOrigin: "50% 100%" }}
        >
          <KWPalmTree style={{ width: 60, height: 150, transform: "scaleX(-1)" }} />
        </motion.div>
      </motion.div>

      {/* Seagulls — glide in from right, then drift on thermals */}
      <motion.div
        className="absolute top-16 right-1/3"
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 0.4, x: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.1, delay: 0.6, ease: [0.25, 0, 0, 1] }}
      >
        <motion.svg
          width="120" height="30" viewBox="0 0 120 30" fill="none"
          animate={{ y: [0, -14, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          {([[14,15],[45,8],[78,18],[104,7]] as [number,number][]).map(([cx, cy], i) => (
            <path key={i}
              d={`M${cx-10} ${cy} Q${cx-5} ${cy-5} ${cx} ${cy} Q${cx+5} ${cy-5} ${cx+10} ${cy}`}
              stroke="#2dd4bf" strokeWidth="1.5" fill="none" opacity="0.55"
            />
          ))}
        </motion.svg>
      </motion.div>

      {/* Waves — roll in from bottom */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 0.85, delay: 0.15, ease: [0.25, 0, 0, 1] }}
      >
        <KWWaves className="w-full" />
      </motion.div>
    </div>
  );
}

// ─── Wharton Texas SVG elements ────────────────────────────────────────────────

function TXCowboyHat({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 160 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="80" cy="72" rx="78" ry="18" fill="#f59e0b" opacity="0.7" />
      <path
        d="M30 72 C28 55 35 30 55 22 C65 18 95 18 105 22 C125 30 132 55 130 72Z"
        fill="#f59e0b"
        opacity="0.75"
      />
      <path
        d="M55 22 C60 35 65 45 80 48 C95 45 100 35 105 22"
        stroke="#92400e"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
      <path d="M38 65 C40 58 120 58 122 65" stroke="#92400e" strokeWidth="3" fill="none" opacity="0.6" />
    </svg>
  );
}

function TXHorseshoe({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    // Idle: pendulum swing — like a horseshoe hung on a nail in the barn
    <motion.div
      className={className}
      style={{ ...style, transformOrigin: "center top" }}
      animate={{ rotate: [-10, 10, -10] }}
      transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Reveal: tossed in from above with spin, bounces on landing */}
      <motion.svg
        viewBox="0 0 80 90" fill="none"
        style={{ width: "100%", height: "100%" }}
        initial={{ y: -38, rotate: 25, opacity: 0, scale: 0.6 }}
        whileInView={{ y: 0, rotate: 0, opacity: 1, scale: 1 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ type: "spring", stiffness: 260, damping: 13 }}
      >
        <path d="M15 80 L15 45 Q15 10 40 10 Q65 10 65 45 L65 80"
          stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.7" />
        {([[17,75],[17,62],[22,50],[63,75],[63,62],[58,50]] as [number,number][]).map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="3" fill="#92400e" opacity="0.6" />
        ))}
      </motion.svg>
    </motion.div>
  );
}

function TXCactus({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 80 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="32" y="20" width="16" height="170" rx="8" fill="#6b7c5c" opacity="0.7" />
      <path
        d="M32 80 C20 80 10 75 10 62 C10 52 16 48 22 50 L22 105"
        stroke="#6b7c5c"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        opacity="0.65"
      />
      <path
        d="M48 100 C60 100 70 95 70 82 C70 72 64 68 58 70 L58 128"
        stroke="#6b7c5c"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        opacity="0.65"
      />
    </svg>
  );
}

function TXLoneStar({
  className = "",
  size = 60,
}: {
  className?: string;
  size?: number;
}) {
  return (
    // Idle: slow celestial drift — like a star pulsing in the night sky
    <motion.div
      className={className}
      style={{ width: size, height: size }}
      animate={{ rotate: [0, 18, 0, -18, 0], scale: [1, 1.12, 1, 1.12, 1] }}
      transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Reveal: shoots in spinning like a thrown Lone Star */}
      <motion.svg
        viewBox="0 0 60 60" width={size} height={size} fill="none"
        initial={{ scale: 0, rotate: 160, opacity: 0 }}
        whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        style={{ transformOrigin: "30px 30px" }}
      >
        <polygon
          points="30,4 35,21 54,21 39,32 45,50 30,39 15,50 21,32 6,21 25,21"
          fill="#f59e0b" stroke="#92400e" strokeWidth="1.5" opacity="0.8"
        />
      </motion.svg>
    </motion.div>
  );
}

function TXRollingPlains({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 800 80"
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        d="M0 60 C100 40 200 70 300 55 C400 40 500 65 600 50 C700 35 750 55 800 50 L800 80 L0 80Z"
        fill="#8b5e3c"
        opacity="0.35"
      />
      <path
        d="M0 70 C80 55 180 75 280 65 C380 55 480 72 580 62 C680 52 740 70 800 65 L800 80 L0 80Z"
        fill="#6b7c5c"
        opacity="0.2"
      />
    </svg>
  );
}

function TXFencePost({ x = 0 }: { x?: number }) {
  return (
    <g>
      <rect x={x} y="20" width="6" height="50" rx="2" fill="#8b5e3c" opacity="0.6" />
      <rect x={x - 3} y="30" width="12" height="3" rx="1" fill="#6b7c5c" opacity="0.5" />
      <rect x={x - 3} y="42" width="12" height="3" rx="1" fill="#6b7c5c" opacity="0.5" />
    </g>
  );
}

function WhartonHeroDecor() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Right cactus — grows up from the earth */}
      <motion.div
        className="absolute bottom-0 right-8"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 0.40, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 0.95, delay: 0.32, ease: [0.25, 0, 0, 1] }}
      >
        <motion.div
          animate={{ rotate: [-1.5, 1.5, -1.5] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 100%" }}
        >
          <TXCactus style={{ width: 55, height: 130 }} />
        </motion.div>
      </motion.div>

      {/* Left cactus — grows slightly later */}
      <motion.div
        className="absolute bottom-0 left-6"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 0.25, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 0.95, delay: 0.46, ease: [0.25, 0, 0, 1] }}
      >
        <motion.div
          animate={{ rotate: [1.2, -1.2, 1.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ transformOrigin: "50% 100%" }}
        >
          <TXCactus style={{ width: 40, height: 100, transform: "scaleX(-1)" }} />
        </motion.div>
      </motion.div>

      {/* Cowboy hat — tips in from above like someone tossed it */}
      <motion.div
        className="absolute top-14 right-12"
        initial={{ opacity: 0, y: -24, rotate: -12 }}
        whileInView={{ opacity: 0.20, y: 0, rotate: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.65 }}
      >
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <TXCowboyHat style={{ width: 80, height: 50 }} />
        </motion.div>
      </motion.div>

      {/* Fence — rises from the ground */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 w-full"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 0.28, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 0.75, delay: 0.2, ease: [0.25, 0, 0, 1] }}
      >
        <svg height="70" viewBox="0 0 800 70" fill="none" style={{ width: "100%" }}>
          {[0, 80, 160, 240, 320, 400, 480, 560, 640, 720].map((x) => (
            <TXFencePost key={x} x={x + 30} />
          ))}
          <line x1="0" y1="33" x2="800" y2="33" stroke="#8b5e3c" strokeWidth="2" opacity="0.5" />
          <line x1="0" y1="45" x2="800" y2="45" stroke="#8b5e3c" strokeWidth="2" opacity="0.5" />
        </svg>
      </motion.div>

      {/* Rolling plains — fade in */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.1, delay: 0.14 }}
      >
        <TXRollingPlains className="w-full" />
      </motion.div>
    </div>
  );
}

// ─── Night City SVG elements ──────────────────────────────────────────────────

const NIGHT_BUILDINGS: [number, number, number, number][] = [
  [0, 78, 55, 52], [50, 60, 45, 70], [90, 72, 38, 58],
  [125, 42, 55, 88], [175, 65, 42, 65], [212, 48, 65, 82],
  [272, 70, 38, 60], [305, 38, 75, 92], [375, 62, 45, 68],
  [415, 50, 60, 80], [470, 74, 40, 56], [505, 44, 68, 86],
  [568, 68, 42, 62], [605, 52, 55, 78], [655, 76, 38, 54],
  [688, 60, 48, 70], [730, 48, 70, 82],
];

const NIGHT_WINDOWS: [number, number, number, number, number][] = [
  [132, 50, 5, 7, 0.65], [144, 50, 5, 7, 0.5], [156, 50, 5, 7, 0.6], [168, 50, 5, 7, 0.4],
  [132, 63, 5, 7, 0.5], [156, 63, 5, 7, 0.65], [168, 63, 5, 7, 0.45],
  [132, 76, 5, 7, 0.6], [144, 76, 5, 7, 0.5], [168, 76, 5, 7, 0.55],
  [220, 55, 6, 8, 0.6], [232, 55, 6, 8, 0.5], [252, 55, 6, 8, 0.65], [264, 55, 6, 8, 0.45],
  [220, 70, 6, 8, 0.5], [244, 70, 6, 8, 0.6], [264, 70, 6, 8, 0.55],
  [313, 46, 7, 9, 0.7], [326, 46, 7, 9, 0.55], [346, 46, 7, 9, 0.6], [359, 46, 7, 9, 0.5],
  [313, 62, 7, 9, 0.5], [339, 62, 7, 9, 0.65], [359, 62, 7, 9, 0.45],
  [326, 78, 7, 9, 0.55], [359, 78, 7, 9, 0.6],
  [422, 58, 6, 8, 0.6], [434, 58, 6, 8, 0.45], [454, 58, 6, 8, 0.65], [466, 58, 6, 8, 0.5],
  [422, 73, 6, 8, 0.55], [454, 73, 6, 8, 0.6],
  [513, 52, 6, 8, 0.65], [525, 52, 6, 8, 0.5], [547, 52, 6, 8, 0.6], [559, 52, 6, 8, 0.45],
  [513, 68, 6, 8, 0.5], [547, 68, 6, 8, 0.65], [559, 68, 6, 8, 0.55],
  [612, 60, 5, 7, 0.6], [623, 60, 5, 7, 0.5], [643, 60, 5, 7, 0.65],
  [612, 73, 5, 7, 0.45], [635, 73, 5, 7, 0.6],
];

function NightCitySkyline({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 800 130" preserveAspectRatio="none" fill="none">
      <rect x="0" y="95" width="800" height="35" fill="#9333ea" opacity="0.07" />
      {NIGHT_BUILDINGS.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill="#0d0020" opacity={0.68 + (i % 3) * 0.04} />
      ))}
      <line x1="343" y1="38" x2="343" y2="20" stroke="#1a0030" strokeWidth="2" opacity="0.85" />
      <circle cx="343" cy="19" r="2.5" fill="#a855f7" opacity="0.75" />
      <line x1="539" y1="44" x2="539" y2="26" stroke="#1a0030" strokeWidth="2" opacity="0.85" />
      <circle cx="539" cy="25" r="2" fill="#9333ea" opacity="0.65" />
      {NIGHT_WINDOWS.map(([x, y, w, h, op], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill="#e8c547" opacity={op} rx="0.5" />
      ))}
    </svg>
  );
}

function NightChampagne({
  className = "",
  size = 60,
}: {
  className?: string;
  size?: number;
}) {
  const bubbles: [number, number, number][] = [
    [25, 52, 0], [23, 50, 0.55], [27, 53, 1.2], [24, 48, 0.3], [26, 51, 0.9],
  ];
  return (
    <motion.div
      className={className}
      style={{ width: size, height: size * 2 }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.svg
        viewBox="0 0 50 100"
        width={size}
        height={size * 2}
        fill="none"
        initial={{ scale: 0, opacity: 0, rotate: -12 }}
        whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        style={{ transformOrigin: "25px 90px" }}
      >
        {/* Glass body */}
        <path
          d="M 12 8 L 38 8 L 30 50 L 28 55 L 22 55 L 20 50 Z"
          fill="#a855f7"
          fillOpacity="0.1"
          stroke="#a855f7"
          strokeWidth="1.2"
          strokeOpacity="0.55"
        />
        {/* Champagne fill */}
        <path
          d="M 21 47 L 29 47 L 30 50 L 28 55 L 22 55 L 20 50 Z"
          fill="#e8c547"
          fillOpacity="0.28"
        />
        {/* Shine */}
        <line x1="15" y1="12" x2="18" y2="46" stroke="white" strokeWidth="1" strokeOpacity="0.18" />
        {/* Stem */}
        <line x1="25" y1="55" x2="25" y2="82" stroke="#a855f7" strokeWidth="1.5" strokeOpacity="0.45" />
        {/* Base */}
        <line x1="13" y1="82" x2="37" y2="82" stroke="#a855f7" strokeWidth="1.5" strokeOpacity="0.45" />
        {/* Bubbles */}
        {bubbles.map(([cx, startY, delay], i) => (
          <motion.circle
            key={i}
            cx={cx}
            r={1.2}
            fill="#e8c547"
            animate={{ cy: [startY, 12], opacity: [0.75, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay, ease: "easeOut" }}
          />
        ))}
      </motion.svg>
    </motion.div>
  );
}

function NightSparkle({
  className = "",
  size = 36,
  color = "#a855f7",
}: {
  className?: string;
  size?: number;
  color?: string;
}) {
  return (
    <motion.div
      className={className}
      style={{ width: size, height: size }}
      animate={{ rotate: [0, 360], scale: [1, 1.18, 1] }}
      transition={{
        rotate: { duration: 12, repeat: Infinity, ease: "linear" },
        scale: { duration: 3.8, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <motion.svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        fill="none"
        initial={{ scale: 0, rotate: -90, opacity: 0 }}
        whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ type: "spring", stiffness: 250, damping: 14 }}
        style={{ transformOrigin: "20px 20px" }}
      >
        <path d="M20 2 L22 18 L38 20 L22 22 L20 38 L18 22 L2 20 L18 18 Z" fill={color} opacity="0.9" />
        <path d="M20 9 L21 19 L31 20 L21 21 L20 31 L19 21 L9 20 L19 19 Z" fill="white" opacity="0.22" />
      </motion.svg>
    </motion.div>
  );
}

function NightMoon({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{ scale: [1, 1.05, 1], opacity: [0.7, 0.9, 0.7] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.svg
        width="54" height="54" viewBox="0 0 54 54" fill="none"
        initial={{ scale: 0.4, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.2, ease: [0.25, 0, 0, 1], delay: 0.4 }}
        style={{ transformOrigin: "27px 27px" }}
      >
        <path
          d="M34 8 C20 8 10 17 10 28 C10 39 20 48 34 48 C25 44 18 37 18 28 C18 19 25 12 34 8 Z"
          fill="#e8c547"
          opacity="0.75"
        />
        <circle cx="42" cy="11" r="1.8" fill="#e8c547" opacity="0.55" />
        <circle cx="40" cy="22" r="1.1" fill="#a855f7" opacity="0.65" />
        <circle cx="47" cy="17" r="1.1" fill="#e8c547" opacity="0.45" />
      </motion.svg>
    </motion.div>
  );
}

function NightCityHeroDecor() {
  const starPositions: [number, number, number, string][] = [
    [160, 22, 9, "#a855f7"],
    [290, 44, 7, "#e8c547"],
    [470, 18, 11, "#a855f7"],
    [610, 38, 7, "#e8c547"],
    [710, 28, 9, "#a855f7"],
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Moon */}
      <motion.div
        className="absolute top-12 right-16"
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 0.7, scale: 1 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.25, 0, 0, 1] }}
      >
        <NightMoon />
      </motion.div>

      {/* Stars / sparkles scattered */}
      {starPositions.map(([right, top, size, color], i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ right, top }}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 0.45 + (i % 3) * 0.12, scale: 1 }}
          viewport={{ once: false, amount: 0.01 }}
          transition={{ duration: 0.55, delay: 0.28 + i * 0.1 }}
        >
          <NightSparkle size={size} color={color} />
        </motion.div>
      ))}

      {/* Champagne glass — left */}
      <motion.div
        className="absolute bottom-16 left-8"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 0.55, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 0.9, delay: 0.55, ease: [0.25, 0, 0, 1] }}
      >
        <NightChampagne size={44} />
      </motion.div>

      {/* Champagne glass — right, smaller */}
      <motion.div
        className="absolute bottom-20 right-10"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 0.38, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 0.9, delay: 0.7, ease: [0.25, 0, 0, 1] }}
      >
        <NightChampagne size={30} />
      </motion.div>

      {/* City skyline — rises from bottom */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.0, delay: 0.1, ease: [0.25, 0, 0, 1] }}
      >
        <NightCitySkyline className="w-full" />
      </motion.div>
    </div>
  );
}

// ─── Houston Skyline SVG elements ─────────────────────────────────────────────

function CityGlare({ size = 70 }: { size?: number }) {
  const cx = size / 2, cy = size / 2;
  return (
    <motion.svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.2 }}
    >
      {/* Pulsing glow rings */}
      <motion.circle cx={cx} cy={cy} r={size * 0.47} stroke="#facc15" strokeWidth="0.6" opacity="0.18"
        animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
      <motion.circle cx={cx} cy={cy} r={size * 0.36} stroke="#facc15" strokeWidth="1" opacity="0.28"
        animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }} />
      {/* Rotating rays */}
      <motion.g animate={{ rotate: 360 }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const short = i % 3 === 1;
          const r1 = size * 0.26, r2 = short ? size * 0.35 : size * 0.44;
          return <line key={i}
            x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1}
            x2={cx + Math.cos(a) * r2} y2={cy + Math.sin(a) * r2}
            stroke="#facc15" strokeWidth={short ? 1 : 1.8} strokeLinecap="round"
            opacity={short ? 0.45 : 0.75} />;
        })}
      </motion.g>
      {/* Lens flare streak */}
      <line x1={cx - size * 0.44} y1={cy} x2={cx + size * 0.44} y2={cy}
        stroke="#facc15" strokeWidth="0.8" opacity="0.2" />
      {/* Core */}
      <motion.circle cx={cx} cy={cy} r={size * 0.16} fill="#facc15" opacity="0.9"
        animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      <circle cx={cx} cy={cy} r={size * 0.08} fill="white" opacity="0.95" />
    </motion.svg>
  );
}

function CityTaxi({ size = 88 }: { size?: number }) {
  const h = size * 0.52;
  return (
    <motion.svg width={size} height={h} viewBox="0 0 88 46" fill="none"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 16, delay: 0.4 }}
    >
      <motion.g animate={{ x: [0, 3, 0, -2, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
        {/* Body */}
        <rect x="5" y="20" width="78" height="18" rx="3" fill="#facc15" opacity="0.88" />
        {/* Passenger compartment */}
        <path d="M19 20 L24 10 L64 10 L69 20Z" fill="#facc15" opacity="0.78" />
        {/* Windows */}
        <rect x="25" y="11" width="13" height="8" rx="1" fill="#bae6fd" opacity="0.72" />
        <rect x="41" y="11" width="13" height="8" rx="1" fill="#bae6fd" opacity="0.72" />
        {/* Taxi light on roof */}
        <rect x="37" y="6" width="14" height="5" rx="1" fill="#fef9c3" opacity="0.95" />
        {/* Checkered stripe */}
        {Array.from({ length: 14 }).map((_, i) => (
          <rect key={i} x={12 + i * 4} y="27" width="4" height="3"
            fill={i % 2 === 0 ? "#1e293b" : "#facc15"} opacity="0.55" />
        ))}
        {/* Wheels */}
        <circle cx="22" cy="39" r="6" fill="#0f172a" opacity="0.85" />
        <circle cx="22" cy="39" r="3" fill="#334155" opacity="0.7" />
        <circle cx="66" cy="39" r="6" fill="#0f172a" opacity="0.85" />
        <circle cx="66" cy="39" r="3" fill="#334155" opacity="0.7" />
        {/* Bumpers */}
        <rect x="2" y="28" width="6" height="8" rx="2" fill="#facc15" opacity="0.55" />
        <rect x="80" y="28" width="6" height="8" rx="2" fill="#facc15" opacity="0.55" />
      </motion.g>
    </motion.svg>
  );
}

// Deterministic lit-window pattern for glass towers
const GLASS_WIN_LIT = [
  true,false,true,false,false,true,false,true,
  false,true,false,true,true,false,true,false,
  true,true,false,false,true,false,true,false,
  false,false,true,false,false,true,false,true,
  true,false,false,true,true,false,false,true,
  false,true,true,false,false,true,true,false,
  true,false,true,false,true,true,false,false,
  false,true,false,true,false,false,true,true,
];

// [x, w, h] for each tower
const GLASS_TOWERS: [number, number, number][] = [
  [0, 32, 95],  [34, 22, 130], [58, 38, 108],
  [98, 28, 158],[128, 46, 138],[176, 24, 172],
  [202, 40, 148],[244, 26, 162],[272, 36, 118],
  [310, 20, 140],[332, 32, 100],
];

function GlassSkyline() {
  const H = 180;
  const [lit, setLit] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Build list of flickering window keys with their initial states
    const windows: { key: string; initial: boolean }[] = [];
    GLASS_TOWERS.forEach(([, w, h], ti) => {
      const cols = Math.max(2, Math.floor(w / 10));
      const rows = Math.floor((h - 10) / 13);
      Array.from({ length: rows }).forEach((_, row) => {
        Array.from({ length: cols }).forEach((_, col) => {
          const winIdx = ti * 7 + row * cols + col;
          if ((winIdx * 3 + ti * 5) % 10 < 3) {
            windows.push({ key: `${ti}-${row}-${col}`, initial: GLASS_WIN_LIT[winIdx % GLASS_WIN_LIT.length] });
          }
        });
      });
    });

    // Initialise state
    const init: Record<string, boolean> = {};
    windows.forEach(({ key, initial }) => { init[key] = initial; });
    setLit(init);

    // Each window toggles on its own random interval
    const timers = windows.map(({ key }) => {
      let t: ReturnType<typeof setTimeout>;
      const schedule = () => {
        t = setTimeout(() => {
          setLit(prev => ({ ...prev, [key]: !prev[key] }));
          schedule();
        }, 4000 + Math.floor(Math.random() * 10000));
      };
      // Stagger start so they don't all fire together
      const startDelay = setTimeout(schedule, Math.floor(Math.random() * 6000));
      return () => { clearTimeout(t); clearTimeout(startDelay); };
    });

    return () => timers.forEach(cancel => cancel());
  }, []);

  return (
    <svg width="364" height={H} viewBox={`0 0 364 ${H}`} fill="none">
      <defs>
        <filter id="win-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {GLASS_TOWERS.map(([x, w, h], ti) => {
        const y = H - h;
        const cols = Math.max(2, Math.floor(w / 10));
        const rows = Math.floor((h - 10) / 13);
        const colW = (w - 6) / cols;
        return (
          <g key={ti}>
            <rect x={x} y={y} width={w} height={h} fill="#38bdf8" opacity="0.14" />
            <rect x={x + 4} y={y - 8} width={w - 8} height={10} fill="#38bdf8" opacity="0.17" />
            <rect x={x + 8} y={y - 15} width={w - 16} height={9} fill="#38bdf8" opacity="0.2" />
            {Array.from({ length: rows }).map((_, row) =>
              Array.from({ length: cols }).map((_, col) => {
                const winIdx = ti * 7 + row * cols + col;
                const idx = winIdx % GLASS_WIN_LIT.length;
                const flickerKey = `${ti}-${row}-${col}`;
                const flickers = (winIdx * 3 + ti * 5) % 10 < 3;
                const isLit = flickers ? (lit[flickerKey] ?? GLASS_WIN_LIT[idx]) : GLASS_WIN_LIT[idx];
                return (
                  <rect key={flickerKey}
                    x={x + 3 + col * colW} y={y + 5 + row * 13}
                    width={colW - 2} height={10}
                    fill={isLit ? "#facc15" : "#38bdf8"}
                    opacity={isLit ? 0.6 : 0.28}
                    filter={isLit ? "url(#win-glow)" : undefined}
                  />
                );
              })
            )}
          </g>
        );
      })}
      <line x1="188" y1="8" x2="188" y2="0" stroke="#38bdf8" strokeWidth="1.5" opacity="0.55" />
      <motion.circle cx="188" cy="0" r="2" fill="#facc15"
        animate={{ opacity: [1, 0.15, 1] }} transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }} />
      <line x1="0" y1={H - 1} x2="364" y2={H - 1} stroke="#38bdf8" strokeWidth="1" opacity="0.2" />
    </svg>
  );
}

function HoustonSkylineHeroDecor() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Sun glare — top right */}
      <motion.div className="absolute top-8 right-12"
        initial={{ opacity: 0, scale: 0.4 }}
        whileInView={{ opacity: 0.88, scale: 1 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1, delay: 0.25, ease: [0.25, 0, 0, 1] }}
      >
        <CityGlare size={76} />
      </motion.div>

      {/* Taxi — slides in from left, street level */}
      <motion.div className="absolute bottom-20 left-8"
        initial={{ opacity: 0, x: -80 }}
        whileInView={{ opacity: 0.78, x: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 0.85, delay: 0.55, ease: [0.25, 0, 0, 1] }}
      >
        <CityTaxi size={96} />
      </motion.div>

      {/* Second taxi — right side, smaller */}
      <motion.div className="absolute bottom-24 right-16"
        initial={{ opacity: 0, x: 60 }}
        whileInView={{ opacity: 0.42, x: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 0.85, delay: 0.72, ease: [0.25, 0, 0, 1] }}
      >
        <CityTaxi size={62} />
      </motion.div>

      {/* Glass skyscrapers — bottom */}
      <motion.div className="absolute bottom-0 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 0.7, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.0, delay: 0.12, ease: [0.25, 0, 0, 1] }}
      >
        <GlassSkyline />
      </motion.div>
    </div>
  );
}

// ─── Dividers ──────────────────────────────────────────────────────────────────

function WaveDivider({ color, strong = false }: { color: string; strong?: boolean }) {
  return (
    <div className="w-full overflow-hidden" style={{ height: strong ? 50 : 30 }}>
      <svg
        viewBox="0 0 800 50"
        preserveAspectRatio="none"
        className="w-full h-full"
        fill="none"
      >
        <path
          d="M0 25 C100 8 200 42 300 25 C400 8 500 42 600 25 C700 8 750 35 800 25"
          stroke={color}
          strokeWidth={strong ? 2 : 1.5}
          opacity={strong ? 0.45 : 0.3}
        />
        {strong && (
          <path
            d="M0 35 C80 20 180 48 280 35 C380 22 480 48 580 35 C680 22 740 42 800 35"
            stroke={color}
            strokeWidth="1"
            opacity="0.18"
          />
        )}
      </svg>
    </div>
  );
}

function RopeDivider({ color, strong = false }: { color: string; strong?: boolean }) {
  return (
    <div className="w-full overflow-hidden" style={{ height: strong ? 28 : 18 }}>
      <svg
        viewBox="0 0 800 28"
        preserveAspectRatio="none"
        className="w-full h-full"
        fill="none"
      >
        <path
          d="M0 14 C40 9 80 19 120 14 C160 9 200 19 240 14 C280 9 320 19 360 14 C400 9 440 19 480 14 C520 9 560 19 600 14 C640 9 680 19 720 14 C760 9 790 19 800 14"
          stroke={color}
          strokeWidth={strong ? 2 : 1.5}
          opacity={strong ? 0.4 : 0.22}
          strokeDasharray="5 3"
        />
      </svg>
    </div>
  );
}

function SparkDivider({ color, strong = false }: { color: string; strong?: boolean }) {
  return (
    <div className="w-full overflow-hidden" style={{ height: strong ? 28 : 18 }}>
      <svg viewBox="0 0 800 28" preserveAspectRatio="none" className="w-full h-full" fill="none">
        <line x1="0" y1="14" x2="350" y2="14" stroke={color} strokeWidth={strong ? 1.5 : 1} opacity={strong ? 0.28 : 0.15} />
        <polygon points="380,8 386,14 380,20 374,14" fill={color} opacity={strong ? 0.55 : 0.32} />
        <polygon points="400,11 404,14 400,17 396,14" fill={color} opacity={strong ? 0.32 : 0.18} />
        <polygon points="420,8 426,14 420,20 414,14" fill={color} opacity={strong ? 0.55 : 0.32} />
        <line x1="450" y1="14" x2="800" y2="14" stroke={color} strokeWidth={strong ? 1.5 : 1} opacity={strong ? 0.28 : 0.15} />
      </svg>
    </div>
  );
}

function SkylineDivider({ color, strong = false }: { color: string; strong?: boolean }) {
  return (
    <div className="w-full overflow-hidden" style={{ height: strong ? 28 : 18 }}>
      <svg viewBox="0 0 800 28" preserveAspectRatio="none" className="w-full h-full" fill="none">
        <line x1="0" y1="14" x2="355" y2="14" stroke={color} strokeWidth={strong ? 1.5 : 1} opacity={strong ? 0.28 : 0.15} />
        {/* Sun rays */}
        <line x1="400" y1="4" x2="400" y2="8" stroke={color} strokeWidth="1.5" opacity={strong ? 0.5 : 0.28} strokeLinecap="round" />
        <line x1="400" y1="20" x2="400" y2="24" stroke={color} strokeWidth="1.5" opacity={strong ? 0.5 : 0.28} strokeLinecap="round" />
        <line x1="388" y1="14" x2="384" y2="14" stroke={color} strokeWidth="1.5" opacity={strong ? 0.5 : 0.28} strokeLinecap="round" />
        <line x1="412" y1="14" x2="416" y2="14" stroke={color} strokeWidth="1.5" opacity={strong ? 0.5 : 0.28} strokeLinecap="round" />
        <line x1="391" y1="7" x2="394" y2="10" stroke={color} strokeWidth="1.5" opacity={strong ? 0.4 : 0.22} strokeLinecap="round" />
        <line x1="409" y1="7" x2="406" y2="10" stroke={color} strokeWidth="1.5" opacity={strong ? 0.4 : 0.22} strokeLinecap="round" />
        <line x1="391" y1="21" x2="394" y2="18" stroke={color} strokeWidth="1.5" opacity={strong ? 0.4 : 0.22} strokeLinecap="round" />
        <line x1="409" y1="21" x2="406" y2="18" stroke={color} strokeWidth="1.5" opacity={strong ? 0.4 : 0.22} strokeLinecap="round" />
        <circle cx="400" cy="14" r="6" fill={color} opacity={strong ? 0.55 : 0.32} />
        <circle cx="400" cy="14" r="3.5" fill={color} opacity={strong ? 0.35 : 0.2} />
        <line x1="445" y1="14" x2="800" y2="14" stroke={color} strokeWidth={strong ? 1.5 : 1} opacity={strong ? 0.28 : 0.15} />
      </svg>
    </div>
  );
}

// ─── Coastal / Gulf Coast (Ella & Leo) ───────────────────────────────────────

function CoastalSunset({ size = 100 }: { size?: number }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 100 100" fill="none"
      initial={{ scale: 0.4, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: false, amount: 0.01 }}
      transition={{ duration: 1.1, ease: [0.25, 0, 0, 1], delay: 0.2 }}
      style={{ transformOrigin: "50px 50px" }}
    >
      {/* Outer horizon glow */}
      <motion.circle cx="50" cy="50" r="46" stroke="#FF7043" strokeWidth="1" opacity="0.15"
        animate={{ scale: [1, 1.16, 1] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} />
      <motion.circle cx="50" cy="50" r="34" stroke="#FACC15" strokeWidth="1.2" opacity="0.22"
        animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3.2, repeat: Infinity, delay: 0.6, ease: "easeInOut" }} />
      {/* Rotating rays */}
      <motion.g animate={{ rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const short = i % 2 === 1;
          return <line key={i}
            x1={50 + Math.cos(a) * 22} y1={50 + Math.sin(a) * 22}
            x2={50 + Math.cos(a) * (short ? 32 : 40)} y2={50 + Math.sin(a) * (short ? 32 : 40)}
            stroke={i % 3 === 0 ? "#FF7043" : "#FACC15"} strokeWidth={short ? 1 : 1.8} strokeLinecap="round" opacity={short ? 0.4 : 0.65} />;
        })}
      </motion.g>
      {/* Sun body — warm orange-red gradient effect */}
      <motion.circle cx="50" cy="50" r="20" fill="#FF7043" opacity="0.92"
        animate={{ scale: [1, 1.07, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      <circle cx="50" cy="50" r="12" fill="#FACC15" opacity="0.85" />
      <circle cx="50" cy="50" r="6" fill="white" opacity="0.5" />
      {/* Horizon reflection line */}
      <line x1="12" y1="68" x2="88" y2="68" stroke="#FACC15" strokeWidth="0.6" opacity="0.22" />
    </motion.svg>
  );
}

function CoastalGull({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div className={className}
      animate={{ x: [-16, 16, -16], y: [0, -7, 0] }}
      transition={{ duration: 3.5 + delay * 0.4, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <svg width="34" height="16" viewBox="0 0 34 16" fill="none">
        <path d="M17 8 C11 3 4 5 0 8" stroke="#F4845F" strokeWidth="2" strokeLinecap="round" opacity="0.72" />
        <path d="M17 8 C23 3 30 5 34 8" stroke="#F4845F" strokeWidth="2" strokeLinecap="round" opacity="0.72" />
        <circle cx="17" cy="8" r="1.5" fill="#F4845F" opacity="0.5" />
      </svg>
    </motion.div>
  );
}

function CoastalKite({ className = "" }: { className?: string }) {
  return (
    <motion.div className={className}
      animate={{ y: [0, -10, 0, 7, 0], rotate: [-5, 5, -5] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.svg width="44" height="54" viewBox="0 0 44 54" fill="none"
        initial={{ scale: 0, rotate: 20, opacity: 0 }}
        whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
      >
        <path d="M22 2 L40 22 L22 38 L4 22 Z" fill="#F4845F" opacity="0.72" />
        <path d="M22 2 L22 38" stroke="#FACC15" strokeWidth="1.2" opacity="0.6" />
        <path d="M4 22 L40 22" stroke="#FACC15" strokeWidth="1.2" opacity="0.6" />
        {/* Bow ties on tail */}
        <path d="M22 38 C19 44 23 47 20 52" stroke="#F4845F" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" opacity="0.6" />
        <path d="M20 44 L24 44" stroke="#FACC15" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </motion.svg>
    </motion.div>
  );
}

function CoastalShell({ className = "" }: { className?: string }) {
  return (
    <motion.div className={className}
      animate={{ rotate: [-8, 8, -8] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "center bottom" }}
    >
      <motion.svg width="36" height="44" viewBox="0 0 50 58" fill="none"
        initial={{ scale: 0.1, rotate: -200, opacity: 0 }}
        whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ type: "spring", stiffness: 160, damping: 14 }}
        style={{ transformOrigin: "25px 30px" }}
      >
        <path d="M25 54 C8 46 4 30 8 15 C12 3 38 3 42 15 C46 30 42 46 25 54Z"
          stroke="#F4845F" strokeWidth="1.5" fill="none" opacity="0.8" />
        <path d="M25 54 C25 34 22 16 25 5" stroke="#F4845F" strokeWidth="1" opacity="0.55" />
        <path d="M25 54 C16 36 10 22 14 11" stroke="#F4845F" strokeWidth="0.9" opacity="0.42" />
        <path d="M25 54 C34 36 40 22 36 11" stroke="#F4845F" strokeWidth="0.9" opacity="0.42" />
        <path d="M25 54 C12 42 6 30 10 19" stroke="#FACC15" strokeWidth="0.8" opacity="0.3" />
        <path d="M25 54 C38 42 44 30 40 19" stroke="#FACC15" strokeWidth="0.8" opacity="0.3" />
        <path d="M18 12 C16 22 16 34 18 42" stroke="white" strokeWidth="1.2" opacity="0.16" strokeLinecap="round" />
      </motion.svg>
    </motion.div>
  );
}

function CoastalHeart({ size = 28, className = "", delay = 0 }: { size?: number; className?: string; delay?: number }) {
  return (
    <motion.div className={className}
      animate={{ scale: [1, 1.2, 1], y: [0, -5, 0] }}
      transition={{ duration: 2.8 + delay * 0.3, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <motion.svg width={size} height={size} viewBox="0 0 28 26" fill="none"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        style={{ transformOrigin: "14px 13px" }}
      >
        <path d="M14 23 C6 16 1 11 1 7 C1 3 5 1 8 1 C11 1 13 3 14 5 C15 3 17 1 20 1 C23 1 27 3 27 7 C27 11 22 16 14 23Z"
          fill="#F4845F" opacity="0.88" />
        <path d="M8 5 C6 7 5 9 6 12" stroke="white" strokeWidth="1.2" opacity="0.28" strokeLinecap="round" />
      </motion.svg>
    </motion.div>
  );
}

function CoastalSandWave({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 800 90" preserveAspectRatio="none" fill="none">
      {/* Sand */}
      <path d="M0 68 C80 60 200 75 320 65 C440 55 580 72 720 62 C760 59 780 64 800 62 L800 90 L0 90Z"
        fill="#C97B2A" opacity="0.2" />
      {/* Wave 1 — coral */}
      <path d="M0 46 C80 28 160 58 240 40 C320 22 400 56 480 36 C560 16 640 53 720 33 C760 23 780 30 800 32 L800 90 L0 90Z"
        fill="#F4845F" opacity="0.18" />
      {/* Wave 2 — golden */}
      <path d="M0 60 C60 46 130 66 200 55 C270 44 340 66 400 55 C470 44 540 66 600 55 C680 44 740 64 800 55 L800 90 L0 90Z"
        fill="#FACC15" opacity="0.11" />
      {/* Foam crest */}
      <path d="M0 46 C80 28 160 58 240 40 C320 22 400 56 480 36 C560 16 640 53 720 33 C760 23 780 30 800 32"
        stroke="white" strokeWidth="0.9" opacity="0.2" />
    </svg>
  );
}

function CoastalHeroDecor() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Sunset — top right, large and vibrant */}
      <motion.div className="absolute top-8 right-12"
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 0.75, scale: 1 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.1, delay: 0.15, ease: [0.25, 0, 0, 1] }}
      >
        <CoastalSunset size={120} />
      </motion.div>

      {/* Kite — upper left */}
      <motion.div className="absolute top-20 left-10"
        initial={{ opacity: 0, y: -22 }}
        whileInView={{ opacity: 0.6, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 0.9, delay: 0.42, ease: [0.25, 0, 0, 1] }}
      >
        <CoastalKite />
      </motion.div>

      {/* Seagulls — scattered across sky */}
      {([["absolute top-16 right-1/3", 0], ["absolute top-36 right-1/4", 0.7], ["absolute top-12 left-1/3", 1.2], ["absolute top-44 left-1/5", 1.8]] as [string, number][]).map(([cls, d], i) => (
        <motion.div key={i} className={cls}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.45 }}
          viewport={{ once: false, amount: 0.01 }}
          transition={{ duration: 0.6, delay: 0.5 + d * 0.13 }}
        >
          <CoastalGull delay={d} />
        </motion.div>
      ))}

      {/* Floating hearts */}
      {([["absolute top-16 left-16", 0, 28], ["absolute top-48 right-22", 1.3, 22], ["absolute top-30 right-1/3", 2.2, 18]] as [string, number, number][]).map(([cls, d, sz], i) => (
        <motion.div key={i} className={cls}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 0.45, y: 0 }}
          viewport={{ once: false, amount: 0.01 }}
          transition={{ duration: 0.7, delay: 0.52 + i * 0.18 }}
        >
          <CoastalHeart size={sz as number} delay={d as number} />
        </motion.div>
      ))}

      {/* Shells — bottom */}
      <motion.div className="absolute bottom-24 left-14"
        initial={{ opacity: 0, rotate: -25 }}
        whileInView={{ opacity: 0.52, rotate: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 0.8, delay: 0.62, ease: [0.25, 0, 0, 1] }}
      >
        <CoastalShell />
      </motion.div>
      <motion.div className="absolute bottom-20 right-12"
        initial={{ opacity: 0, rotate: 25 }}
        whileInView={{ opacity: 0.4, rotate: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 0.8, delay: 0.78, ease: [0.25, 0, 0, 1] }}
      >
        <CoastalShell />
      </motion.div>

      {/* Sand + waves — bottom */}
      <motion.div className="absolute bottom-0 left-0 right-0"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 0.9, delay: 0.1, ease: [0.25, 0, 0, 1] }}
      >
        <CoastalSandWave className="w-full" />
      </motion.div>
    </div>
  );
}

// ─── Romantic / Floral (My Beautiful Wife) ────────────────────────────────────

function RomanticCarnation({ size = 60, delay = 0 }: { size?: number; delay?: number }) {
  const PETALS = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <motion.div style={{ width: size, height: size }}
      animate={{ rotate: [0, 8, 0, -8, 0] }}
      transition={{ duration: 7 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <motion.svg viewBox="0 0 60 60" width={size} height={size} fill="none"
        initial="hidden" whileInView="visible"
        viewport={{ once: false, amount: 0.4 }}
        variants={{
          hidden: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
          visible: { transition: { staggerChildren: 0.04 } },
        }}
      >
        {PETALS.map((deg) => (
          <g key={deg} transform={`rotate(${deg} 30 30)`}>
            <motion.ellipse cx="30" cy="13" rx="7" ry="14" fill="#E8729A"
              variants={{
                hidden: { scale: 0, opacity: 0 },
                visible: { scale: 1, opacity: 0.78, transition: { type: "spring", stiffness: 200, damping: 13 } },
              }}
              style={{ transformOrigin: "30px 30px" }}
            />
          </g>
        ))}
        <motion.circle cx="30" cy="30" r="8" fill="#F7C5D5"
          variants={{
            hidden: { scale: 0, opacity: 0 },
            visible: { scale: 1, opacity: 0.92, transition: { type: "spring", stiffness: 300, damping: 16 } },
          }}
          style={{ transformOrigin: "30px 30px" }}
        />
      </motion.svg>
    </motion.div>
  );
}

function RomanticPetal({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div className={className}
      animate={{ y: [0, 12, 0], rotate: [-10, 10, -10], opacity: [0.55, 0.38, 0.55] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <svg width="16" height="22" viewBox="0 0 16 22" fill="none">
        <ellipse cx="8" cy="11" rx="6" ry="10" fill="#E8729A" opacity="0.7" transform="rotate(-18 8 11)" />
      </svg>
    </motion.div>
  );
}

function RomanticHeroDecor() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div className="absolute top-10 right-10"
        initial={{ opacity: 0, scale: 0.4, rotate: -15 }}
        whileInView={{ opacity: 0.52, scale: 1, rotate: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.0, delay: 0.25, ease: [0.25, 0, 0, 1] }}
      >
        <RomanticCarnation size={72} delay={0} />
      </motion.div>
      <motion.div className="absolute top-28 left-8"
        initial={{ opacity: 0, scale: 0.3, rotate: 12 }}
        whileInView={{ opacity: 0.35, scale: 1, rotate: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.0, delay: 0.45, ease: [0.25, 0, 0, 1] }}
      >
        <RomanticCarnation size={44} delay={1.5} />
      </motion.div>
      {([["absolute top-16 left-1/4", 0], ["absolute top-40 right-1/3", 0.8], ["absolute top-24 right-16", 1.5], ["absolute top-52 left-1/3", 2.1], ["absolute top-8 left-1/2", 0.4]] as [string, number][]).map(([cls, d], i) => (
        <motion.div key={i} className={cls}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.01 }}
          transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
        >
          <RomanticPetal delay={d} />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Frontier / Texas Landscapes ──────────────────────────────────────────────

function FrontierSun({ size = 88 }: { size?: number }) {
  return (
    <motion.div style={{ width: size, height: size }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.svg width={size} height={size} viewBox="0 0 88 88" fill="none"
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.0, ease: [0.25, 0, 0, 1], delay: 0.3 }}
        style={{ transformOrigin: "44px 44px" }}
      >
        <circle cx="44" cy="44" r="40" fill="#A07850" opacity="0.06" />
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "44px 44px" }}>
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * 45 * Math.PI) / 180;
            return <line key={i}
              x1={44 + Math.cos(a) * 22} y1={44 + Math.sin(a) * 22}
              x2={44 + Math.cos(a) * 36} y2={44 + Math.sin(a) * 36}
              stroke="#A07850" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />;
          })}
        </motion.g>
        <circle cx="44" cy="44" r="17" fill="#A07850" opacity="0.78" />
        <circle cx="44" cy="44" r="9" fill="#d6b896" opacity="0.6" />
      </motion.svg>
    </motion.div>
  );
}

function FrontierHorizon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 800 80" preserveAspectRatio="none" fill="none">
      <path d="M0 45 C120 28 260 55 400 38 C540 22 680 50 800 36 L800 80 L0 80Z"
        fill="#A07850" opacity="0.18" />
      <path d="M0 60 C80 48 200 66 320 56 C440 46 580 64 720 54 C760 51 780 56 800 54 L800 80 L0 80Z"
        fill="#4A5E3A" opacity="0.2" />
      <path d="M0 45 C120 28 260 55 400 38 C540 22 680 50 800 36"
        stroke="#A07850" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

function FrontierHeroDecor() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div className="absolute top-14 right-14"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 0.62, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.0, delay: 0.3, ease: [0.25, 0, 0, 1] }}
      >
        <FrontierSun size={90} />
      </motion.div>
      <motion.div className="absolute top-10 left-10"
        initial={{ opacity: 0, scale: 0, rotate: 80 }}
        whileInView={{ opacity: 0.32, scale: 1, rotate: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 0.8, delay: 0.55, ease: [0.25, 0, 0, 1] }}
      >
        <TXLoneStar size={28} />
      </motion.div>
      <motion.div className="absolute bottom-0 left-0 right-0"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.0, delay: 0.1, ease: [0.25, 0, 0, 1] }}
      >
        <FrontierHorizon className="w-full" />
      </motion.div>
    </div>
  );
}

// ─── Wildlife / Nature ────────────────────────────────────────────────────────

function WildLeaf({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <motion.svg className={className} style={style} viewBox="0 0 80 120" fill="none"
      initial={{ scale: 0.2, rotate: -28, opacity: 0 }}
      whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 180, damping: 14 }}
    >
      <path d="M40 110 C40 80 20 60 15 35 C10 15 30 5 40 10 C50 5 70 15 65 35 C60 60 40 80 40 110Z"
        fill="#4A9B6B" opacity="0.65" />
      <path d="M40 110 C40 80 40 40 40 10" stroke="#2d7a52" strokeWidth="1.5" opacity="0.45" />
    </motion.svg>
  );
}

function WildPawPrint({ size = 60 }: { size?: number }) {
  // 1 large central pad + 4 toe pads in proper arc
  const pads: [number, number, number][] = [
    [30, 54, 10], // central pad (large)
    [11, 38, 7],  // far left toe
    [22, 28, 7],  // center-left toe
    [38, 28, 7],  // center-right toe
    [49, 38, 7],  // far right toe
  ];
  return (
    <motion.div style={{ width: size, height: size }}
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: false, amount: 0.4 }}
      transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.2 }}
    >
      <motion.svg width={size} height={size} viewBox="0 0 60 64" fill="none"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        {pads.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="#C97B2A" opacity="0.74" />
        ))}
      </motion.svg>
    </motion.div>
  );
}

function WildBird({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div className={className}
      animate={{ y: [0, -7, 0], x: [-8, 8, -8] }}
      transition={{ duration: 3.5 + delay * 0.5, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <svg width="40" height="22" viewBox="0 0 40 22" fill="none">
        <ellipse cx="20" cy="14" rx="6" ry="4" fill="#4A9B6B" opacity="0.72" />
        <path d="M20 13 C14 6 6 4 1 7 C6 9 13 11 20 13Z" fill="#4A9B6B" opacity="0.65" />
        <path d="M20 13 C26 6 34 4 39 7 C34 9 27 11 20 13Z" fill="#4A9B6B" opacity="0.65" />
        <path d="M14 14 C10 18 7 19 5 18" stroke="#2d7a52" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
        <path d="M27 13 L32 12" stroke="#C97B2A" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      </svg>
    </motion.div>
  );
}

function WildVine({ style }: { style?: React.CSSProperties }) {
  return (
    <svg style={style} viewBox="0 0 40 220" fill="none">
      <path d="M20 0 C13 48 27 85 16 126 C7 160 22 185 17 220"
        stroke="#2d7a52" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      <path d="M14 42 C3 36 -1 20 8 14 C10 28 12 36 14 42Z" fill="#4A9B6B" opacity="0.55" />
      <path d="M25 78 C36 70 40 55 31 48 C28 62 26 72 25 78Z" fill="#4A9B6B" opacity="0.5" />
      <path d="M12 118 C1 112 -3 96 6 90 C8 104 10 112 12 118Z" fill="#4A9B6B" opacity="0.45" />
      <path d="M24 158 C35 150 39 135 30 128 C27 142 25 152 24 158Z" fill="#4A9B6B" opacity="0.4" />
      <path d="M14 198 C3 192 -1 176 8 170 C10 184 12 192 14 198Z" fill="#4A9B6B" opacity="0.35" />
    </svg>
  );
}

function WildJungleTree({ style }: { style?: React.CSSProperties }) {
  return (
    <svg style={style} viewBox="0 0 140 320" fill="none">
      <path d="M70 320 C68 255 64 195 67 148" stroke="#1a4a2a" strokeWidth="14" strokeLinecap="round" opacity="0.65" />
      <path d="M67 148 C36 124 10 104 4 80 C22 96 46 118 67 148Z" fill="#4A9B6B" opacity="0.62" />
      <path d="M67 148 C98 122 124 102 130 78 C112 94 90 116 67 148Z" fill="#4A9B6B" opacity="0.58" />
      <path d="M67 148 C50 112 45 78 56 56 C59 82 63 114 67 148Z" fill="#4A9B6B" opacity="0.55" />
      <path d="M67 148 C84 112 89 78 78 56 C75 82 71 114 67 148Z" fill="#4A9B6B" opacity="0.55" />
      <path d="M67 148 C32 136 12 126 6 110 C22 116 46 132 67 148Z" fill="#2d7a52" opacity="0.38" />
      <path d="M67 148 C102 138 122 128 128 112 C112 118 90 132 67 148Z" fill="#2d7a52" opacity="0.35" />
      <path d="M16 100 C12 124 18 146 12 168" stroke="#2d7a52" strokeWidth="2" strokeLinecap="round" opacity="0.38" />
      <path d="M120 96 C124 120 118 142 122 164" stroke="#2d7a52" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      <ellipse cx="9" cy="128" rx="9" ry="5.5" fill="#4A9B6B" opacity="0.35" transform="rotate(-28 9 128)" />
      <ellipse cx="124" cy="124" rx="9" ry="5.5" fill="#4A9B6B" opacity="0.32" transform="rotate(22 124 124)" />
    </svg>
  );
}

function WildHeroDecor() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Tall jungle tree — right */}
      <motion.div className="absolute bottom-0 right-0"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 0.5, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.1, delay: 0.18, ease: [0.25, 0, 0, 1] }}
      >
        <motion.div animate={{ rotate: [-1.5, 1.5, -1.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 100%" }}>
          <WildJungleTree style={{ width: 115, height: 260 }} />
        </motion.div>
      </motion.div>

      {/* Shorter tree — left */}
      <motion.div className="absolute bottom-0 left-0"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 0.35, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.1, delay: 0.36, ease: [0.25, 0, 0, 1] }}
      >
        <motion.div animate={{ rotate: [1.2, -1.2, 1.2] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          style={{ transformOrigin: "50% 100%" }}>
          <WildJungleTree style={{ width: 82, height: 195, transform: "scaleX(-1)" }} />
        </motion.div>
      </motion.div>

      {/* Hanging vines — left cluster */}
      <motion.div className="absolute top-0 left-8"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 0.6, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.0, delay: 0.5, ease: [0.25, 0, 0, 1] }}
      >
        <motion.div animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "20px 0px" }}>
          <WildVine style={{ width: 40, height: 230 }} />
        </motion.div>
      </motion.div>
      <motion.div className="absolute top-0 left-28"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 0.38, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.0, delay: 0.62, ease: [0.25, 0, 0, 1] }}
      >
        <motion.div animate={{ rotate: [-1.5, 1.5, -1.5] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          style={{ transformOrigin: "20px 0px" }}>
          <WildVine style={{ width: 30, height: 160 }} />
        </motion.div>
      </motion.div>

      {/* Hanging vines — right cluster */}
      <motion.div className="absolute top-0 right-14"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 0.45, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.0, delay: 0.65, ease: [0.25, 0, 0, 1] }}
      >
        <motion.div animate={{ rotate: [2, -2, 2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ transformOrigin: "20px 0px" }}>
          <WildVine style={{ width: 36, height: 185, transform: "scaleX(-1)" }} />
        </motion.div>
      </motion.div>
      <motion.div className="absolute top-0 right-36"
        initial={{ opacity: 0, y: -25 }}
        whileInView={{ opacity: 0.3, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.0, delay: 0.78, ease: [0.25, 0, 0, 1] }}
      >
        <motion.div animate={{ rotate: [1, -1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{ transformOrigin: "20px 0px" }}>
          <WildVine style={{ width: 28, height: 145, transform: "scaleX(-1)" }} />
        </motion.div>
      </motion.div>

      {/* Birds — more spread across the sky */}
      {([
        ["absolute top-20 right-1/3", 0, 1],
        ["absolute top-10 left-1/3", 0.9, 1],
        ["absolute top-36 right-1/5", 1.6, 1],
        ["absolute top-16 left-1/5", 2.3, 0.8],
        ["absolute top-28 right-2/5", 3.1, 0.7],
        ["absolute top-44 left-2/5", 1.2, 0.65],
      ] as [string, number, number][]).map(([cls, d, op], i) => (
        <motion.div key={i} className={cls}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: op * 0.55 }}
          viewport={{ once: false, amount: 0.01 }}
          transition={{ duration: 0.7, delay: 0.55 + d * 0.12 }}
        >
          <WildBird delay={d} />
        </motion.div>
      ))}

      {/* Paw print — top right */}
      <motion.div className="absolute top-14 right-24"
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 0.48, scale: 1 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 0.7, delay: 0.72, ease: [0.25, 0, 0, 1] }}
      >
        <WildPawPrint size={52} />
      </motion.div>
    </div>
  );
}

// ─── Studio / Portraits ───────────────────────────────────────────────────────

function StudioAperture({ size = 80 }: { size?: number }) {
  const BLADES = 8;
  return (
    <motion.div style={{ width: size, height: size }}
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
    >
      <motion.svg width={size} height={size} viewBox="0 0 80 80" fill="none"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.0, ease: [0.25, 0, 0, 1], delay: 0.25 }}
        style={{ transformOrigin: "40px 40px" }}
      >
        <circle cx="40" cy="40" r="38" stroke="#94A3B8" strokeWidth="1" opacity="0.3" />
        <circle cx="40" cy="40" r="28" stroke="#94A3B8" strokeWidth="0.6" opacity="0.18" />
        {Array.from({ length: BLADES }).map((_, i) => {
          const a = (i * (360 / BLADES) * Math.PI) / 180;
          const a2 = ((i * (360 / BLADES) + 32) * Math.PI) / 180;
          const r1 = 10, r2 = 28;
          return (
            <path key={i}
              d={`M ${40 + Math.cos(a) * r1} ${40 + Math.sin(a) * r1} L ${40 + Math.cos(a2) * r2} ${40 + Math.sin(a2) * r2} L ${40 + Math.cos(a2 + 0.4) * r2} ${40 + Math.sin(a2 + 0.4) * r2} Z`}
              fill="#94A3B8" opacity="0.2" />
          );
        })}
        <motion.circle cx="40" cy="40" r="9" stroke="#94A3B8" strokeWidth="1.5" fill="none" opacity="0.6"
          animate={{ scale: [1, 0.85, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "40px 40px" }} />
        <circle cx="40" cy="40" r="4" fill="#CBD5E1" opacity="0.5" />
      </motion.svg>
    </motion.div>
  );
}

function StudioLightRay({ style }: { style?: React.CSSProperties }) {
  return (
    <motion.div style={style}
      animate={{ opacity: [0.07, 0.16, 0.07] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="110" height="280" viewBox="0 0 110 280" fill="none">
        <path d="M55 0 L95 280 L15 280 Z" fill="#94A3B8" opacity="0.1" />
      </svg>
    </motion.div>
  );
}

function StudioHeroDecor() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div className="absolute top-10 right-12"
        initial={{ opacity: 0, scale: 0.4 }}
        whileInView={{ opacity: 0.55, scale: 1 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.0, delay: 0.2, ease: [0.25, 0, 0, 1] }}
      >
        <StudioAperture size={84} />
      </motion.div>
      <motion.div className="absolute top-0 left-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.2, delay: 0.4 }}
      >
        <StudioLightRay />
      </motion.div>
      <motion.div className="absolute top-0 right-28"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.2, delay: 0.65 }}
      >
        <StudioLightRay style={{ transform: "scaleX(-1)" }} />
      </motion.div>
      {([[18, "top-20 left-20"], [14, "top-40 right-32"], [11, "top-12 left-1/2"]] as [number, string][]).map(([sz, cls], i) => (
        <motion.div key={i} className={`absolute ${cls}`}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 0.28, scale: 1 }}
          viewport={{ once: false, amount: 0.01 }}
          transition={{ duration: 0.6, delay: 0.55 + i * 0.12 }}
        >
          <svg width={sz} height={sz} viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#94A3B8" strokeWidth="1.2" opacity="0.5" />
            <circle cx="10" cy="10" r="4" fill="#94A3B8" opacity="0.28" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Dallas Cowboys / Rangers / Western SVG elements ──────────────────────────

function DallasStar({ size = 70, className = "" }: { size?: number; className?: string }) {
  return (
    <motion.div className={className} style={{ width: size, height: size }}
      animate={{ rotate: [0, 10, 0, -10, 0], scale: [1, 1.05, 1, 1.05, 1] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.svg viewBox="0 0 70 70" width={size} height={size} fill="none"
        initial={{ scale: 0, rotate: -160, opacity: 0 }}
        whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ type: "spring", stiffness: 160, damping: 14 }}
        style={{ transformOrigin: "35px 35px" }}
      >
        <motion.circle cx="35" cy="35" r="32" stroke="#4A8FE3" strokeWidth="0.8" opacity="0.18"
          animate={{ scale: [1, 1.14, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
        <polygon
          points="35,4 41.5,25 64,25 46,38 52.5,60 35,47 17.5,60 24,38 6,25 28.5,25"
          fill="#C4CDD6" stroke="#4A8FE3" strokeWidth="1.5" opacity="0.92"
        />
        <polygon
          points="35,10 40,27 59,27 44,38 49,57 35,46 21,57 26,38 11,27 30,27"
          fill="white" opacity="0.12"
        />
      </motion.svg>
    </motion.div>
  );
}

function WesternSpur({ size = 90, className = "" }: { size?: number; className?: string }) {
  const h = Math.round(size * 0.58);
  return (
    <motion.div className={className} style={{ width: size, height: h }}
      animate={{ rotate: [-4, 4, -4] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.svg viewBox="0 0 100 58" width={size} height={h} fill="none"
        initial={{ scale: 0.4, opacity: 0, x: 20 }}
        whileInView={{ scale: 1, opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ type: "spring", stiffness: 180, damping: 15 }}
      >
        {/* Heel band */}
        <path d="M8 18 C8 6 20 2 32 4 L68 4 C80 4 92 10 92 20 C92 30 80 36 68 36 L32 36 C20 36 8 30 8 18Z"
          stroke="#C4CDD6" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.72" />
        {/* Shank */}
        <path d="M32 36 L58 52" stroke="#C4CDD6" strokeWidth="2.5" strokeLinecap="round" opacity="0.68" />
        {/* Rowel hub */}
        <circle cx="64" cy="54" r="3.5" stroke="#C4CDD6" strokeWidth="1.5" fill="none" opacity="0.65" />
        {/* Rowel points — spinning */}
        <motion.g style={{ transformOrigin: "64px 54px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * 45 * Math.PI) / 180;
            return <line key={i}
              x1={64 + Math.cos(a) * 5} y1={54 + Math.sin(a) * 5}
              x2={64 + Math.cos(a) * 11} y2={54 + Math.sin(a) * 11}
              stroke="#C4CDD6" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />;
          })}
        </motion.g>
      </motion.svg>
    </motion.div>
  );
}

function DallasCowboyHat({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 160 100" fill="none">
      <ellipse cx="80" cy="72" rx="78" ry="18" fill="#0d2657" opacity="0.78" />
      <path d="M30 72 C28 55 35 30 55 22 C65 18 95 18 105 22 C125 30 132 55 130 72Z"
        fill="#0d2657" opacity="0.85" />
      <path d="M55 22 C60 35 65 45 80 48 C95 45 100 35 105 22"
        stroke="#C4CDD6" strokeWidth="2" fill="none" opacity="0.5" />
      <path d="M38 65 C40 58 120 58 122 65" stroke="#C4CDD6" strokeWidth="2.5" fill="none" opacity="0.55" />
      <path d="M40 64 L120 64 L120 68 L40 68Z" fill="#C4CDD6" opacity="0.18" />
    </svg>
  );
}

function DallasHeroDecor() {
  const scatteredStars: [number, number, number][] = [[180, 18, 18], [320, 46, 14], [440, 22, 22]];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main Cowboys star — top right */}
      <motion.div className="absolute top-10 right-12"
        initial={{ opacity: 0, scale: 0.4 }}
        whileInView={{ opacity: 0.7, scale: 1 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 1.0, delay: 0.2, ease: [0.25, 0, 0, 1] }}
      >
        <DallasStar size={84} />
      </motion.div>

      {/* Spur — bottom left */}
      <motion.div className="absolute bottom-16 left-8"
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 0.55, x: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 0.9, delay: 0.45, ease: [0.25, 0, 0, 1] }}
      >
        <WesternSpur size={95} />
      </motion.div>

      {/* Cowboy hat — bottom right */}
      <motion.div className="absolute bottom-8 right-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 0.42, y: 0 }}
        viewport={{ once: false, amount: 0.01 }}
        transition={{ duration: 0.9, delay: 0.6, ease: [0.25, 0, 0, 1] }}
      >
        <DallasCowboyHat style={{ width: 80, height: 50 }} />
      </motion.div>

      {/* Scattered small stars */}
      {scatteredStars.map(([right, top, sz], i) => (
        <motion.div key={i} className="absolute" style={{ right, top }}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 0.28 + i * 0.06, scale: 1 }}
          viewport={{ once: false, amount: 0.01 }}
          transition={{ duration: 0.5, delay: 0.32 + i * 0.12 }}
        >
          <DallasStar size={sz} />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Shared divider router ─────────────────────────────────────────────────────

type DividerType = "wave" | "rope" | "spark" | "skyline";

function ThemeDivider({ color, type, strong = false }: { color: string; type: DividerType; strong?: boolean }) {
  if (type === "wave") return <WaveDivider color={color} strong={strong} />;
  if (type === "spark") return <SparkDivider color={color} strong={strong} />;
  if (type === "skyline") return <SkylineDivider color={color} strong={strong} />;
  return <RopeDivider color={color} strong={strong} />;
}

// ─── Per-chapter color & background config ─────────────────────────────────────

interface ThemeVars {
  accentColor: string;
  accentSecondary: string;
  pageBg: string;
  heroBg: string;
  descBg: string;
  galleryBg: string;
  heroOverlayGradient: string;
  ambientGlow: string;
  galleryGlow: string;
  navBg: string;
  dropdownBg: string;
  sectionBg: string;
  descTextColor: string;
  dividerType: DividerType;
}

const CHAPTER_THEMES: Record<string, ThemeVars> = {
  tropical: {
    accentColor: "#2dd4bf", accentSecondary: "#fb7185",
    pageBg: "#091c1c",
    heroBg: "linear-gradient(to bottom right, #0c2e2c, #091c1c)",
    descBg: "linear-gradient(to bottom, #091c1c, #0c2422, #091c1c)",
    galleryBg: "linear-gradient(to bottom, #091c1c 0%, #0a2020 50%, #091c1c 100%)",
    heroOverlayGradient: "linear-gradient(to bottom, rgba(6,26,24,0.35) 0%, rgba(6,26,24,0.1) 35%, rgba(6,26,24,0.82) 78%, rgba(6,26,24,1) 100%)",
    ambientGlow: "radial-gradient(ellipse 130% 55% at 50% 0%, rgba(45,212,191,0.1) 0%, transparent 55%)",
    galleryGlow: "radial-gradient(ellipse 80% 40% at 50% 60%, rgba(45,212,191,0.05) 0%, transparent 65%)",
    navBg: "rgba(7,28,28,0.9)", dropdownBg: "rgba(7,28,28,0.97)",
    sectionBg: "linear-gradient(to bottom, #071c1c, #091e1e)",
    descTextColor: "#b2f5ea", dividerType: "wave",
  },
  ranch: {
    accentColor: "#f59e0b", accentSecondary: "#6b7c5c",
    pageBg: "#1a0d03",
    heroBg: "linear-gradient(to bottom right, #2a1403, #1a0d03)",
    descBg: "linear-gradient(to bottom, #1a0d03, #211005, #1a0d03)",
    galleryBg: "linear-gradient(to bottom, #1a0d03 0%, #1e1005 50%, #1a0d03 100%)",
    heroOverlayGradient: "linear-gradient(to bottom, rgba(18,8,2,0.35) 0%, rgba(18,8,2,0.1) 35%, rgba(18,8,2,0.82) 78%, rgba(18,8,2,1) 100%)",
    ambientGlow: "radial-gradient(ellipse 130% 55% at 50% 0%, rgba(245,158,11,0.1) 0%, transparent 55%)",
    galleryGlow: "radial-gradient(ellipse 80% 40% at 50% 60%, rgba(245,158,11,0.05) 0%, transparent 65%)",
    navBg: "rgba(22,10,2,0.9)", dropdownBg: "rgba(22,10,2,0.97)",
    sectionBg: "linear-gradient(to bottom, #1a0d03, #1e1005)",
    descTextColor: "#fde68a", dividerType: "rope",
  },
  nightlife: {
    accentColor: "#a855f7", accentSecondary: "#e8c547",
    pageBg: "#0a0018",
    heroBg: "linear-gradient(to bottom right, #1c0038, #0a0018)",
    descBg: "linear-gradient(to bottom, #0a0018, #110025, #0a0018)",
    galleryBg: "linear-gradient(to bottom, #0a0018 0%, #0e0022 50%, #0a0018 100%)",
    heroOverlayGradient: "linear-gradient(to bottom, rgba(10,0,24,0.45) 0%, rgba(10,0,24,0.15) 35%, rgba(10,0,24,0.85) 78%, rgba(10,0,24,1) 100%)",
    ambientGlow: "radial-gradient(ellipse 130% 55% at 50% 0%, rgba(168,85,247,0.14) 0%, transparent 55%)",
    galleryGlow: "radial-gradient(ellipse 80% 40% at 50% 60%, rgba(168,85,247,0.07) 0%, transparent 65%)",
    navBg: "rgba(10,0,25,0.92)", dropdownBg: "rgba(10,0,25,0.97)",
    sectionBg: "linear-gradient(to bottom, #0a001a, #0c0022)",
    descTextColor: "#d8b4fe", dividerType: "spark",
  },
  skyline: {
    accentColor: "#38bdf8", accentSecondary: "#facc15",
    pageBg: "#020c1a",
    heroBg: "linear-gradient(to bottom right, #0e2d4a, #020c1a)",
    descBg: "linear-gradient(to bottom, #020c1a, #041a2e, #020c1a)",
    galleryBg: "linear-gradient(to bottom, #020c1a 0%, #041a2e 50%, #020c1a 100%)",
    heroOverlayGradient: "linear-gradient(to bottom, rgba(2,12,26,0.3) 0%, rgba(2,12,26,0.08) 35%, rgba(2,12,26,0.82) 78%, rgba(2,12,26,1) 100%)",
    ambientGlow: "radial-gradient(ellipse 130% 55% at 50% 0%, rgba(56,189,248,0.12) 0%, transparent 55%)",
    galleryGlow: "radial-gradient(ellipse 80% 40% at 50% 60%, rgba(56,189,248,0.06) 0%, transparent 65%)",
    navBg: "rgba(2,12,26,0.94)", dropdownBg: "rgba(2,12,26,0.97)",
    sectionBg: "linear-gradient(to bottom, #020c1a, #041a2e)",
    descTextColor: "#bae6fd", dividerType: "skyline",
  },
  western: {
    accentColor: "#4A8FE3", accentSecondary: "#DC2626",
    pageBg: "#010914",
    heroBg: "linear-gradient(to bottom right, #061730, #010914)",
    descBg: "linear-gradient(to bottom, #010914, #081a36, #010914)",
    galleryBg: "linear-gradient(to bottom, #010914 0%, #081a36 50%, #010914 100%)",
    heroOverlayGradient: "linear-gradient(to bottom, rgba(1,9,20,0.3) 0%, rgba(1,9,20,0.08) 35%, rgba(1,9,20,0.82) 78%, rgba(1,9,20,1) 100%)",
    ambientGlow: "radial-gradient(ellipse 130% 55% at 50% 0%, rgba(74,143,227,0.14) 0%, transparent 55%)",
    galleryGlow: "radial-gradient(ellipse 80% 40% at 50% 60%, rgba(74,143,227,0.06) 0%, transparent 65%)",
    navBg: "rgba(1,9,20,0.94)", dropdownBg: "rgba(1,9,20,0.97)",
    sectionBg: "linear-gradient(to bottom, #010914, #081a36)",
    descTextColor: "#bfdbfe", dividerType: "spark",
  },
  coastal: {
    accentColor: "#F4845F", accentSecondary: "#FACC15",
    pageBg: "#080d1a",
    heroBg: "linear-gradient(to bottom right, #0f1a35, #080d1a)",
    descBg: "linear-gradient(to bottom, #080d1a, #0c1525, #080d1a)",
    galleryBg: "linear-gradient(to bottom, #080d1a 0%, #0c1525 50%, #080d1a 100%)",
    heroOverlayGradient: "linear-gradient(to bottom, rgba(8,13,26,0.3) 0%, rgba(8,13,26,0.08) 35%, rgba(8,13,26,0.82) 78%, rgba(8,13,26,1) 100%)",
    ambientGlow: "radial-gradient(ellipse 130% 55% at 50% 0%, rgba(244,132,95,0.12) 0%, transparent 55%)",
    galleryGlow: "radial-gradient(ellipse 80% 40% at 50% 60%, rgba(244,132,95,0.05) 0%, transparent 65%)",
    navBg: "rgba(8,13,26,0.94)", dropdownBg: "rgba(8,13,26,0.97)",
    sectionBg: "linear-gradient(to bottom, #080d1a, #0c1525)",
    descTextColor: "#fed7c5", dividerType: "wave",
  },
  romantic: {
    accentColor: "#E8729A", accentSecondary: "#F7C5D5",
    pageBg: "#120309",
    heroBg: "linear-gradient(to bottom right, #200515, #120309)",
    descBg: "linear-gradient(to bottom, #120309, #180610, #120309)",
    galleryBg: "linear-gradient(to bottom, #120309 0%, #180610 50%, #120309 100%)",
    heroOverlayGradient: "linear-gradient(to bottom, rgba(18,3,9,0.35) 0%, rgba(18,3,9,0.1) 35%, rgba(18,3,9,0.82) 78%, rgba(18,3,9,1) 100%)",
    ambientGlow: "radial-gradient(ellipse 130% 55% at 50% 0%, rgba(232,114,154,0.12) 0%, transparent 55%)",
    galleryGlow: "radial-gradient(ellipse 80% 40% at 50% 60%, rgba(232,114,154,0.06) 0%, transparent 65%)",
    navBg: "rgba(18,3,9,0.94)", dropdownBg: "rgba(18,3,9,0.97)",
    sectionBg: "linear-gradient(to bottom, #120309, #180610)",
    descTextColor: "#fbcfe8", dividerType: "wave",
  },
  frontier: {
    accentColor: "#A07850", accentSecondary: "#4A5E3A",
    pageBg: "#0a0704",
    heroBg: "linear-gradient(to bottom right, #1a1108, #0a0704)",
    descBg: "linear-gradient(to bottom, #0a0704, #100c06, #0a0704)",
    galleryBg: "linear-gradient(to bottom, #0a0704 0%, #100c06 50%, #0a0704 100%)",
    heroOverlayGradient: "linear-gradient(to bottom, rgba(10,7,4,0.35) 0%, rgba(10,7,4,0.1) 35%, rgba(10,7,4,0.82) 78%, rgba(10,7,4,1) 100%)",
    ambientGlow: "radial-gradient(ellipse 130% 55% at 50% 0%, rgba(160,120,80,0.1) 0%, transparent 55%)",
    galleryGlow: "radial-gradient(ellipse 80% 40% at 50% 60%, rgba(160,120,80,0.04) 0%, transparent 65%)",
    navBg: "rgba(10,7,4,0.94)", dropdownBg: "rgba(10,7,4,0.97)",
    sectionBg: "linear-gradient(to bottom, #0a0704, #100c06)",
    descTextColor: "#d6b896", dividerType: "rope",
  },
  wild: {
    accentColor: "#4A9B6B", accentSecondary: "#C97B2A",
    pageBg: "#030a05",
    heroBg: "linear-gradient(to bottom right, #071409, #030a05)",
    descBg: "linear-gradient(to bottom, #030a05, #051208, #030a05)",
    galleryBg: "linear-gradient(to bottom, #030a05 0%, #051208 50%, #030a05 100%)",
    heroOverlayGradient: "linear-gradient(to bottom, rgba(3,10,5,0.35) 0%, rgba(3,10,5,0.1) 35%, rgba(3,10,5,0.82) 78%, rgba(3,10,5,1) 100%)",
    ambientGlow: "radial-gradient(ellipse 130% 55% at 50% 0%, rgba(74,155,107,0.12) 0%, transparent 55%)",
    galleryGlow: "radial-gradient(ellipse 80% 40% at 50% 60%, rgba(74,155,107,0.06) 0%, transparent 65%)",
    navBg: "rgba(3,10,5,0.94)", dropdownBg: "rgba(3,10,5,0.97)",
    sectionBg: "linear-gradient(to bottom, #030a05, #051208)",
    descTextColor: "#bbf7d0", dividerType: "rope",
  },
  studio: {
    accentColor: "#94A3B8", accentSecondary: "#CBD5E1",
    pageBg: "#030306",
    heroBg: "linear-gradient(to bottom right, #0a0a0f, #030306)",
    descBg: "linear-gradient(to bottom, #030306, #07070e, #030306)",
    galleryBg: "linear-gradient(to bottom, #030306 0%, #07070e 50%, #030306 100%)",
    heroOverlayGradient: "linear-gradient(to bottom, rgba(3,3,6,0.3) 0%, rgba(3,3,6,0.08) 35%, rgba(3,3,6,0.82) 78%, rgba(3,3,6,1) 100%)",
    ambientGlow: "radial-gradient(ellipse 130% 55% at 50% 0%, rgba(148,163,184,0.1) 0%, transparent 55%)",
    galleryGlow: "radial-gradient(ellipse 80% 40% at 50% 60%, rgba(148,163,184,0.05) 0%, transparent 65%)",
    navBg: "rgba(3,3,6,0.94)", dropdownBg: "rgba(3,3,6,0.97)",
    sectionBg: "linear-gradient(to bottom, #030306, #07070e)",
    descTextColor: "#e2e8f0", dividerType: "spark",
  },
};

const DEFAULT_THEME_VARS: ThemeVars = CHAPTER_THEMES.ranch;

// ─── Sticky chapter navigation ─────────────────────────────────────────────────

function StickyChapterNav({
  chapter,
  accentColor,
  navBg,
  dropdownBg,
}: {
  chapter: Chapter;
  accentColor: string;
  navBg: string;
  dropdownBg: string;
}) {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const others = allChapters.filter((c) => c.id !== chapter.id);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-4 left-0 right-0 z-50 flex justify-center pointer-events-none"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
        >
          <div
            className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-full"
            style={{
              background: navBg,
              border: `1px solid ${accentColor}33`,
              backdropFilter: "blur(14px)",
              boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}18`,
            }}
          >
            {/* Back */}
            <Link
              href="/"
              className="flex items-center gap-1 group"
              style={{
                fontFamily: "var(--font-courier)",
                color: "#c4a882",
                fontSize: 10,
                letterSpacing: "0.15em",
                opacity: 0.65,
                textDecoration: "none",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                className="transition-transform group-hover:-translate-x-1"
              >
                <path
                  d="M10 3L5 8l5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              ALBUM
            </Link>

            {/* Separator */}
            <div
              className="w-px h-4"
              style={{ background: `${accentColor}33` }}
            />

            {/* Current chapter */}
            <span
              style={{
                fontFamily: "var(--font-courier)",
                color: accentColor,
                fontSize: 10,
                letterSpacing: "0.1em",
                opacity: 0.9,
              }}
            >
              {chapter.title}
            </span>

            {/* Separator */}
            <div
              className="w-px h-4"
              style={{ background: `${accentColor}33` }}
            />

            {/* Other chapters dropdown trigger */}
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1 transition-opacity hover:opacity-100"
                style={{
                  fontFamily: "var(--font-courier)",
                  color: "#c4a882",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  opacity: 0.55,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 4px",
                }}
              >
                MORE
                <motion.svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path
                    d="M2 4l3 3 3-3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    className="absolute top-full right-0 mt-2 rounded overflow-hidden"
                    style={{
                      background: dropdownBg,
                      border: `1px solid ${accentColor}2a`,
                      minWidth: 170,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                    }}
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                  >
                    {others.map((c) => (
                      <Link
                        key={c.id}
                        href={`/chapters/${c.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 group transition-colors"
                        style={{
                          textDecoration: "none",
                        }}
                      >
                        <div
                          className="relative flex-shrink-0 overflow-hidden"
                          style={{ width: 36, height: 36 }}
                        >
                          <Image
                            src={c.coverPhoto.src}
                            alt={c.title}
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        </div>
                        <div>
                          <p
                            style={{
                              fontFamily: "var(--font-playfair)",
                              color: "#f5e6c8",
                              fontSize: 12,
                              opacity: 0.9,
                            }}
                          >
                            {c.title}
                          </p>
                          <p
                            style={{
                              fontFamily: "var(--font-courier)",
                              color: c.theme.primaryColor,
                              fontSize: 9,
                              letterSpacing: "0.1em",
                              opacity: 0.7,
                            }}
                          >
                            {c.location.toUpperCase()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Per-theme floor decorations ──────────────────────────────────────────────

function ThemeFloorDecor({ decorative }: { decorative: string }) {
  if (decorative === "wild") {
    return (
      <div className="relative w-full pointer-events-none" style={{ height: 300, overflow: "hidden" }}>
        {/* Hanging vines from top of floor block */}
        <motion.div className="absolute top-0 left-8"
          initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 0.58, y: 0 }}
          viewport={{ once: false, amount: 0.01 }}
          transition={{ duration: 1.0, delay: 0.2, ease: [0.25, 0, 0, 1] }}
        >
          <motion.div animate={{ rotate: [-1.5, 1.5, -1.5] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "20px 0px" }}>
            <WildVine style={{ width: 38, height: 220 }} />
          </motion.div>
        </motion.div>
        <motion.div className="absolute top-0 left-28"
          initial={{ opacity: 0, y: -14 }} whileInView={{ opacity: 0.36, y: 0 }}
          viewport={{ once: false, amount: 0.01 }}
          transition={{ duration: 1.0, delay: 0.38, ease: [0.25, 0, 0, 1] }}
        >
          <motion.div animate={{ rotate: [-1, 1, -1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            style={{ transformOrigin: "20px 0px" }}>
            <WildVine style={{ width: 28, height: 160 }} />
          </motion.div>
        </motion.div>
        <motion.div className="absolute top-0 right-12"
          initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 0.5, y: 0 }}
          viewport={{ once: false, amount: 0.01 }}
          transition={{ duration: 1.0, delay: 0.3, ease: [0.25, 0, 0, 1] }}
        >
          <motion.div animate={{ rotate: [1.5, -1.5, 1.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            style={{ transformOrigin: "20px 0px" }}>
            <WildVine style={{ width: 34, height: 190, transform: "scaleX(-1)" }} />
          </motion.div>
        </motion.div>
        <motion.div className="absolute top-0 right-36"
          initial={{ opacity: 0, y: -12 }} whileInView={{ opacity: 0.3, y: 0 }}
          viewport={{ once: false, amount: 0.01 }}
          transition={{ duration: 1.0, delay: 0.5, ease: [0.25, 0, 0, 1] }}
        >
          <motion.div animate={{ rotate: [1, -1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{ transformOrigin: "20px 0px" }}>
            <WildVine style={{ width: 26, height: 140, transform: "scaleX(-1)" }} />
          </motion.div>
        </motion.div>
        {/* Jungle floor at the bottom of this block */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full" viewBox="0 0 800 180" preserveAspectRatio="none" fill="none">
            <path d="M0 180 L800 180 L800 130 C700 118 600 138 500 126 C400 114 300 142 200 128 C130 118 60 136 0 126Z"
              fill="#0d2a14" opacity="0.65" />
            <ellipse cx="70" cy="148" rx="65" ry="34" fill="#0a1f0e" opacity="0.72" />
            <ellipse cx="45" cy="155" rx="42" ry="22" fill="#071509" opacity="0.68" />
            <ellipse cx="100" cy="158" rx="30" ry="18" fill="#0d2a14" opacity="0.58" />
            <ellipse cx="730" cy="150" rx="68" ry="32" fill="#0a1f0e" opacity="0.7" />
            <ellipse cx="758" cy="158" rx="44" ry="20" fill="#071509" opacity="0.65" />
            <ellipse cx="704" cy="160" rx="32" ry="16" fill="#0d2a14" opacity="0.55" />
            <ellipse cx="280" cy="162" rx="34" ry="16" fill="#0a1f0e" opacity="0.44" />
            <ellipse cx="520" cy="160" rx="30" ry="14" fill="#0a1f0e" opacity="0.4" />
            <ellipse cx="420" cy="168" rx="22" ry="10" fill="#0a1f0e" opacity="0.32" />
            <path d="M0 142 C30 132 70 148 110 138 C150 128 180 146 220 140 C250 134 270 144 290 138"
              stroke="#2d7a52" strokeWidth="2.5" opacity="0.38" fill="none" />
            <path d="M510 138 C550 128 590 144 640 134 C680 126 720 140 760 132 C780 128 795 136 800 138"
              stroke="#2d7a52" strokeWidth="2.5" opacity="0.35" fill="none" />
            <path d="M150 180 C138 152 120 136 132 122 C136 140 144 162 150 180Z" fill="#4A9B6B" opacity="0.55" />
            <path d="M164 180 C174 150 190 134 180 118 C175 138 168 160 164 180Z" fill="#4A9B6B" opacity="0.5" />
            <path d="M178 180 C166 154 150 138 158 124 C163 144 172 164 178 180Z" fill="#2d7a52" opacity="0.42" />
            <path d="M200 180 C192 158 178 144 186 132 C189 150 196 168 200 180Z" fill="#4A9B6B" opacity="0.36" />
            <path d="M640 180 C628 152 610 136 622 122 C626 140 634 162 640 180Z" fill="#4A9B6B" opacity="0.52" />
            <path d="M654 180 C664 150 680 134 670 118 C665 138 658 160 654 180Z" fill="#4A9B6B" opacity="0.46" />
            <path d="M668 180 C656 154 640 140 648 126 C652 146 660 166 668 180Z" fill="#2d7a52" opacity="0.4" />
            <path d="M388 180 C378 158 364 144 372 132 C375 150 382 168 388 180Z" fill="#4A9B6B" opacity="0.3" />
            <path d="M400 180 C410 156 424 142 416 130 C412 148 405 166 400 180Z" fill="#4A9B6B" opacity="0.26" />
            <path d="M0 100 C18 88 35 112 22 130 C10 118 4 106 0 100Z" fill="#4A9B6B" opacity="0.48" />
            <path d="M800 98 C782 86 765 110 778 128 C790 116 797 104 800 98Z" fill="#4A9B6B" opacity="0.45" />
          </svg>
        </div>
      </div>
    );
  }
  if (decorative === "coastal") {
    return (
      <div className="w-full pointer-events-none" style={{ height: 100 }}>
        <CoastalSandWave className="w-full h-full" />
      </div>
    );
  }
  if (decorative === "romantic") {
    return (
      <div className="w-full pointer-events-none" style={{ height: 90 }}>
        <svg className="w-full h-full" viewBox="0 0 800 90" fill="none" preserveAspectRatio="none">
          {[
            [60, 72, -30, 16, 9], [140, 62, 20, 14, 8], [240, 78, -15, 12, 7],
            [360, 68, 35, 18, 10], [480, 75, -25, 13, 7], [580, 60, 18, 16, 9],
            [680, 80, -10, 14, 8], [750, 66, 28, 12, 7], [310, 82, -40, 10, 6],
            [530, 64, 22, 11, 6], [190, 80, -18, 9, 5], [420, 72, 30, 13, 7],
            [100, 85, 15, 10, 6], [460, 55, -22, 12, 7], [700, 58, 12, 9, 5],
          ].map(([cx, cy, rot, rx, ry], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry}
              fill="#E8729A" opacity={0.18 + (i % 3) * 0.07}
              transform={`rotate(${rot} ${cx} ${cy})`} />
          ))}
        </svg>
      </div>
    );
  }
  if (decorative === "tropical") {
    return (
      <div className="w-full pointer-events-none" style={{ height: 60 }}>
        <KWWaves className="w-full h-full" />
      </div>
    );
  }
  if (decorative === "ranch" || decorative === "frontier") {
    return (
      <div className="w-full pointer-events-none" style={{ height: 80 }}>
        <TXRollingPlains className="w-full h-full" />
      </div>
    );
  }
  if (decorative === "western") {
    return (
      <div className="w-full pointer-events-none" style={{ height: 80 }}>
        <svg className="w-full h-full" viewBox="0 0 800 80" fill="none" preserveAspectRatio="none">
          {[12, 26, 40, 54, 68].map((y, i) => (
            <line key={i} x1="0" y1={y} x2="800" y2={y} stroke="#1a3a6b" strokeWidth="2" opacity={0.1 + i * 0.03} />
          ))}
          {[100, 220, 340, 460, 580, 700].map((x, i) => (
            <line key={i} x1={x} y1="0" x2={x} y2="80" stroke="#1a3a6b" strokeWidth="1.2" opacity="0.08" />
          ))}
          <polygon points="60,54 62,64 72,64 65,71 68,81 60,74 52,81 55,71 48,64 58,64"
            fill="#4A8FE3" opacity="0.2" />
          <polygon points="740,52 742,62 752,62 745,69 748,79 740,72 732,79 735,69 728,62 738,62"
            fill="#4A8FE3" opacity="0.16" />
          <polygon points="400,56 402,64 410,64 404,70 406,78 400,72 394,78 396,70 390,64 398,64"
            fill="#4A8FE3" opacity="0.1" />
        </svg>
      </div>
    );
  }
  if (decorative === "nightlife") {
    return (
      <div className="w-full pointer-events-none" style={{ height: 70 }}>
        <svg className="w-full h-full" viewBox="0 0 800 70" fill="none" preserveAspectRatio="none">
          <rect x="0" y="46" width="800" height="24" fill="#0a0018" opacity="0.55" />
          <path d="M0 48 C80 43 160 52 240 47 C320 42 400 52 480 47 C560 42 640 52 720 47 C760 44 780 48 800 47"
            stroke="#a855f7" strokeWidth="1" opacity="0.2" />
          {[80, 200, 320, 440, 560, 680].map((x, i) => (
            <rect key={i} x={x} y="55" width="44" height="4" fill="#a855f7" opacity="0.14" />
          ))}
          <circle cx="400" cy="52" r="10" stroke="#a855f7" strokeWidth="1" opacity="0.1" fill="none" />
          <circle cx="400" cy="52" r="6" stroke="#a855f7" strokeWidth="0.8" opacity="0.08" fill="none" />
        </svg>
      </div>
    );
  }
  if (decorative === "skyline") {
    return (
      <div className="w-full pointer-events-none" style={{ height: 65 }}>
        <svg className="w-full h-full" viewBox="0 0 800 65" fill="none" preserveAspectRatio="none">
          <rect x="0" y="38" width="800" height="27" fill="#020c1a" opacity="0.55" />
          {[60, 180, 300, 420, 540, 660].map((x, i) => (
            <rect key={i} x={x} y="46" width="52" height="4" fill="#38bdf8" opacity="0.14" />
          ))}
          <line x1="0" y1="38" x2="800" y2="38" stroke="#38bdf8" strokeWidth="1" opacity="0.22" />
        </svg>
      </div>
    );
  }
  if (decorative === "studio") {
    return (
      <div className="w-full pointer-events-none" style={{ height: 60 }}>
        <svg className="w-full h-full" viewBox="0 0 800 60" fill="none" preserveAspectRatio="none">
          {[12, 24, 36, 48].map((y, i) => (
            <line key={i} x1="0" y1={y} x2="800" y2={y} stroke="#94A3B8" strokeWidth="0.6" opacity={0.04 + i * 0.025} />
          ))}
          {[100, 200, 300, 400, 500, 600, 700].map((x, i) => (
            <line key={i} x1={x} y1="0" x2={x} y2="60" stroke="#94A3B8" strokeWidth="0.6" opacity="0.05" />
          ))}
        </svg>
      </div>
    );
  }
  return null;
}

// ─── Bottom chapter cards ──────────────────────────────────────────────────────

function MoreChaptersSection({
  chapter,
  accentColor,
  sectionBg,
  dividerType,
  decorative,
}: {
  chapter: Chapter;
  accentColor: string;
  sectionBg: string;
  dividerType: DividerType;
  decorative: string;
}) {
  const others = allChapters.filter((c) => c.id !== chapter.id);
  if (others.length === 0) return null;

  return (
    <section
      className="relative z-10 pt-20 pb-0"
      style={{
        borderTop: `1px solid ${accentColor}22`,
        background: sectionBg,
      }}
    >
      {/* Floor starts right at the section boundary */}
      <ThemeFloorDecor decorative={decorative} />

      <ThemeDivider color={accentColor} type={dividerType} strong />

      <div className="max-w-4xl mx-auto px-6 pt-10">
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.5 }}
        >
          <p
            style={{
              fontFamily: "var(--font-courier)",
              color: accentColor,
              opacity: 0.45,
              fontSize: 10,
              letterSpacing: "0.28em",
            }}
          >
            — ALSO IN THE ALBUM —
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-10 md:gap-16 pb-16">
          {others.map((c, i) => {
            const rot = CARD_ROTS[i % CARD_ROTS.length];
            return (
              <motion.div
                key={c.id}
                className="relative cursor-pointer"
                initial={{ opacity: 0, y: 30, rotate: rot }}
                whileInView={{ opacity: 1, y: 0, rotate: rot }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ delay: i * 0.1, duration: 0.55, ease: [0.25, 0, 0, 1] }}
                whileHover={{
                  rotate: 0,
                  scale: 1.05,
                  zIndex: 10,
                  transition: { type: "spring", stiffness: 250, damping: 22 },
                }}
              >
                <Link href={`/chapters/${c.slug}`} style={{ textDecoration: "none" }}>
                  {/* Tape */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 tape"
                    style={{ top: -10, zIndex: 10 }}
                  />
                  <div className="polaroid" style={{ width: 200 }}>
                    <div
                      className="relative overflow-hidden"
                      style={{ aspectRatio: "3/4" }}
                    >
                      <Image
                        src={c.coverPhoto.src}
                        alt={c.title}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{ backgroundColor: c.theme.primaryColor }}
                      />
                    </div>
                    <div className="pt-2 pb-1 px-1 text-center">
                      <p
                        style={{
                          fontFamily: "var(--font-caveat)",
                          color: "#1a1008",
                          fontSize: 17,
                        }}
                      >
                        {c.title}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-courier)",
                          color: "#3d2314",
                          fontSize: 9,
                          letterSpacing: "0.08em",
                          opacity: 0.55,
                          marginTop: 2,
                        }}
                      >
                        {c.location.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

    </section>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  chapter: Chapter;
}

export default function ChapterPageClient({ chapter }: Props) {

  const isKeyWest = chapter.theme.decorative === "tropical";
  const isTexas = chapter.theme.decorative === "ranch";
  const isNightlife = chapter.theme.decorative === "nightlife";
  const isSkyline = chapter.theme.decorative === "skyline";
  const isWestern = chapter.theme.decorative === "western";
  const isCoastal = chapter.theme.decorative === "coastal";
  const isRomantic = chapter.theme.decorative === "romantic";
  const isFrontier = chapter.theme.decorative === "frontier";
  const isWild = chapter.theme.decorative === "wild";
  const isStudio = chapter.theme.decorative === "studio";

  const tc = CHAPTER_THEMES[chapter.theme.decorative] ?? DEFAULT_THEME_VARS;
  const {
    accentColor,
    accentSecondary,
    pageBg,
    heroBg,
    descBg,
    galleryBg,
    heroOverlayGradient,
    ambientGlow,
    galleryGlow,
    navBg,
    dropdownBg,
    sectionBg,
    descTextColor,
    dividerType,
  } = tc;

  return (
    <motion.div
      className="min-h-screen relative overflow-x-hidden"
      style={{ backgroundColor: pageBg }}
      initial={{ opacity: 0, scale: 0.995 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.25, 0, 0, 1] }}
    >
      {/* Fixed ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: ambientGlow }}
      />

      {/* Sticky chapter nav */}
      <StickyChapterNav
        chapter={chapter}
        accentColor={accentColor}
        navBg={navBg}
        dropdownBg={dropdownBg}
      />

      {/* ─── HERO ──────────────────────────────── */}
      <section className="relative z-10 pt-0">
        <div
          className="relative overflow-hidden"
          style={{ minHeight: "75vh", background: heroBg }}
        >
          <div className="absolute inset-0 overflow-hidden">
            {chapter.coverVideo ? (
              <>
                {/* Cover photo shows while video loads */}
                <Image
                  src={chapter.coverPhoto.src}
                  alt={chapter.coverPhoto.alt}
                  fill
                  className="object-cover"
                  style={{ objectPosition: chapter.coverPosition ?? "center" }}
                  sizes="100vw"
                  priority
                />
                <video
                  src={chapter.coverVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: chapter.coverPosition ?? "center" }}
                />
              </>
            ) : (
              <Image
                src={chapter.coverPhoto.src}
                alt={chapter.coverPhoto.alt}
                fill
                className="object-cover"
                style={{ objectPosition: chapter.coverPosition ?? "center" }}
                sizes="100vw"
                priority
              />
            )}
            <div className="absolute inset-0" style={{ background: heroOverlayGradient }} />
            <div
              className="absolute inset-0 mix-blend-multiply opacity-20"
              style={{ backgroundColor: accentColor }}
            />
          </div>

          {isKeyWest && <KeyWestHeroDecor />}
          {isTexas && <WhartonHeroDecor />}
          {isWestern && <DallasHeroDecor />}
          {isNightlife && <NightCityHeroDecor />}
          {isSkyline && <HoustonSkylineHeroDecor />}
          {isCoastal && <CoastalHeroDecor />}
          {isRomantic && <RomanticHeroDecor />}
          {isFrontier && <FrontierHeroDecor />}
          {isWild && <WildHeroDecor />}
          {isStudio && <StudioHeroDecor />}

          {/* Back button */}
          <motion.div
            className="absolute top-6 left-6 z-20"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link
              href="/"
              className="flex items-center gap-2 group"
              style={{
                fontFamily: "var(--font-courier)",
                color: "#c4a882",
                fontSize: 11,
                letterSpacing: "0.15em",
                opacity: 0.8,
                textDecoration: "none",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="transition-transform group-hover:-translate-x-1"
              >
                <path
                  d="M10 3L5 8l5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              THE ALBUM
            </Link>
          </motion.div>

          {/* Title */}
          <div className="absolute bottom-0 left-0 right-0 z-10 pb-16 px-6 md:px-12 max-w-3xl">
            <motion.p
              className="mb-3 tracking-[0.3em] text-xs uppercase"
              style={{ fontFamily: "var(--font-courier)", color: accentColor, opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              {chapter.location} — {chapter.date}
            </motion.p>

            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight"
              style={{
                fontFamily: "var(--font-playfair)",
                color: "#f5e6c8",
                textShadow: `0 4px 50px ${accentColor}66`,
              }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.2, ease: [0.25, 0, 0, 1] }}
            >
              {chapter.title}
            </motion.h1>

            <motion.p
              className="mt-3"
              style={{
                fontFamily: "var(--font-caveat)",
                color: accentSecondary,
                fontSize: 26,
                opacity: 0,
              }}
              animate={{ opacity: 0.95 }}
              transition={{ duration: 0.65, delay: 0.35 }}
            >
              {chapter.subtitle}
            </motion.p>

            <motion.div
              className="mt-5 inline-flex items-center gap-2 px-3 py-1"
              style={{
                border: `1px solid ${accentColor}44`,
                borderRadius: 2,
                backdropFilter: "blur(10px)",
                background: `${accentColor}15`,
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.5 }}
            >
              <span style={{ color: accentColor, fontSize: 8, opacity: 0.7 }}>◆</span>
              <span
                style={{
                  fontFamily: "var(--font-courier)",
                  color: accentColor,
                  fontSize: 9,
                  letterSpacing: "0.22em",
                  opacity: 0.9,
                }}
              >
                {chapter.theme.tagline.toUpperCase()}
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <ThemeDivider color={accentColor} type={dividerType} strong />

      {/* ─── DESCRIPTION ───────────────────────── */}
      <section
        className="relative z-10 max-w-2xl mx-auto px-6 py-16 text-center"
        style={{ background: descBg }}
      >
        {/* Chapter-specific corner accents — each component owns its reveal + idle */}
        {isKeyWest && (
          <>
            <div className="absolute top-6 left-6" style={{ opacity: 0.22 }}>
              <CursorRepulsor maxPush={30} maxRotation={28}>
                <KWHibiscus size={44} opacity={1} />
              </CursorRepulsor>
            </div>
            <div className="absolute top-10 right-8" style={{ opacity: 0.16 }}>
              <CursorRepulsor maxPush={30} maxRotation={28}>
                <KWHibiscus size={30} opacity={1} />
              </CursorRepulsor>
            </div>
            <div className="absolute bottom-10 right-10" style={{ opacity: 0.35 }}>
              <CursorRepulsor maxPush={24} maxRotation={35}>
                <KWShell />
              </CursorRepulsor>
            </div>
          </>
        )}
        {isTexas && (
          <>
            <div className="absolute top-6 left-8" style={{ opacity: 0.22 }}>
              <CursorRepulsor maxPush={38} maxRotation={32}>
                <TXLoneStar size={38} />
              </CursorRepulsor>
            </div>
            <div className="absolute top-8 right-10" style={{ opacity: 0.20 }}>
              <CursorRepulsor maxPush={28} maxRotation={22}>
                <TXHorseshoe style={{ width: 40, height: 45 }} />
              </CursorRepulsor>
            </div>
          </>
        )}
        {isNightlife && (
          <>
            <div className="absolute top-6 left-6" style={{ opacity: 0.32 }}>
              <CursorRepulsor maxPush={36} maxRotation={32}>
                <NightSparkle size={38} color="#a855f7" />
              </CursorRepulsor>
            </div>
            <div className="absolute top-8 right-8" style={{ opacity: 0.22 }}>
              <CursorRepulsor maxPush={36} maxRotation={32}>
                <NightSparkle size={26} color="#e8c547" />
              </CursorRepulsor>
            </div>
            <div className="absolute bottom-10 right-10" style={{ opacity: 0.42 }}>
              <CursorRepulsor maxPush={28} maxRotation={20}>
                <NightChampagne size={38} />
              </CursorRepulsor>
            </div>
          </>
        )}
        {isSkyline && (
          <>
            <div className="absolute top-6 left-5" style={{ opacity: 0.62 }}>
              <CursorRepulsor maxPush={34} maxRotation={20}>
                <CityGlare size={40} />
              </CursorRepulsor>
            </div>
            <div className="absolute top-8 right-6" style={{ opacity: 0.55 }}>
              <CursorRepulsor maxPush={28} maxRotation={16}>
                <CityTaxi size={68} />
              </CursorRepulsor>
            </div>
            <div className="absolute bottom-8 left-8" style={{ opacity: 0.38 }}>
              <CursorRepulsor maxPush={24} maxRotation={14}>
                <CityTaxi size={50} />
              </CursorRepulsor>
            </div>
          </>
        )}
        {isWestern && (
          <>
            <div className="absolute top-6 left-6" style={{ opacity: 0.28 }}>
              <CursorRepulsor maxPush={38} maxRotation={28}>
                <DallasStar size={40} />
              </CursorRepulsor>
            </div>
            <div className="absolute bottom-8 right-8" style={{ opacity: 0.22 }}>
              <CursorRepulsor maxPush={28} maxRotation={18}>
                <WesternSpur size={68} />
              </CursorRepulsor>
            </div>
          </>
        )}
        {isCoastal && (
          <>
            <div className="absolute top-6 left-6" style={{ opacity: 0.35 }}>
              <CursorRepulsor maxPush={32} maxRotation={24}>
                <CoastalShell />
              </CursorRepulsor>
            </div>
            <div className="absolute top-8 right-8" style={{ opacity: 0.38 }}>
              <CursorRepulsor maxPush={28} maxRotation={22}>
                <CoastalHeart size={30} />
              </CursorRepulsor>
            </div>
            <div className="absolute bottom-8 left-10" style={{ opacity: 0.25 }}>
              <CursorRepulsor maxPush={26} maxRotation={18}>
                <CoastalGull />
              </CursorRepulsor>
            </div>
          </>
        )}
        {isRomantic && (
          <>
            <div className="absolute top-6 left-6" style={{ opacity: 0.28 }}>
              <CursorRepulsor maxPush={34} maxRotation={28}>
                <RomanticCarnation size={40} />
              </CursorRepulsor>
            </div>
            <div className="absolute top-10 right-8" style={{ opacity: 0.18 }}>
              <CursorRepulsor maxPush={28} maxRotation={24}>
                <RomanticCarnation size={26} />
              </CursorRepulsor>
            </div>
          </>
        )}
        {isFrontier && (
          <>
            <div className="absolute top-6 left-8" style={{ opacity: 0.22 }}>
              <CursorRepulsor maxPush={38} maxRotation={32}>
                <TXLoneStar size={36} />
              </CursorRepulsor>
            </div>
          </>
        )}
        {isWild && (
          <>
            <div className="absolute top-8 left-6" style={{ opacity: 0.32 }}>
              <CursorRepulsor maxPush={30} maxRotation={22}>
                <WildPawPrint size={44} />
              </CursorRepulsor>
            </div>
            <div className="absolute bottom-8 right-8" style={{ opacity: 0.22 }}>
              <CursorRepulsor maxPush={24} maxRotation={18}>
                <WildPawPrint size={30} />
              </CursorRepulsor>
            </div>
          </>
        )}
        {isStudio && (
          <>
            <div className="absolute top-6 right-8" style={{ opacity: 0.38 }}>
              <CursorRepulsor maxPush={28} maxRotation={16}>
                <StudioAperture size={38} />
              </CursorRepulsor>
            </div>
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-5 mb-8">
            <motion.div
              className="h-px w-16 opacity-40"
              style={{ backgroundColor: accentColor }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            />
            {isKeyWest ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 0.55, delay: 0.2, ease: [0.25, 0, 0, 1] }}
              >
                <KWHibiscus size={26} opacity={0.85} />
              </motion.div>
            ) : isNightlife ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.3, rotate: -90 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 0.55, delay: 0.2, ease: [0.25, 0, 0, 1] }}
              >
                <NightSparkle size={26} color="#a855f7" />
              </motion.div>
            ) : isSkyline ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.3, x: -20 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 0.55, delay: 0.2, ease: [0.25, 0, 0, 1] }}
              >
                <CityGlare size={28} />
              </motion.div>
            ) : isCoastal ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.2 }}
              >
                <CoastalHeart size={26} />
              </motion.div>
            ) : isRomantic ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.3, rotate: -20 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 0.55, delay: 0.2, ease: [0.25, 0, 0, 1] }}
              >
                <RomanticCarnation size={26} />
              </motion.div>
            ) : isWild ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 0.55, delay: 0.2 }}
              >
                <WildPawPrint size={26} />
              </motion.div>
            ) : isStudio ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 0.55, delay: 0.2 }}
              >
                <StudioAperture size={26} />
              </motion.div>
            ) : isWestern ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.3, rotate: -160 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.2 }}
              >
                <DallasStar size={28} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.3, rotate: 90 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 0.55, delay: 0.2, ease: [0.25, 0, 0, 1] }}
              >
                <TXLoneStar size={26} />
              </motion.div>
            )}
            <motion.div
              className="h-px w-16 opacity-40"
              style={{ backgroundColor: accentColor }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            />
          </div>

          <p
            style={{
              fontFamily: "var(--font-caveat)",
              color: descTextColor,
              fontSize: 23,
              lineHeight: 1.7,
              opacity: 0.85,
            }}
          >
            {chapter.description}
          </p>

          {/* Info chips — stagger in */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            {[chapter.location, chapter.date, `${chapter.photos.length} Frames`].map(
              (tag, i) => (
                <motion.span
                  key={tag}
                  className="px-3 py-1 text-[10px] tracking-widest"
                  style={{
                    fontFamily: "var(--font-courier)",
                    color: accentColor,
                    border: `1px solid ${accentColor}3a`,
                    borderRadius: 2,
                    background: `${accentColor}0a`,
                    display: "inline-block",
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 0.85, y: 0 }}
                  viewport={{ once: false, amount: 0.4 }}
                  transition={{ duration: 0.4, delay: 0.35 + i * 0.08 }}
                >
                  {tag.toUpperCase()}
                </motion.span>
              )
            )}
          </div>
        </motion.div>
      </section>

      {/* Mid-page divider */}
      <ThemeDivider color={accentColor} type={dividerType} />

      {/* ─── GALLERY ───────────────────────────── */}
      <section
        className="relative z-10 pb-24"
        style={{ background: galleryBg }}
      >
        {/* Ambient colored glow in gallery bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: galleryGlow,
          }}
        />

        <motion.div
          className="relative z-10 text-center py-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-4">
            <div
              className="h-px w-24"
              style={{ background: `linear-gradient(to right, transparent, ${accentColor}55)` }}
            />
            <span
              style={{
                fontFamily: "var(--font-courier)",
                color: accentColor,
                opacity: 0.5,
                fontSize: 10,
                letterSpacing: "0.3em",
              }}
            >
              — GALLERY —
            </span>
            <div
              className="h-px w-24"
              style={{ background: `linear-gradient(to left, transparent, ${accentColor}55)` }}
            />
          </div>
        </motion.div>

        <PhotoGrid photos={chapter.photos} accentColor={accentColor} />
      </section>

      {/* ─── MORE CHAPTERS ─────────────────────── */}
      <MoreChaptersSection
        chapter={chapter}
        accentColor={accentColor}
        sectionBg={sectionBg}
        dividerType={dividerType}
        decorative={chapter.theme.decorative}
      />

      {/* ─── FOOTER NAV ────────────────────────── */}
      <div
        className="relative z-10 flex flex-col items-center gap-4"
        style={{
          borderTop: `1px solid ${accentColor}18`,
          background: pageBg,
        }}
      >
        <ThemeFloorDecor decorative={chapter.theme.decorative} />
        <div className="py-10 flex flex-col items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 group"
          style={{
            fontFamily: "var(--font-courier)",
            color: "#c4a882",
            fontSize: 11,
            letterSpacing: "0.22em",
            opacity: 0.45,
            textDecoration: "none",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="transition-transform group-hover:-translate-x-1"
          >
            <path
              d="M10 3L5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          RETURN TO THE ALBUM
        </Link>
        </div>
      </div>
    </motion.div>
  );
}
