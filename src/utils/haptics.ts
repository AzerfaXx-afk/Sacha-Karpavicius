"use client";

/**
 * Trigger subtle native haptic feedback on supported touch devices.
 */
export function triggerHaptic(type: "light" | "medium" | "heavy" | "success" | "selection" = "light") {
  if (typeof window === "undefined" || !("navigator" in window) || !navigator.vibrate) {
    return;
  }

  try {
    switch (type) {
      case "light":
        navigator.vibrate(10);
        break;
      case "medium":
        navigator.vibrate(20);
        break;
      case "heavy":
        navigator.vibrate(40);
        break;
      case "selection":
        navigator.vibrate([8, 15]);
        break;
      case "success":
        navigator.vibrate([15, 30, 20, 30, 15]);
        break;
      default:
        navigator.vibrate(12);
        break;
    }
  } catch (_) {
    // Ignore errors on non-supported platforms
  }
}
