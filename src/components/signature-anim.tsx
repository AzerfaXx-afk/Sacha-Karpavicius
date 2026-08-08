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
  const secondaryPathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!pathRef.current || !containerRef.current) return;

    const path = pathRef.current;
    const secondaryPath = secondaryPathRef.current;
    const pathLength = path.getTotalLength();
    const secLength = secondaryPath ? secondaryPath.getTotalLength() : 0;

    // Set initial dasharray & dashoffset
    gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
      opacity: 1,
    });

    if (secondaryPath) {
      gsap.set(secondaryPath, {
        strokeDasharray: secLength,
        strokeDashoffset: secLength,
        opacity: 1,
      });
    }

    const ctx = gsap.context(() => {
      // Endless loop timeline: Write -> 5s Hold -> Progressive Erase -> Repeat
      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 0.6,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play pause resume reset",
        },
      });

      // Reset state for loop restart
      tl.set(path, { strokeDashoffset: pathLength })
        .set(secondaryPath, { strokeDashoffset: secLength })
        .set(dotRef.current, { opacity: 1, scale: 1 });

      // Step 1: Draw signature (Crayon / Pen writing live)
      tl.to(path, {
        strokeDashoffset: 0,
        duration: 2.2,
        ease: "power2.inOut",
        onUpdate: function () {
          if (dotRef.current && path) {
            const currentProgress = this.progress();
            const point = path.getPointAtLength(currentProgress * pathLength);
            dotRef.current.setAttribute("cx", point.x.toString());
            dotRef.current.setAttribute("cy", point.y.toString());
          }
        },
      });

      // Step 2: Draw underline flourish
      if (secondaryPath) {
        tl.to(
          secondaryPath,
          {
            strokeDashoffset: 0,
            duration: 1.0,
            ease: "power2.out",
          },
          "-=0.4"
        );
      }

      // Step 3: Hide pen tip after completion
      tl.to(dotRef.current, {
        opacity: 0,
        scale: 0,
        duration: 0.3,
      });

      // Step 4: Hold signature completely visible for 5 full seconds
      tl.to({}, { duration: 5.0 });

      // Step 5: Progressive Eraser ("se gomme petit à petit")
      if (secondaryPath) {
        tl.to(secondaryPath, {
          strokeDashoffset: secLength,
          duration: 0.8,
          ease: "power2.in",
        });
      }

      tl.to(
        path,
        {
          strokeDashoffset: pathLength,
          duration: 1.6,
          ease: "power2.inOut",
        },
        "-=0.4"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={`relative flex flex-col items-start ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-[9px] tracking-[0.3em] text-white/30 uppercase block">
          SIGNATURE
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-ping" />
      </div>
      <div className="relative w-[220px] sm:w-[280px] h-[90px] overflow-visible">
        <svg
          viewBox="0 0 400 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
        >
          {/* Main Signature Cursive Path */}
          <path
            ref={pathRef}
            d="M 25 75 C 20 45, 45 20, 60 40 C 75 60, 40 85, 30 95 C 40 100, 75 90, 85 75 C 95 60, 105 70, 115 80 C 125 90, 135 65, 145 60 C 155 55, 160 85, 175 75 C 190 65, 205 40, 220 30 C 235 20, 225 70, 240 80 C 255 90, 270 65, 280 60 C 290 55, 305 75, 315 80 C 325 85, 340 70, 355 65"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Artistic Underline Flourish */}
          <path
            ref={secondaryPathRef}
            d="M 20 108 Q 180 125 365 102"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Pen Tip Glow Dot */}
          <circle
            ref={dotRef}
            cx="25"
            cy="75"
            r="4.5"
            className="fill-white drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
          />
        </svg>
      </div>
    </div>
  );
}
