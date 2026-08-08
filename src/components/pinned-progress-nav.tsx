"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useSiteContext } from "@/context/site-context";
import { triggerHaptic } from "@/utils/haptics";

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
  const hitBoxRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Strictly only display on homepage
  const isHomePage = pathname === "/";
  
  // Show UI condition: must be on homepage, and UI explicitly active
  const isVisible = isHomePage && (customShowUI !== undefined ? customShowUI : (hasEnteredSite || isHoveringName) && !isHideUI);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update progress visuals synchronously
  const updateProgressVisuals = useCallback((progress: number) => {
    const clamped = Math.min(1, Math.max(0, progress));
    setScrollPercent(Math.round(clamped * 100));

    if (fillRef.current) {
      fillRef.current.style.transform = `scaleY(${clamped})`;
    }

    if (headRef.current && containerRef.current) {
      const trackHeight = containerRef.current.clientHeight;
      const currentY = clamped * trackHeight;
      headRef.current.style.transform = `translateY(${currentY}px)`;
      headRef.current.style.opacity = clamped > 0.002 ? "1" : "0";
    }
  }, []);

  // Sync scroll on window / Lenis scroll
  useEffect(() => {
    if (!isHomePage) return;

    let rafId: number;

    const updateProgress = () => {
      if (isDragging) return; // Ignore window scroll updates while user is actively scrubbing
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docH > 0 ? scrollY / docH : 0;
      updateProgressVisuals(progress);
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

    // Proximity hover detection near right edge (rightmost 80px on desktop)
    const onMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const distanceToRight = window.innerWidth - e.clientX;
      setIsHovered(distanceToRight <= 80);
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", onScroll);
      }
    };
  }, [isHomePage, isDragging, updateProgressVisuals]);

  // Handle Scrub / Drag calculation
  const handleScrub = useCallback((clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetY = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const progress = rect.height > 0 ? offsetY / rect.height : 0;

    updateProgressVisuals(progress);

    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = progress * docH;

    // Instant Lenis or native window scroll update
    const lenis = (window as any).__lenis;
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(targetY, { immediate: true });
    } else {
      window.scrollTo({ top: targetY, behavior: "instant" });
    }
  }, [updateProgressVisuals]);

  // Pointer Event Handlers for Mouse & Touch Scrubbing
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    setIsDragging(true);
    triggerHaptic("selection");
    handleScrub(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.stopPropagation();
    handleScrub(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
    setIsDragging(false);
    triggerHaptic("light");
  };

  if (!isHomePage) return null;

  const rightMargin = isMobile ? 12 : 48;
  const topMargin = isMobile ? 70 : 62;
  const bottomMargin = isMobile ? 80 : 62;

  return (
    <div
      ref={hitBoxRef}
      id="scroll-progress-hitbox"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: "fixed",
        right: rightMargin - 16, // Center 34px hit area on progress line
        top: topMargin,
        bottom: bottomMargin,
        zIndex: 100, // Under Preloader (10000)
        width: 34,
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
        pointerEvents: isVisible ? "auto" : "none",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.7s cubic-bezier(0.76, 0, 0.24, 1)",
      }}
      aria-label="Progress scroll bar"
      role="slider"
      aria-valuenow={scrollPercent}
    >
      {/* Visual Bar Track Container */}
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: isDragging ? 4 : isHovered ? 3 : 2,
          transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
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
            background: isDragging || isHovered
              ? "linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.98), #ffffff)"
              : "linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0.85), rgba(255,255,255,1))",
            transformOrigin: "top center",
            transform: "scaleY(0)",
            willChange: "transform",
            maskImage: "linear-gradient(to bottom, transparent 0%, white 3%, white 97%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, white 3%, white 97%, transparent 100%)",
            boxShadow: isDragging || isHovered ? "0 0 12px rgba(255, 255, 255, 0.7)" : "none",
            transition: "box-shadow 0.3s ease",
          }}
        />

        {/* Awwwards glowing lead dot at exact scroll head */}
        <div
          ref={headRef}
          style={{
            position: "absolute",
            top: -3,
            left: "50%",
            width: isDragging ? 8 : isHovered ? 6 : 5,
            height: isDragging ? 8 : isHovered ? 6 : 5,
            marginLeft: isDragging ? -4 : isHovered ? -3 : -2.5,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            boxShadow: isDragging
              ? "0 0 16px 4px rgba(255, 255, 255, 1), 0 0 8px rgba(255, 255, 255, 1)"
              : "0 0 10px 2px rgba(255, 255, 255, 0.85), 0 0 4px rgba(255, 255, 255, 1)",
            transform: "translateY(0px)",
            opacity: 0,
            willChange: "transform, opacity",
            transition: "width 0.2s ease, height 0.2s ease, margin 0.2s ease, opacity 0.2s ease",
            pointerEvents: "none",
          }}
        >
          {/* Floating Drag Percentage HUD Badge */}
          <div
            style={{
              position: "absolute",
              right: 18,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: isDragging || isHovered ? 1 : 0,
              pointerEvents: "none",
              transition: "opacity 0.25s ease, transform 0.25s ease",
              backgroundColor: "rgba(10, 10, 10, 0.85)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: 4,
              padding: "2px 6px",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontFamily: "monospace", fontSize: 10, color: "#ffffff", letterSpacing: "0.05em" }}>
              {scrollPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
