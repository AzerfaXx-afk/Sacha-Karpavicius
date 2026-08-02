"use client";

import { useEffect } from "react";

export default function PwaInstallPrompt() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Register Service Worker silently in the background
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
