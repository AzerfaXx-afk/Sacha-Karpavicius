"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface PreloaderProps {
  onComplete: () => void;
  onStart: () => void;
  onHoverChange?: (isHovering: boolean) => void;
  lang?: "fr" | "en";
}

export default function Preloader({ onComplete, onStart, onHoverChange, lang = "fr" }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const letterSRef = useRef<HTMLHeadingElement>(null);
  const letterKRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isHoveringLocal, setIsHoveringLocal] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const lens = lensRef.current;
    const letterS = letterSRef.current;
    const letterK = letterKRef.current;
    const nameContainer = nameRef.current;

    if (!container || !lens || !letterS || !letterK || !nameContainer) return;

    // Force scroll position to top and disable automatic browser scroll restoration on refresh
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Lock scroll completely during preloader
    document.body.style.overflow = "hidden";

    const preventScroll = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    const preventKeys = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "Space", "PageUp", "PageDown"].includes(e.code)) {
        preventScroll(e);
      }
    };
    window.addEventListener("keydown", preventKeys, { passive: false });

    // Spotlight cursor logic
    const handleMouseMove = (e: MouseEvent) => {
      if (nameContainer) {
        const rect = nameContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePos({ x: e.clientX, y: e.clientY });
        nameContainer.style.setProperty("--mouse-x", `${x}px`);
        nameContainer.style.setProperty("--mouse-y", `${y}px`);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Set initial states - ONLY on mount
    if (!hasStarted) {
      gsap.set(lens, { width: 0, height: 0, rotation: 45, xPercent: -50, yPercent: -50 });
      gsap.set([letterS, letterK], { yPercent: 120, opacity: 0 });
      gsap.set(nameContainer.querySelectorAll(".name-char"), { opacity: 1, y: 0 });
    }

    let tl: gsap.core.Timeline | null = null;

    if (hasStarted) {
      tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          onComplete();
        },
      });

      // 1. Letters S & K float up into 3D space & fade softly
      tl.to(
        [letterS, letterK],
        {
          yPercent: -30,
          scale: 1.1,
          opacity: 0,
          duration: 1.2,
          ease: "power3.inOut",
          stagger: 0.08,
        },
        0
      );

      // 2. Center name container zooms forward into camera with 3D scale and gentle blur
      tl.to(
        nameContainer,
        {
          scale: 1.3,
          y: -20,
          opacity: 0,
          filter: "blur(8px)",
          duration: 1.4,
          ease: "power2.inOut",
        },
        0
      );

      // 3. Central lens aperture expands smoothly to 400vmax over 2.8s (Luxurious 3D Portal Expansion)
      tl.to(
        lens,
        {
          width: "400vmax",
          height: "400vmax",
          rotation: 0,
          duration: 2.8,
          ease: "cubic-bezier(0.76, 0, 0.18, 1)",
          overwrite: true,
        },
        0
      );

      // 4. Smooth, continuous backdrop fade out during the last 1.2s of the aperture expansion
      tl.to(
        container,
        {
          opacity: 0,
          duration: 1.2,
          ease: "power2.inOut",
        },
        "-=1.2"
      );
    }

    return () => {
      if (tl) tl.kill();
      document.body.style.overflow = "";
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", preventKeys);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [onComplete, hasStarted]);

  return (
    <div
      ref={containerRef}
      data-lenis-prevent="true"
      data-preloader="true"
      className="fixed inset-0 w-full h-full z-[100] flex items-center justify-center select-none overflow-hidden pointer-events-auto"
    >
      {/* Expanding Square Aperture (The "hole" that reveals the site) */}
      <div
        ref={lensRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          boxShadow: "0 0 0 200vmax #050505",
          width: 0,
          height: 0,
          borderRadius: "0%",
        }}
      ></div>

      {/* Center Animated Name with Spotlight */}
      <div
        ref={nameRef}
        onMouseMove={() => {
          if (!isHoveringLocal && !hasStarted) {
            setIsHoveringLocal(true);
            onHoverChange?.(true);
            if (lensRef.current) gsap.to(lensRef.current, { width: '30vw', height: '30vw', rotation: 0, duration: 0.8, ease: 'power3.out', overwrite: true });
          }
        }}
        onMouseLeave={() => {
          setIsHoveringLocal(false);
          if (!hasStarted) {
            onHoverChange?.(false);
            if (lensRef.current) gsap.to(lensRef.current, { width: 0, height: 0, rotation: 45, duration: 0.8, ease: 'power3.out', overwrite: true });
          }
        }}
        onTouchStart={(e) => {
          if (hasStarted) return;
          setIsHoveringLocal(true);
          onHoverChange?.(true);
          const touch = e.touches[0];
          const rect = nameRef.current?.getBoundingClientRect();
          if (rect) {
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            setMousePos({ x: touch.clientX, y: touch.clientY });
            nameRef.current?.style.setProperty("--mouse-x", `${x}px`);
            nameRef.current?.style.setProperty("--mouse-y", `${y}px`);
          }
          if (lensRef.current) {
            gsap.to(lensRef.current, {
              width: '55vw',
              height: '55vw',
              rotation: 0,
              duration: 0.8,
              ease: 'power3.out',
              overwrite: true
            });
          }
        }}
        onTouchMove={(e) => {
          if (hasStarted) return;
          const touch = e.touches[0];
          const rect = nameRef.current?.getBoundingClientRect();
          if (rect) {
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            setMousePos({ x: touch.clientX, y: touch.clientY });
            nameRef.current?.style.setProperty("--mouse-x", `${x}px`);
            nameRef.current?.style.setProperty("--mouse-y", `${y}px`);
          }
        }}
        onTouchEnd={() => {
          if (hasStarted) return;
          setIsHoveringLocal(false);
          onHoverChange?.(false);
          if (lensRef.current) {
            gsap.to(lensRef.current, {
              width: 0,
              height: 0,
              rotation: 45,
              duration: 0.8,
              ease: 'power3.out',
              overwrite: true
            });
          }
        }}
        onClick={() => {
          if (!hasStarted) {
            setHasStarted(true);
            onStart();
            // Request device orientation permission for iOS devices to enable mobile parallax
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<PermissionState> }).requestPermission === 'function') {
              (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<PermissionState> }).requestPermission().catch(console.error);
            }
          }
        }}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 ${hasStarted ? 'pointer-events-none' : 'cursor-pointer group'}`}
      >
        <div
          className="relative flex font-syne font-bold text-base md:text-2xl tracking-[0.45em] uppercase whitespace-nowrap transition-all duration-700 group-hover:scale-105 mix-blend-difference drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
          style={{ color: "#ffffff" }}
        >
          {"Sacha Karpavicius".split("").map((char, i) => (
            <span key={`base-${i}`} className="name-char inline-block text-white">
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>

        {/* Click Indicator */}
        <div className={`mt-3 transition-opacity duration-500 ${hasStarted ? 'opacity-0' : 'group-hover:opacity-0'}`}>
          <div className="font-mono text-[9px] md:text-[10px] tracking-[0.4em] uppercase text-white/80 animate-pulse drop-shadow-md">
            {lang === "fr" ? "Cliquer pour entrer" : "Click to enter"}
          </div>
        </div>
      </div>

      {/* Bottom Left Letter */}
      <h1
        ref={letterSRef}
        className="absolute bottom-[-2vw] left-4 md:left-12 font-syne font-bold text-[30vw] md:text-[25vw] leading-none text-white/90 pointer-events-none"
        style={{ opacity: 0 }}
      >
        S
      </h1>

      {/* Bottom Right Letter */}
      <h1
        ref={letterKRef}
        className="absolute bottom-[-2vw] right-4 md:right-12 font-syne font-bold text-[30vw] md:text-[25vw] leading-none text-white/90 pointer-events-none"
        style={{ opacity: 0 }}
      >
        K
      </h1>
    </div>
  );
}
