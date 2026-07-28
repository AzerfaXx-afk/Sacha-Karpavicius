"use client";

import React, { useEffect, useState } from "react";

interface ScrollIndicatorProps {
  isLocked: boolean;
}

export default function ScrollIndicator({ isLocked }: ScrollIndicatorProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // When unlocked and at top, show indicator after 200ms delay
    if (!isLocked && typeof window !== "undefined") {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      if (scrollY <= 20) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 200);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [isLocked]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      if (scrollY > 25) {
        setHasScrolled(true);
        setIsVisible(false);
      } else if (!isLocked && scrollY <= 10) {
        setHasScrolled(false);
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLocked]);

  const active = isVisible && !hasScrolled && !isLocked;

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        active ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
      }`}
    >
      {/* Desktop Minimalist Animated Mouse Icon */}
      <div className="hidden md:flex items-center justify-center">
        <div className="w-5 h-9 rounded-full border-2 border-white/70 flex justify-center pt-2 shadow-[0_0_20px_rgba(0,0,0,0.6)] bg-black/40 backdrop-blur-md">
          <div className="w-1 h-2.5 bg-white rounded-full animate-[scrollWheel_1.8s_infinite]" />
        </div>
      </div>

      {/* Mobile Minimalist Touch Gesture Swipe Icon */}
      <div className="flex md:hidden items-center justify-center">
        <div className="w-9 h-9 rounded-full border-2 border-white/60 bg-black/50 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.6)]">
          <svg
            className="w-5 h-5 text-white animate-[swipeUp_1.6s_infinite]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
          </svg>
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollWheel {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          60% {
            opacity: 1;
            transform: translateY(7px);
          }
          100% {
            opacity: 0;
            transform: translateY(10px);
          }
        }
        @keyframes swipeUp {
          0% {
            opacity: 0.3;
            transform: translateY(4px);
          }
          50% {
            opacity: 1;
            transform: translateY(-4px);
          }
          100% {
            opacity: 0.3;
            transform: translateY(4px);
          }
        }
      `}</style>
    </div>
  );
}
