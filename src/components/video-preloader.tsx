"use client";

import { useEffect, useState } from "react";
import { videoProjectsData } from "@/data/projects";

export default function VideoPreloader() {
  const [shouldWarmup, setShouldWarmup] = useState(false);

  useEffect(() => {
    // Only warmup lightweight preview snippets after page has stabilized
    const timer = setTimeout(() => setShouldWarmup(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!shouldWarmup || typeof document === "undefined") return;

    // Collect ONLY lightweight local preview clips (NEVER full 4K movies or external YouTube links)
    const previewUrls: string[] = [
      ...videoProjectsData
        .map((vp) => vp.previewVideoUrl)
        .filter((url): url is string => Boolean(url && !url.includes("youtu") && !url.startsWith("http"))),
    ];

    previewUrls.forEach((url) => {
      try {
        const v = document.createElement("video");
        v.preload = "metadata";
        v.muted = true;
        v.playsInline = true;
        v.src = url;
      } catch (_) {}
    });
  }, [shouldWarmup]);

  return null;
}
