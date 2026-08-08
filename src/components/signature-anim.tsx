"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!pathRef.current || !containerRef.current) return;

    const path = pathRef.current;
    const pathLength = path.getTotalLength();

    // Set initial dasharray & dashoffset
    gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
      opacity: 1,
    });

    const ctx = gsap.context(() => {
      // Timeline: Write -> Hold -> Progressive erase -> Repeat
      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.2,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play pause resume reset",
        },
      });

      timelineRef.current = tl;

      // Reset state for loop restart
      tl.set(path, { strokeDashoffset: pathLength })
        .set(penTipRef.current, { opacity: 1, scale: 1 });

      // Step 1: Realistic Pen Writing Animation of Sacha's exact handwritten signature
      tl.to(path, {
        strokeDashoffset: 0,
        duration: 3.2,
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

      // Step 2: Fade out pen tip gracefully
      tl.to(penTipRef.current, {
        opacity: 0,
        scale: 0,
        duration: 0.35,
        ease: "power2.out",
      });

      // Step 3: Hold signature completely visible
      tl.to({}, { duration: 6.5 });

      // Step 4: Progressive Erase
      tl.to(path, {
        strokeDashoffset: pathLength,
        duration: 2.0,
        ease: "power2.inOut",
      });
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex flex-col items-start cursor-pointer group select-none ${className}`}
      title="Cliquer pour re-tracer la signature"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-[9px] tracking-[0.25em] text-white/40 group-hover:text-white transition-colors duration-300 uppercase block">
          SIGNATURE OFFICIELLE
        </span>
        <span className="text-[9px] font-mono text-white/20 group-hover:text-white/60 transition-colors duration-300">
          (RE-JOUER ↺)
        </span>
      </div>

      <div className="relative w-[230px] sm:w-[270px] md:w-[310px] h-[170px] sm:h-[200px] overflow-visible">
        <svg
          viewBox="70 0 320 270"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_16px_rgba(255,255,255,0.65)] group-hover:drop-shadow-[0_0_26px_rgba(255,255,255,0.95)] transition-all duration-500"
        >
          {/* Authentic Handwritten Signature Path of Sacha Karpavicius */}
          <path
            ref={pathRef}
            d="M 140 180 C 138 135, 145 60, 150 25 C 152 14, 142 12, 134 35 C 124 68, 118 115, 114 175 C 112 148, 140 92, 185 85 C 225 78, 238 112, 195 138 C 160 152, 98 152, 94 182 C 90 220, 140 265, 205 248 C 240 235, 238 198, 168 180 C 195 180, 290 188, 385 230"
            stroke="white"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Realistic Pen Nib Spark / Writing Tip */}
          <g ref={penTipRef} style={{ opacity: 0 }}>
            {/* Ink glow halo */}
            <circle r="10" className="fill-white/35 blur-[2px]" />
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
