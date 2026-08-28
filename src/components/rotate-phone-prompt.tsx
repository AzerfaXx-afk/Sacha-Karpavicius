"use client";

import React, { useEffect, useRef } from "react";

interface RotatePhonePromptProps {
  onDismiss?: () => void;
  onForceLandscape: () => void;
  lang?: "fr" | "en";
}

export default function RotatePhonePrompt({
  onDismiss,
  onForceLandscape,
  lang = "fr",
}: RotatePhonePromptProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      const audio = new Audio("/Videos/Rotate Your Phone Animation 4k.mp3");
      audio.volume = 0.85;
      audioRef.current = audio;
      audio.play().catch(() => {});
    } catch (_) {}

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-between p-6 sm:p-8 text-white select-none animate-fade-in"
      style={{ touchAction: "none" }}
    >
      {/* Top Brand Header */}
      <div className="w-full flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-white/70">
            CINÉMA 4K UHD
          </span>
        </div>
        <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
          Sacha Karpavicius
        </span>
      </div>

      {/* Center Cinematic Rotating Phone Stage */}
      <div className="flex flex-col items-center justify-center my-auto space-y-8 max-w-sm">
        {/* Animated Phone Vector Graphic */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-3xl" />

          {/* Rotating Trajectory Orbit Arc */}
          <svg className="absolute inset-0 w-full h-full animate-rotate-arc text-cyan-400/50" viewBox="0 0 100 100" fill="none">
            <path
              d="M 50 12 A 38 38 0 0 1 88 50"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
            <polygon points="88,46 93,52 83,52" fill="currentColor" />
          </svg>

          {/* Rotating Smartphone Device Frame */}
          <div className="relative animate-rotate-phone">
            <div className="w-20 h-36 sm:w-24 sm:h-44 rounded-2xl border-2 border-white/80 bg-black/60 shadow-[0_0_35px_rgba(255,255,255,0.25)] flex flex-col justify-between p-2 relative overflow-hidden backdrop-blur-md">
              {/* Top Speaker / Dynamic Island */}
              <div className="w-8 h-1.5 bg-white/40 rounded-full mx-auto" />

              {/* Center 16:9 Screen Simulation */}
              <div className="w-full flex-1 my-2 rounded-lg bg-gradient-to-tr from-white/10 via-cyan-400/20 to-white/10 flex items-center justify-center border border-white/20">
                <div className="w-6 h-4 rounded border border-white/60 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                </div>
              </div>

              {/* Bottom Home Indicator */}
              <div className="w-10 h-1 bg-white/40 rounded-full mx-auto" />
            </div>
          </div>
        </div>

        {/* Text Instructions */}
        <div className="space-y-3 text-center px-4">
          <h2 className="font-syne font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            {lang === "fr" ? "Pivotez votre écran" : "Rotate your phone"}
          </h2>
          <p className="font-inter text-[12px] sm:text-[13px] text-white/70 leading-relaxed font-light">
            {lang === "fr"
              ? "Pour profiter du cadrage originel et du master 4K, cette vidéo se regarde exclusivement en plein écran horizontal."
              : "To experience original cinematic framing and 4K master quality, this film is viewed exclusively in landscape."}
          </p>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="w-full max-w-sm pb-4 space-y-3">
        <button
          onClick={onForceLandscape}
          className="w-full py-3.5 px-6 rounded-full bg-white text-black font-syne font-bold text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{lang === "fr" ? "Lancer en plein écran horizontal" : "Launch Horizontal Fullscreen"}</span>
          <span className="font-mono text-sm">↗</span>
        </button>
      </div>
    </div>
  );
}
