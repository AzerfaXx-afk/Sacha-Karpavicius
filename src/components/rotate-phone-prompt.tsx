"use client";

import React, { useRef, useState, useEffect } from "react";

interface RotatePhonePromptProps {
  onComplete: () => void;
  lang?: "fr" | "en";
}

export default function RotatePhonePrompt({
  onComplete,
  lang = "fr",
}: RotatePhonePromptProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleFinish = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 350);
  };

  useEffect(() => {
    const vid = videoRef.current;
    if (vid) {
      vid.currentTime = 0;
      vid.play().catch(() => {
        // Fallback for browsers requiring user interaction
        vid.muted = true;
        vid.play().catch(() => {});
      });
    }
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleFinish}
      className={`fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center select-none cursor-pointer transition-opacity duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
      }`}
      style={{ touchAction: "none" }}
    >
      {/* 4K Rotate Phone Animation Video with Master Sound */}
      <video
        ref={videoRef}
        src="/Videos/rotate-phone.mp4"
        autoPlay
        playsInline
        preload="auto"
        onEnded={handleFinish}
        className="w-full h-full object-contain pointer-events-none"
        style={{
          imageRendering: "crisp-edges",
        }}
      />

      {/* Top Skip Badge */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white font-inter text-[11px] uppercase tracking-widest active:scale-95 transition-all">
        <span>{lang === "fr" ? "Passer" : "Skip"}</span>
        <span className="font-mono text-xs">→</span>
      </div>

      {/* Bottom Subtitle Hint */}
      <div className="absolute bottom-8 inset-x-0 text-center z-20 px-6 pointer-events-none">
        <p className="font-syne text-[11px] sm:text-[13px] uppercase tracking-[0.2em] text-white/80 font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          {lang === "fr"
            ? "Pivotez votre écran pour l'expérience cinéma"
            : "Rotate your device for the cinema experience"}
        </p>
      </div>
    </div>
  );
}
