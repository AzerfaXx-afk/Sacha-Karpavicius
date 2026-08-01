"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "@studio-freight/react-lenis";

export default function PullToRefresh({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  // Disable pull-to-refresh on all project pages
  if (pathname !== "/") {
    return <>{children}</>;
  }
  
  const startY = useRef(0);
  const isScrollingDownRef = useRef(false);
  const isTouchFromTopRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useEffect(() => {
    // Preload camera shutter click sound
    audioRef.current = new Audio("/click.mp3");
    audioRef.current.volume = 0.2;
    audioRef.current.preload = "auto";
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleTouchStart = (e: TouchEvent) => {
      // Disable pull-to-refresh if the preloader is still active
      const isPreloaderActive = typeof document !== "undefined" && !!document.querySelector('[data-preloader="true"]');
      if (isPreloaderActive) return;

      const currentScroll = lenisRef.current ? lenisRef.current.scroll : window.scrollY;
      if (currentScroll > 5 || isRefreshing) return;

      const touchY = e.touches[0].clientY;
      startY.current = touchY;
      isTouchFromTopRef.current = touchY <= 120;
      isScrollingDownRef.current = false;
      setIsPulling(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const isPreloaderActive = typeof document !== "undefined" && !!document.querySelector('[data-preloader="true"]');
      if (isPreloaderActive || isRefreshing) return;

      // If the touch did NOT start near the very top of the page, allow native scrolling freely
      if (!isTouchFromTopRef.current) return;

      const currentScroll = lenisRef.current ? lenisRef.current.scroll : window.scrollY;
      // If we are already determined to be scrolling down the page, ignore
      if (currentScroll > 5 || isScrollingDownRef.current) return;
      
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      if (diff > 0) {
        // User is swiping down from top -> activate Pull-to-Refresh
        setIsPulling(true);
        const distance = Math.min(120, Math.pow(diff, 0.82));
        
        if (e.cancelable) {
          e.preventDefault();
        }
        setPullDistance(distance);
      } else if (diff < -5) {
        // User is swiping up to scroll down -> release pull state and let browser handle scroll
        isScrollingDownRef.current = true;
        isTouchFromTopRef.current = false;
        setIsPulling(false);
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      isScrollingDownRef.current = false;
      isTouchFromTopRef.current = false;
      if (!isPulling || isRefreshing) {
        setIsPulling(false);
        return;
      }
      setIsPulling(false);

      if (pullDistance >= 85) {
        // Refresh threshold met
        setIsRefreshing(true);
        setPullDistance(50); // Settle shutter at refreshing resting position
        
        // Play shutter sound click
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }

        // Reload page after standard animation delay
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        // Snap back to top
        setPullDistance(0);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isPulling, pullDistance, isRefreshing]);

  // Map pulling distance to styles
  const translateY = isRefreshing ? 55 : pullDistance;
  const rotation = pullDistance * 3.5;
  const scale = Math.min(1, pullDistance / 85);
  const opacity = isRefreshing ? 1 : Math.min(0.85, pullDistance / 60);

  // Check if we should render the indicator container visible
  const isVisible = pullDistance > 0 || isRefreshing;

  return (
    <>
      {/* Custom Pull-To-Refresh Shutter Indicator */}
      <div 
        className="fixed left-1/2 -translate-x-1/2 z-[150] pointer-events-none flex flex-col items-center justify-center"
        style={{
          top: "-45px",
          transform: `translate3d(-50%, ${translateY}px, 0)`,
          opacity: isVisible ? opacity : 0,
          transition: isPulling ? "none" : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease"
        }}
      >
        <div className="w-12 h-12 bg-black/45 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center shadow-2xl">
          {/* Shutter Icon (Camera Lens Aperture) */}
          <svg 
            className={`w-6 h-6 text-white ${isRefreshing ? "animate-[spin_1s_linear_infinite]" : ""}`}
            style={{
              transform: isRefreshing ? undefined : `rotate(${rotation}deg) scale(${scale})`,
              transition: isRefreshing ? "none" : (isPulling ? "none" : "transform 0.3s ease")
            }}
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
          >
            {/* Shutter blades */}
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3a9 9 0 00-6.36 2.64L12 12V3z" fill="currentColor" fillOpacity="0.08" />
            <path d="M21 12a9 9 0 00-2.64-6.36L12 12h9z" fill="currentColor" fillOpacity="0.08" />
            <path d="M12 21a9 9 0 006.36-2.64L12 12v9z" fill="currentColor" fillOpacity="0.08" />
            <path d="M3 12a9 9 0 002.64 6.36L12 12H3z" fill="currentColor" fillOpacity="0.08" />
            {/* Dividing lines */}
            <line x1="12" y1="3" x2="12" y2="12" />
            <line x1="21" y1="12" x2="12" y2="12" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="3" y1="12" x2="12" y2="12" />
          </svg>
        </div>
      </div>
      
      {/* Content push down animation */}
      <div 
        className="w-full min-h-full"
        style={{
          transform: isRefreshing 
            ? "translate3d(0, 45px, 0)" 
            : pullDistance > 0 
              ? `translate3d(0, ${pullDistance * 0.4}px, 0)` 
              : "none",
          transition: isPulling ? "none" : "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)"
        }}
      >
        {children}
      </div>
    </>
  );
}
