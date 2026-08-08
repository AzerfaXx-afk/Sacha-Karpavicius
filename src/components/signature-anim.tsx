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
  const flourishRef = useRef<SVGPathElement>(null);
  const penTipRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!pathRef.current || !containerRef.current) return;

    const path = pathRef.current;
    const flourish = flourishRef.current;
    const pathLength = path.getTotalLength();
    const flourishLength = flourish ? flourish.getTotalLength() : 0;

    // Set initial dasharray & dashoffset
    gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
      opacity: 1,
    });

    if (flourish) {
      gsap.set(flourish, {
        strokeDasharray: flourishLength,
        strokeDashoffset: flourishLength,
        opacity: 1,
      });
    }

    const ctx = gsap.context(() => {
      // Loop timeline: Write -> Hold -> Progressive erase -> Repeat
      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 0.8,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play pause resume reset",
        },
      });

      // Reset state for loop restart
      tl.set(path, { strokeDashoffset: pathLength })
        .set(flourish, { strokeDashoffset: flourishLength })
        .set(penTipRef.current, { opacity: 1, scale: 1 });

      // Step 1: Realistic Pen Writing Animation
      tl.to(path, {
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
      });

      // Step 2: Underline Flourish
      if (flourish) {
        tl.to(
          flourish,
          {
            strokeDashoffset: 0,
            duration: 1.1,
            ease: "power2.out",
            onUpdate: function () {
              if (penTipRef.current && flourish) {
                const progress = this.progress();
                const point = flourish.getPointAtLength(progress * flourishLength);
                penTipRef.current.setAttribute(
                  "transform",
                  `translate(${point.x}, ${point.y})`
                );
              }
            },
          },
          "-=0.3"
        );
      }

      // Step 3: Fade out pen tip
      tl.to(penTipRef.current, {
        opacity: 0,
        scale: 0,
        duration: 0.3,
      });

      // Step 4: Hold signature completely visible
      tl.to({}, { duration: 5.5 });

      // Step 5: Progressive Erase
      if (flourish) {
        tl.to(flourish, {
          strokeDashoffset: flourishLength,
          duration: 0.9,
          ease: "power2.in",
        });
      }

      tl.to(
        path,
        {
          strokeDashoffset: pathLength,
          duration: 1.8,
          ease: "power2.inOut",
        },
        "-=0.4"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={`relative flex flex-col items-start ${className}`}>
      <div className="relative w-[240px] sm:w-[300px] h-[95px] overflow-visible">
        <svg
          viewBox="0 0 420 135"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.45)]"
        >
          {/* Main Signature Cursive Path (Sacha K.) */}
          <path
            ref={pathRef}
            d="M 28 80 C 18 45, 52 18, 68 42 C 82 64, 42 92, 32 102 C 45 106, 82 92, 92 76 C 104 58, 114 72, 126 82 C 136 92, 146 64, 156 58 C 168 52, 172 88, 186 78 C 200 68, 218 38, 234 28 C 248 18, 238 72, 252 82 C 266 92, 282 68, 294 62 C 306 56, 320 78, 332 82 C 344 86, 360 72, 375 66"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Underline Flourish */}
          <path
            ref={flourishRef}
            d="M 22 112 Q 190 130 385 106"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Realistic Pen Nib Spark / Writing Tip */}
          <g ref={penTipRef} style={{ opacity: 0 }}>
            {/* Ink glow halo */}
            <circle r="8" className="fill-white/30 blur-[2px]" />
            {/* Pen tip core */}
            <circle r="3.5" className="fill-white shadow-[0_0_12px_rgba(255,255,255,1)]" />
            {/* Tiny ink spark */}
            <circle r="1.5" className="fill-white opacity-90" />
          </g>
        </svg>
      </div>
    </div>
  );
}
