"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Déclenche une transition de page Awwwards ultra-fluide avec rideau fondu rapide et sans blocage.
 */
export function triggerPageTransition(
  router: AppRouterInstance,
  targetUrl: string,
  onStart?: () => void
) {
  if (typeof window === "undefined") {
    router.push(targetUrl);
    return;
  }

  if (onStart) {
    try {
      onStart();
    } catch (_) {}
  }

  // Pre-set SPA navigation marker for instant scroll reset
  sessionStorage.setItem("spa_nav", "true");

  // Clean up any existing overlay
  const existing = document.getElementById("awwwards-page-transition-overlay");
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }

  // Create high-z-index fullscreen curtain overlay
  const overlay = document.createElement("div");
  overlay.id = "awwwards-page-transition-overlay";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.backgroundColor = "#050505";
  overlay.style.opacity = "0";
  overlay.style.zIndex = "999999";
  overlay.style.pointerEvents = "none"; // Never block or trap clicks
  overlay.style.transition = "opacity 0.18s cubic-bezier(0.76, 0, 0.24, 1)";
  document.body.appendChild(overlay);

  // Trigger smooth curtain fade-in
  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
  });

  // Navigate after swift 160ms curtain fade
  setTimeout(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    router.push(targetUrl);

    // Fade curtain out on new page
    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 250);
    }, 150);
  }, 160);

  // Hard safety cleanup: always ensure overlay is destroyed after 1200ms
  setTimeout(() => {
    const el = document.getElementById("awwwards-page-transition-overlay");
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }, 1200);
}
