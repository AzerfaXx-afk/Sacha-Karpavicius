"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

const AnimatedLink = ({ 
  text, 
  href, 
  number,
  onClick, 
  isDimmed, 
  onMouseEnter, 
  onMouseLeave,
  isOpen,
  index
}: { 
  text: string; 
  href: string; 
  number: string;
  onClick: () => void; 
  isDimmed: boolean; 
  onMouseEnter: () => void; 
  onMouseLeave: () => void;
  isOpen: boolean;
  index: number;
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }, 1000); // Wait for the menu to close
  };

  return (
    <div 
      className={`group flex items-start cursor-pointer transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
        isOpen ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
      }`}
      style={{ 
        transitionDelay: isOpen ? `${0.25 + index * 0.08}s` : '0s' 
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={handleClick}
    >
      {/* Sliding Number prefix */}
      <div className="relative overflow-hidden font-mono text-[2.5vw] md:text-[1vw] text-white/20 mr-4 md:mr-8 self-start mt-2 md:mt-4 h-[1.2em] pointer-events-none">
        <div className={`transition-transform duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col ${isDimmed ? '' : 'group-hover:-translate-y-1/2'}`}>
          <span className="h-[1.2em] flex items-center">{number}</span>
          <span className="h-[1.2em] flex items-center text-white">{number}</span>
        </div>
      </div>

      <a 
        href={href} 
        onClick={(e) => e.preventDefault()} // Handled by parent container click
        className={`relative flex whitespace-nowrap overflow-hidden leading-none text-[7vw] md:text-[4.5vw] font-syne font-bold uppercase tracking-tight transition-all duration-[750ms] ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none ${
          isDimmed 
            ? 'opacity-15 blur-[1px] scale-[0.98]' 
            : 'text-white scale-100'
        }`}
      >
        <div className="flex">
          {text.split("").map((c, i) => (
            <span 
              key={i} 
              className="inline-block transition-transform duration-[750ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-y-[120%] group-hover:skew-y-[6deg]"
              style={{ transitionDelay: `${i * 0.015}s` }}
            >
              {c === " " ? "\u00A0" : c}
            </span>
          ))}
        </div>
        <div className="absolute inset-0 flex text-white pointer-events-none">
          {text.split("").map((c, i) => (
            <span 
              key={i} 
              className="inline-block translate-y-[120%] skew-y-[6deg] transition-transform duration-[750ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:translate-y-0 group-hover:skew-y-0"
              style={{ transitionDelay: `${i * 0.015}s` }}
            >
              {c === " " ? "\u00A0" : c}
            </span>
          ))}
        </div>
      </a>
    </div>
  );
};

export default function Navbar({ showUI = true, clickable = true }: { showUI?: boolean, clickable?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [time, setTime] = useState("");
  const navRef = useRef<HTMLElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    // Navbar entry animation
    if (showUI) {
      if (navRef.current) gsap.to(navRef.current, { y: 0, opacity: 1, duration: 1.5, ease: "power4.out", overwrite: true });
      if (timeRef.current) gsap.to(timeRef.current, { opacity: 1, duration: 1.5, ease: "power4.out", overwrite: true });
    } else {
      if (navRef.current) gsap.to(navRef.current, { y: -32, opacity: 0, duration: 1.0, ease: "power3.inOut", overwrite: true });
      if (timeRef.current) gsap.to(timeRef.current, { opacity: 0, duration: 1.0, ease: "power3.inOut", overwrite: true });
    }
  }, [showUI]);

  useEffect(() => {
    // Prevent scroll when menu is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = (index: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setHoveredIndex(null);
    }, 120); // Bridge short gaps between menu links smoothly
  };

  const handleLinkClick = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setHoveredIndex(null);
    setIsOpen(false);
  };

  const handleOverlayMouseMove = (e: React.MouseEvent) => {
    if (!floatingRef.current) return;
    const x = e.clientX;
    const y = e.clientY;
    
    // Calculate rotation based on horizontal speed of mouse
    const speedX = e.movementX || 0;
    const rotation = gsap.utils.clamp(-12, 12, speedX * 0.4);
    
    gsap.to(floatingRef.current, {
      x: x,
      y: y,
      rotation: rotation,
      duration: 0.8,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  return (
    <>
      <nav 
        ref={navRef}
        className={`fixed top-0 left-0 w-full z-[110] px-6 py-6 md:px-12 md:py-8 mix-blend-difference -translate-y-8 opacity-0 ${clickable ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <div className="flex justify-between items-start w-full">
          {/* Top Left: Hamburger Menu */}
          <button 
            onClick={() => {
              if (isOpen) {
                handleLinkClick();
              } else {
                setIsOpen(true);
              }
            }}
            className="group flex flex-col gap-2 w-12 h-10 items-start justify-center cursor-pointer"
          >
            <div className={`h-[1px] bg-white transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isOpen ? 'w-8 rotate-45 translate-y-[4.5px]' : 'w-10 group-hover:w-6'}`} />
            <div className={`h-[1px] bg-white transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isOpen ? 'w-8 -rotate-45 -translate-y-[4.5px]' : 'w-6 group-hover:w-10'}`} />
          </button>

          {/* Top Center: Logo */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 top-4 md:top-4 w-14 h-14 md:w-20 md:h-20 cursor-pointer group"
            onClick={() => {
              handleLinkClick();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <img src="/logo.png" alt="Sacha Karpavicius Logo" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      </nav>

      {/* Fullscreen Overlay Menu */}
      <div 
        className="fixed inset-0 z-[100] bg-[#050505] flex flex-col justify-center px-6 md:px-12 transition-transform duration-[1s] ease-[cubic-bezier(0.76,0,0.24,1)] overflow-hidden"
        style={{ transform: isOpen ? 'translateY(0)' : 'translateY(-100%)' }}
        onMouseMove={handleOverlayMouseMove}
      >
        {/* Navigation Grid Lines */}
        <div className="absolute inset-0 pointer-events-none flex justify-between px-6 md:px-12 z-0">
          <div className="w-[1px] h-full bg-white/[0.02]" />
          <div className="w-[1px] h-full bg-white/[0.02] hidden md:block" />
          <div className="w-[1px] h-full bg-white/[0.02] hidden md:block" />
          <div className="w-[1px] h-full bg-white/[0.02]" />
        </div>

        {/* Menu Links Container */}
        <div className="relative max-w-5xl w-full mx-auto z-10 flex flex-col gap-6 md:gap-10 pl-2 md:pl-16">
          <AnimatedLink 
            text="Selected Works" 
            href="#works" 
            number="01" 
            onClick={handleLinkClick} 
            isDimmed={hoveredIndex !== null && hoveredIndex !== 0}
            onMouseEnter={() => handleMouseEnter(0)}
            onMouseLeave={handleMouseLeave}
            isOpen={isOpen}
            index={0}
          />
          <AnimatedLink 
            text="About & Vision" 
            href="#about" 
            number="02" 
            onClick={handleLinkClick} 
            isDimmed={hoveredIndex !== null && hoveredIndex !== 1}
            onMouseEnter={() => handleMouseEnter(1)}
            onMouseLeave={handleMouseLeave}
            isOpen={isOpen}
            index={1}
          />
          <AnimatedLink 
            text="Connect" 
            href="#contact" 
            number="03" 
            onClick={handleLinkClick} 
            isDimmed={hoveredIndex !== null && hoveredIndex !== 2}
            onMouseEnter={() => handleMouseEnter(2)}
            onMouseLeave={handleMouseLeave}
            isOpen={isOpen}
            index={2}
          />
        </div>

        {/* Floating Image Cursor Follower */}
        <div 
          ref={floatingRef}
          className="fixed top-0 left-0 pointer-events-none z-[5] will-change-transform hidden md:block"
        >
          <div 
            className="relative w-[260px] h-[340px] rounded-lg overflow-hidden border border-white/10 shadow-2xl transition-all duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)] origin-center"
            style={{
              opacity: hoveredIndex !== null ? 1 : 0,
              transform: `translate(-50%, -50%) scale(${hoveredIndex !== null ? 1 : 0.75}) rotate(${hoveredIndex !== null ? 0 : -5}deg)`,
            }}
          >
            <div className="relative w-full h-full bg-[#111]">
              {/* Image 01: Selected Works */}
              <div 
                className="absolute inset-0 transition-opacity duration-700 ease-in-out overflow-hidden"
                style={{ opacity: hoveredIndex === 0 ? 1 : 0 }}
              >
                <img 
                  src="/2.jpg" 
                  alt="Selected Works Preview" 
                  className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${
                    hoveredIndex === 0 ? "scale-100" : "scale-110"
                  }`} 
                />
              </div>
              
              {/* Image 02: About */}
              <div 
                className="absolute inset-0 transition-opacity duration-700 ease-in-out overflow-hidden"
                style={{ opacity: hoveredIndex === 1 ? 1 : 0 }}
              >
                <img 
                  src="/5.jpg" 
                  alt="About & Vision Preview" 
                  className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${
                    hoveredIndex === 1 ? "scale-100" : "scale-110"
                  }`} 
                />
              </div>
              
              {/* Image 03: Connect */}
              <div 
                className="absolute inset-0 transition-opacity duration-700 ease-in-out overflow-hidden"
                style={{ opacity: hoveredIndex === 2 ? 1 : 0 }}
              >
                <img 
                  src="/6.jpg" 
                  alt="Connect Preview" 
                  className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${
                    hoveredIndex === 2 ? "scale-100" : "scale-110"
                  }`} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time at top right */}
      <div 
        ref={timeRef} 
        className="fixed top-6 right-6 md:top-8 md:right-12 z-[110] flex flex-col items-end gap-1 mix-blend-difference pointer-events-none opacity-0"
      >
        <div className="border border-white/20 px-2 py-0.5 rounded-sm text-[10px] text-white">
          {time || "00:00:00"}
        </div>
        <div className="text-[10px] text-white/50 text-right uppercase font-inter tracking-[0.2em]">
          Paris<br/>CET
        </div>
      </div>
    </>
  );
}
