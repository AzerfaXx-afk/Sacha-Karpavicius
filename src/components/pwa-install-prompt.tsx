"use client";

import { useEffect } from "react";

export default function PwaInstallPrompt() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Register Service Worker silently in the background
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        if (process.env.NODE_ENV === "development") {
          console.log("SW registered:", reg.scope);
        }
      })
      .catch((err) => {
        if (process.env.NODE_ENV === "development") {
          console.log("SW registration failed:", err);
        }
      });
  }, []);

  return null;
}
