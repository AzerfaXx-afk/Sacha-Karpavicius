"use client";

import React, { useEffect, useRef } from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import { gsap } from "gsap";

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    
    // Sync GSAP's internal ticker with Lenis
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis 
      ref={lenisRef}
      root 
      autoRaf={false}
      options={{ 
        lerp: 0.08, 
        duration: 1.2, 
        wheelMultiplier: 1,
      }}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {children as any}
    </ReactLenis>
  );
}
