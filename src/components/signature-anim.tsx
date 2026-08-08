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

// Refined stroke paths:
// PATH_S: Cursive 'S' initial (starts near center stem, arches up-left, sweeps down into bottom loop)
// PATH_K: 'K' initial & sweep flourish (needle stem up, upper-right lobe, sweep flourish right)
const PATH_S =
  "M 75,90 C 58,75 42,82 38,98 C 34,120 32,150 48,178 C 62,192 84,188 85,168 C 86,148 78,125 75,118";

const PATH_K =
  "M 75,118 C 73,72 72,38 74,16 C 76,4 86,6 88,22 C 90,46 82,85 76,102 C 82,85 120,66 142,80 C 158,90 138,114 75,116 C 110,116 180,120 230,126 C 260,130 278,136 288,140";

export default function SignatureAnim({ className = "" }: SignatureAnimProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathSRef = useRef<SVGPathElement>(null);
  const pathKRef = useRef<SVGPathElement>(null);
  const penTipRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (
      !containerRef.current ||
      !pathSRef.current ||
      !pathKRef.current ||
      !penTipRef.current
    )
      return;

    const pathS = pathSRef.current;
    const pathK = pathKRef.current;
    const penTip = penTipRef.current;

    const lenS = pathS.getTotalLength() || 231;
    const lenK = pathK.getTotalLength() || 595;

    const updatePenTip = (path: SVGPathElement, totalLen: number, progress: number) => {
      if (!path || !penTip) return;
      try {
        const pointLen = Math.max(0, Math.min(totalLen, totalLen * progress));
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
      tl.set(pathS, { strokeDasharray: lenS, strokeDashoffset: lenS });
      tl.set(pathK, { strokeDasharray: lenK, strokeDashoffset: lenK });
      tl.set(penTip, { opacity: 0 });

      // --- WRITE PHASE ---
      // 2. Draw 'S' stroke in real-time (1.2s)
      tl.to(penTip, {
        opacity: 1,
        duration: 0.15,
        onStart: () => updatePenTip(pathS, lenS, 0),
      });

      const sWriteObj = { progress: 0 };
      tl.to(pathS, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, "-=0.1");
      tl.to(
        sWriteObj,
        {
          progress: 1,
          duration: 1.2,
          ease: "power2.inOut",
          onUpdate: () => updatePenTip(pathS, lenS, sWriteObj.progress),
        },
        "<"
      );

      // 3. Draw 'K' stroke in real-time seamlessly (2.0s)
      const kWriteObj = { progress: 0 };
      tl.to(pathK, { strokeDashoffset: 0, duration: 2.0, ease: "power2.inOut" });
      tl.to(
        kWriteObj,
        {
          progress: 1,
          duration: 2.0,
          ease: "power2.inOut",
          onUpdate: () => updatePenTip(pathK, lenK, kWriteObj.progress),
        },
        "<"
      );

      // 4. Fade out pen tip at end of writing
      tl.to(penTip, { opacity: 0, duration: 0.35, ease: "power2.out" });

      // --- HOLD PHASE (4.5s) ---
      tl.to({}, { duration: 4.5 });

      // --- REVERSE ERASE PHASE ---
      // 5. Fade in pen tip at end of 'K' flourish to start reverse un-writing
      tl.to(penTip, {
        opacity: 1,
        duration: 0.15,
        onStart: () => updatePenTip(pathK, lenK, 1),
      });

      // 6. Un-draw 'K' stroke in exact reverse with trailing pen tip (1.8s)
      const kEraseObj = { progress: 1 };
      tl.to(pathK, { strokeDashoffset: lenK, duration: 1.8, ease: "power2.inOut" }, "-=0.1");
      tl.to(
        kEraseObj,
        {
          progress: 0,
          duration: 1.8,
          ease: "power2.inOut",
          onUpdate: () => updatePenTip(pathK, lenK, kEraseObj.progress),
        },
        "<"
      );

      // 7. Un-draw 'S' stroke in exact reverse with trailing pen tip (1.0s)
      const sEraseObj = { progress: 1 };
      tl.to(pathS, { strokeDashoffset: lenS, duration: 1.0, ease: "power2.inOut" });
      tl.to(
        sEraseObj,
        {
          progress: 0,
          duration: 1.0,
          ease: "power2.inOut",
          onUpdate: () => updatePenTip(pathS, lenS, sEraseObj.progress),
        },
        "<"
      );

      // 8. Fade out pen tip after reverse erase
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
      {/* Sacha Karpavicius Monogram Canvas — Non-Clickable Real-Time Pen & Reverse Erase Animation */}
      <div className="relative h-[160px] sm:h-[200px] md:h-[250px] w-auto aspect-[300/210] flex items-center justify-center">
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 300 210"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full filter drop-shadow-[0_0_12px_rgba(255,255,255,0.65)]"
        >
          <defs>
            <filter id="pen-glow-sk-v3" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Stroke Layer 1: Cursive 'S' Initial Gesture */}
          <path
            ref={pathSRef}
            d={PATH_S}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Stroke Layer 2: Monogram 'K' Initial & Sweep Flourish */}
          <path
            ref={pathKRef}
            d={PATH_K}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Glowing Neon Pen Tip Dot */}
          <circle
            ref={penTipRef}
            cx="75"
            cy="90"
            r="3.5"
            fill="#ffffff"
            filter="url(#pen-glow-sk-v3)"
            className="drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
          />
        </svg>
      </div>
    </div>
  );
}
