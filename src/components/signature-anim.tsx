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

// Authentic continuous stroke matching Sacha's exact handwriting instructions & geometry:
// 1. Top of 'S' starts inside K's grosse boucle at (125,90) [well below needle top] -> ondules left across stem at Y=84
// 2. Upper S belly (38,120) -> slants down-right (78,155) -> reviens left into bottom S bowl (48,198) -> returns to stem axis (75,140)
// 3. "Monte derrière": Ascends straight up along vertical stem axis X=74 behind S loops into needle top (74,16), apex loop (88,22), down stem (76,102)
// 4. Grosse boucle du 'k' (160,85) englobing the top of S, returning to stem (76,115), and long flourish leg (288,140)
const SACHA_CORRECT_BEHIND_SIGNATURE_PATH =
  "M 125,90 C 105,82 65,80 45,84 C 25,92 20,108 38,120 C 56,130 95,138 78,155 C 60,172 25,186 48,198 C 72,206 96,188 75,140 C 74,95 73,42 74,16 C 76,4 86,6 88,22 C 90,46 82,85 76,102 C 82,85 130,68 160,85 C 172,98 145,112 76,115 C 115,116 180,120 230,126 C 260,130 278,136 288,140";

export default function SignatureAnim({ className = "" }: SignatureAnimProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const penTipRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!containerRef.current || !pathRef.current || !penTipRef.current) return;

    const path = pathRef.current;
    const penTip = penTipRef.current;
    const totalLength = path.getTotalLength() || 984;

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
      // 2. Fade in glowing pen tip inside K's grosse boucle at start of 'S' (125, 90)
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
      {/* Sacha Karpavicius Perfect Signature Canvas — Haut du S dans la Grosse Boucle & Remontée du 'k' Derrière la Tige */}
      <div className="relative h-[160px] sm:h-[200px] md:h-[250px] w-auto aspect-[300/210] flex items-center justify-center">
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 300 210"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full filter drop-shadow-[0_0_12px_rgba(255,255,255,0.65)]"
        >
          <defs>
            <filter id="pen-glow-sacha-behind" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Continuous Single Unbroken Stroke:
              S top starts in grosse boucle -> ondules left -> slants right -> bottom bowl -> ascends DERRIERE along vertical stem axis -> needle top -> grosse boucle englobing S top -> flourish leg */}
          <path
            ref={pathRef}
            d={SACHA_CORRECT_BEHIND_SIGNATURE_PATH}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Glowing Neon Pen Tip Dot */}
          <circle
            ref={penTipRef}
            cx="125"
            cy="90"
            r="3.5"
            fill="#ffffff"
            filter="url(#pen-glow-sacha-behind)"
            className="drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
          />
        </svg>
      </div>
    </div>
  );
}
