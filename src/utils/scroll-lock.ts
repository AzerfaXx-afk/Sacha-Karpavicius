let activeLockTimeout: NodeJS.Timeout | null = null;
let currentPreventScroll: ((e: Event) => void) | null = null;

export function lockScrollForNavigation(durationMs: number = 800) {
  if (typeof window === "undefined") return;

  if (activeLockTimeout) {
    clearTimeout(activeLockTimeout);
  }

  // Force top scroll instantly
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  // Lock body scroll and pointer events during transition to prevent accidental scroll-through
  document.body.style.overflow = "hidden";
  document.body.style.pointerEvents = "none";

  const preventScroll = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  if (currentPreventScroll) {
    window.removeEventListener("wheel", currentPreventScroll);
    window.removeEventListener("touchmove", currentPreventScroll);
  }
  currentPreventScroll = preventScroll;

  window.addEventListener("wheel", preventScroll, { passive: false });
  window.addEventListener("touchmove", preventScroll, { passive: false });

  activeLockTimeout = setTimeout(() => {
    if (currentPreventScroll) {
      window.removeEventListener("wheel", currentPreventScroll);
      window.removeEventListener("touchmove", currentPreventScroll);
      currentPreventScroll = null;
    }
    document.body.style.overflow = "";
    document.body.style.pointerEvents = "";
  }, durationMs);
}
