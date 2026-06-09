"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface PreloaderProps {
  onComplete: () => void;
  onStart: () => void;
}

export default function Preloader({ onComplete, onStart }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const letterSRef = useRef<HTMLHeadingElement>(null);
  const letterKRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const lens = lensRef.current;
    const letterS = letterSRef.current;
    const letterK = letterKRef.current;
    const nameContainer = nameRef.current;

    if (!container || !lens || !letterS || !letterK || !nameContainer) return;

    // Lock scroll completely during preloader
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

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
        nameContainer.style.setProperty("--mouse-x", `${x}px`);
        nameContainer.style.setProperty("--mouse-y", `${y}px`);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Initial state setup regardless of start
    gsap.set(lens, { width: 0, height: 0, rotation: 45, xPercent: -50, yPercent: -50 });
    
    if (!hasStarted) {
      gsap.set([letterS, letterK], { yPercent: 120, opacity: 0 });
      gsap.set(nameContainer.querySelectorAll(".name-char"), { opacity: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        onComplete();
      },
    });

    // 2. Letters slide up
    tl.to(
      [letterS, letterK],
      {
        yPercent: 0,
        opacity: 1,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.1,
      },
      0
    );

    // 3. Open the square aperture partially (camera lens effect)
    tl.to(
      lens,
      {
        width: "25vw",
        height: "25vw",
        rotation: 0,
        duration: 1.5,
        ease: "power3.inOut",
      },
      "-=0.5"
    );

    // 4. Expand the aperture to reveal the entire site
    tl.to(
      lens,
      {
        width: "300vmax",
        height: "300vmax",
        rotation: 45,
        duration: 1.5,
        ease: "power4.inOut",
      },
      "+=0.4"
    );

    // 5. Letters and center name fade out as the aperture opens
    tl.to(
      [letterS, letterK, nameContainer],
      {
        opacity: 0,
        scale: 1.1,
        duration: 1.0,
        ease: "power2.inOut",
      },
      "-=1.2"
    );

    return () => {
      tl.kill();
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
        onClick={() => {
          if (!hasStarted) {
            setHasStarted(true);
            onStart();
          }
        }}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex font-inter text-sm md:text-xl tracking-[0.4em] uppercase whitespace-nowrap z-10 ${hasStarted ? 'pointer-events-none' : 'cursor-pointer hover:scale-105 transition-transform duration-500'}`}
        style={{ color: "rgba(255, 255, 255, 0.15)" }}
      >
        {"Sacha Karpavicius".split("").map((char, i) => (
          <span key={`base-${i}`} className="name-char inline-block">
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
        
        {/* Spotlight Overlay */}
        <div 
          className="absolute inset-0 flex text-white pointer-events-none"
          style={{
            WebkitMaskImage: `radial-gradient(100px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)`,
            maskImage: `radial-gradient(100px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)`,
          }}
        >
          {"Sacha Karpavicius".split("").map((char, i) => (
            <span key={`spotlight-${i}`} className="name-char inline-block">
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Left Letter */}
      <h1
        ref={letterSRef}
        className="absolute bottom-[-2vw] left-4 md:left-12 font-syne font-bold text-[30vw] md:text-[25vw] leading-none text-white/90"
      >
        S
      </h1>

      {/* Bottom Right Letter */}
      <h1
        ref={letterKRef}
        className="absolute bottom-[-2vw] right-4 md:right-12 font-syne font-bold text-[30vw] md:text-[25vw] leading-none text-white/90"
      >
        K
      </h1>
    </div>
  );
}
