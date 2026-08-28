"use client";

import { usePathname } from "next/navigation";
import { useSiteContext } from "@/context/site-context";
import { videoProjectsData } from "@/data/projects";

export default function GlobalAudioSignal() {
  const pathname = usePathname();
  const { isHideUI, isPlaying, toggleAudio, hasEnteredSite, isHoveringName } = useSiteContext();

  // Hide ONLY on video pages; keep visible on homepage and photo/image gallery projects!
  const isVideoPage = videoProjectsData.some(
    (p) => pathname?.includes(`/project/${p.slug}`) || pathname?.includes(`/project/${p.id}`)
  );
  if (isVideoPage) {
    return null;
  }

  // On photo project pages or homepage, show whenever UI is not hidden
  const isPhotoProject = pathname?.startsWith("/project/");
  const showUI = (hasEnteredSite || isHoveringName || isPhotoProject) && !isHideUI;

  return (
    <div
      className={`fixed bottom-6 right-6 md:bottom-10 md:right-12 z-[100000] cursor-pointer group flex items-center justify-center gap-[4px] h-4 w-8 mix-blend-difference transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
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
