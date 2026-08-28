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
  const [isFlinging, setIsFlinging] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Velocity & Inertia physics refs
  const lastPointerYRef = useRef<number>(0);
  const lastPointerTimeRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const flingRafRef = useRef<number | null>(null);
  const currentProgressRef = useRef<number>(0);

  // Strictly only display on homepage
  const isHomePage = pathname === "/";
  
  // Show UI condition: must be on homepage and UI explicitly active
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
    currentProgressRef.current = clamped;
    setScrollPercent(Math.round(clamped * 100));

    if (fillRef.current) {
      fillRef.current.style.transform = `scaleY(${clamped})`;
    }

    if (headRef.current && containerRef.current) {
      const trackHeight = containerRef.current.clientHeight;
      const currentY = clamped * trackHeight;
      headRef.current.style.transform = `translateY(${currentY}px)`;
      // Hide glowing orb at 0% (top) AND at 100% (bottom)
      headRef.current.style.opacity = clamped > 0.002 && clamped < 0.998 ? "1" : "0";
    }
  }, []);

  // 5-Point Milestone Calibration (0% Hero -> 25% Photos -> 50% Videos -> 75% About -> 100% Contact)
  const getCalibratedScrollProgress = useCallback((scrollY: number): number => {
    if (typeof document === "undefined") return 0;
    const photosEl = document.getElementById("photos");
    const videosEl = document.getElementById("videos");
    const aboutEl = document.getElementById("about");
    const contactEl = document.getElementById("contact");

    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (docH <= 0) return 0;

    if (!photosEl || !videosEl || !aboutEl || !contactEl) {
      return Math.min(1, Math.max(0, scrollY / docH));
    }

    const yHero = 0;
    const yPhotos = photosEl.offsetTop;
    const yVideos = videosEl.offsetTop;
    const yAbout = aboutEl.offsetTop;
    const yContact = Math.min(contactEl.offsetTop, docH);

    if (scrollY <= yHero) return 0;

    // Interval 0: Hero -> Photos (0% to 25%)
    if (scrollY < yPhotos) {
      const ratio = (scrollY - yHero) / Math.max(1, yPhotos - yHero);
      return ratio * 0.25;
    }
    // Interval 1: Photos -> Videos (25% to 50%)
    if (scrollY < yVideos) {
      const ratio = (scrollY - yPhotos) / Math.max(1, yVideos - yPhotos);
      return 0.25 + ratio * 0.25;
    }
    // Interval 2: Videos -> About (50% to 75%)
    if (scrollY < yAbout) {
      const ratio = (scrollY - yVideos) / Math.max(1, yAbout - yVideos);
      return 0.50 + ratio * 0.25;
    }
    // Interval 3: About -> Contact (75% to 100%)
    const span = Math.max(1, docH - yAbout);
    const ratio = (scrollY - yAbout) / span;
    return Math.min(1, 0.75 + ratio * 0.25);
  }, []);

  const getScrollYFromProgress = useCallback((progress: number): number => {
    if (typeof document === "undefined") return 0;
    const photosEl = document.getElementById("photos");
    const videosEl = document.getElementById("videos");
    const aboutEl = document.getElementById("about");
    const contactEl = document.getElementById("contact");
    const docH = document.documentElement.scrollHeight - window.innerHeight;

    if (docH <= 0) return 0;
    if (!photosEl || !videosEl || !aboutEl || !contactEl) {
      return progress * docH;
    }

    const yHero = 0;
    const yPhotos = photosEl.offsetTop;
    const yVideos = videosEl.offsetTop;
    const yAbout = aboutEl.offsetTop;
    const yContact = docH;

    if (progress <= 0) return 0;
    if (progress >= 1) return docH;

    // 0% -> 25% (Hero -> Photos)
    if (progress < 0.25) {
      const ratio = progress / 0.25;
      return yHero + ratio * (yPhotos - yHero);
    }
    // 25% -> 50% (Photos -> Videos)
    if (progress < 0.50) {
      const ratio = (progress - 0.25) / 0.25;
      return yPhotos + ratio * (yVideos - yPhotos);
    }
    // 50% -> 75% (Videos -> About)
    if (progress < 0.75) {
      const ratio = (progress - 0.50) / 0.25;
      return yVideos + ratio * (yAbout - yVideos);
    }
    // 75% -> 100% (About -> Contact)
    const ratio = (progress - 0.75) / 0.25;
    return yAbout + ratio * (yContact - yAbout);
  }, []);

  // Sync scroll on window / Lenis scroll
  useEffect(() => {
    if (!isHomePage) return;

    let rafId: number;

    const updateProgress = () => {
      if (isDragging || isFlinging) return; // Ignore window scroll updates while user is scrubbing/flinging
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const progress = getCalibratedScrollProgress(scrollY);
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

    // Proximity hover detection near right edge (rightmost 90px on desktop)
    const onMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const distanceToRight = window.innerWidth - e.clientX;
      setIsHovered(distanceToRight <= 90);
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
  }, [isHomePage, isDragging, isFlinging, updateProgressVisuals, getCalibratedScrollProgress]);

  // Handle Scrub / Drag calculation
  const handleScrub = useCallback((clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetY = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const progress = rect.height > 0 ? offsetY / rect.height : 0;

    updateProgressVisuals(progress);
    const targetY = getScrollYFromProgress(progress);

    // Instant Lenis or native window scroll update
    const lenis = (window as any).__lenis;
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(targetY, { immediate: true });
    } else {
      window.scrollTo({ top: targetY, behavior: "instant" });
    }
  }, [updateProgressVisuals, getScrollYFromProgress]);

  // Launch / Fling Inertia Loop
  const startFlingInertia = useCallback(() => {
    if (!containerRef.current) return;
    if (flingRafRef.current) cancelAnimationFrame(flingRafRef.current);

    setIsFlinging(true);
    let lastTime = performance.now();

    const step = (now: number) => {
      const dt = Math.min(32, now - lastTime);
      lastTime = now;

      if (!containerRef.current) {
        setIsFlinging(false);
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const trackHeight = rect.height;
      if (trackHeight <= 0) {
        setIsFlinging(false);
        return;
      }

      // Move current progress based on velocity
      let currentProgress = currentProgressRef.current + (velocityRef.current * dt) / trackHeight;

      // Handle boundaries with subtle bounce damping
      if (currentProgress < 0) {
        currentProgress = 0;
        velocityRef.current = -velocityRef.current * 0.25; // Subtle classy bounce off top
        triggerHaptic("light");
      } else if (currentProgress > 1) {
        currentProgress = 1;
        velocityRef.current = -velocityRef.current * 0.25; // Subtle classy bounce off bottom
        triggerHaptic("light");
      }

      // Smooth, natural friction decay (~0.89 per 16ms frame)
      velocityRef.current *= Math.pow(0.89, dt / 16);

      // Apply visuals & update scroll position
      updateProgressVisuals(currentProgress);
      const targetY = getScrollYFromProgress(currentProgress);

      const lenis = (window as any).__lenis;
      if (lenis && typeof lenis.scrollTo === "function") {
        lenis.scrollTo(targetY, { immediate: true });
      } else {
        window.scrollTo({ top: targetY, behavior: "instant" });
      }

      // Continue loop until velocity is negligible
      if (Math.abs(velocityRef.current) > 0.004) {
        flingRafRef.current = requestAnimationFrame(step);
      } else {
        velocityRef.current = 0;
        setIsFlinging(false);
        flingRafRef.current = null;
      }
    };

    flingRafRef.current = requestAnimationFrame(step);
  }, [updateProgressVisuals, getScrollYFromProgress]);

  // Pointer Event Handlers for Mouse & Touch Scrubbing
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    if (flingRafRef.current) {
      cancelAnimationFrame(flingRafRef.current);
      flingRafRef.current = null;
    }

    setIsFlinging(false);
    setIsDragging(true);
    lastPointerYRef.current = e.clientY;
    lastPointerTimeRef.current = performance.now();
    velocityRef.current = 0;

    triggerHaptic("selection");
    handleScrub(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.stopPropagation();

    const now = performance.now();
    const dt = Math.max(1, now - lastPointerTimeRef.current);
    const dy = e.clientY - lastPointerYRef.current;
    
    // Instant velocity in px/ms
    const instVel = dy / dt;
    // Exponential smoothing & clamp max velocity for classy, non-exaggerated fling
    const smoothedVel = velocityRef.current * 0.4 + instVel * 0.6;
    velocityRef.current = Math.min(1.2, Math.max(-1.2, smoothedVel));

    lastPointerYRef.current = e.clientY;
    lastPointerTimeRef.current = now;

    handleScrub(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    setIsDragging(false);

    const now = performance.now();
    const timeSinceLastMove = now - lastPointerTimeRef.current;

    // If pointer stopped moving for > 70ms before release, kill velocity (no accidental fling)
    if (timeSinceLastMove > 70) {
      velocityRef.current = 0;
      triggerHaptic("light");
    } else if (Math.abs(velocityRef.current) > 0.08) {
      // Launch / fling glowing orb with silky, natural momentum!
      triggerHaptic("medium");
      startFlingInertia();
    } else {
      triggerHaptic("light");
    }
  };

  if (!isHomePage) return null;

  const rightMargin = isMobile ? 22 : 58;
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
          width: isDragging || isFlinging ? 4 : isHovered ? 3 : 2,
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
            background: isDragging || isFlinging || isHovered
              ? "linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.98), #ffffff)"
              : "linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0.85), rgba(255,255,255,1))",
            transformOrigin: "top center",
            transform: "scaleY(0)",
            willChange: "transform",
            maskImage: "linear-gradient(to bottom, transparent 0%, white 3%, white 97%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, white 3%, white 97%, transparent 100%)",
            boxShadow: isDragging || isFlinging || isHovered ? "0 0 14px rgba(255, 255, 255, 0.8)" : "none",
            transition: "box-shadow 0.3s ease",
          }}
        />

        {/* Awwwards glowing lead dot / luminescent orb at exact scroll head */}
        <div
          ref={headRef}
          style={{
            position: "absolute",
            top: -3,
            left: "50%",
            width: isDragging || isFlinging ? 9 : isHovered ? 7 : 5,
            height: isDragging || isFlinging ? 9 : isHovered ? 7 : 5,
            marginLeft: isDragging || isFlinging ? -4.5 : isHovered ? -3.5 : -2.5,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            boxShadow: isDragging || isFlinging
              ? "0 0 20px 5px rgba(255, 255, 255, 1), 0 0 10px rgba(255, 255, 255, 1)"
              : isHovered
              ? "0 0 14px 3px rgba(255, 255, 255, 0.9), 0 0 6px rgba(255, 255, 255, 1)"
              : "0 0 10px 2px rgba(255, 255, 255, 0.85), 0 0 4px rgba(255, 255, 255, 1)",
            transform: "translateY(0px)",
            opacity: 0,
            willChange: "transform, opacity",
            transition: "width 0.2s ease, height 0.2s ease, margin 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease",
            pointerEvents: "none",
          }}
        >
          {/* Floating Pure Awwwards Typography Percentage on the RIGHT of the line (No Box / Square) */}
          <div
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: `translateY(-50%) scale(${isDragging || isFlinging ? 1.1 : isHovered ? 1.03 : 1})`,
              opacity: isDragging || isHovered || isFlinging ? 1 : 0,
              pointerEvents: "none",
              transition: "opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              display: "flex",
              alignItems: "baseline",
              gap: "1px",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                fontFamily: "'Syne', var(--font-syne), 'Inter', sans-serif",
                fontSize: isMobile ? 11 : 13,
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.02em",
                textShadow: "0 0 14px rgba(255, 255, 255, 0.7), 0 0 4px rgba(255, 255, 255, 0.9)",
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}
            >
              {scrollPercent.toString().padStart(2, "0")}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 8,
                color: "rgba(255, 255, 255, 0.6)",
                fontWeight: 500,
                marginLeft: 1,
                textShadow: "0 0 8px rgba(255, 255, 255, 0.4)",
              }}
            >
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

