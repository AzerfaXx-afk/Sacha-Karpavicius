"use client";

import React, { useRef, useState, useEffect } from "react";
import { useSiteContext } from "@/context/site-context";

interface RotatePhonePromptProps {
  onComplete: () => void;
  lang?: "fr" | "en";
  filmTitle?: string;
}

export default function RotatePhonePrompt({
  onComplete,
  lang = "fr",
  filmTitle,
}: RotatePhonePromptProps) {
  const { pauseAudio, setIsHideUI } = useSiteContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleFinish = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 250);
  };

  useEffect(() => {
    pauseAudio(true);
    setIsHideUI(true);

    const vid = videoRef.current;
    if (vid) {
      vid.currentTime = 0;
      vid.play().catch(() => {
        vid.muted = true;
        vid.play().catch(() => {});
      });
    }

    // Safety fallback: if video stalls or takes too long, complete after 3.2s
    const fallbackTimer = setTimeout(() => {
      handleFinish();
    }, 3200);

    return () => clearTimeout(fallbackTimer);
  }, [pauseAudio, setIsHideUI]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleFinish}
      className={`fixed inset-0 z-[999999] bg-black flex flex-col items-center justify-center select-none cursor-pointer overflow-hidden transition-opacity duration-300 ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
      }`}
      style={{ touchAction: "none" }}
    >
      {/* Rotate Phone Animation Video Fullscreen */}
      <video
        ref={videoRef}
        src="/Videos/rotate-phone.mp4"
        autoPlay
        playsInline
        muted
        preload="auto"
        onEnded={handleFinish}
        className="w-full h-full object-cover sm:object-contain pointer-events-none scale-105 sm:scale-100"
        style={{
          imageRendering: "crisp-edges",
        }}
      />

      {/* Floating Film Badge & Skip Notice */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        {filmTitle && (
          <span className="font-syne font-bold text-xs uppercase tracking-widest text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            {filmTitle}
          </span>
        )}
        <span className="font-mono text-[10px] tracking-wider uppercase text-white/50 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/15">
          {lang === "fr" ? "Touchez pour passer" : "Tap to skip"}
        </span>
      </div>
    </div>
  );
}
