"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useLenis } from "@studio-freight/react-lenis";

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
  const lenis = useLenis();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
    setTimeout(() => {
      if (lenis) {
        lenis.scrollTo(href, { 
          offset: 0,
          duration: 1.5,
        });
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }
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
      <div className="relative shrink-0 overflow-hidden font-mono text-[2.5vw] md:text-[1vw] text-white/20 mr-4 md:mr-8 self-start mt-2 md:mt-4 h-[1.2em] pointer-events-none">
        <div className={`transition-transform duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col ${isDimmed ? '' : 'group-hover:-translate-y-1/2'}`}>
          <span className="h-[1.2em] flex items-center">{number}</span>
          <span className="h-[1.2em] flex items-center text-white">{number}</span>
        </div>
      </div>

      <a 
        href={href} 
        onClick={(e) => e.preventDefault()} // Handled by parent container click
        className={`relative flex shrink-0 whitespace-nowrap overflow-hidden px-6 md:px-16 leading-none text-[7vw] md:text-[4.5vw] font-syne font-bold uppercase tracking-tight transition-all duration-[750ms] ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none ${
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
        <div className="absolute inset-0 flex text-white pointer-events-none px-6 md:px-16">
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

export default function Navbar({ 
  showUI = true, 
  clickable = true, 
  lang = "fr",
  onPlayHoverSfx,
  onPlayClickSfx
}: { 
  showUI?: boolean; 
  clickable?: boolean; 
  lang?: "fr" | "en";
  onPlayHoverSfx?: () => void;
  onPlayClickSfx?: () => void;
}) {
  const lenis = useLenis();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [time, setTime] = useState("");
  const navRef = useRef<HTMLElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile navigation enhancements
  const [showDock, setShowDock] = useState(true);
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileBgIndex, setMobileBgIndex] = useState(0);
  const lastScrollY = useRef(0);
  const siteStarted = showUI && clickable;

  // Track clock time
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

  // Navbar entry animation
  useEffect(() => {
    if (showUI) {
      if (navRef.current) gsap.to(navRef.current, { y: 0, opacity: 1, duration: 1.5, ease: "power4.out", overwrite: true });
      if (timeRef.current) gsap.to(timeRef.current, { opacity: 1, duration: 1.5, ease: "power4.out", overwrite: true });
    } else {
      if (navRef.current) gsap.to(navRef.current, { y: -32, opacity: 0, duration: 1.0, ease: "power3.inOut", overwrite: true });
      if (timeRef.current) gsap.to(timeRef.current, { opacity: 0, duration: 1.0, ease: "power3.inOut", overwrite: true });
    }
  }, [showUI]);

  // Lock body scroll when overlay menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Auto-hide mobile dock on scroll down, show on scroll up
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Scroll down: hide; Scroll up: show
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setShowDock(false);
      } else {
        setShowDock(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Monitor active section using Intersection Observer (for the dock bar)
  useEffect(() => {
    if (typeof window === "undefined" || !siteStarted) return;

    const sections = ["hero", "works", "about", "contact"];
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        {
          rootMargin: "-25% 0px -55% 0px", // Trigger when section is in the center view
        }
      );
      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, [siteStarted]);

  // Slow slideshow cycle for mobile fullscreen overlay backdrop
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setMobileBgIndex((prev) => (prev + 1) % 3);
    }, 3500);
    return () => clearInterval(interval);
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
    }, 120);
  };

  const handleLinkClick = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setHoveredIndex(null);
    setIsOpen(false);
    document.body.style.overflow = ""; // Force scroll unlock instantly
  };

  const handleOverlayMouseMove = (e: React.MouseEvent) => {
    if (!floatingRef.current) return;
    const x = e.clientX;
    const y = e.clientY;
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

  const handleDockClick = (id: string) => {
    onPlayClickSfx?.();
    if (lenis) {
      lenis.scrollTo(`#${id}`, { duration: 1.2 });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeIndex = ["hero", "works", "about", "contact"].indexOf(activeSection);

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
              onPlayClickSfx?.();
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
              onPlayClickSfx?.();
              handleLinkClick();
              if (lenis) {
                lenis.scrollTo(0, { duration: 1.2, immediate: false });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
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
        {/* Background Image Layer (Mobile and Desktop) */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {[ "/2.jpg", "/5.jpg", "/6.jpg" ].map((imgSrc, idx) => {
            const isVisible = hoveredIndex !== null 
              ? hoveredIndex === idx 
              : (mobileBgIndex === idx); // Crossfade on slow cycle on mobile
            
            return (
              <div
                key={imgSrc}
                className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
                style={{
                  opacity: isVisible ? 0.08 : 0,
                }}
              >
                <img
                  src={imgSrc}
                  alt=""
                  className="w-full h-full object-cover scale-105"
                />
              </div>
            );
          })}
          <div className="absolute inset-0 bg-[#050505]/80 mix-blend-multiply" />
        </div>

        {/* Menu Links Container */}
        <div className="relative max-w-7xl w-full mx-auto z-10 flex flex-col gap-6 md:gap-10 pl-2 md:pl-16">
          <AnimatedLink 
            text={lang === "fr" ? "Projets" : "Selected Works"} 
            href="#works" 
            number="01" 
            onClick={handleLinkClick} 
            isDimmed={hoveredIndex !== null && hoveredIndex !== 0}
            onMouseEnter={() => {
              onPlayHoverSfx?.();
              handleMouseEnter(0);
            }}
            onMouseLeave={handleMouseLeave}
            isOpen={isOpen}
            index={0}
          />
          <AnimatedLink 
            text={lang === "fr" ? "À Propos & Vision" : "About & Vision"} 
            href="#about" 
            number="02" 
            onClick={handleLinkClick} 
            isDimmed={hoveredIndex !== null && hoveredIndex !== 1}
            onMouseEnter={() => {
              onPlayHoverSfx?.();
              handleMouseEnter(1);
            }}
            onMouseLeave={handleMouseLeave}
            isOpen={isOpen}
            index={1}
          />
          <AnimatedLink 
            text={lang === "fr" ? "Contact" : "Connect"} 
            href="#contact" 
            number="03" 
            onClick={handleLinkClick} 
            isDimmed={hoveredIndex !== null && hoveredIndex !== 2}
            onMouseEnter={() => {
              onPlayHoverSfx?.();
              handleMouseEnter(2);
            }}
            onMouseLeave={handleMouseLeave}
            isOpen={isOpen}
            index={2}
          />
        </div>

        {/* Floating Image Cursor Follower (Desktop Only) */}
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
              <div className="absolute inset-0 bg-black/15 z-10 pointer-events-none" />

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

      {/* Premium Mobile App Navigation Dock */}
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[115] w-[90vw] max-w-[380px] bg-black/45 backdrop-blur-xl border border-white/10 rounded-full py-1.5 px-2 flex items-center justify-between shadow-[0_12px_45px_rgba(0,0,0,0.6)] transition-all duration-[600ms] ease-[cubic-bezier(0.76,0,0.24,1)] md:hidden ${
          showDock && siteStarted ? 'translate-y-0 opacity-100' : 'translate-y-28 opacity-0 pointer-events-none'
        }`}
      >
        {/* Sliding Active Pill Indicator */}
        <div 
          className="absolute top-1 bottom-1 bg-white/12 border border-white/5 rounded-full transition-all duration-[500ms] ease-[cubic-bezier(0.76,0,0.24,1)] z-0"
          style={{
            width: 'calc(25% - 6px)',
            left: `calc(3px + ${activeIndex >= 0 ? activeIndex : 0} * 25%)`,
          }}
        />

        {/* Dock Item 1: Home */}
        <button
          onClick={() => handleDockClick("hero")}
          className="relative z-10 w-1/4 py-1.5 flex flex-col items-center justify-center gap-0.5 text-white cursor-pointer"
        >
          <svg className={`w-[18px] h-[18px] transition-all duration-300 ${activeSection === "hero" ? "opacity-100 scale-105" : "opacity-40"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className={`font-inter text-[8px] tracking-[0.05em] transition-all duration-300 uppercase ${activeSection === "hero" ? "opacity-100 font-bold" : "opacity-30"}`}>
            {lang === "fr" ? "Accueil" : "Home"}
          </span>
        </button>

        {/* Dock Item 2: Selected Works */}
        <button
          onClick={() => handleDockClick("works")}
          className="relative z-10 w-1/4 py-1.5 flex flex-col items-center justify-center gap-0.5 text-white cursor-pointer"
        >
          <svg className={`w-[18px] h-[18px] transition-all duration-300 ${activeSection === "works" ? "opacity-100 scale-105" : "opacity-40"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className={`font-inter text-[8px] tracking-[0.05em] transition-all duration-300 uppercase ${activeSection === "works" ? "opacity-100 font-bold" : "opacity-30"}`}>
            {lang === "fr" ? "Projets" : "Works"}
          </span>
        </button>

        {/* Dock Item 3: About & Vision */}
        <button
          onClick={() => handleDockClick("about")}
          className="relative z-10 w-1/4 py-1.5 flex flex-col items-center justify-center gap-0.5 text-white cursor-pointer"
        >
          <svg className={`w-[18px] h-[18px] transition-all duration-300 ${activeSection === "about" ? "opacity-100 scale-105" : "opacity-40"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className={`font-inter text-[8px] tracking-[0.05em] transition-all duration-300 uppercase ${activeSection === "about" ? "opacity-100 font-bold" : "opacity-30"}`}>
            {lang === "fr" ? "Vision" : "About"}
          </span>
        </button>

        {/* Dock Item 4: Contact */}
        <button
          onClick={() => handleDockClick("contact")}
          className="relative z-10 w-1/4 py-1.5 flex flex-col items-center justify-center gap-0.5 text-white cursor-pointer"
        >
          <svg className={`w-[18px] h-[18px] transition-all duration-300 ${activeSection === "contact" ? "opacity-100 scale-105" : "opacity-40"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className={`font-inter text-[8px] tracking-[0.05em] transition-all duration-300 uppercase ${activeSection === "contact" ? "opacity-100 font-bold" : "opacity-30"}`}>
            {lang === "fr" ? "Contact" : "Connect"}
          </span>
        </button>
      </div>
    </>
  );
}
