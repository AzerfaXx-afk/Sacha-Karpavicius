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

// Single continuous unbroken handwritten stroke:
// Starts top of 'S' -> loops down into bottom 'S' curve -> transitions without lifting pen into lowercase 'k'
// (shoots up tall needle stem -> upper small loop -> long sweeping leg flourish)
const CONTINUOUS_SIGNATURE_PATH =
  "M 42,75 C 54,62 70,68 72,82 C 72,95 48,110 38,135 C 30,162 55,188 80,182 C 102,175 106,145 75,120 C 73,75 72,38 74,16 C 76,4 86,6 88,22 C 90,46 82,85 76,102 C 82,85 115,65 135,78 C 148,88 135,108 80,114 C 115,115 180,120 230,126 C 260,130 278,136 288,140";

export default function SignatureAnim({ className = "" }: SignatureAnimProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const penTipRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!containerRef.current || !pathRef.current || !penTipRef.current) return;

    const path = pathRef.current;
    const penTip = penTipRef.current;
    const totalLength = path.getTotalLength() || 830;

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

      // --- WRITE PHASE ---
      // 2. Fade in pen tip at start of 'S' (top left)
      tl.to(penTip, {
        opacity: 1,
        duration: 0.15,
        onStart: () => updatePenTip(0),
      });

      // 3. Draw entire continuous stroke in real-time without lifting pen (3.0s)
      const drawObj = { progress: 0 };
      tl.to(path, { strokeDashoffset: 0, duration: 3.0, ease: "power2.inOut" }, "-=0.1");
      tl.to(
        drawObj,
        {
          progress: 1,
          duration: 3.0,
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
      // 5. Fade in pen tip at end of sweep leg to begin exact reverse un-writing
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
      {/* Sacha Karpavicius Signature Canvas — Continuous Unbroken Pen Stroke & Exact Reverse Erase */}
      <div className="relative h-[160px] sm:h-[200px] md:h-[250px] w-auto aspect-[300/210] flex items-center justify-center">
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 300 210"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full filter drop-shadow-[0_0_12px_rgba(255,255,255,0.65)]"
        >
          <defs>
            <filter id="pen-glow-sacha-continuous" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Continuous Single Unbroken Stroke: S -> k -> leg */}
          <path
            ref={pathRef}
            d={CONTINUOUS_SIGNATURE_PATH}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Glowing Neon Pen Tip Dot */}
          <circle
            ref={penTipRef}
            cx="42"
            cy="75"
            r="3.5"
            fill="#ffffff"
            filter="url(#pen-glow-sacha-continuous)"
            className="drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
          />
        </svg>
      </div>
    </div>
  );
}
