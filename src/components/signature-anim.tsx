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

export default function SignatureAnim({ className = "" }: SignatureAnimProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const penTipRef = useRef<SVGGElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!pathRef.current || !containerRef.current) return;

    const path = pathRef.current;
    const pathLength = path.getTotalLength();

    // Initial state: hidden stroke
    gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
      opacity: 1,
    });

    const ctx = gsap.context(() => {
      // Endless Awwwards loop timeline: Draw -> Hold -> Erase -> Repeat
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

      // Loop iteration reset
      tl.set(path, { strokeDashoffset: pathLength })
        .set(penTipRef.current, { opacity: 1, scale: 1 });

      // Step 1: Smooth pen drawing of Sacha's exact signature
      tl.to(path, {
        strokeDashoffset: 0,
        duration: 2.6,
        ease: "power2.inOut",
        onUpdate: function () {
          if (penTipRef.current && path) {
            const progress = this.progress();
            const point = path.getPointAtLength(progress * pathLength);
            penTipRef.current.setAttribute(
              "transform",
              `translate(${point.x}, ${point.y})`
            );
          }
        },
      });

      // Step 2: Pen tip spark fades out
      tl.to(penTipRef.current, {
        opacity: 0,
        scale: 0,
        duration: 0.35,
        ease: "power2.out",
      });

      // Step 3: Hold signature 100% visible and glowing
      tl.to({}, { duration: 4.8 });

      // Step 4: Progressive smooth erase stroke
      tl.to(path, {
        strokeDashoffset: pathLength,
        duration: 1.8,
        ease: "power2.inOut",
      });

      // Step 5: Brief pause at blank state before repeating
      tl.to({}, { duration: 0.8 });
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
      className={`relative inline-block cursor-pointer group select-none ${className}`}
      title="Cliquer pour re-tracer la signature"
    >
      <div className="relative w-[220px] sm:w-[260px] md:w-[300px] h-[120px] sm:h-[140px] md:h-[150px] overflow-visible">
        <svg
          viewBox="80 10 310 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_18px_rgba(255,255,255,0.7)] group-hover:drop-shadow-[0_0_28px_rgba(255,255,255,1)] transition-all duration-500"
        >
          {/* Authentic Handwritten Signature Path of Sacha Karpavicius */}
          <path
            ref={pathRef}
            d="M 145 170 C 147 115, 150 55, 152 28 C 153 16, 142 16, 134 38 C 126 75, 118 120, 112 172 C 114 142, 145 88, 192 82 C 228 78, 240 110, 198 136 C 162 150, 96 148, 92 178 C 88 218, 138 262, 202 246 C 238 232, 235 195, 165 178 C 192 178, 285 185, 385 226"
            stroke="white"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Realistic Pen Nib Spark / Writing Tip */}
          <g ref={penTipRef} style={{ opacity: 0 }}>
            {/* Ink glow halo */}
            <circle r="10" className="fill-white/40 blur-[2px]" />
            {/* Pen tip core */}
            <circle r="4.5" className="fill-white shadow-[0_0_16px_rgba(255,255,255,1)]" />
            {/* Tiny ink spark */}
            <circle r="2" className="fill-white opacity-95" />
          </g>
        </svg>
      </div>
    </div>
  );
}
