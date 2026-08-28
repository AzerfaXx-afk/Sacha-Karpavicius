"use client";

import React, { useRef, useState, useEffect } from "react";
import { useSiteContext } from "@/context/site-context";

interface RotatePhonePromptProps {
  onComplete: () => void;
  lang?: "fr" | "en";
}

export default function RotatePhonePrompt({
  onComplete,
  lang = "fr",
}: RotatePhonePromptProps) {
  const { pauseAudio, setIsHideUI } = useSiteContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleFinish = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  useEffect(() => {
    // Cut off background site ambient music immediately
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
  }, [pauseAudio, setIsHideUI]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleFinish}
      className={`fixed inset-0 z-[99999] bg-black flex items-center justify-center select-none cursor-pointer overflow-hidden transition-opacity duration-300 ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
      }`}
      style={{ touchAction: "none" }}
    >
      {/* 4K Pure Rotate Phone Animation Video Fullscreen */}
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
    </div>
  );
}
