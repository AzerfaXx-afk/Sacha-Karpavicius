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

// Refined stroke paths matching Sacha Karpavicius's authentic 'S' and 'K' monogram handwriting:
const PATH_S =
  "M 65,70 C 48,90 38,118 35,145 C 32,174 56,192 82,185 C 105,178 110,148 75,118";

const PATH_K =
  "M 75,118 C 73,72 72,38 74,16 C 76,4 86,6 88,22 C 90,46 82,85 76,102 C 82,85 120,66 142,80 C 158,90 138,114 75,116 C 110,116 180,120 230,126 C 260,130 278,136 288,140";

export default function SignatureAnim({ className = "" }: SignatureAnimProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const strokeGroupRef = useRef<SVGGElement>(null);
  const pathSRef = useRef<SVGPathElement>(null);
  const pathKRef = useRef<SVGPathElement>(null);
  const penTipRef = useRef<SVGCircleElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (
      !containerRef.current ||
      !pathSRef.current ||
      !pathKRef.current ||
      !penTipRef.current ||
      !strokeGroupRef.current
    )
      return;

    const pathS = pathSRef.current;
    const pathK = pathKRef.current;
    const penTip = penTipRef.current;
    const strokeGroup = strokeGroupRef.current;

    const lenS = pathS.getTotalLength() || 240;
    const lenK = pathK.getTotalLength() || 590;

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

      timelineRef.current = tl;

      // 1. Reset state for new cycle
      tl.set(pathS, { strokeDasharray: lenS, strokeDashoffset: lenS });
      tl.set(pathK, { strokeDasharray: lenK, strokeDashoffset: lenK });
      tl.set(strokeGroup, { opacity: 1, clipPath: "inset(0 0% 0 0)" });
      tl.set(penTip, { opacity: 0 });

      // 2. Fade in pen tip at start of 'S'
      tl.to(penTip, {
        opacity: 1,
        duration: 0.15,
        onStart: () => updatePenTip(pathS, lenS, 0),
      });

      // 3. Draw 'S' stroke in real-time (1.1s)
      const sObj = { progress: 0 };
      tl.to(pathS, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, "-=0.1");
      tl.to(
        sObj,
        {
          progress: 1,
          duration: 1.1,
          ease: "power2.inOut",
          onUpdate: () => updatePenTip(pathS, lenS, sObj.progress),
        },
        "<"
      );

      // 4. Draw 'K' stroke in real-time seamlessly (2.0s)
      const kObj = { progress: 0 };
      tl.to(pathK, { strokeDashoffset: 0, duration: 2.0, ease: "power2.inOut" });
      tl.to(
        kObj,
        {
          progress: 1,
          duration: 2.0,
          ease: "power2.inOut",
          onUpdate: () => updatePenTip(pathK, lenK, kObj.progress),
        },
        "<"
      );

      // 5. Fade out pen tip
      tl.to(penTip, { opacity: 0, duration: 0.35, ease: "power2.out" });

      // 6. Hold fully visible signature (4.5s)
      tl.to({}, { duration: 4.5 });

      // 7. Natural Erase Phase: Forward Dissolve/Wipe in writing direction (1.4s)
      tl.to(strokeGroup, {
        opacity: 0,
        duration: 1.2,
        ease: "power2.inOut",
      });

      // 8. Brief pause before loop restarts
      tl.to({}, { duration: 0.6 });
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
      title="Cliquer pour re-tracer la signature"
    >
      {/* Sacha Karpavicius Monogram Canvas — Pure Real-Time Pen Animation */}
      <div className="relative h-[160px] sm:h-[200px] md:h-[250px] w-auto aspect-[300/210] flex items-center justify-center">
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 300 210"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full filter drop-shadow-[0_0_12px_rgba(255,255,255,0.65)] group-hover:drop-shadow-[0_0_22px_rgba(255,255,255,1)] transition-all duration-500"
        >
          <defs>
            {/* Glowing neon filter for pen tip dot */}
            <filter id="pen-glow-sk-v2" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Stroke Layer Group: 'S' + 'K' Strokes with Natural Dissolve Fade */}
          <g ref={strokeGroupRef}>
            {/* Stroke Layer 1: 'S' Monogram Initial */}
            <path
              ref={pathSRef}
              d={PATH_S}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Stroke Layer 2: 'K' Monogram Initial & Sweep Flourish */}
            <path
              ref={pathKRef}
              d={PATH_K}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Glowing Neon Pen Tip Dot */}
          <circle
            ref={penTipRef}
            cx="65"
            cy="70"
            r="3.5"
            fill="#ffffff"
            filter="url(#pen-glow-sk-v2)"
            className="drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
          />
        </svg>
      </div>
    </div>
  );
}
