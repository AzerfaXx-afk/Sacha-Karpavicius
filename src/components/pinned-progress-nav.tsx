"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSiteContext } from "@/context/site-context";

interface PinnedProgressNavProps {
  lang?: "fr" | "en";
  showUI?: boolean;
}

export default function PinnedProgressNav({ lang = "fr", showUI: customShowUI }: PinnedProgressNavProps) {
  const pathname = usePathname();
  const { hasEnteredSite, isHideUI, isHoveringName } = useSiteContext();

  const fillRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDesktop, setIsDesktop] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Strictly only display on homepage
  const isHomePage = pathname === "/";
  
  // Show UI condition: must be on homepage, and UI explicitly active
  const isVisible = isHomePage && (customShowUI !== undefined ? customShowUI : (hasEnteredSite || isHoveringName) && !isHideUI);

  useEffect(() => {
    if (!isHomePage) return;

    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);

    let rafId: number;

    const updateProgress = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docH > 0 ? Math.min(1, Math.max(0, scrollY / docH)) : 0;

      if (fillRef.current) {
        fillRef.current.style.transform = `scaleY(${progress})`;
      }

      if (headRef.current && containerRef.current) {
        const trackHeight = containerRef.current.clientHeight;
        const currentY = progress * trackHeight;
        headRef.current.style.transform = `translateY(${currentY}px)`;
        headRef.current.style.opacity = progress > 0.005 ? "1" : "0";
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateProgress);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateProgress();

    // Sync with Lenis smooth scroll if present
    const lenis = (window as any).__lenis;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", onScroll);
    }

    // Proximity hover detection near right edge (rightmost 80px)
    const onMouseMove = (e: MouseEvent) => {
      const distanceToRight = window.innerWidth - e.clientX;
      setIsHovered(distanceToRight <= 80);
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", check);
      window.removeEventListener("mousemove", onMouseMove);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", onScroll);
      }
    };
  }, [isHomePage]);

  if (!isHomePage || !isDesktop) return null;

  return (
    <div
      ref={containerRef}
      id="scroll-progress-track"
      style={{
        position: "fixed",
        right: 48,
        top: 62,
        bottom: 62,
        zIndex: 100, // Kept below Preloader (10000) so it never bleeds into intro screen
        pointerEvents: "none",
        width: isHovered ? 3 : 2,
        opacity: isVisible ? (isHovered ? 1 : 0.85) : 0,
        transform: isVisible ? "translateY(0)" : "translateY(12px)",
        transition:
          "opacity 0.7s cubic-bezier(0.76, 0, 0.24, 1), transform 0.7s cubic-bezier(0.76, 0, 0.24, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Track background line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          borderRadius: 9999,
          backgroundColor: "rgba(255, 255, 255, 0.18)",
          maskImage: "linear-gradient(to bottom, transparent 0%, white 3%, white 97%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, white 3%, white 97%, transparent 100%)",
          transition: "background-color 0.3s ease",
        }}
      />

      {/* Progress fill line */}
      <div
        ref={fillRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          borderRadius: 9999,
          background: isHovered
            ? "linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0.95), #ffffff)"
            : "linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0.85), rgba(255,255,255,1))",
          transformOrigin: "top center",
          transform: "scaleY(0)",
          willChange: "transform",
          maskImage: "linear-gradient(to bottom, transparent 0%, white 3%, white 97%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, white 3%, white 97%, transparent 100%)",
          boxShadow: isHovered ? "0 0 8px rgba(255, 255, 255, 0.5)" : "none",
          transition: "box-shadow 0.3s ease",
        }}
      />

      {/* Subtle Awwwards glowing lead dot at exact scroll head */}
      <div
        ref={headRef}
        style={{
          position: "absolute",
          top: -2,
          left: "50%",
          width: 5,
          height: 5,
          marginLeft: -2.5,
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          boxShadow: "0 0 10px 2px rgba(255, 255, 255, 0.85), 0 0 4px rgba(255, 255, 255, 1)",
          transform: "translateY(0px)",
          opacity: 0,
          willChange: "transform, opacity",
          transition: "opacity 0.2s ease",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
