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

// Separate stroke paths for the 'S' and 'K' monogram initials of Sacha Karpavicius
const PATH_S =
  "M 60,65 C 45,85 38,115 35,142 C 32,172 58,192 82,185 C 105,178 110,148 75,120";

const PATH_K =
  "M 75,120 C 73,75 72,40 74,18 C 76,4 86,6 88,22 C 90,46 82,85 76,102 C 82,85 120,68 140,82 C 155,92 135,115 75,118 C 110,118 180,122 230,128 C 260,132 278,138 288,142";

export default function SignatureAnim({ className = "" }: SignatureAnimProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathSRef = useRef<SVGPathElement>(null);
  const pathKRef = useRef<SVGPathElement>(null);
  const penTipRef = useRef<SVGCircleElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

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

    const lenS = pathS.getTotalLength() || 240;
    const lenK = pathK.getTotalLength() || 590;

    // Initial state
    gsap.set(pathS, { strokeDasharray: lenS, strokeDashoffset: lenS, opacity: 1 });
    gsap.set(pathK, { strokeDasharray: lenK, strokeDashoffset: lenK, opacity: 1 });
    gsap.set(penTip, { opacity: 0 });
    if (labelRef.current) gsap.set(labelRef.current, { opacity: 0, y: 6 });

    const updatePenTipPath = (path: SVGPathElement, totalLen: number, progress: number) => {
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

      timelineRef.current = tl;

      // 1. Reset state
      tl.set(pathS, { strokeDashoffset: lenS });
      tl.set(pathK, { strokeDashoffset: lenK });
      tl.set(penTip, { opacity: 0 });
      if (labelRef.current) tl.set(labelRef.current, { opacity: 0, y: 6 });

      // 2. Draw 'S' stroke (1.1s)
      tl.to(penTip, {
        opacity: 1,
        duration: 0.15,
        onStart: () => updatePenTipPath(pathS, lenS, 0),
      });

      const sObj = { progress: 0 };
      tl.to(pathS, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, "-=0.1");
      tl.to(
        sObj,
        {
          progress: 1,
          duration: 1.1,
          ease: "power2.inOut",
          onUpdate: () => updatePenTipPath(pathS, lenS, sObj.progress),
        },
        "<"
      );

      // 3. Seamless transition to 'K' stroke (2.0s)
      const kObj = { progress: 0 };
      tl.to(pathK, { strokeDashoffset: 0, duration: 2.0, ease: "power2.inOut" });
      tl.to(
        kObj,
        {
          progress: 1,
          duration: 2.0,
          ease: "power2.inOut",
          onUpdate: () => updatePenTipPath(pathK, lenK, kObj.progress),
        },
        "<"
      );

      // 4. Fade out pen tip and fade in micro-label
      tl.to(penTip, { opacity: 0, duration: 0.3, ease: "power2.out" });
      if (labelRef.current) {
        tl.to(labelRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.2");
      }

      // 5. Hold fully visible (4.5s)
      tl.to({}, { duration: 4.5 });

      // 6. Fade out micro-label
      if (labelRef.current) {
        tl.to(labelRef.current, { opacity: 0, duration: 0.3, ease: "power2.in" });
      }

      // 7. Erase strokes in reverse (1.6s)
      tl.to(penTip, {
        opacity: 1,
        duration: 0.15,
        onStart: () => updatePenTipPath(pathK, lenK, 1),
      });

      const eraseKObj = { progress: 1 };
      tl.to(pathK, { strokeDashoffset: -lenK, duration: 1.2, ease: "power2.inOut" }, "-=0.1");
      tl.to(
        eraseKObj,
        {
          progress: 0,
          duration: 1.2,
          ease: "power2.inOut",
          onUpdate: () => updatePenTipPath(pathK, lenK, eraseKObj.progress),
        },
        "<"
      );

      const eraseSObj = { progress: 1 };
      tl.to(pathS, { strokeDashoffset: -lenS, duration: 0.7, ease: "power2.inOut" });
      tl.to(
        eraseSObj,
        {
          progress: 0,
          duration: 0.7,
          ease: "power2.inOut",
          onUpdate: () => updatePenTipPath(pathS, lenS, eraseSObj.progress),
        },
        "<"
      );

      tl.to(penTip, { opacity: 0, duration: 0.2, ease: "power2.out" });
      tl.to({}, { duration: 0.5 });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleReplay = () => {
    if (timelineRef.current) {
      timelineRef.current.restart(true);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleReplay}
      className={`relative flex flex-col items-start select-none cursor-pointer group ${className}`}
      title="Cliquer pour re-tracer le monogramme SK"
    >
      {/* Real-time Monogram Pen Canvas (S + K Layered Animation) */}
      <div className="relative h-[160px] sm:h-[200px] md:h-[250px] w-auto aspect-[300/210] flex items-center justify-center">
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 300 210"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full filter drop-shadow-[0_0_12px_rgba(255,255,255,0.65)] group-hover:drop-shadow-[0_0_22px_rgba(255,255,255,1)] transition-all duration-500"
        >
          <defs>
            <filter id="pen-glow-sk" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Stroke Layer 1: Initial 'S' Gesture */}
          <path
            ref={pathSRef}
            d={PATH_S}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Stroke Layer 2: Monogram 'K' Gesture & Sweep Flourish */}
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
            cx="60"
            cy="65"
            r="3.5"
            fill="#ffffff"
            filter="url(#pen-glow-sk)"
            className="drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
          />
        </svg>
      </div>

      {/* Awwwards Micro-Label Monogram Caption */}
      <div
        ref={labelRef}
        className="mt-1 flex items-center gap-2 font-mono text-[9px] md:text-[10px] tracking-[0.3em] text-white/50 uppercase"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span>[ S.K ] — MONOGRAMME OFFICIEL</span>
      </div>
    </div>
  );
}
