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

// Single continuous stroke path matching Sacha's signature gesture
const PATH_DATA =
  "M 65,115 C 60,85 62,45 72,22 C 80,4 96,6 98,24 C 102,48 85,82 72,104 C 55,130 36,136 26,148 C 14,162 24,184 48,184 C 74,184 94,162 88,138 C 82,118 60,114 50,114 C 70,112 140,115 190,117 C 230,118 265,115 285,113";

export default function SignatureAnim({ className = "" }: SignatureAnimProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const penTipRef = useRef<SVGCircleElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!containerRef.current || !pathRef.current || !penTipRef.current) return;

    const path = pathRef.current;
    const penTip = penTipRef.current;
    const totalLength = path.getTotalLength();

    // Set initial dasharray and hidden offset
    gsap.set(path, {
      strokeDasharray: totalLength,
      strokeDashoffset: totalLength,
      opacity: 1,
    });
    gsap.set(penTip, { opacity: 0 });

    const updatePenTip = (progress: number) => {
      if (!path || !penTip) return;
      try {
        const pointLength = Math.max(0, Math.min(totalLength, totalLength * progress));
        const pt = path.getPointAtLength(pointLength);
        penTip.setAttribute("cx", pt.x.toString());
        penTip.setAttribute("cy", pt.y.toString());
      } catch {
        // Fallback for browsers before mount completes
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
      tl.set(path, { strokeDashoffset: totalLength });
      tl.set(penTip, { opacity: 0 });

      // 2. Fade in pen tip at start position
      tl.to(penTip, {
        opacity: 1,
        duration: 0.2,
        onStart: () => updatePenTip(0),
      });

      // 3. Draw signature in real-time stroke by stroke (2.6s)
      const drawObj = { progress: 0 };
      tl.to(
        path,
        {
          strokeDashoffset: 0,
          duration: 2.6,
          ease: "power2.inOut",
        },
        "-=0.1"
      );
      tl.to(
        drawObj,
        {
          progress: 1,
          duration: 2.6,
          ease: "power2.inOut",
          onUpdate: () => updatePenTip(drawObj.progress),
        },
        "<"
      );

      // 4. Fade out pen tip when drawing completes
      tl.to(penTip, { opacity: 0, duration: 0.35, ease: "power2.out" });

      // 5. Hold fully drawn signature visible (4.0s)
      tl.to({}, { duration: 4.0 });

      // 6. Fade in pen tip at the end position for erasing
      tl.to(penTip, {
        opacity: 1,
        duration: 0.2,
        onStart: () => updatePenTip(1),
      });

      // 7. Erase signature stroke smoothly (1.6s)
      const eraseObj = { progress: 1 };
      tl.to(
        path,
        {
          strokeDashoffset: -totalLength,
          duration: 1.6,
          ease: "power2.inOut",
        },
        "-=0.1"
      );
      tl.to(
        eraseObj,
        {
          progress: 0,
          duration: 1.6,
          ease: "power2.inOut",
          onUpdate: () => updatePenTip(eraseObj.progress),
        },
        "<"
      );

      // 8. Fade out pen tip after erase
      tl.to(penTip, { opacity: 0, duration: 0.25, ease: "power2.out" });

      // 9. Brief pause before loop restarts
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
      title="Cliquer pour re-tracer la signature"
    >
      {/* Real-time Pen Writing Canvas — Awwwards Real-Time Pen Animation */}
      <div className="relative h-[140px] sm:h-[180px] md:h-[220px] w-auto aspect-[300/200] flex items-center justify-center">
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 300 200"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full filter drop-shadow-[0_0_12px_rgba(255,255,255,0.65)] group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,1)] transition-all duration-500"
        >
          <defs>
            {/* Glowing neon filter for pen tip dot */}
            <filter id="pen-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Real-Time Handwritten Pen Stroke */}
          <path
            ref={pathRef}
            d={PATH_DATA}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Glowing Neon Pen Tip Dot */}
          <circle
            ref={penTipRef}
            cx="65"
            cy="115"
            r="3.5"
            fill="#ffffff"
            filter="url(#pen-glow)"
            className="drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
          />
        </svg>
      </div>
    </div>
  );
}
