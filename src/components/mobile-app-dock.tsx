"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { triggerHaptic } from "@/utils/haptics";
import { useSiteContext } from "@/context/site-context";

export default function MobileAppDock() {
  const { isPlaying, toggleAudio, playClickSfx } = useSiteContext();
  const router = useRouter();
  const pathname = usePathname();

  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkStandalone = () => {
      const isStandaloneMatch =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMatch);
    };
    checkStandalone();
  }, []);

  const handleOpenInstall = () => {
    triggerHaptic("selection");
    playClickSfx();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-pwa-install"));
    }
  };

  const handleNav = (path: string) => {
    triggerHaptic("light");
    playClickSfx();
    if (pathname !== path) {
      router.push(path);
    }
  };

  const handleToggleSound = () => {
    triggerHaptic("medium");
    playClickSfx();
    toggleAudio();
  };

  return (
    <nav
      aria-label="Mobile Application Dock"
      className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-[9000] w-[calc(100%-2.5rem)] max-w-xs"
    >
      <div className="relative overflow-hidden rounded-full bg-[#080808]/90 backdrop-blur-2xl border border-white/20 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.9)] flex items-center justify-around gap-1 text-white">

        {/* Accueil */}
        <button
          onClick={() => handleNav("/")}
          className={`flex flex-col items-center justify-center py-2 px-3.5 rounded-full transition-all duration-300 active:scale-90 ${
            pathname === "/"
              ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)]"
              : "text-white/60 hover:text-white"
          }`}
          aria-label="Accueil"
        >
          <svg className="w-4 h-4 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-[9px] font-mono tracking-tight uppercase">Index</span>
        </button>

        {/* Projets */}
        <button
          onClick={() => handleNav("/project/1")}
          className={`flex flex-col items-center justify-center py-2 px-3.5 rounded-full transition-all duration-300 active:scale-90 ${
            pathname.startsWith("/project")
              ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)]"
              : "text-white/60 hover:text-white"
          }`}
          aria-label="Projets"
        >
          <svg className="w-4 h-4 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-[9px] font-mono tracking-tight uppercase">Galerie</span>
        </button>

        {/* Son Toggle */}
        <button
          onClick={handleToggleSound}
          className={`flex flex-col items-center justify-center py-2 px-3.5 rounded-full transition-all duration-300 active:scale-90 ${
            isPlaying ? "text-emerald-400 font-bold" : "text-white/60 hover:text-white"
          }`}
          aria-label="Activer ou désactiver le son"
        >
          {isPlaying ? (
            <svg className="w-4 h-4 mb-0.5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          ) : (
            <svg className="w-4 h-4 mb-0.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
          <span className="text-[9px] font-mono tracking-tight uppercase">{isPlaying ? "Audio" : "Mute"}</span>
        </button>

        {/* App Install Button */}
        {!isStandalone && (
          <button
            onClick={handleOpenInstall}
            className="relative flex flex-col items-center justify-center py-2 px-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all active:scale-90 border border-white/25"
            aria-label="Installer l'application"
          >
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <svg className="w-4 h-4 mb-0.5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span className="text-[9px] font-mono font-bold tracking-tight text-emerald-300 uppercase">App</span>
          </button>
        )}
      </div>
    </nav>
  );
}
