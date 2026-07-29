"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Déclenche une transition de page Awwwards ultra-fluide avec rideau fondu.
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
    onStart();
  }

  // Pre-set SPA navigation marker for instant scroll reset
  sessionStorage.setItem("spa_nav", "true");

  // Create high-z-index fullscreen curtain overlay
  const overlay = document.createElement("div");
  overlay.id = "awwwards-page-transition-overlay";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.backgroundColor = "#050505";
  overlay.style.opacity = "0";
  overlay.style.zIndex = "999999";
  overlay.style.pointerEvents = "all";
  overlay.style.transition = "opacity 0.45s cubic-bezier(0.76, 0, 0.24, 1)";
  document.body.appendChild(overlay);

  // Trigger smooth curtain fade-in
  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
  });

  // Navigate after curtain is fully drawn
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
      }, 450);
    }, 250);
  }, 450);
}
