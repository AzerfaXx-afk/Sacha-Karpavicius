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

// Authentic continuous stroke matching Sacha's exact cursive 'S' gesture:
// 1. 'S' top bar starts right (130,70) -> curves left (45,62) -> upper arch (25,85) -> slants down-right diagonal body (110,140) -> bottom S bowl (70,192) -> left S tail (28,155).
// 2. "Quand on remonte de la queue": Unbroken transition from left tail (28,155) straight up tall needle stem of 'k' (74,16), apex (88,22), down stem (76,102).
// 3. Upper-right loop of 'k' (145,80) and long sweeping flourish leg (288,140).
const SACHA_TRUE_CURSIVE_S_PATH =
  "M 130,70 C 105,58 65,58 45,62 C 32,65 22,74 25,85 C 30,105 75,128 110,140 C 122,152 105,188 70,192 C 45,194 24,175 28,155 C 32,130 65,70 74,16 C 76,4 86,6 88,22 C 90,46 82,85 76,102 C 82,85 125,65 145,80 C 158,92 140,114 76,115 C 115,116 180,120 230,126 C 260,130 278,136 288,140";

export default function SignatureAnim({ className = "" }: SignatureAnimProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const penTipRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!containerRef.current || !pathRef.current || !penTipRef.current) return;

    const path = pathRef.current;
    const penTip = penTipRef.current;
    const totalLength = path.getTotalLength() || 1008;

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
      // 2. Fade in glowing pen tip at start of 'S' top bar (130, 70)
      tl.to(penTip, {
        opacity: 1,
        duration: 0.15,
        onStart: () => updatePenTip(0),
      });

      // 3. Draw continuous stroke in real-time without lifting pen (3.4s)
      const drawObj = { progress: 0 };
      tl.to(path, { strokeDashoffset: 0, duration: 3.4, ease: "power2.inOut" }, "-=0.1");
      tl.to(
        drawObj,
        {
          progress: 1,
          duration: 3.4,
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

      // 6. Un-draw continuous stroke in exact reverse with trailing pen tip (2.4s)
      const eraseObj = { progress: 1 };
      tl.to(path, { strokeDashoffset: totalLength, duration: 2.4, ease: "power2.inOut" }, "-=0.1");
      tl.to(
        eraseObj,
        {
          progress: 0,
          duration: 2.4,
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
      {/* Sacha Karpavicius Perfect Cursive 'S' + 'k' Signature Canvas — Continuous Unbroken Stroke & Exact Reverse Pen Un-Writing */}
      <div className="relative h-[160px] sm:h-[200px] md:h-[250px] w-auto aspect-[300/210] flex items-center justify-center">
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 300 210"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full filter drop-shadow-[0_0_12px_rgba(255,255,255,0.65)]"
        >
          <defs>
            <filter id="pen-glow-sacha-true-cursive" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Continuous Single Unbroken Stroke matching Sacha's exact handwriting:
              Cursive S top bar -> S upper arch -> diagonal S body -> bottom S bowl -> queue (S tail) -> up needle k stem -> upper loop -> long flourish leg */}
          <path
            ref={pathRef}
            d={SACHA_TRUE_CURSIVE_S_PATH}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Glowing Neon Pen Tip Dot */}
          <circle
            ref={penTipRef}
            cx="130"
            cy="70"
            r="3.5"
            fill="#ffffff"
            filter="url(#pen-glow-sacha-true-cursive)"
            className="drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
          />
        </svg>
      </div>
    </div>
  );
}
