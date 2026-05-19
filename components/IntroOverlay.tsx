"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function IntroOverlay() {
  const [show, setShow]       = useState(true);
  const [exiting, setExiting] = useState(false);
  const [phase, setPhase]     = useState(0);

  useEffect(() => {
    const visited = sessionStorage.getItem("eg-intro");
    if (visited) {
      // Already visited — hide immediately with no animation
      setShow(false);
      return;
    }
    sessionStorage.setItem("eg-intro", "1");

    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1100);
    const t3 = setTimeout(() => setPhase(3), 1900);
    const t4 = setTimeout(() => setExiting(true), 2900);
    const t5 = setTimeout(() => setShow(false), 3900);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div key="intro" className="fixed inset-0" style={{ zIndex: 9999 }}>

          {/* Top curtain */}
          <motion.div
            className="absolute left-0 right-0 top-0"
            style={{ height: "52vh", background: "#060300" }}
            animate={exiting ? { y: "-100%" } : { y: 0 }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          />

          {/* Bottom curtain */}
          <motion.div
            className="absolute left-0 right-0 bottom-0"
            style={{ height: "52vh", background: "#060300" }}
            animate={exiting ? { y: "100%" } : { y: 0 }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          />

          {/* Center fill so there's no gap between curtains */}
          <motion.div
            className="absolute inset-0"
            style={{ background: "#060300", zIndex: -1 }}
            animate={exiting ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          />

          {/* Content — sits above curtains */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            animate={exiting ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            {/* Film strips */}
            {[true, false].map((isTop) => (
              <motion.div
                key={String(isTop)}
                className={`absolute ${isTop ? "top-0" : "bottom-0"} left-0 right-0 flex justify-around items-center`}
                initial={{ opacity: 0 }}
                animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  height: 28,
                  background: "#060300",
                  borderBottom: isTop ? "1px solid rgba(212,160,23,0.15)" : "none",
                  borderTop: !isTop ? "1px solid rgba(212,160,23,0.15)" : "none",
                }}
              >
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} style={{
                    width: 18, height: 11, borderRadius: 2,
                    border: "1px solid rgba(212,160,23,0.22)",
                  }} />
                ))}
              </motion.div>
            ))}

            {/* Diamond */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={phase >= 1 ? { opacity: 0.85, scale: 1 } : {}}
              transition={{ duration: 0.45, ease: [0.25, 0, 0, 1] }}
              style={{ color: "#d4a017", fontSize: 14, marginBottom: 26, letterSpacing: "0.6em" }}
            >
              ◆
            </motion.div>

            {/* Title */}
            <div style={{ overflow: "hidden" }}>
              <motion.h1
                initial={{ y: 60 }}
                animate={phase >= 1 ? { y: 0 } : {}}
                transition={{ duration: 0.85, ease: [0.25, 0, 0, 1] }}
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: "#f5e6c8",
                  fontSize: "clamp(34px, 6.5vw, 76px)",
                  fontWeight: 300,
                  letterSpacing: "0.04em",
                  lineHeight: 1,
                }}
              >
                Emerson&apos;s Gallery
              </motion.h1>
            </div>

            {/* Gold line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={phase >= 2 ? { scaleX: 1 } : {}}
              transition={{ duration: 0.65, ease: [0.25, 0, 0, 1] }}
              style={{
                height: 1,
                width: "min(260px, 38vw)",
                background: "linear-gradient(to right, transparent, #d4a017 30%, #d4a017 70%, transparent)",
                transformOrigin: "center",
                margin: "20px 0 16px",
              }}
            />

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={phase >= 2 ? { opacity: 0.45 } : {}}
              transition={{ duration: 0.55, delay: 0.15 }}
              style={{
                fontFamily: "var(--font-courier)",
                color: "#c4a882",
                fontSize: 10,
                letterSpacing: "0.38em",
                textTransform: "uppercase",
              }}
            >
              A Visual Journal
            </motion.p>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={phase >= 3 ? { opacity: 0.32, y: 0 } : {}}
              transition={{ duration: 0.55 }}
              style={{
                fontFamily: "var(--font-caveat)",
                color: "#c4a882",
                fontSize: 17,
                marginTop: 16,
              }}
            >
              Capturing your vision with our lens
            </motion.p>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
