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

// Authentic stroke path following Sacha Karpavicius's actual handwriting gesture:
// 1. Upstroke & needle loop top  2. Upper-right lobe  3. Lower-left loop  4. Rightward sweep flourish
const SACHA_SIGNATURE_PATH =
  "M 75,115 C 73,80 72,45 74,22 C 76,8 86,10 88,26 C 90,50 82,85 76,105 C 85,90 115,70 135,82 C 150,92 135,112 85,114 C 60,116 38,125 35,148 C 32,175 60,192 82,185 C 105,178 112,150 82,120 C 100,120 160,122 210,128 C 240,132 265,138 285,142";

export default function SignatureAnim({ className = "" }: SignatureAnimProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const penTipRef = useRef<SVGCircleElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!containerRef.current || !pathRef.current || !penTipRef.current) return;

    const path = pathRef.current;
    const penTip = penTipRef.current;
    const totalLength = path.getTotalLength() || 780;

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
        // Fallback for pre-render
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

      // 2. Fade in glowing pen tip at start position
      tl.to(penTip, {
        opacity: 1,
        duration: 0.2,
        onStart: () => updatePenTip(0),
      });

      // 3. Draw Sacha's signature stroke in real-time (2.8s)
      const drawObj = { progress: 0 };
      tl.to(
        path,
        {
          strokeDashoffset: 0,
          duration: 2.8,
          ease: "power2.inOut",
        },
        "-=0.1"
      );
      tl.to(
        drawObj,
        {
          progress: 1,
          duration: 2.8,
          ease: "power2.inOut",
          onUpdate: () => updatePenTip(drawObj.progress),
        },
        "<"
      );

      // 4. Fade out pen tip when stroke completes
      tl.to(penTip, { opacity: 0, duration: 0.35, ease: "power2.out" });

      // 5. Hold fully drawn signature visible (4.0s)
      tl.to({}, { duration: 4.0 });

      // 6. Fade in pen tip at end position for erasing
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
      {/* Sacha Karpavicius Authentic Real-Time Pen Animation Canvas */}
      <div className="relative h-[160px] sm:h-[200px] md:h-[250px] w-auto aspect-[300/210] flex items-center justify-center">
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 300 210"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full filter drop-shadow-[0_0_12px_rgba(255,255,255,0.65)] group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,1)] transition-all duration-500"
        >
          <defs>
            {/* Glowing neon filter for pen tip dot */}
            <filter id="pen-glow-sacha" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Sacha's Real-Time Handwritten Pen Stroke */}
          <path
            ref={pathRef}
            d={SACHA_SIGNATURE_PATH}
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
            cy="115"
            r="3.5"
            fill="#ffffff"
            filter="url(#pen-glow-sacha)"
            className="drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
          />
        </svg>
      </div>
    </div>
  );
}
