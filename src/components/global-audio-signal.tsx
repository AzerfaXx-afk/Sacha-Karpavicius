"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSiteContext } from "@/context/site-context";
import { videoProjectsData } from "@/data/projects";

export default function GlobalAudioSignal() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { isHideUI, isPlaying, toggleAudio, hasEnteredSite, isHoveringName } = useSiteContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isVideoPage = videoProjectsData.some(
    (p) => pathname?.includes(`/project/${p.slug}`) || pathname?.includes(`/project/${p.id}`)
  );

  // On photo project pages, video project pages (PC only), or homepage: show whenever UI is active
  const isProjectPage = pathname?.startsWith("/project/");
  // During SSR and initial hydration (mounted=false), always render hidden to ensure 100% server/client HTML match
  const showUI = mounted && (hasEnteredSite || isHoveringName || isProjectPage) && !isHideUI;

  // On mobile on video pages, hide to prevent overlay clutter; on PC, keep visible so user can control site audio!
  const responsiveDisplay = isVideoPage ? "hidden md:flex" : "flex";

  return (
    <div
      suppressHydrationWarning
      className={`fixed bottom-6 right-6 md:bottom-10 md:right-12 z-[100000] cursor-pointer group flex items-center justify-center gap-[4px] h-8 w-10 p-2 mix-blend-difference transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${responsiveDisplay} ${
        showUI ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        toggleAudio();
      }}
      aria-label={isPlaying ? "Couper le son" : "Activer le son"}
      role="button"
    >
      <div
        className={`w-[3px] rounded-full transition-all duration-300 ease-out ${
          mounted && isPlaying
            ? "bg-white animate-sound-1"
            : "bg-white/45 h-[3px] group-hover:bg-white group-hover:scale-125"
        }`}
      />
      <div
        className={`w-[3px] rounded-full transition-all duration-300 ease-out ${
          mounted && isPlaying
            ? "bg-white animate-sound-2"
            : "bg-white/45 h-[3px] group-hover:bg-white group-hover:scale-125"
        }`}
      />
      <div
        className={`w-[3px] rounded-full transition-all duration-300 ease-out ${
          mounted && isPlaying
            ? "bg-white animate-sound-3"
            : "bg-white/45 h-[3px] group-hover:bg-white group-hover:scale-125"
        }`}
      />
      <div
        className={`w-[3px] rounded-full transition-all duration-300 ease-out ${
          mounted && isPlaying
            ? "bg-white animate-sound-4"
            : "bg-white/45 h-[3px] group-hover:bg-white group-hover:scale-125"
        }`}
      />
    </div>
  );
}
