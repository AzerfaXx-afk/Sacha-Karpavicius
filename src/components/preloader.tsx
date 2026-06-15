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

  // 1. Scroll locking and global listeners (Runs once on mount)
  useEffect(() => {
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
      const nameContainer = nameRef.current;
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

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", preventKeys);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // 2. Intro Animation (runs on mount)
  useEffect(() => {
    if (hasStarted) return;
    
    const letterS = letterSRef.current;
    const letterK = letterKRef.current;
    const nameContainer = nameRef.current;
    const lens = lensRef.current;

    if (!letterS || !letterK || !nameContainer || !lens) return;

    const chars = nameContainer.querySelectorAll(".name-char");
    const clickIndicator = nameContainer.querySelector(".animate-pulse") || nameContainer.lastElementChild;

    // Set initial states
    gsap.set(lens, { width: 0, height: 0, rotation: 45, xPercent: -50, yPercent: -50 });
    gsap.set([letterS, letterK], { yPercent: 120, opacity: 0, x: 0 });
    gsap.set(chars, { y: 25, opacity: 0 });
    if (clickIndicator) gsap.set(clickIndicator, { opacity: 0, y: 10 });

    const introTl = gsap.timeline({ delay: 0.1 });

    // Name characters slide up and fade in
    introTl.to(chars, {
      y: 0,
      opacity: 1,
      duration: 1.0,
      ease: "power3.out",
      stagger: 0.04,
    });

    // Giant letters S and K slide up
    introTl.to(
      [letterS, letterK],
      {
        yPercent: 0,
        opacity: 0.9,
        duration: 1.5,
        ease: "power4.out",
        stagger: 0.15,
      },
      "-=0.6"
    );

    // Fade in click indicator
    if (clickIndicator) {
      introTl.to(
        clickIndicator,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.8"
      );
    }

    return () => {
      introTl.kill();
    };
  }, [hasStarted]);

  // 3. Exit Animation (runs when hasStarted changes to true)
  useEffect(() => {
    if (!hasStarted) return;

    const letterS = letterSRef.current;
    const letterK = letterKRef.current;
    const nameContainer = nameRef.current;
    const lens = lensRef.current;

    if (!letterS || !letterK || !nameContainer || !lens) return;

    const exitTl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        onComplete();
      },
    });

    // A. Aperture starts opening instantly and expands completely
    exitTl.to(
      lens,
      {
        width: "300vmax",
        height: "300vmax",
        rotation: 45,
        duration: 1.6,
        ease: "power4.inOut",
        overwrite: true,
      },
      0
    );

    // B. S and K letters slide outward off-screen
    exitTl.to(
      letterS,
      {
        x: -150,
        opacity: 0,
        duration: 1.2,
        ease: "power3.inOut",
      },
      0
    );
    exitTl.to(
      letterK,
      {
        x: 150,
        opacity: 0,
        duration: 1.2,
        ease: "power3.inOut",
      },
      0
    );

    // C. Name container slides up and fades out
    exitTl.to(
      nameContainer,
      {
        y: -100,
        opacity: 0,
        duration: 0.8,
        ease: "power3.inOut",
      },
      0
    );

    return () => {
      exitTl.kill();
    };
  }, [hasStarted, onComplete]);

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
          className="relative flex font-inter text-sm md:text-xl tracking-[0.4em] uppercase whitespace-nowrap transition-transform duration-700 group-hover:scale-105"
          style={{ color: "rgba(255, 255, 255, 0.15)" }}
        >
          {/* Spotlight Effect - only active when hovering */}
          <div
            className="pointer-events-none absolute inset-0 mix-blend-soft-light transition-opacity duration-1000"
            style={{
              background: `radial-gradient(circle 800px at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.1), transparent 40%)`,
              opacity: hasStarted ? 0 : (isHoveringLocal ? 1 : 0)
            }}
          />
          {"Sacha Karpavicius".split("").map((char, i) => (
            <span key={`base-${i}`} className="name-char inline-block">
              {char === " " ? "\u00A0" : char}
            </span>
          ))}

          {/* Spotlight Overlay */}
          <div
            className="absolute inset-0 flex text-white pointer-events-none transition-opacity duration-1000"
            style={{
              WebkitMaskImage: `radial-gradient(100px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)`,
              maskImage: `radial-gradient(100px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)`,
              opacity: hasStarted ? 0 : (isHoveringLocal ? 1 : 0)
            }}
          >
            {"Sacha Karpavicius".split("").map((char, i) => (
              <span key={`spotlight-${i}`} className="name-char inline-block">
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </div>
        </div>

        {/* Click Indicator */}
        <div className={`mt-2 transition-opacity duration-500 ${hasStarted ? 'opacity-0' : 'group-hover:opacity-0'}`}>
          <div className="font-inter text-[7px] md:text-[8px] tracking-[0.4em] uppercase text-white/40 animate-pulse">
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
