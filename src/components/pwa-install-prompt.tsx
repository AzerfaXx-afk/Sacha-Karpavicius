"use client";

import React, { useState, useEffect } from "react";
import { triggerHaptic } from "@/utils/haptics";
import { useSiteContext } from "@/context/site-context";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PwaInstallPrompt() {
  const { playClickSfx } = useSiteContext();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if running in standalone app mode
    const checkStandalone = () => {
      const isStandaloneMatch =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(isStandaloneMatch);
    };

    checkStandalone();

    // Detect iOS device
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIos(isIosDevice);

    // Capture beforeinstallprompt for Android/Chrome/Windows safely
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

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
        setShowModal(false);
        localStorage.setItem("sacha_pwa_installed", "true");
        triggerHaptic("success");
      }
    }
  };

  const handleCloseModal = () => {
    triggerHaptic("light");
    playClickSfx();
    setShowModal(false);
  };

  // If already running as an installed standalone app, render nothing
  if (isStandalone) {
    return null;
  }

  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#050505] border border-white/10 p-6 md:p-10 shadow-2xl text-white">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <span className="text-[10px] font-mono tracking-[0.3em] text-white/40 uppercase">
              APPLICATION WEB OFFICIELLE
            </span>
            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
              SACHA KARPAVICIUS OS
            </h3>
            <p className="text-xs text-white/50 mt-1 font-mono tracking-wider">
              PORTFOLIO HIGH-END & PROJETS EXCLUSIFS
            </p>
          </div>

          <button
            onClick={handleCloseModal}
            className="w-8 h-8 rounded-full border border-white/20 hover:border-white text-white/70 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* 1-Click Native Install (Android/Chrome/Windows) */}
        {deferredPrompt && (
          <div className="mb-8 p-5 rounded-xl bg-white/[0.03] border border-white/10">
            <p className="text-xs text-white/70 mb-4 font-mono tracking-wide">
              Installation instantanée disponible pour votre navigateur :
            </p>
            <button
              onClick={handleInstallClick}
              className="w-full py-4 px-6 rounded-lg bg-white text-black font-mono font-bold text-xs uppercase tracking-[0.2em] hover:bg-white/90 active:scale-[0.99] transition-all cursor-pointer shadow-lg"
            >
              [ INSTALLER L'APPLICATION ]
            </button>
          </div>
        )}

        {/* Step-by-Step Instructions (for iOS Safari & standard browsers) */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/40">
            {isIos ? "GUIDE D'INSTALLATION IPHONE & IPAD (SAFARI) :" : "INSTRUCTIONS MANUELLES :"}
          </h4>

          <div className="grid gap-3 text-xs font-mono">
            {/* Step 01 */}
            <div className="flex items-center gap-4 p-3.5 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-white/40 text-xs font-bold">01</span>
              <div>
                <p className="text-white/90">
                  Appuyez sur le bouton de Partage Safari <span className="inline-block px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-white">⎋</span>
                </p>
                <p className="text-white/40 text-[10px] mt-0.5">
                  Situé dans la barre d'outils au bas de votre écran.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="flex items-center gap-4 p-3.5 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-white/40 text-xs font-bold">02</span>
              <div>
                <p className="text-white/90">
                  Sélectionnez « Sur l'écran d'accueil » <span className="inline-block px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-white">+</span>
                </p>
                <p className="text-white/40 text-[10px] mt-0.5">
                  Faites défiler le menu vers le bas.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="flex items-center gap-4 p-3.5 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-white/40 text-xs font-bold">03</span>
              <div>
                <p className="text-white/90">
                  Confirmez en appuyant sur « Ajouter »
                </p>
                <p className="text-white/40 text-[10px] mt-0.5">
                  L'application s'ajoutera avec vos applications natives.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase">
            DISPLAY MODE: STANDALONE
          </span>
          <button
            onClick={handleCloseModal}
            className="text-[10px] font-mono tracking-widest text-white/60 hover:text-white uppercase transition-colors cursor-pointer"
          >
            [ FERMER ]
          </button>
        </div>
      </div>
    </div>
  );
}
