"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SignatureAnimProps {
  className?: string;
}

// Authentic continuous stroke matching Sacha's exact paper signature reference:
// 1. 'S' (APPROVED & KEPT 100% INTACT): Starts inside K's loop at (120,75) -> top bar left (45,76) -> upper arch (25,84) -> slants far right (120,143) -> bottom bowl to far left (30,163).
// 2. 'k' PETITE BOUCLE RESSERRÉE: From far left (30,163), shoots up sleek tight needle stem (75,16), narrow apex loop (84,20), down stem to (75,108).
// 3. 'k' GROSSE BOUCLE RAPPROCHÉE DU CREUX DU S: Arches high and wide up-right to (158,70) wrapping around S top bar (120,75), returning right against CREUX DU S junction (75,112).
// 4. Long horizontal flourish leg sweeping right from CREUX DU S junction (288,140).
const SACHA_TIGHT_NEEDLE_CREUX_PATH =
  "M 120,75 C 98,72 60,70 45,76 C 25,84 20,102 40,116 C 60,128 100,130 120,143 C 132,158 105,190 70,193 C 45,194 28,183 30,163 C 32,135 68,70 75,16 C 77,6 83,8 84,20 C 85,42 78,85 75,108 C 82,90 125,58 158,70 C 172,82 142,108 75,112 C 115,114 180,120 230,126 C 260,130 278,136 288,140";

export default function SignatureAnim({ className = "" }: SignatureAnimProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const penTipRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!containerRef.current || !pathRef.current || !penTipRef.current) return;

    const path = pathRef.current;
    const penTip = penTipRef.current;
    const totalLength = path.getTotalLength() || 1035;

    const updatePenTip = (progress: number) => {
      if (!path || !penTip) return;
      try {
        const pointLen = Math.max(0, Math.min(totalLength, totalLength * progress));
        const pt = path.getPointAtLength(pointLen);
        penTip.setAttribute("cx", pt.x.toString());
        penTip.setAttribute("cy", pt.y.toString());
      } catch {
        // Fallback
      }
    };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 0.8,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play pause resume reset",
        },
      });

      // 1. Initial State Setup
      tl.set(path, { strokeDasharray: totalLength, strokeDashoffset: totalLength });
      tl.set(penTip, { opacity: 0 });

      // --- REAL-TIME WRITE PHASE ---
      // 2. Fade in glowing pen tip inside K's grosse boucle at start of 'S' (120, 75)
      tl.to(penTip, {
        opacity: 1,
        duration: 0.15,
        onStart: () => updatePenTip(0),
      });

      // 3. Draw continuous stroke in real-time without lifting pen (3.2s)
      const drawObj = { progress: 0 };
      tl.to(path, { strokeDashoffset: 0, duration: 3.2, ease: "power2.inOut" }, "-=0.1");
      tl.to(
        drawObj,
        {
          progress: 1,
          duration: 3.2,
          ease: "power2.inOut",
          onUpdate: () => updatePenTip(drawObj.progress),
        },
        "<"
      );

      // 4. Fade out pen tip at end of flourish leg
      tl.to(penTip, { opacity: 0, duration: 0.35, ease: "power2.out" });

      // --- HOLD PHASE (4.5s) ---
      tl.to({}, { duration: 4.5 });

      // --- EXACT REVERSE ERASE PHASE ---
      // 5. Fade in pen tip at end of flourish leg for reverse pen un-writing
      tl.to(penTip, {
        opacity: 1,
        duration: 0.15,
        onStart: () => updatePenTip(1),
      });

      // 6. Un-draw continuous stroke in exact reverse with trailing pen tip (2.2s)
      const eraseObj = { progress: 1 };
      tl.to(path, { strokeDashoffset: totalLength, duration: 2.2, ease: "power2.inOut" }, "-=0.1");
      tl.to(
        eraseObj,
        {
          progress: 0,
          duration: 2.2,
          ease: "power2.inOut",
          onUpdate: () => updatePenTip(eraseObj.progress),
        },
        "<"
      );

      // 7. Fade out pen tip after reverse erase
      tl.to(penTip, { opacity: 0, duration: 0.25, ease: "power2.out" });
      tl.to({}, { duration: 0.5 });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-start select-none pointer-events-none cursor-default ${className}`}
    >
      {/* Sacha Karpavicius Perfect Signature Canvas — Petite Boucle Resserrée & Grosse Boucle Rapprochée du Creux du S */}
      <div className="relative h-[160px] sm:h-[200px] md:h-[250px] w-auto aspect-[300/210] flex items-center justify-center">
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 300 210"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full filter drop-shadow-[0_0_12px_rgba(255,255,255,0.65)]"
        >
          <defs>
            <filter id="pen-glow-sacha-tight" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Continuous Single Unbroken Stroke:
              S top starts in K grosse boucle -> ondules left -> slants FAR RIGHT -> round bottom bowl to far left -> shoots up tight needle stem -> narrow apex loop -> grosse boucle hugging CREUX DU S -> flourish leg */}
          <path
            ref={pathRef}
            d={SACHA_TIGHT_NEEDLE_CREUX_PATH}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Glowing Neon Pen Tip Dot */}
          <circle
            ref={penTipRef}
            cx="120"
            cy="75"
            r="3.5"
            fill="#ffffff"
            filter="url(#pen-glow-sacha-tight)"
            className="drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
          />
        </svg>
      </div>
    </div>
  );
}
