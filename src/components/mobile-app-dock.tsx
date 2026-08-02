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
      const isStandaloneMatch = window.matchMedia("(display-mode: standalone)").matches ||
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
      className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[9000] w-[calc(100%-2rem)] max-w-sm"
    >
      <div className="relative overflow-hidden rounded-full bg-[#0c0c0c]/85 backdrop-blur-2xl border border-white/20 p-2 shadow-2xl shadow-black/80 flex items-center justify-around gap-1 text-white">

        {/* Home */}
        <button
          onClick={() => handleNav("/")}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all ${
            pathname === "/" ? "bg-white text-black font-bold scale-105" : "text-white/70 hover:text-white"
          }`}
          aria-label="Accueil"
        >
          <span className="text-sm">🏠</span>
          <span className="text-[10px] tracking-tight">Accueil</span>
        </button>

        {/* Portfolio */}
        <button
          onClick={() => handleNav("/project/1")}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all ${
            pathname.startsWith("/project") ? "bg-white text-black font-bold scale-105" : "text-white/70 hover:text-white"
          }`}
          aria-label="Projets"
        >
          <span className="text-sm">📸</span>
          <span className="text-[10px] tracking-tight">Projets</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={handleToggleSound}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all ${
            isPlaying ? "text-emerald-400 font-bold" : "text-white/70 hover:text-white"
          }`}
          aria-label="Activer ou désactiver le son"
        >
          <span className="text-sm">{isPlaying ? "🔊" : "🔇"}</span>
          <span className="text-[10px] tracking-tight">{isPlaying ? "Son ON" : "Son OFF"}</span>
        </button>

        {/* App Install Button (Hidden if already in standalone app mode) */}
        {!isStandalone && (
          <button
            onClick={handleOpenInstall}
            className="relative flex flex-col items-center justify-center py-1.5 px-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95 border border-white/20"
            aria-label="Installer l'application"
          >
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-sm">📲</span>
            <span className="text-[10px] font-bold tracking-tight text-emerald-300">App</span>
          </button>
        )}
      </div>
    </nav>
  );
}
