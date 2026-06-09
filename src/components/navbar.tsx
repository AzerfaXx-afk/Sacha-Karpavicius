"use client";

import React, { useState, useEffect } from "react";

export default function Navbar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-[90] px-5 py-6 md:px-10 md:py-8 font-inter text-[11px] md:text-[12px] tracking-wide text-white mix-blend-difference pointer-events-auto flex flex-col md:flex-row md:items-start justify-between gap-8 md:gap-0">

      {/* Left Logo - Sacha Knight */}
      <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 group cursor-pointer">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full group-hover:scale-105 transition-transform duration-500">
          <path d="M50 0 C77.6 0 100 22.4 100 50 C100 77.6 77.6 100 50 100 C22.4 100 0 77.6 0 50 C0 22.4 22.4 0 50 0 Z" opacity="0.1" />
          {/* Abstract S-K horse/knight shape representing the logo */}
          <path d="M40 20 L60 30 L55 50 L70 60 L60 80 L40 70 L30 50 Z" />
          <path d="M30 30 L45 25 L40 40 Z" />
        </svg>
      </div>

      {/* Center Columns Container */}
      <div className="flex-1 flex flex-row justify-between md:justify-center md:gap-32 w-full">
        {/* Column 1 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-white/90 mb-1">
            <span className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent"></span>
            <span className="font-medium">Portfolio</span>
          </div>
          <a href="#works" className="text-white/60 hover:text-white transition-colors cursor-pointer">Selected Works</a>
          <a href="#works" className="text-white/60 hover:text-white transition-colors cursor-pointer">Editorials</a>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-white/90 mb-1">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            <span className="font-medium">Narrative</span>
          </div>
          <a href="#about" className="text-white/60 hover:text-white transition-colors cursor-pointer">About</a>
          <a href="#about" className="text-white/60 hover:text-white transition-colors cursor-pointer">Vision</a>
          <a href="#contact" className="text-white/60 hover:text-white transition-colors cursor-pointer">Connect</a>
        </div>

        {/* Column 3 (Hidden on very small screens) */}
        <div className="hidden sm:flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-white/90 mb-1">
            <span className="w-2 h-2 bg-white"></span>
            <span className="font-medium">Services</span>
          </div>
          <span className="text-white/60">For Brands</span>
          <span className="text-white/60">For Agencies</span>
        </div>
      </div>

      {/* Right Time / Info */}
      <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
        <div className="border border-white/20 px-2 py-0.5 rounded-sm text-[10px]">
          {time || "00:00:00"}
        </div>
        <div className="text-[10px] text-white/50 text-right">
          PARIS<br />CET
        </div>
      </div>

      {/* Far Right Discover (Like Ravi site) */}
      <div className="hidden lg:block ml-16 text-white/90 font-medium">
        Discover
      </div>
    </nav>
  );
}
