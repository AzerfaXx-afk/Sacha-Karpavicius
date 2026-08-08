"use client";

import React, { useEffect, useRef } from "react";

export default function PostProcessing() {
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null);
  const lightLeakRef = useRef<HTMLDivElement>(null);
  const chromaticFilterRef = useRef<SVGFEOffsetElement>(null);

  // 1. Organic Animated 35mm Film Grain Canvas (15 FPS GPU Loop)
  useEffect(() => {
    const canvas = noiseCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let lastTime = 0;
    const fpsInterval = 1000 / 15; // 15 FPS film grain jitter

    const resize = () => {
      // Small canvas pattern scaled up via CSS for performance & organic noise scale
      canvas.width = Math.min(window.innerWidth, 320);
      canvas.height = Math.min(window.innerHeight, 320);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    const generateNoise = () => {
      const w = canvas.width;
      const h = canvas.height;
      const imgData = ctx.createImageData(w, h);
      const buffer = new Uint32Array(imgData.data.buffer);
      const len = buffer.length;

      for (let i = 0; i < len; i++) {
        // Subtle film grain luminance distribution
        const noise = (Math.random() * 255) | 0;
        // 0x0A0A0A base luminance with variable alpha noise (around 4% - 10%)
        const alpha = (Math.random() * 22) | 0;
        buffer[i] = (alpha << 24) | (noise << 16) | (noise << 8) | noise;
      }

      ctx.putImageData(imgData, 0, 0);
    };

    const loop = (time: number) => {
      animId = requestAnimationFrame(loop);
      const delta = time - lastTime;
      if (delta > fpsInterval) {
        lastTime = time - (delta % fpsInterval);
        generateNoise();
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // 2. Ambient Cursor Light Leak & Velocity Chromatic Aberration
  useEffect(() => {
    let lastScrollY = window.scrollY || 0;
    let lastTime = performance.now();
    let currentShift = 0;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      if (!lightLeakRef.current) return;
      const x = e.clientX;
      const y = e.clientY;
      lightLeakRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Smooth Velocity-based Chromatic Aberration updates
    const updateVelocityAberration = () => {
      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const speed = Math.abs(scrollY - lastScrollY) / dt;

      lastScrollY = scrollY;
      lastTime = now;

      // Target shift in px (max 3.5px during high speed)
      const targetShift = Math.min(3.5, speed * 2.2);
      // Smooth lerp back to 0
      currentShift += (targetShift - currentShift) * 0.18;

      if (chromaticFilterRef.current) {
        // Shift red channel filter offset
        chromaticFilterRef.current.setAttribute("dx", (currentShift * 0.8).toFixed(2));
      }

      rafId = requestAnimationFrame(updateVelocityAberration);
    };

    rafId = requestAnimationFrame(updateVelocityAberration);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <>
      {/* SVG Chromatic Aberration Filter definition */}
      <svg className="hidden absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="awwwards-chromatic" x="-10%" y="-10%" width="120%" height="120%">
            <feOffset ref={chromaticFilterRef} in="SourceGraphic" dx="0" dy="0" result="red-shift" />
            <feBlend mode="screen" in="SourceGraphic" in2="red-shift" />
          </filter>
        </defs>
      </svg>

      {/* 35mm Organic Film Grain Overlay */}
      <canvas
        ref={noiseCanvasRef}
        aria-hidden="true"
        className="fixed inset-0 w-full h-full pointer-events-none z-[45] mix-blend-overlay opacity-[0.038] will-change-transform"
      />

      {/* Cinematic Viewport Edge Vignette */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[44] bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.45)_100%)] opacity-80"
      />

      {/* Ambient Mouse-following Cinema Light Leak */}
      <div
        ref={lightLeakRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-[500px] h-[500px] -ml-[250px] -mt-[250px] rounded-full pointer-events-none z-[43] mix-blend-screen opacity-[0.07] bg-[radial-gradient(circle,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_70%)] transition-transform duration-75 ease-out will-change-transform hidden md:block"
      />
    </>
  );
}
