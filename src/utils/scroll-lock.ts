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

export function lockScrollForNavigation(durationMs: number = 2800) {
  if (typeof window === "undefined") return;

  // Clean up prior lock timer
  if (activeLockTimeout) {
    clearTimeout(activeLockTimeout);
    activeLockTimeout = null;
  }

  _isLocked = true;
  window.dispatchEvent(new CustomEvent("scroll-lock-changed", { detail: { isLocked: true } }));

  // Stop Lenis smooth scroll dead in its tracks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenis = (window as any).__lenis;
  if (lenis && typeof lenis.stop === "function") {
    lenis.stop();
  }

  // Force scroll position to top instantly
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  // Create or reuse full-screen invisible block overlay (z-index 999999)
  let overlay = document.getElementById("global-scroll-lock-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "global-scroll-lock-overlay";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "999999";
    overlay.style.cursor = "wait";
    overlay.style.background = "transparent";
    overlay.style.touchAction = "none";
    overlay.style.pointerEvents = "auto";
    document.body.appendChild(overlay);
  }

  // Lock body & root element scroll and pointer events during transition
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  const preventScroll = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const preventKeys = (e: KeyboardEvent) => {
    const keys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Space", "Home", "End"];
    if (keys.includes(e.code) || keys.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  if (currentPreventScroll) {
    window.removeEventListener("wheel", currentPreventScroll);
    window.removeEventListener("touchmove", currentPreventScroll);
    window.removeEventListener("touchstart", currentPreventScroll);
    window.removeEventListener("pointermove", currentPreventScroll);
  }
  if (currentPreventKeys) {
    window.removeEventListener("keydown", currentPreventKeys);
  }

  currentPreventScroll = preventScroll;
  currentPreventKeys = preventKeys;

  window.addEventListener("wheel", preventScroll, { passive: false });
  window.addEventListener("touchmove", preventScroll, { passive: false });
  window.addEventListener("touchstart", preventScroll, { passive: false });
  window.addEventListener("pointermove", preventScroll, { passive: false });
  window.addEventListener("keydown", preventKeys, { passive: false });

  activeLockTimeout = setTimeout(() => {
    unlockScroll();
  }, durationMs);
}
