"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useLenis } from "@studio-freight/react-lenis";
import { lockScrollForNavigation } from "@/utils/scroll-lock";

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
  onMouseEnter: (pos?: { x: number, y: number }) => void; 
  onMouseLeave: () => void;
  isOpen: boolean;
  index: number;
}) => {
  const lenis = useLenis();
  const linkRef = useRef<HTMLDivElement>(null);
  const [isTouchHovered, setIsTouchHovered] = useState(false);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const touchTimeout = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  useEffect(() => {
    const el = linkRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const clientX = touch.clientX;
      const clientY = touch.clientY;
      touchStartPos.current = { x: clientX, y: clientY };
      isLongPress.current = false;

      if (touchTimeout.current) clearTimeout(touchTimeout.current);
      touchTimeout.current = setTimeout(() => {
        isLongPress.current = true;
        setIsTouchHovered(true);
        onMouseEnter({ x: clientX, y: clientY });
      }, 200); // Trigger preview after 200ms hold
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchStartPos.current.x);
      const dy = Math.abs(touch.clientY - touchStartPos.current.y);

      // Cancel preview hold if they drag far (scrolling)
      if (dx > 20 || dy > 20) {
        if (touchTimeout.current) clearTimeout(touchTimeout.current);
        setIsTouchHovered(false);
        onMouseLeave();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchTimeout.current) clearTimeout(touchTimeout.current);

      if (isLongPress.current) {
        // Long press holds preview. Prevent click/navigation and fade out slowly
        e.preventDefault();
        setTimeout(() => {
          setIsTouchHovered(false);
          onMouseLeave();
        }, 1200);
      } else {
        // Short press triggers default click (navigates)
      }
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: false });
    el.addEventListener("touchcancel", handleTouchEnd, { passive: false });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
      if (touchTimeout.current) clearTimeout(touchTimeout.current);
    };
  }, [onMouseEnter, onMouseLeave]);

  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
    setTimeout(() => {
      if (pathname !== "/") {
        router.push("/" + href);
      } else {
        if (lenis) {
          lenis.scrollTo(href, { 
            offset: 0,
            duration: 1.5,
          });
        } else {
          const target = document.querySelector(href);
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 600);
  };

  return (
    <div 
      ref={linkRef}
      className="menu-link-item group flex items-start cursor-pointer opacity-0 translate-y-24 transform-gpu"
      onMouseEnter={(e) => {
        onMouseEnter({ x: e.clientX, y: e.clientY });
      }}
      onMouseLeave={onMouseLeave}
      data-touch-hover={isTouchHovered}
      onClick={handleClick}
    >
      {/* Sliding Number prefix */}
      <div className="relative shrink-0 overflow-hidden font-mono text-[2.5vw] md:text-[1vw] text-white/20 mr-4 md:mr-8 self-start mt-2 md:mt-4 h-[1.2em] pointer-events-none">
        <div className="transition-transform duration-[600ms] ease-[cubic-bezier(0.76,0,0.24,1)] flex flex-col group-hover:-translate-y-1/2 group-data-[touch-hover=true]:-translate-y-1/2">
          <span className="h-[1.2em] flex items-center">{number}</span>
          <span className="h-[1.2em] flex items-center text-white">{number}</span>
        </div>
      </div>

      <a 
        href={href} 
        onClick={(e) => e.preventDefault()} // Handled by parent container click
        className={`relative flex shrink-0 whitespace-nowrap overflow-hidden px-6 md:px-16 leading-none text-[7vw] md:text-[4.5vw] font-syne font-bold uppercase tracking-tight transition-all duration-[750ms] ease-[cubic-bezier(0.76,0,0.24,1)] pointer-events-none ${
          isDimmed 
            ? 'opacity-15 blur-[1px] scale-[0.98]' 
            : 'text-white scale-100'
        }`}
      >
        <div className="flex">
          {text.split("").map((c, i) => (
            <span 
              key={i} 
              className="inline-block transition-transform duration-[750ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-[120%] group-hover:skew-y-[6deg] group-data-[touch-hover=true]:-translate-y-[120%] group-data-[touch-hover=true]:skew-y-[6deg]"
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
              className="inline-block translate-y-[120%] skew-y-[6deg] transition-transform duration-[750ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-0 group-hover:skew-y-0 group-data-[touch-hover=true]:translate-y-0 group-data-[touch-hover=true]:skew-y-0"
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
  onPlayClickSfx,
  onMenuToggle
}: { 
  showUI?: boolean; 
  clickable?: boolean; 
  lang?: "fr" | "en";
  onPlayHoverSfx?: () => void;
  onPlayClickSfx?: () => void;
  onMenuToggle?: (isOpen: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    onMenuToggle?.(isOpen);
  }, [isOpen, onMenuToggle]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [time, setTime] = useState("");
  const navRef = useRef<HTMLElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const floatingCardRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const linksContainerRef = useRef<HTMLDivElement>(null);
  const lastTouchPos = useRef({ x: 0, y: 0, time: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile background crossfade state
  const [mobileBgIndex, setMobileBgIndex] = useState(0);

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
      if (timeRef.current) gsap.to(timeRef.current, { y: 0, opacity: 1, duration: 1.5, ease: "power4.out", overwrite: true });
    } else {
      if (navRef.current) gsap.to(navRef.current, { y: -32, opacity: 0, duration: 1.0, ease: "power3.inOut", overwrite: true });
      if (timeRef.current) gsap.to(timeRef.current, { y: -32, opacity: 0, duration: 1.0, ease: "power3.inOut", overwrite: true });
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

  // Slow slideshow cycle for mobile fullscreen overlay backdrop
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setMobileBgIndex((prev) => (prev + 1) % 4);
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Morphing clipPath menu reveal & staggered links entrance/exit
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const links = linksContainerRef.current?.querySelectorAll(".menu-link-item");

    if (isOpen) {
      setIsMenuVisible(true);
      // Kill any active tweens on the path and links
      gsap.killTweensOf(path);
      if (links) gsap.killTweensOf(links);

      // Set initial state of path and links
      gsap.set(path, { attr: { d: "M 0,0 L 1,0 L 1,0 Q 0.5,0 0,0 Z" } });
      if (links && links.length > 0) {
        gsap.set(links, { y: 80, opacity: 0 });
      }

      // Animate morphing menu opening
      const tl = gsap.timeline();
      tl.to(path, {
        attr: { d: "M 0,0 L 1,0 L 1,1 Q 0.5,1.15 0,1 Z" },
        duration: 0.65,
        ease: "power3.in",
      }).to(path, {
        attr: { d: "M 0,0 L 1,0 L 1,1 Q 0.5,1 0,1 Z" },
        duration: 0.45,
        ease: "power2.out",
      });

      // Animate links in
      if (links && links.length > 0) {
        gsap.to(links, {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power4.out",
          stagger: 0.08,
          delay: 0.35,
        });
      }
    } else {
      // Closing
      gsap.killTweensOf(path);
      if (links) gsap.killTweensOf(links);

      // Animate morphing menu closing
      const tl = gsap.timeline({
        onComplete: () => {
          setIsMenuVisible(false);
        }
      });
      tl.to(path, {
        attr: { d: "M 0,0 L 1,0 L 1,0 Q 0.5,0.15 0,0 Z" },
        duration: 0.45,
        ease: "power3.in",
      }).to(path, {
        attr: { d: "M 0,0 L 1,0 L 1,0 Q 0.5,0 0,0 Z" },
        duration: 0.35,
        ease: "power2.out",
      });

      // Animate links out
      if (links && links.length > 0) {
        gsap.to(links, {
          y: -50,
          opacity: 0,
          duration: 0.4,
          ease: "power3.in",
          stagger: 0.05,
        });
      }
    }
  }, [isOpen]);

  // Floating cursor preview card GSAP transitions (avoiding CSS transition conflicts)
  useEffect(() => {
    const card = floatingCardRef.current;
    if (!card) return;

    if (hoveredIndex !== null) {
      gsap.to(card, {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.6,
        ease: "power4.out",
        overwrite: "auto",
      });

      // Zoom active image inside preview card
      const activeImg = card.querySelector(`[data-index="${hoveredIndex}"] img`);
      if (activeImg) {
        gsap.fromTo(activeImg, 
          { scale: 1.25 },
          { scale: 1, duration: 1.2, ease: "power3.out", overwrite: "auto" }
        );
      }
    } else {
      gsap.to(card, {
        opacity: 0,
        scale: 0.75,
        rotation: -5,
        duration: 0.5,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  }, [hoveredIndex]);

  const handleMouseEnter = (index: number, pos?: { x: number, y: number }) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setHoveredIndex(index);

    if (pos && floatingRef.current) {
      gsap.set(floatingRef.current, {
        x: pos.x,
        y: pos.y,
        rotation: 0,
      });
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setHoveredIndex(null);
    }, 120);
  };

  const handleOverlayTouchMove = (e: React.TouchEvent) => {
    if (!floatingRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    const now = Date.now();
    
    const dt = now - lastTouchPos.current.time || 16;
    const dx = x - lastTouchPos.current.x;
    const dy = y - lastTouchPos.current.y;
    
    // Scale speed to match movementX/Y speed values
    const speedX = (dx / dt) * 16;
    const speedY = (dy / dt) * 16;
    
    const rotation = gsap.utils.clamp(-8, 8, speedX * 0.35);
    const skewX = gsap.utils.clamp(-8, 8, speedX * 0.25);
    const skewY = gsap.utils.clamp(-8, 8, speedY * 0.25);
    
    gsap.to(floatingRef.current, {
      x: x,
      y: y,
      rotation: rotation,
      skewX: skewX,
      skewY: skewY,
      duration: 0.6,
      ease: "power3.out",
      overwrite: "auto",
    });
    
    lastTouchPos.current = { x, y, time: now };
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
    const speedY = e.movementY || 0;
    
    // Calculate rotation and skews based on mouse speed
    const rotation = gsap.utils.clamp(-12, 12, speedX * 0.45);
    const skewX = gsap.utils.clamp(-10, 10, speedX * 0.3);
    const skewY = gsap.utils.clamp(-10, 10, speedY * 0.3);
    
    gsap.to(floatingRef.current, {
      x: x,
      y: y,
      rotation: rotation,
      skewX: skewX,
      skewY: skewY,
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
              lockScrollForNavigation(750);
              if (pathname !== "/") {
                router.push("/");
              } else {
                if (lenis) {
                  lenis.scrollTo(0, { duration: 1.2, immediate: false });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }
            }}
          >
            <img src="/logo.png" alt="Sacha Karpavicius Logo" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      </nav>

      {/* Fullscreen Overlay Menu */}
      <div 
        ref={linksContainerRef}
        className="fixed inset-0 z-[100] bg-[#050505] flex flex-col justify-center px-6 md:px-12 overflow-hidden"
        style={{ 
          clipPath: "url(#menu-clip)",
          pointerEvents: isOpen ? "auto" : "none",
          visibility: isMenuVisible ? "visible" : "hidden"
        }}
        onMouseMove={handleOverlayMouseMove}
        onTouchMove={handleOverlayTouchMove}
      >
        {/* Background Image Layer (Mobile and Desktop) */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {[ "/2.jpg", "/Videos/maladaptive-cover.jpg", "/5.jpg", "/6.jpg" ].map((imgSrc, idx) => {
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
        <div className="relative max-w-7xl w-full mx-auto z-10 flex flex-col gap-5 md:gap-8 pl-2 md:pl-16">
          <AnimatedLink 
            text={lang === "fr" ? "Photos" : "Photos"} 
            href="#works" 
            number="01" 
            onClick={handleLinkClick} 
            isDimmed={hoveredIndex !== null && hoveredIndex !== 0}
            onMouseEnter={(pos) => {
              onPlayHoverSfx?.();
              handleMouseEnter(0, pos);
            }}
            onMouseLeave={handleMouseLeave}
            isOpen={isOpen}
            index={0}
          />
          <AnimatedLink 
            text={lang === "fr" ? "Vidéos" : "Videos"} 
            href="#videos" 
            number="02" 
            onClick={handleLinkClick} 
            isDimmed={hoveredIndex !== null && hoveredIndex !== 1}
            onMouseEnter={(pos) => {
              onPlayHoverSfx?.();
              handleMouseEnter(1, pos);
            }}
            onMouseLeave={handleMouseLeave}
            isOpen={isOpen}
            index={1}
          />
          <AnimatedLink 
            text={lang === "fr" ? "À Propos" : "About"} 
            href="#about" 
            number="03" 
            onClick={handleLinkClick} 
            isDimmed={hoveredIndex !== null && hoveredIndex !== 2}
            onMouseEnter={(pos) => {
              onPlayHoverSfx?.();
              handleMouseEnter(2, pos);
            }}
            onMouseLeave={handleMouseLeave}
            isOpen={isOpen}
            index={2}
          />
          <AnimatedLink 
            text={lang === "fr" ? "Contact" : "Contact"} 
            href="#contact" 
            number="04" 
            onClick={handleLinkClick} 
            isDimmed={hoveredIndex !== null && hoveredIndex !== 3}
            onMouseEnter={(pos) => {
              onPlayHoverSfx?.();
              handleMouseEnter(3, pos);
            }}
            onMouseLeave={handleMouseLeave}
            isOpen={isOpen}
            index={3}
          />
        </div>

        {/* Floating Image Cursor Follower (Mobile and Desktop) */}
        <div 
          ref={floatingRef}
          className="fixed top-0 left-0 pointer-events-none z-[5] will-change-transform"
        >
          <div 
            ref={floatingCardRef}
            className="relative w-[160px] h-[210px] md:w-[260px] md:h-[340px] rounded-lg overflow-hidden border border-white/10 shadow-2xl origin-center -translate-x-1/2 -translate-y-[115%] md:-translate-y-1/2 opacity-0 scale-[0.75] -rotate-5 pointer-events-none transform-gpu"
          >
            <div className="relative w-full h-full bg-[#111]">
              <div className="absolute inset-0 bg-black/15 z-10 pointer-events-none" />

              {/* Image 01: Photos */}
              <div 
                data-index={0}
                className="absolute inset-0 transition-opacity duration-700 ease-in-out overflow-hidden"
                style={{ opacity: hoveredIndex === 0 ? 1 : 0 }}
              >
                <img 
                  src="/2.jpg" 
                  alt="Photos Preview" 
                  className="w-full h-full object-cover transform-gpu" 
                />
              </div>
              
              {/* Image 02: Vidéos */}
              <div 
                data-index={1}
                className="absolute inset-0 transition-opacity duration-700 ease-in-out overflow-hidden"
                style={{ opacity: hoveredIndex === 1 ? 1 : 0 }}
              >
                <img 
                  src="/Videos/maladaptive-cover.jpg" 
                  alt="Vidéos Preview" 
                  className="w-full h-full object-cover transform-gpu" 
                />
              </div>

              {/* Image 03: À Propos */}
              <div 
                data-index={2}
                className="absolute inset-0 transition-opacity duration-700 ease-in-out overflow-hidden"
                style={{ opacity: hoveredIndex === 2 ? 1 : 0 }}
              >
                <img 
                  src="/5.jpg" 
                  alt="À Propos Preview" 
                  className="w-full h-full object-cover transform-gpu" 
                />
              </div>
              
              {/* Image 04: Contact */}
              <div 
                data-index={3}
                className="absolute inset-0 transition-opacity duration-700 ease-in-out overflow-hidden"
                style={{ opacity: hoveredIndex === 3 ? 1 : 0 }}
              >
                <img 
                  src="/6.jpg" 
                  alt="Contact Preview" 
                  className="w-full h-full object-cover transform-gpu" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time at top right */}
      <div 
        ref={timeRef} 
        className="fixed top-6 right-6 md:top-8 md:right-12 z-[110] flex flex-col items-end gap-1 mix-blend-difference pointer-events-none -translate-y-8 opacity-0"
      >
        <div className="border border-white/20 px-2 py-0.5 rounded-sm text-[10px] text-white font-mono">
          {time || "00:00:00"}
        </div>
      </div>

      {/* Inline SVG definitions for clip-path morphing */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <clipPath id="menu-clip" clipPathUnits="objectBoundingBox">
            <path ref={pathRef} d="M 0,0 L 1,0 L 1,0 Q 0.5,0 0,0 Z" />
          </clipPath>
        </defs>
      </svg>
    </>
  );
}
