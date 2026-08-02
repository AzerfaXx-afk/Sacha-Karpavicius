"use client";

import React, { useState, useEffect } from "react";
import { triggerHaptic } from "@/utils/haptics";
import { useSiteContext } from "@/context/site-context";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PwaInstallPrompt() {
  const { playClickSfx, isHideUI } = useSiteContext();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if running in standalone app mode
    const checkStandalone = () => {
      const isStandaloneMatch =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(isStandaloneMatch);
      return isStandaloneMatch;
    };

    const standalone = checkStandalone();

    // Detect iOS device
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIos(isIosDevice);

    const dismissed = localStorage.getItem("sacha_pwa_dismissed");

    // Capture beforeinstallprompt for Android/Chrome/Windows
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Always show banner on landing for non-standalone users if not dismissed
    if (!dismissed && !standalone) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    triggerHaptic("heavy");
    playClickSfx();

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowBanner(false);
        localStorage.setItem("sacha_pwa_installed", "true");
        triggerHaptic("success");
      }
    } else {
      setShowGuide(!showGuide);
    }
  };

  const handleDismiss = () => {
    triggerHaptic("light");
    playClickSfx();
    setShowBanner(false);
    localStorage.setItem("sacha_pwa_dismissed", "true");
  };

  // Do not render if standalone app, dismissed, or if UI is hidden
  if (isStandalone || !showBanner || isHideUI) {
    return null;
  }

  return (
    <aside
      aria-label="Application web installable"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[99999] w-[94%] max-w-md bg-[#080808]/95 border border-white/15 backdrop-blur-2xl rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_35px_rgba(255,255,255,0.08)] text-white animate-fade-in transition-all duration-500"
    >
      <div className="flex items-center gap-3.5">
        {/* App Icon Badge */}
        <div className="w-11 h-11 rounded-xl bg-black border border-white/20 overflow-hidden shrink-0 shadow-md p-1 flex items-center justify-center">
          <img
            src="/icon-192.png"
            alt="Sacha Karpavicius App Icon"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-mono tracking-[0.2em] text-white/40 uppercase">
              APPLICATION WEB DISPONIBLE
            </span>
          </div>
          <h4 className="text-xs font-syne font-bold uppercase tracking-wider text-white truncate mt-0.5">
            SACHA KARPAVICIUS OS
          </h4>
          <p className="text-[10px] text-white/60 font-mono truncate">
            {deferredPrompt
              ? "Installer sur votre appareil (1-clic)"
              : isIos
              ? "Ajouter à l'écran d'accueil iOS"
              : "Installer l'application sur PC / Mobile"}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleInstallClick}
          className="px-3.5 py-2.5 rounded-lg bg-white text-black font-mono font-bold text-[10px] uppercase tracking-wider hover:bg-white/90 active:scale-95 transition-all cursor-pointer shrink-0 shadow-md flex items-center gap-1.5"
        >
          <span>INSTALLER</span>
          <span className="text-xs">📲</span>
        </button>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 text-white/50 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer shrink-0"
          aria-label="Masquer la notification"
        >
          ✕
        </button>
      </div>

      {/* Guide Tooltip for Manual / iOS Installation */}
      {showGuide && (
        <div className="mt-3 pt-3 border-t border-white/10 text-[10px] font-mono space-y-2 text-white/80 animate-fade-in">
          {isIos ? (
            <>
              <p className="text-white/50">Pour installer sur iOS Safari :</p>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">1</span>
                <span>Appuyez sur le bouton Partager <strong className="text-white">⎋</strong> dans Safari</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">2</span>
                <span>Sélectionnez <strong className="text-white">« Sur l'écran d'accueil » ⊕</strong></span>
              </div>
            </>
          ) : (
            <>
              <p className="text-white/50">Pour installer l'application sur ce navigateur :</p>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">1</span>
                <span>Cliquez sur l'icône <strong className="text-white">« ⤓ Installer »</strong> dans la barre d'adresse</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">2</span>
                <span>Ou ouvrez le menu <strong className="text-white">⋮ → Applications → Installer ce site</strong></span>
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
