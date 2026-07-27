export function lockScrollForNavigation(durationMs: number = 800) {
  if (typeof window === "undefined") return;

  // Force top scroll instantly
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  // Lock body scroll and pointer events during transition to prevent accidental scroll-through
  document.body.style.overflow = "hidden";
  document.body.style.pointerEvents = "none";

  setTimeout(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.body.style.overflow = "";
    document.body.style.pointerEvents = "";
  }, durationMs);
}
