"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Project } from "@/data/projects";
import { lockScrollForNavigation } from "@/utils/scroll-lock";

interface ProjectNavProps {
  prevProject: Project;
  nextProject: Project;
  lang: "fr" | "en";
  onPlayClickSfx: () => void;
  onPlayHoverSfx: () => void;
}

export default function ProjectNav({
  prevProject,
  nextProject,
  lang,
  onPlayClickSfx,
  onPlayHoverSfx,
}: ProjectNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  const [hoverSide, setHoverSide] = useState<"prev" | "next" | null>(null);

  // Physics Pendulum & Inertia Engine ("Cuillère suspendue / Goutte liquide")
  useEffect(() => {
    const cursor = cursorRef.current;
    const arrow = arrowRef.current;
    if (!cursor) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let vx = 0;
    let vy = 0;
    let prevVx = 0;

    // Spoon / Pendulum Swing Physics
    let arrowAngle = 0;
    let arrowW = 0;
    let arrowOffsetY = 0;

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const updatePhysics = () => {
      // 1. Spring lerp for the outer cursor circle
      const dx = targetX - currentX;
      const dy = targetY - currentY;

      vx += dx * 0.16;
      vy += dy * 0.16;
      vx *= 0.65;
      vy *= 0.65;

      currentX += vx;
      currentY += vy;

      // Acceleration pulse
      const ax = vx - prevVx;
      prevVx = vx;

      // 2. Pendulum Spoon Physics for the Arrow inside (Pivots from top)
      arrowW += -ax * 2.4; 
      arrowW += -arrowAngle * 0.18;
      arrowW *= 0.82;
      arrowAngle += arrowW;

      arrowOffsetY += (vy * 0.35 - arrowOffsetY) * 0.2;

      const speed = Math.sqrt(vx * vx + vy * vy);
      const stretch = Math.min(speed * 0.016, 0.35);
      const circleTilt = Math.max(-20, Math.min(20, vx * 0.7));

      if (cursor) {
        cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) rotate(${circleTilt}deg) scale(${1 + stretch}, ${1 - stretch * 0.5})`;
      }

      if (arrow) {
        arrow.style.transformOrigin = "50% 15%";
        arrow.style.transform = `translate3d(${-vx * 0.25}px, ${arrowOffsetY}px, 0) rotate(${arrowAngle}deg) scale(${1 + Math.abs(arrowAngle) * 0.01})`;
      }

      rafId = requestAnimationFrame(updatePhysics);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafId = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const getSubLabel = (p: Project) => {
    const categoryStr = p.category || "";
    const yearStr = p.year || "";
    const titleStr = p.title || "";
    if (yearStr && !titleStr.includes(yearStr)) {
      return `${categoryStr} — ${yearStr}`;
    }
    return categoryStr;
  };

  return (
    <section
      ref={containerRef}
      className="relative z-10 w-full h-[55vh] md:h-[65vh] min-h-[420px] bg-[#050505] border-t border-white/10 select-none cursor-none overflow-hidden flex flex-col md:flex-row"
      onMouseLeave={() => setHoverSide(null)}
    >
      {/* ═══════════════════ "MOLLE" PENDULUM CURSOR FOLLOWER ═══════════════════ */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[99999] will-change-transform transition-opacity duration-300 ${
          hoverSide ? "opacity-100 scale-100" : "opacity-0 scale-0"
        }`}
      >
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white text-black border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-center backdrop-blur-md transition-all duration-300">
          <div ref={arrowRef} className="will-change-transform">
            {hoverSide === "prev" && (
              <svg
                className="w-8 h-8 md:w-10 md:h-10 text-black drop-shadow-md"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
              </svg>
            )}
            {hoverSide === "next" && (
              <svg
                className="w-8 h-8 md:w-10 md:h-10 text-black drop-shadow-md"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════ PERFECT PINKING SHEARS SVG SEAM LINE (DESKTOP) ═══════════════════ */}
      <svg
        className="hidden md:block absolute top-0 left-0 w-full h-full pointer-events-none z-20"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <polyline
          points="50,0 48,4.16 50,8.33 48,12.5 50,16.66 48,20.83 50,25 48,29.16 50,33.33 48,37.5 50,41.66 48,45.83 50,50 48,54.16 50,58.33 48,62.5 50,66.66 48,70.83 50,75 48,79.16 50,83.33 48,87.5 50,91.66 48,95.83 50,100"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* ───────────────────── PREVIOUS PROJECT (LEFT 50% HALF BOX) ───────────────────── */}
      <Link
        href={`/project/${prevProject.slug}`}
        onMouseEnter={() => {
          setHoverSide("prev");
          onPlayHoverSfx();
        }}
        onClick={() => {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("spa_nav", "true");
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const lenis = (window as any).__lenis;
            if (lenis && typeof lenis.scrollTo === "function") {
              lenis.scrollTo(0, { immediate: true });
            }
          }
          onPlayClickSfx();
        }}
        className="group relative w-full md:w-[50%] h-[260px] md:h-full flex flex-col justify-between p-6 md:p-16 overflow-hidden cursor-none z-10 shrink-0 pinked-left"
      >
        {/* Full Vibrant Color Reveal on Hover */}
        {prevProject.coverImage && (
          <div className="absolute inset-0 z-0 will-change-transform">
            <Image
              src={prevProject.coverImage}
              alt={prevProject.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={90}
              style={{ objectPosition: prevProject.objectPosition ? prevProject.objectPosition.replace("object-[", "").replace("]", "").replace("_", " ") : "center 25%" }}
              className="object-cover grayscale opacity-50 contrast-110 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 group-hover:saturate-150 transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]"
            />
            {/* Subtle Vignette Gradient in Idle, clears on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent group-hover:opacity-30 transition-opacity duration-700" />
          </div>
        )}

        {/* Text Content Container */}
        <div className="relative z-10 w-full max-w-[90%] md:max-w-[80%] h-full flex flex-col justify-between pointer-events-none">
          {/* Top Label */}
          <div>
            <span className="font-mono text-[10px] md:text-[12px] tracking-[0.35em] text-white/60 group-hover:text-white uppercase transition-colors duration-700 block drop-shadow-md">
              {lang === "fr" ? "PROJET PRÉCÉDENT" : "PREVIOUS PROJECT"}
            </span>
          </div>

          {/* Title & Subtitle + Year */}
          <div className="space-y-2 md:space-y-3 my-auto">
            <h3 className="font-syne font-bold text-[6vw] sm:text-[4vw] md:text-[3.6vw] uppercase tracking-tight text-white group-hover:scale-102 transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] leading-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]">
              {prevProject.title}
            </h3>
            <p className="font-inter text-[10px] md:text-[13px] text-white/70 group-hover:text-white tracking-[0.25em] uppercase transition-colors duration-700 font-light drop-shadow-md">
              {getSubLabel(prevProject)}
            </p>
          </div>

          <div />
        </div>
      </Link>

      {/* ───────────────────── NEXT PROJECT (RIGHT 50% HALF BOX) ───────────────────── */}
      <Link
        href={`/project/${nextProject.slug}`}
        onMouseEnter={() => {
          setHoverSide("next");
          onPlayHoverSfx();
        }}
        onClick={() => {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("spa_nav", "true");
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const lenis = (window as any).__lenis;
            if (lenis && typeof lenis.scrollTo === "function") {
              lenis.scrollTo(0, { immediate: true });
            }
          }
          onPlayClickSfx();
        }}
        className="group relative w-full md:w-[50%] h-[260px] md:h-full flex flex-col justify-between p-6 md:p-16 overflow-hidden cursor-none z-10 shrink-0 pinked-right border-t border-white/10 md:border-t-0"
      >

        {/* Full Vibrant Color Reveal on Hover */}
        {nextProject.coverImage && (
          <div className="absolute inset-0 z-0 will-change-transform">
            <Image
              src={nextProject.coverImage}
              alt={nextProject.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={90}
              style={{ objectPosition: nextProject.objectPosition ? nextProject.objectPosition.replace("object-[", "").replace("]", "").replace("_", " ") : "center 25%" }}
              className="object-cover grayscale opacity-50 contrast-110 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 group-hover:saturate-150 transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]"
            />
            {/* Subtle Vignette Gradient in Idle, clears on hover */}
            <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent group-hover:opacity-30 transition-opacity duration-700" />
          </div>
        )}

        {/* Text Content Container */}
        <div className="relative z-10 w-full max-w-[85%] md:max-w-[80%] ml-auto h-full flex flex-col justify-between items-end text-right pointer-events-none">
          {/* Top Label */}
          <div>
            <span className="font-mono text-[11px] md:text-[12px] tracking-[0.35em] text-white/60 group-hover:text-white uppercase transition-colors duration-700 block drop-shadow-md">
              {lang === "fr" ? "PROJET SUIVANT" : "NEXT PROJECT"}
            </span>
          </div>

          {/* Title & Subtitle + Year */}
          <div className="space-y-3 my-auto">
            <h3 className="font-syne font-bold text-[7vw] sm:text-[5vw] md:text-[3.6vw] uppercase tracking-tight text-white group-hover:scale-102 transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] leading-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]">
              {nextProject.title}
            </h3>
            <p className="font-inter text-[11px] md:text-[13px] text-white/70 group-hover:text-white tracking-[0.25em] uppercase transition-colors duration-700 font-light drop-shadow-md">
              {getSubLabel(nextProject)}
            </p>
          </div>

          <div />
        </div>
      </Link>
    </section>
  );
}
