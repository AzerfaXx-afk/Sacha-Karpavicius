"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { triggerHaptic } from "@/utils/haptics";
import { useSiteContext } from "@/context/site-context";
import { useLenis } from "@studio-freight/react-lenis";
import { triggerPageTransition } from "@/utils/page-transition";

export default function MobileAppDock() {
  const { isPlaying, toggleAudio, playClickSfx, isHideUI } = useSiteContext();
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();

  const [activeSection, setActiveSection] = useState<string>("home");

  // Track active section on homepage
  useEffect(() => {
    if (pathname !== "/") return;

    const sections = ["photos", "videos", "about", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pathname]);

  const scrollToSection = (hash: string) => {
    triggerHaptic("light");
    playClickSfx();

    if (pathname !== "/") {
      sessionStorage.setItem("targetSection", hash);
      triggerPageTransition(router, "/" + hash);
      return;
    }

    if (hash === "#") {
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      try {
        window.history.replaceState(null, "", "/");
      } catch (_) {}
      return;
    }

    const target = document.querySelector(hash);
    if (target) {
      if (lenis) {
        lenis.scrollTo(target as HTMLElement, {
          offset: 0,
          duration: 1.4,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
      try {
        window.history.replaceState(null, "", hash);
      } catch (_) {}
    }
  };

  const handleToggleSound = () => {
    triggerHaptic("medium");
    playClickSfx();
    toggleAudio();
  };

  if (isHideUI) return null;

  return (
    <nav
      aria-label="Mobile Application Dock"
      className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[8000] w-[calc(100%-2rem)] max-w-sm pointer-events-auto transition-all duration-500"
    >
      <div className="relative overflow-hidden rounded-full bg-[#080808]/90 backdrop-blur-2xl border border-white/20 px-2 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.9)] flex items-center justify-between gap-1 text-white">
        {/* Accueil */}
        <button
          onClick={() => scrollToSection("#")}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-300 active:scale-90 ${
            pathname === "/" && (!activeSection || activeSection === "home")
              ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)]"
              : "text-white/60 hover:text-white"
          }`}
          aria-label="Accueil"
        >
          <svg className="w-3.5 h-3.5 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          <span className="text-[8px] font-mono tracking-tight uppercase">Index</span>
        </button>

        {/* Photos */}
        <button
          onClick={() => scrollToSection("#photos")}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-300 active:scale-90 ${
            activeSection === "photos" && pathname === "/"
              ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)]"
              : "text-white/60 hover:text-white"
          }`}
          aria-label="Photos"
        >
          <svg className="w-3.5 h-3.5 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-[8px] font-mono tracking-tight uppercase">Photo</span>
        </button>

        {/* Vidéos */}
        <button
          onClick={() => scrollToSection("#videos")}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-300 active:scale-90 ${
            activeSection === "videos" && pathname === "/"
              ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)]"
              : "text-white/60 hover:text-white"
          }`}
          aria-label="Vidéos"
        >
          <svg className="w-3.5 h-3.5 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span className="text-[8px] font-mono tracking-tight uppercase">Vidéo</span>
        </button>

        {/* À Propos */}
        <button
          onClick={() => scrollToSection("#about")}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-300 active:scale-90 ${
            activeSection === "about" && pathname === "/"
              ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)]"
              : "text-white/60 hover:text-white"
          }`}
          aria-label="À Propos"
        >
          <svg className="w-3.5 h-3.5 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span className="text-[8px] font-mono tracking-tight uppercase">Bio</span>
        </button>

        {/* Son Toggle */}
        <button
          onClick={handleToggleSound}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-300 active:scale-90 ${
            isPlaying ? "text-emerald-400 font-bold" : "text-white/60 hover:text-white"
          }`}
          aria-label="Son"
        >
          {isPlaying ? (
            <svg className="w-3.5 h-3.5 mb-0.5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 mb-0.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
          <span className="text-[8px] font-mono tracking-tight uppercase">{isPlaying ? "Audio" : "Mute"}</span>
        </button>
      </div>
    </nav>
  );
}
