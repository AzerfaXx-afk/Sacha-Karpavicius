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
      // Reveal timeline on ScrollTrigger
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      timelineRef.current = tl;

      tl.set(path, { strokeDashoffset: pathLength })
        .set(penTipRef.current, { opacity: 1, scale: 1 });

      // Step 1: Smooth pen drawing of Sacha's signature
      tl.to(path, {
        strokeDashoffset: 0,
        duration: 2.8,
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

      // Step 2: Pen tip fades out, signature stays 100% visible permanently
      tl.to(penTipRef.current, {
        opacity: 0,
        scale: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleReplay = () => {
    if (!pathRef.current) return;
    const path = pathRef.current;
    const pathLength = path.getTotalLength();

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const replayTl = gsap.timeline();
    timelineRef.current = replayTl;

    replayTl
      .set(path, { strokeDashoffset: pathLength })
      .set(penTipRef.current, { opacity: 1, scale: 1 })
      .to(path, {
        strokeDashoffset: 0,
        duration: 2.4,
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
      })
      .to(penTipRef.current, {
        opacity: 0,
        scale: 0,
        duration: 0.35,
        ease: "power2.out",
      });
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
            d="M 140 180 C 138 135, 145 60, 150 25 C 152 14, 142 12, 134 35 C 124 68, 118 115, 114 175 C 112 148, 140 92, 185 85 C 225 78, 238 112, 195 138 C 160 152, 98 152, 94 182 C 90 220, 140 265, 205 248 C 240 235, 238 198, 168 180 C 195 180, 290 188, 385 230"
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
