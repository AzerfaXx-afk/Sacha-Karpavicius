"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

const AnimatedLink = ({ text, href, onClick }: { text: string; href: string, onClick: () => void }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }, 1000); // Wait for the menu to close
  };

  return (
    <a 
      href={href} 
      onClick={handleClick}
      className="group relative flex cursor-pointer overflow-visible leading-none text-[10vw] md:text-[6vw] font-syne font-bold uppercase text-white tracking-tight"
    >
      <div className="flex">
        {text.split("").map((c, i) => (
          <span 
            key={i} 
            className="inline-block transition-all duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:blur-[12px] group-hover:scale-150 group-hover:opacity-0 group-hover:-translate-y-10"
            style={{ transitionDelay: `${i * 0.03}s` }}
          >
            {c === " " ? "\u00A0" : c}
          </span>
        ))}
      </div>
      <div className="absolute inset-0 flex text-white pointer-events-none">
        {text.split("").map((c, i) => (
          <span 
            key={i} 
            className="inline-block opacity-0 blur-[12px] translate-y-10 scale-50 transition-all duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:opacity-100 group-hover:blur-0 group-hover:scale-100 group-hover:translate-y-0"
            style={{ transitionDelay: `${i * 0.03}s` }}
          >
            {c === " " ? "\u00A0" : c}
          </span>
        ))}
      </div>
    </a>
  );
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [time, setTime] = useState("");
  const navRef = useRef<HTMLElement>(null);

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
    
    // Navbar entry animation
    if (navRef.current) {
      gsap.to(navRef.current, {
        y: 0,
        opacity: 1,
        duration: 2.0,
        ease: "power4.out",
        delay: 2.4,
      });
    }

    // Prevent scroll when menu is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      clearInterval(interval);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <nav 
        ref={navRef}
        className="fixed top-0 left-0 w-full z-[110] px-6 py-6 md:px-12 md:py-8 pointer-events-auto mix-blend-difference -translate-y-8 opacity-0"
      >
        <div className="flex justify-between items-start w-full">
          {/* Top Left: Hamburger Menu */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="group flex flex-col gap-2 w-12 h-10 items-start justify-center cursor-pointer"
          >
            <div className={`h-[1px] bg-white transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isOpen ? 'w-8 rotate-45 translate-y-[4.5px]' : 'w-10 group-hover:w-6'}`} />
            <div className={`h-[1px] bg-white transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isOpen ? 'w-8 -rotate-45 -translate-y-[4.5px]' : 'w-6 group-hover:w-10'}`} />
          </button>

          {/* Top Center: Logo */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 top-4 md:top-4 w-14 h-14 md:w-20 md:h-20 cursor-pointer group"
            onClick={() => {
              setIsOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <img src="/logo.png" alt="Sacha Karpavicius Logo" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      </nav>

      {/* Fullscreen Overlay Menu */}
      <div 
        className="fixed inset-0 z-[100] bg-[#050505] flex items-center justify-center transition-transform duration-[1s] ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{ transform: isOpen ? 'translateY(0)' : 'translateY(-100%)' }}
      >
        <div className="flex flex-col items-center gap-6 md:gap-10">
          <AnimatedLink text="Selected Works" href="#works" onClick={() => setIsOpen(false)} />
          <AnimatedLink text="About & Vision" href="#about" onClick={() => setIsOpen(false)} />
          <AnimatedLink text="Connect" href="#contact" onClick={() => setIsOpen(false)} />
        </div>
      </div>

      {/* Time at top right */}
      <div className="fixed top-6 right-6 md:top-8 md:right-12 z-[110] flex flex-col items-end gap-1 mix-blend-difference pointer-events-none opacity-0" ref={(el) => {
        if (el && navRef.current) {
          gsap.to(el, { opacity: 1, duration: 2.0, ease: "power4.out", delay: 2.4 });
        }
      }}>
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
