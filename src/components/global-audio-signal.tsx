"use client";

import { useSiteContext } from "@/context/site-context";

export default function GlobalAudioSignal() {
  const { isHideUI, isPlaying, toggleAudio, hasEnteredSite, isHoveringName } = useSiteContext();

  const showUI = (hasEnteredSite || isHoveringName) && !isHideUI;

  return (
    <div
      className={`hidden md:flex fixed bottom-6 right-6 md:bottom-10 md:right-12 z-[100000] cursor-pointer group items-center justify-center gap-[4px] h-4 w-8 mix-blend-difference transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        showUI ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      onClick={toggleAudio}
      aria-label="Toggle music"
      role="button"
    >
      <div
        className={`w-[3px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          isPlaying
            ? "bg-white animate-sound-1"
            : "bg-white/40 h-[3px] group-hover:h-[6px] group-hover:bg-white"
        }`}
      />
      <div
        className={`w-[3px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          isPlaying
            ? "bg-white animate-sound-2"
            : "bg-white/40 h-[3px] group-hover:h-[10px] group-hover:bg-white"
        }`}
      />
      <div
        className={`w-[3px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          isPlaying
            ? "bg-white animate-sound-3"
            : "bg-white/40 h-[3px] group-hover:h-[6px] group-hover:bg-white"
        }`}
      />
      <div
        className={`w-[3px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          isPlaying
            ? "bg-white animate-sound-4"
            : "bg-white/40 h-[3px] group-hover:h-[8px] group-hover:bg-white"
        }`}
      />
    </div>
  );
}
