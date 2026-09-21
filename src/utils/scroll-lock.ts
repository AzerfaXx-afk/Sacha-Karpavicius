let activeLockTimeout: NodeJS.Timeout | null = null;
let currentPreventScroll: ((e: Event) => void) | null = null;
let currentPreventKeys: ((e: KeyboardEvent) => void) | null = null;
let _isLocked = false;

export function isScrollLocked(): boolean {
  return _isLocked;
}

export function unlockScroll() {
  if (typeof window === "undefined") return;

  if (activeLockTimeout) {
    clearTimeout(activeLockTimeout);
    activeLockTimeout = null;
  }

  // Remove full-screen lock overlay
  const overlay = document.getElementById("global-scroll-lock-overlay");
  if (overlay) {
    overlay.remove();
  }

  if (currentPreventScroll) {
    window.removeEventListener("wheel", currentPreventScroll);
    window.removeEventListener("touchmove", currentPreventScroll);
    window.removeEventListener("touchstart", currentPreventScroll);
    window.removeEventListener("pointermove", currentPreventScroll);
    currentPreventScroll = null;
  }

  if (currentPreventKeys) {
    window.removeEventListener("keydown", currentPreventKeys);
    currentPreventKeys = null;
  }

  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
  document.body.style.pointerEvents = "";

  // Restart Lenis smooth scroll
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenis = (window as any).__lenis;
  if (lenis && typeof lenis.start === "function") {
    lenis.start();
  }

  _isLocked = false;
  window.dispatchEvent(new CustomEvent("scroll-lock-changed", { detail: { isLocked: false } }));
}

export function lockScrollForNavigation(durationMs: number = 200) {
  if (typeof window === "undefined") return;

  // Clean up prior lock timer
  if (activeLockTimeout) {
    clearTimeout(activeLockTimeout);
    activeLockTimeout = null;
  }

  _isLocked = true;
  window.dispatchEvent(new CustomEvent("scroll-lock-changed", { detail: { isLocked: true } }));

  // Gently reset scroll position without disrupting Lenis permanently
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenis = (window as any).__lenis;
  if (lenis && typeof lenis.stop === "function") {
    lenis.stop();
  }

  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  activeLockTimeout = setTimeout(() => {
    unlockScroll();
  }, Math.min(300, durationMs));
}
