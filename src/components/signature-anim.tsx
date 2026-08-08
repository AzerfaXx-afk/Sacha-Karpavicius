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

// Authentic continuous stroke matching Sacha's paper photo:
// 1. Top of 'S' arches up-right into the upper loop area of 'K'
// 2. Sweeps down-left into the lower 'S' loop
// 3. Transitions seamlessly into the tall vertical needle stem of 'K'
// 4. Forms the upper-right lobe of 'K'
// 5. Concludes with the sweeping horizontal leg flourish
const SACHA_PAPER_SIGNATURE_PATH =
  "M 38,95 C 45,70 82,55 115,62 C 132,65 110,88 68,105 C 42,125 32,158 52,182 C 72,192 92,175 76,132 C 75,90 73,42 74,16 C 76,4 86,6 88,22 C 90,46 82,85 76,102 C 82,85 118,68 138,82 C 150,92 135,112 76,115 C 115,116 180,120 230,126 C 260,130 278,136 288,140";

export default function SignatureAnim({ className = "" }: SignatureAnimProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const penTipRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!containerRef.current || !pathRef.current || !penTipRef.current) return;

    const path = pathRef.current;
    const penTip = penTipRef.current;
    const totalLength = path.getTotalLength() || 930;

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
      // 2. Fade in glowing pen tip at start of 'S'
      tl.to(penTip, {
        opacity: 1,
        duration: 0.15,
        onStart: () => updatePenTip(0),
      });

      // 3. Draw continuous stroke in real-time (3.2s)
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

      // 4. Fade out pen tip at end of sweep leg
      tl.to(penTip, { opacity: 0, duration: 0.35, ease: "power2.out" });

      // --- HOLD PHASE (4.5s) ---
      tl.to({}, { duration: 4.5 });

      // --- REVERSE ERASE PHASE ---
      // 5. Fade in pen tip at end of sweep leg for reverse un-writing
      tl.to(penTip, {
        opacity: 1,
        duration: 0.15,
        onStart: () => updatePenTip(1),
      });

      // 6. Un-draw stroke in exact reverse with trailing pen tip (2.2s)
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
      {/* Sacha Karpavicius Paper-Matched Signature Canvas — Continuous Stroke & Exact Reverse Pen Un-Writing */}
      <div className="relative h-[160px] sm:h-[200px] md:h-[250px] w-auto aspect-[300/210] flex items-center justify-center">
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 300 210"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full filter drop-shadow-[0_0_12px_rgba(255,255,255,0.65)]"
        >
          <defs>
            <filter id="pen-glow-sacha-paper" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Paper-Matched Continuous Stroke: S (top loop in K) -> bottom S -> needle K -> upper lobe -> flourish */}
          <path
            ref={pathRef}
            d={SACHA_PAPER_SIGNATURE_PATH}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Glowing Neon Pen Tip Dot */}
          <circle
            ref={penTipRef}
            cx="38"
            cy="95"
            r="3.5"
            fill="#ffffff"
            filter="url(#pen-glow-sacha-paper)"
            className="drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
          />
        </svg>
      </div>
    </div>
  );
}
