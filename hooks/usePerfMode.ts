"use client";

import { useEffect, useState } from "react";

/**
 * Returns `true` when the device should run in a lightweight visual mode —
 * heavy decorative animations, cursor-tracking springs, and infinite loops
 * are skipped to keep low-end and touch devices smooth.
 *
 * Triggers on:
 *  - prefers-reduced-motion: reduce   (user opted out of motion)
 *  - a coarse pointer                 (phones / tablets — heavy decor barely visible, costs the most)
 *  - navigator.deviceMemory <= 4      (low-RAM devices, when the browser reports it)
 *
 * Defaults to `false` (full experience) during SSR and on capable desktops.
 */
export function usePerfMode(): boolean {
  const [lite, setLite] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");

    const compute = () => {
      const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
      const lowMem = typeof mem === "number" && mem <= 4;
      setLite(reduce.matches || coarse.matches || lowMem);
    };

    compute();
    reduce.addEventListener("change", compute);
    coarse.addEventListener("change", compute);
    return () => {
      reduce.removeEventListener("change", compute);
      coarse.removeEventListener("change", compute);
    };
  }, []);

  return lite;
}
