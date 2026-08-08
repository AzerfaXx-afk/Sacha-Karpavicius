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
  const imgRef = useRef<HTMLImageElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!imgRef.current || !containerRef.current) return;

    const img = imgRef.current;

    // Initial state: fully clipped (invisible)
    gsap.set(img, {
      clipPath: "inset(0 100% 0 0)",
      opacity: 1,
    });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.0,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play pause resume reset",
        },
      });

      timelineRef.current = tl;

      // Reset: fully clipped
      tl.set(img, { clipPath: "inset(0 100% 0 0)" });

      // Step 1: Reveal from left to right (pen drawing effect)
      tl.to(img, {
        clipPath: "inset(0 0% 0 0)",
        duration: 2.8,
        ease: "power2.inOut",
      });

      // Step 2: Hold signature fully visible
      tl.to({}, { duration: 5.0 });

      // Step 3: Erase from left to right
      tl.to(img, {
        clipPath: "inset(0 0 0 100%)",
        duration: 1.8,
        ease: "power2.inOut",
      });

      // Step 4: Brief pause
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
      className={`relative inline-block cursor-pointer group select-none ${className}`}
    >
      <div className="relative w-[200px] sm:w-[240px] md:w-[280px] h-[100px] sm:h-[120px] md:h-[130px] overflow-visible">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src="/signature-white.svg"
          alt="Signature de Sacha Karpavicius"
          className="w-full h-full object-contain drop-shadow-[0_0_14px_rgba(255,255,255,0.6)] group-hover:drop-shadow-[0_0_22px_rgba(255,255,255,0.95)] transition-[filter] duration-500"
          draggable={false}
        />
      </div>
    </div>
  );
}
