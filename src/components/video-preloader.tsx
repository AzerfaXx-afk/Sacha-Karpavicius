"use client";

import { useEffect, useState } from "react";
import { videoProjectsData } from "@/data/projects";

export default function VideoPreloader() {
  const [shouldWarmup, setShouldWarmup] = useState(false);

  useEffect(() => {
    // Start warming up video cache immediately — don't wait for site entry
    const timer = setTimeout(() => setShouldWarmup(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!shouldWarmup || typeof document === "undefined") return;

    // Collect all video URLs that need preloading
    const allVideoUrls: string[] = [
      "/Videos/rotate-phone.mp4",
      ...videoProjectsData.map((vp) => vp.previewVideoUrl).filter(Boolean) as string[],
      ...videoProjectsData.map((vp) => vp.mobileVideoUrl).filter(Boolean) as string[],
      ...videoProjectsData.map((vp) => vp.videoUrl).filter(Boolean) as string[],
    ];

    // 1. Programmatic video element load to trigger browser media pipeline
    allVideoUrls.forEach((url) => {
      try {
        const v = document.createElement("video");
        v.preload = "auto";
        v.muted = true;
        v.playsInline = true;
        v.src = url;
        v.load();
      } catch (_) {}
    });

    // 2. Prefetch links in document head for maximum browser cache retention
    allVideoUrls.forEach((url) => {
      try {
        const existing = document.querySelector(`link[href="${url}"]`);
        if (!existing) {
          const link = document.createElement("link");
          link.rel = "prefetch";
          link.as = "video";
          link.href = url;
          document.head.appendChild(link);
        }
      } catch (_) {}
    });
  }, [shouldWarmup]);

  if (!shouldWarmup) return null;

  return (
    <div
      aria-hidden="true"
      className="hidden pointer-events-none opacity-0 select-none w-0 h-0 overflow-hidden"
    >
      <video preload="auto" muted playsInline src="/Videos/rotate-phone.mp4" />
      {videoProjectsData.map((vp) => (
        <div key={vp.id}>
          {vp.previewVideoUrl && (
            <video preload="auto" muted playsInline src={vp.previewVideoUrl} />
          )}
          {vp.mobileVideoUrl && (
            <video preload="auto" muted playsInline src={vp.mobileVideoUrl} />
          )}
          {vp.videoUrl && (
            <video preload="auto" muted playsInline src={vp.videoUrl} />
          )}
        </div>
      ))}
    </div>
  );
}
