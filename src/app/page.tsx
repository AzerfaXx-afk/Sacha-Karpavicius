"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Preloader from "@/components/preloader";
import Navbar from "@/components/navbar";
import CustomCursor from "@/components/custom-cursor";
import { projectsData, videoProjectsData } from "@/data/projects";
import { useSiteContext } from "@/context/site-context";
import { lockScrollForNavigation } from "@/utils/scroll-lock";

gsap.registerPlugin(ScrollTrigger);

/* ──── Project data ──── */
const projects = [
  { src: "/img/projet1/extend back.png", title: "AEMONA & FADA", category: "Portrait" },
  { src: "/img/projet2/DSC02768.jpg", title: "FADA", category: "Portrait" },
  { src: "/img/projet3/DSC07375-3.jpg", title: "CROSSOVER FESTIVAL AYMCE", category: "Festival" },
  { src: "/img/projet4/1.jpg", title: "AUTOPORTRAIT", category: "Portrait" },
  { src: "/img/projet5/FAB09470 copie-2.jpg", title: "Margiela - LA FABRIC", category: "Fashion" },
  { src: "/img/projet6/Sans titre - 11 mars 2026 15.07.jpg", title: "LA FABRIC", category: "Editorial" },
  { src: "/img/projet7/IMG_3069-2.jpg", title: "PORTRAIT VII", category: "Portrait" },
];

/* ──── About Image Card with 3D Tilt Glare Effect ──── */
/* ──── About Image Card with 3D Tilt Glare Effect ──── */
const AboutImageCard = ({ isMenuOpen }: { isMenuOpen: boolean }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const isTouching = useRef(false);
  const touchTimeout = useRef<NodeJS.Timeout | null>(null);
  const isMobileDevice = useRef(false);

  useEffect(() => {
    isMobileDevice.current = typeof window !== "undefined" && (window.innerWidth < 768 || ("ontouchstart" in window) || (navigator.maxTouchPoints > 0));
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobileDevice.current) return;
    if (!cardRef.current || !imgRef.current || !glareRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;

    // Card frame: 3D tilt
    gsap.to(cardRef.current, {
      rotateY: x * 30,
      rotateX: -y * 30,
      transformPerspective: 1000,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });

    // Inner image: translate opposite to tilt for parallax window effect
    gsap.to(imgRef.current, {
      x: -x * 25,
      y: -y * 25,
      scale: 1.15,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });

    // Glare: follow mouse client position inside the card container
    const glareX = e.clientX - left;
    const glareY = e.clientY - top;
    gsap.to(glareRef.current, {
      x: glareX - width / 2,
      y: glareY - height / 2,
      opacity: 0.7,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current || !imgRef.current || !glareRef.current) return;
    gsap.to(cardRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.8,
      ease: "power3.out",
      overwrite: "auto",
    });
    gsap.to(imgRef.current, {
      x: 0,
      y: 0,
      scale: 1.0,
      duration: 0.8,
      ease: "power3.out",
      overwrite: "auto",
    });
    gsap.to(glareRef.current, {
      x: 0,
      y: 0,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isMobileDevice.current) return;
    if (!cardRef.current || !imgRef.current) return;
    isTouching.current = true;
    if (touchTimeout.current) clearTimeout(touchTimeout.current);

    const touch = e.touches[0];
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (touch.clientX - left) / width - 0.5;
    const y = (touch.clientY - top) / height - 0.5;

    gsap.to(cardRef.current, {
      rotateY: x * 35,
      rotateX: -y * 35,
      transformPerspective: 1000,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });

    gsap.to(imgRef.current, {
      x: -x * 20,
      y: -y * 20,
      scale: 1.15,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isMobileDevice.current) return;
    if (!cardRef.current || !imgRef.current) return;
    const touch = e.touches[0];
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (touch.clientX - left) / width - 0.5;
    const y = (touch.clientY - top) / height - 0.5;

    gsap.to(cardRef.current, {
      rotateY: x * 35,
      rotateX: -y * 35,
      transformPerspective: 1000,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });

    gsap.to(imgRef.current, {
      x: -x * 20,
      y: -y * 20,
      scale: 1.15,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleTouchEnd = () => {
    if (isMobileDevice.current) return;
    handleMouseLeave();
    if (touchTimeout.current) clearTimeout(touchTimeout.current);
    touchTimeout.current = setTimeout(() => {
      isTouching.current = false;
    }, 500); // Wait for the spring back animation to finish before letting gyro take over
  };

  // Mobile Gyroscope tilt interaction
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (isTouching.current || e.gamma == null || e.beta == null || !cardRef.current || !imgRef.current || isMenuOpen) return;
      
      const rawX = gsap.utils.clamp(-30, 30, e.gamma * 0.9);
      const rawY = gsap.utils.clamp(-30, 30, (e.beta - 50) * 0.9);

      // Card frame: very subtle tilt (nearly static)
      gsap.to(cardRef.current, {
        rotateY: rawX * 0.15,
        rotateX: -rawY * 0.15,
        transformPerspective: 1200,
        duration: 1.2,
        ease: "power2.out",
        overwrite: "auto",
      });

      // Inner image: large translation for parallax-window effect
      gsap.to(imgRef.current, {
        x: -rawX * 1.2,
        y: -rawY * 1.2,
        scale: 1.12,
        duration: 1.2,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      if (touchTimeout.current) clearTimeout(touchTimeout.current);
    };
  }, [isMenuOpen]);

  // Center/reset when menu is opened
  useEffect(() => {
    if (isMenuOpen && cardRef.current && imgRef.current && glareRef.current) {
      gsap.to(cardRef.current, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.8,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(imgRef.current, {
        x: 0,
        y: 0,
        scale: 1.0,
        duration: 0.8,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(glareRef.current, {
        x: 0,
        y: 0,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  }, [isMenuOpen]);

  return (
    <div
      data-about-img
      className="w-full max-w-[300px] aspect-[3/4] rounded-lg will-change-transform"
      style={{ perspective: "1000px" }}
    >
      <div
        ref={cardRef}
        className="relative w-full h-full rounded-lg overflow-hidden border border-white/10 shadow-2xl cursor-pointer group select-none touch-pan-y"
        style={{ transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imgRef}
          src="/1.jpg"
          alt="Sacha Karpavicius Portrait"
          className="w-full h-full object-cover pointer-events-none"
        />
        {/* Shine glare overlay layer */}
        <div
          ref={glareRef}
          className="absolute w-[150%] h-[150%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_70%)] pointer-events-none -translate-x-1/2 -translate-y-1/2 mix-blend-overlay opacity-0"
          style={{ left: "50%", top: "50%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>
    </div>
  );
};


/* ──── Interactive List Item ──── */
const InteractiveListItem = ({ text, onMouseEnter, onClick }: { text: string; onMouseEnter?: () => void; onClick?: () => void }) => {
  const [isTouchHovered, setIsTouchHovered] = useState(false);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const touchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    if (touchTimeout.current) clearTimeout(touchTimeout.current);
    touchTimeout.current = setTimeout(() => {
      setIsTouchHovered(true);
      onMouseEnter?.();
    }, 100);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);
    if (dx > 10 || dy > 10) {
      if (touchTimeout.current) clearTimeout(touchTimeout.current);
      setIsTouchHovered(false);
    }
  };

  const handleTouchEnd = () => {
    if (touchTimeout.current) clearTimeout(touchTimeout.current);
    setTimeout(() => {
      setIsTouchHovered(false);
    }, 250);
  };

  return (
    <li 
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      data-touch-hover={isTouchHovered}
      className="group flex items-center justify-between py-2.5 border-b border-white/[0.04] transition-colors duration-300 hover:text-white data-[touch-hover=true]:text-white cursor-pointer select-none"
    >
      <span className="transition-transform duration-300 group-hover:translate-x-2 group-data-[touch-hover=true]:translate-x-2 flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-white opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-data-[touch-hover=true]:opacity-100 group-data-[touch-hover=true]:scale-100 transition-all duration-300" />
        {text}
      </span>
      <div className="relative overflow-hidden w-4 h-4 flex items-center justify-end">
        <span className="absolute transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-data-[touch-hover=true]:translate-x-0 group-data-[touch-hover=true]:opacity-100 transition-all duration-300 ease-out font-mono text-[10px]">
          →
        </span>
        <span className="absolute transform translate-x-0 opacity-100 group-hover:translate-x-4 group-hover:opacity-0 group-data-[touch-hover=true]:translate-x-4 group-data-[touch-hover=true]:opacity-0 transition-all duration-300 ease-out font-mono text-[10px] text-white/30">
          →
        </span>
      </div>
    </li>
  );
};

/* ──── Rolling Letter Text Component ──── */
const RollingText = ({ text, className }: { text: string; className?: string }) => {
  return (
    <span className={`inline-block relative overflow-hidden group/roll ${className || ""}`}>
      <span className="relative inline-flex flex-wrap justify-center">
        {text.split("").map((char, i) => (
          <span
            key={i}
            className="inline-block transition-transform duration-[600ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/roll:-translate-y-[115%]"
            style={{ transitionDelay: `${i * 15}ms` }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
      <span className="absolute left-0 top-0 inline-flex flex-wrap justify-center pointer-events-none w-full">
        {text.split("").map((char, i) => (
          <span
            key={i}
            className="inline-block translate-y-[115%] transition-transform duration-[600ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/roll:translate-y-0"
            style={{ transitionDelay: `${i * 15}ms` }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
    </span>
  );
};

/* ──── Gapless Web Audio Player ──── */
class GaplessPlayer {
  private ctx: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private url: string;
  private loaded = false;

  constructor(url: string) {
    this.url = url;
  }

  async load() {
    if (typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    
    try {
      this.ctx = new AudioContextClass();
      const response = await fetch(this.url);
      const arrayBuffer = await response.arrayBuffer();
      this.buffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.loaded = true;
    } catch (err) {
      console.warn("Failed to load/decode audio:", err);
    }
  }

  /** Resume AudioContext – must be called inside a user-gesture handler */
  async resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      try { await this.ctx.resume(); } catch { console.warn("AudioContext resume failed"); }
    }
  }

  play(targetVolume = 0.5, fadeDuration = 1.5) {
    if (!this.loaded || !this.buffer || !this.ctx) return;
    if (this.isPlaying) return;

    // Always attempt resume (no-op if already running)
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    this.source = this.ctx.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = true;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(targetVolume, this.ctx.currentTime + fadeDuration);

    this.source.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    this.source.start(0);
    this.isPlaying = true;
  }

  pause(fadeDuration = 1.5) {
    if (!this.ctx || !this.gainNode || !this.source || !this.isPlaying) return;

    this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ctx.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + fadeDuration);

    try {
      this.source.stop(this.ctx.currentTime + fadeDuration);
    } catch {
      // ignore errors if source was already stopped or not started
    }

    this.isPlaying = false;
  }
}

/** Helper: warm up an HTMLAudioElement inside a user-gesture so the browser
 *  marks it as "user-activated" and allows future programmatic plays. */
function warmUpAudio(el: HTMLAudioElement | null) {
  if (!el) return;
  const prevVol = el.volume;
  el.volume = 0;
  el.play()
    .then(() => { el.pause(); el.currentTime = 0; el.volume = prevVol; })
    .catch(() => { el.volume = prevVol; });
}

export default function Home() {
  const router = useRouter();
  const { hasEnteredSite, setHasEnteredSite, isHoveringName, setIsHoveringName, isHideUI, setIsHideUI, isPlaying, toggleAudio, playEntrance } = useSiteContext();
  const [loading, setLoading] = useState(true);
  const [siteStarted, setSiteStarted] = useState(false);
  const isHoveringNameRef = useRef(isHoveringName);
  useEffect(() => {
    isHoveringNameRef.current = isHoveringName;
  }, [isHoveringName]);
  const [isMounted, setIsMounted] = useState(false);
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [isProjectTransitioning, setIsProjectTransitioning] = useState(false);
  
  // Mobile responsive enhancements: Touch-hover and Gyroscope Guide
  const [touchHoveredIndex, setTouchHoveredIndex] = useState<number | null>(null);
  const [showGyroIndicator, setShowGyroIndicator] = useState(false);
  const touchHoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  
  const [isContactTouchHovered, setIsContactTouchHovered] = useState(false);
  const contactTouchStartPos = useRef({ x: 0, y: 0 });
  const contactTouchTimeout = useRef<NodeJS.Timeout | null>(null);

  const [isInstaTouchHovered, setIsInstaTouchHovered] = useState(false);
  const isInstaTouchHoveredRef = useRef(false);
  const instaTouchTimeout = useRef<NodeJS.Timeout | null>(null);
  const instaTouchStartPos = useRef({ x: 0, y: 0 });
  const instaLongPressed = useRef(false);
  const instaTouchStartTime = useRef<number>(0);
  const instaBtnRect = useRef<DOMRect | null>(null);

  // New mobile menu sync & redirect transition states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMenuOpenRef = useRef(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Refs for curtain redirection transition
  const redirectCurtainRef = useRef<HTMLDivElement>(null);
  const redirectTextRef = useRef<HTMLDivElement>(null);
  const instaFooterBtnRef = useRef<HTMLAnchorElement>(null);

  const playerRef = useRef<GaplessPlayer | null>(null);
  const wasPlayingRef = useRef(false);
  const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);
  const entranceAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);

  /** Unlock all audio nodes – safe to call multiple times, only acts once */
  const unlockAllAudio = useCallback(() => {
    if (audioUnlockedRef.current) return;
    audioUnlockedRef.current = true;

    // Resume Web Audio API context
    if (playerRef.current) {
      playerRef.current.resume();
    }

    // Warm up all HTML5 Audio elements
    warmUpAudio(hoverAudioRef.current);
    warmUpAudio(clickAudioRef.current);
    warmUpAudio(entranceAudioRef.current);
  }, []);

  const playHoverSfx = useCallback(() => {
    if (hoverAudioRef.current) {
      hoverAudioRef.current.currentTime = 0;
      hoverAudioRef.current.play().catch(() => {});
    }
  }, []);

  const playClickSfx = useCallback(() => {
    if (clickAudioRef.current) {
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.play().catch(() => {});
    }
  }, []);

  const playEntranceSfx = useCallback(() => {
    if (entranceAudioRef.current) {
      entranceAudioRef.current.currentTime = 0;
      entranceAudioRef.current.play().catch(() => {});
    }
  }, []);

  const handleMagnetMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isRedirecting) return;
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(btn, {
      x: x * 0.35,
      y: y * 0.35,
      scale: 1.02,
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });

    const content = btn.querySelector(".btn-content");
    if (content) {
      gsap.to(content, {
        x: x * 0.15,
        y: y * 0.15,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  const handleMagnetLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isRedirecting) return;
    const btn = e.currentTarget;
    gsap.to(btn, {
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: "elastic.out(1.2, 0.4)",
      overwrite: "auto",
    });

    const content = btn.querySelector(".btn-content");
    if (content) {
      gsap.to(content, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1.2, 0.4)",
        overwrite: "auto",
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);

      // In-app navigation: skip preloader if site was already entered in this React session
      if (hasEnteredSite) {
        setLoading(false);
        setSiteStarted(true);
      } else {
        // F5 / Fresh Page Reload: ALWAYS force preloader & clear URL hash
        setLoading(true);
        setSiteStarted(false);
        if (typeof window !== "undefined" && window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }

      // Language detection
      if (typeof window !== "undefined" && navigator) {
        const userLang = navigator.language || (navigator as Navigator & { userLanguage?: string }).userLanguage;
        if (userLang && !userLang.toLowerCase().startsWith("fr")) {
          setLang("en");
        }
      }

      // Handle smooth scroll to #contact if triggered from project page Contact click
      if (typeof window !== "undefined") {
        const shouldScrollToContact = sessionStorage.getItem("scrollToContact");
        if (shouldScrollToContact === "true") {
          sessionStorage.removeItem("scrollToContact");
          setLoading(false);
          setSiteStarted(true);
          setHasEnteredSite(true);
          setTimeout(() => {
            const contactEl = document.getElementById("contact");
            if (contactEl) {
              contactEl.scrollIntoView({ behavior: "smooth" });
            }
          }, 350);
        }
      }
    }, 0);

    // Initialize gapless background music player
    playerRef.current = new GaplessPlayer("/musique.mp3");
    playerRef.current.load();

    // Initialize SFX
    hoverAudioRef.current = new Audio("/hover.mp3");
    hoverAudioRef.current.volume = 0.08;
    hoverAudioRef.current.preload = "auto";

    clickAudioRef.current = new Audio("/click.mp3");
    clickAudioRef.current.volume = 0.15;
    clickAudioRef.current.preload = "auto";

    entranceAudioRef.current = new Audio("/entrance.mp3");
    entranceAudioRef.current.volume = 0.3;
    entranceAudioRef.current.preload = "auto";

    return () => {
      clearTimeout(timer);
      if (playerRef.current) {
        playerRef.current.pause(0);
      }
    };
  }, [hasEnteredSite]);

  // Keep isHoveringNameRef synced and reset image center on hover
  useEffect(() => {
    isHoveringNameRef.current = isHoveringName;
    if (isHoveringName && heroImgRef.current) {
      gsap.to(heroImgRef.current, {
        x: 0,
        y: 0,
        rotationY: 0,
        rotationX: 0,
        duration: 0.8,
        ease: "power3.out",
        overwrite: "auto"
      });
    }
  }, [isHoveringName]);

  // Play hover sound when user hovers Sacha's name in the preloader
  useEffect(() => {
    if (isHoveringName) {
      playHoverSfx();
    }
  }, [isHoveringName, playHoverSfx]);

  const handleStartSite = useCallback(() => {
    setHasEnteredSite(true);
    setIsHoveringName(false);
    setSiteStarted(true);
    playEntrance();
  }, [setHasEnteredSite, playEntrance]);

  // Handle visibility change (pause music when backgrounded, resume when foregrounded)
  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasPlayingRef.current = isPlaying;
        if (isPlaying && playerRef.current) {
          playerRef.current.pause(0.5);
        }
      } else {
        if (wasPlayingRef.current && playerRef.current) {
          playerRef.current.play(0.5, 0.5);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPlaying]);

  // Gyroscope guide icon idle detection
  useEffect(() => {
    if (!siteStarted) return;
    
    let timer: NodeJS.Timeout;
    let initialGamma: number | null = null;
    let initialBeta: number | null = null;

    const startTimer = () => {
      timer = setTimeout(() => {
        setShowGyroIndicator(true);
      }, 3000);
    };

    const resetTimer = () => {
      clearTimeout(timer);
      setShowGyroIndicator(false);
      startTimer();
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      if (initialGamma === null || initialBeta === null) {
        initialGamma = e.gamma;
        initialBeta = e.beta;
        return;
      }
      
      const deltaGamma = Math.abs(e.gamma - initialGamma);
      const deltaBeta = Math.abs(e.beta - initialBeta);
      
      // If phone tilts by more than 2 degrees, consider it active explorer (hide indicator and reset timer)
      if (deltaGamma > 2 || deltaBeta > 2) {
        initialGamma = e.gamma;
        initialBeta = e.beta;
        resetTimer();
      }
    };

    startTimer();

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [siteStarted]);

  /* Refs */
  const heroRef = useRef<HTMLElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLDivElement>(null);
  const heroSubRef = useRef<HTMLDivElement>(null);
  const worksRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const audioIconRef = useRef<HTMLDivElement>(null);
  const getInTouchRef = useRef<HTMLDivElement>(null);
  const instaBtnRef = useRef<HTMLAnchorElement>(null);

  /* Preloader done callback */
  const onPreloaderComplete = useCallback(() => {
    setLoading(false);
  }, []);

  /* ── UI animations (get in touch, instagram) ── */
  useEffect(() => {
    const uiElements = [getInTouchRef.current, instaBtnRef.current].filter(Boolean);
    if (uiElements.length === 0) return;

    if (siteStarted || isHoveringName) {
      gsap.to(uiElements, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", overwrite: true });
    } else {
      gsap.to(uiElements, { y: 20, opacity: 0, duration: 0.5, ease: "power3.in", overwrite: true });
    }
  }, [siteStarted, isHoveringName]);

  // Mobile menu open / close sync and centering
  useEffect(() => {
    isMenuOpenRef.current = isMenuOpen;
    if (isMenuOpen && heroImgRef.current) {
      gsap.to(heroImgRef.current, {
        x: 0,
        y: 0,
        rotationY: 0,
        rotationX: 0,
        duration: 0.8,
        ease: "power3.out",
        overwrite: "auto"
      });
    }
  }, [isMenuOpen]);

  // Premium Awwwards-style click redirection animation
  const handleInstaClick = (e: React.MouseEvent<HTMLAnchorElement> | React.TouchEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isRedirecting) return;
    setIsRedirecting(true);
    playClickSfx();

    const clickedBtn = e.currentTarget;

    // GSAP Timeline for the button pop and curtain redirect
    const tl = gsap.timeline({
      onComplete: () => {
        // Safe navigation on same window to bypass mobile popup blockers and launch app directly
        window.location.href = "https://www.instagram.com/sachakarpaviciusss/";
        
        // Safety fallback: slide curtain out after redirection starts
        gsap.to(redirectCurtainRef.current, {
          yPercent: -100,
          duration: 0.5,
          ease: "power3.inOut",
          delay: 0.8,
          onComplete: () => {
            setIsRedirecting(false);
            gsap.set(redirectCurtainRef.current, { yPercent: 100 });
            // Reset clicked button styles back to default
            gsap.set(clickedBtn, { scale: 1, backgroundColor: "", color: "", borderColor: "" });
            const children = clickedBtn.querySelectorAll(".text-white, svg");
            gsap.set(children, { color: "", stroke: "" });
          }
        });
      }
    });

    // 1. Button Pop Animation & Color Wipe (turns solid white, text/icon turns black)
    tl.to(clickedBtn, {
      scale: 0.82,
      backgroundColor: "#ffffff",
      borderColor: "#ffffff",
      color: "#000000",
      duration: 0.08,
      ease: "power2.out"
    });

    const textElements = clickedBtn.querySelectorAll(".text-white, svg");
    if (textElements.length > 0) {
      tl.to(textElements, {
        color: "#000000",
        stroke: "#000000",
        duration: 0.08,
        ease: "power2.out"
      }, 0);
    }

    tl.to(clickedBtn, {
      scale: 1.1,
      duration: 0.3,
      ease: "elastic.out(1.2, 0.45)"
    });

    // 2. Fast Curtain slide up (starts at 50ms, covers screen in 450ms)
    tl.to(redirectCurtainRef.current, {
      yPercent: 0,
      duration: 0.45,
      ease: "power3.inOut",
    }, 0.05);

    // Stagger character animations for "INSTAGRAM"
    if (redirectTextRef.current) {
      const chars = redirectTextRef.current.querySelectorAll(".reveal-char");
      tl.fromTo(chars, 
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: "power3.out", stagger: 0.02 },
        0.25 // trigger when curtain covers screen
      );
    }
  };

  // FLIP Zoom Transition to Project Page (Luxurious, Slow & Smooth Awwwards)
  const handleProjectClick = (e: React.MouseEvent, project: any) => {
    e.preventDefault();
    if (isProjectTransitioning) return;
    lockScrollForNavigation(850);
    setIsProjectTransitioning(true);
    setIsHideUI(true);
    playClickSfx();

    const cardElement = e.currentTarget as HTMLElement;
    const imgElement = cardElement.querySelector("img");
    const rect = (imgElement || cardElement).getBoundingClientRect();

    // Create fixed clone container for smooth FLIP zoom
    const clone = document.createElement("div");
    clone.style.position = "fixed";
    clone.style.top = `${rect.top}px`;
    clone.style.left = `${rect.left}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.zIndex = "99998";
    clone.style.overflow = "hidden";
    clone.style.borderRadius = "8px";
    clone.style.boxShadow = "0 35px 70px -15px rgba(0,0,0,0.9)";
    clone.style.pointerEvents = "none";
    clone.style.willChange = "transform, width, height, top, left, border-radius, opacity";
    clone.style.transformOrigin = "center center";

    const img = document.createElement("img");
    img.src = project.coverImage || project.src || "/2.jpg";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    
    // Parse objectPosition (e.g. object-[center_28%] -> center 28%)
    const rawPos = project.objectPosition || "";
    const cleanPos = rawPos.includes("[") ? rawPos.split("[")[1].split("]")[0].replace("_", " ") : "center 28%";
    img.style.objectPosition = cleanPos || "center 28%";
    img.style.transition = "none";

    clone.appendChild(img);
    document.body.appendChild(clone);

    // Background curtain overlay — gradual darken
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.backgroundColor = "#050505";
    overlay.style.opacity = "0";
    overlay.style.zIndex = "99997";
    overlay.style.pointerEvents = "none";
    document.body.appendChild(overlay);

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const tl = gsap.timeline();

    // 1. Subtle depth overlay fade (0.4s)
    tl.to(overlay, {
      opacity: 0.6,
      duration: 0.4,
      ease: "power2.out"
    }, 0);

    // 2. Expand clicked cover card gracefully from its grid position to 100vw x 100vh fullscreen hero (0.85s Awwwards curve)
    tl.to(clone, {
      top: 0,
      left: 0,
      width: viewportWidth,
      height: viewportHeight,
      borderRadius: "0px",
      boxShadow: "none",
      duration: 0.85,
      ease: "cubic-bezier(0.76, 0, 0.24, 1)",
      onComplete: () => {
        if (typeof window !== "undefined") {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
        router.push(`/project/${project.slug || "editorial-1"}`);

        // Luxurious hand-off: smooth cross-fade clone over newly mounted project page hero image
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.scrollTo(0, 0);
          }
          gsap.to([clone, overlay], {
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
              clone.remove();
              overlay.remove();
              setIsProjectTransitioning(false);
            }
          });
        }, 150);
      }
    }, 0);
  };


  /* Page entry animations */
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
      }
      const scrollToContact = sessionStorage.getItem("scrollToContact");
      if (!scrollToContact) {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    }
    if (!siteStarted) return;
    const ctx = gsap.context(() => {
      /* ── Hero reveal ── */
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.5 });

      heroTl.to(
        heroImgRef.current,
        { scale: 1.05, duration: 4.0, ease: "power3.out" },
        0
      );

      heroTl.fromTo(
        heroTitleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2 },
        0.2
      );

      if (heroSubRef.current) {
        heroTl.fromTo(
          heroSubRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          0.4
        );
      }

      /* ── Hero parallax on scroll ── */
      gsap.to(heroRef.current, {
        y: 100,
        opacity: 0,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      /* ── About image parallax ── */
      gsap.to("[data-about-img]", {
        yPercent: -12,
        ease: "none",
        scrollTrigger: {
          trigger: aboutRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      /* ── Works image parallax ── */
      document.querySelectorAll("[data-parallax-img]").forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: img.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });

      /* ── Works cards scroll reveal ── */
      const workCards = document.querySelectorAll("[data-work-card]");
      workCards.forEach((card) => {
        gsap.fromTo(
          card,
          { y: 120, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      /* ── Horizontal line reveals ── */
      document.querySelectorAll("[data-line-reveal]").forEach((line) => {
        gsap.fromTo(
          line,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.5,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: line,
              start: "top 95%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      document.querySelectorAll("[data-text-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.0,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    });

    return () => {
      ctx.revert();
    };
  }, [siteStarted]);

  /* Mouse Parallax (always active) */
  useEffect(() => {
    const isMobileDevice = typeof window !== "undefined" && (window.innerWidth < 768 || ("ontouchstart" in window) || (navigator.maxTouchPoints > 0));

    const ctx = gsap.context(() => {
      // Desktop: Smooth, subtle mouse tracking using gsap.to directly to avoid StrictMode issues
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 40;
        const yPos = (clientY / window.innerHeight - 0.5) * 40;

        if (heroImgRef.current) {
          gsap.to(heroImgRef.current, {
            x: xPos,
            y: yPos,
            rotationY: xPos * 0.05,
            rotationX: -yPos * 0.05,
            duration: 2.5,
            ease: "power2.out",
            overwrite: "auto"
          });
        }
      };

      // Mobile: Gyroscope / Tilt tracking
      const handleOrientation = (e: DeviceOrientationEvent) => {
        if (e.gamma == null || e.beta == null || isHoveringNameRef.current || isMenuOpenRef.current) return;
        
        // Map tilt angles to wider translation limits (-55px to 55px) and center around normal holding angle (45-50deg)
        const xPos = gsap.utils.clamp(-55, 55, e.gamma * 1.5);
        const yPos = gsap.utils.clamp(-55, 55, (e.beta - 50) * 1.5);

        if (heroImgRef.current) {
          gsap.to(heroImgRef.current, {
            x: xPos,
            y: yPos,
            rotationY: xPos * 0.15,
            rotationX: -yPos * 0.15,
            duration: 2.0,
            ease: "power2.out",
            overwrite: "auto"
          });
        }

        // Apply same gyroscope movement to Instagram button
        if (instaBtnRef.current) {
          gsap.to(instaBtnRef.current, {
            x: xPos * 0.35,
            y: yPos * 0.35,
            duration: 2.0,
            ease: "power2.out",
            overwrite: "auto"
          });
          const content = instaBtnRef.current.querySelector(".btn-content");
          if (content) {
            gsap.to(content, {
              x: xPos * 0.15,
              y: yPos * 0.15,
              duration: 2.0,
              ease: "power2.out",
              overwrite: "auto"
            });
          }
        }
      };

      if (!isMobileDevice) {
        window.addEventListener("mousemove", handleMouseMove);
      }
      window.addEventListener("deviceorientation", handleOrientation);
      return () => {
        if (!isMobileDevice) {
          window.removeEventListener("mousemove", handleMouseMove);
        }
        window.removeEventListener("deviceorientation", handleOrientation);
      };
    });
    return () => ctx.revert();
  }, []);

  if (!isMounted) return <div className="bg-[#0a0a0a] min-h-screen" />;

  return (
    <>
      <CustomCursor />
      {/* Preloader */}
      {loading && <Preloader onComplete={onPreloaderComplete} onStart={handleStartSite} onHoverChange={setIsHoveringName} lang={lang} />}

      <Navbar 
        showUI={siteStarted || isHoveringName} 
        clickable={siteStarted} 
        lang={lang} 
        onPlayClickSfx={playClickSfx}
        onPlayHoverSfx={playHoverSfx}
        onMenuToggle={setIsMenuOpen}
      />

      <style>{`
        @keyframes phone-tilt {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(-12deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(12deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-phone-tilt {
          animation: phone-tilt 2.5s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>


      {/* Persistent Get In Touch (Bottom Left) */}
      <div ref={getInTouchRef} className={`fixed bottom-6 left-6 md:bottom-10 md:left-12 z-[100] mix-blend-difference opacity-0 ${siteStarted ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <a 
          href="#contact" 
          onClick={(e) => {
            e.preventDefault();
            playClickSfx();
            const contactEl = document.getElementById("contact");
            if (contactEl) {
              contactEl.scrollIntoView({ behavior: "smooth" });
            }
          }}
          data-touch-hover={isContactTouchHovered}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            contactTouchStartPos.current = { x: touch.clientX, y: touch.clientY };
            if (contactTouchTimeout.current) clearTimeout(contactTouchTimeout.current);
            contactTouchTimeout.current = setTimeout(() => {
              setIsContactTouchHovered(true);
            }, 100);
          }}
          onTouchMove={(e) => {
            const touch = e.touches[0];
            const dx = Math.abs(touch.clientX - contactTouchStartPos.current.x);
            const dy = Math.abs(touch.clientY - contactTouchStartPos.current.y);
            if (dx > 10 || dy > 10) {
              if (contactTouchTimeout.current) clearTimeout(contactTouchTimeout.current);
              setIsContactTouchHovered(false);
            }
          }}
          onTouchEnd={() => {
            if (contactTouchTimeout.current) clearTimeout(contactTouchTimeout.current);
            setTimeout(() => {
              setIsContactTouchHovered(false);
            }, 250);
          }}
          onTouchCancel={() => {
            if (contactTouchTimeout.current) clearTimeout(contactTouchTimeout.current);
            setIsContactTouchHovered(false);
          }}
          className="inline-flex items-center gap-1.5 border border-white/20 px-3 py-2 md:px-4 md:py-2.5 rounded-sm hover:bg-white hover:text-black data-[touch-hover=true]:bg-white data-[touch-hover=true]:text-black transition-all duration-300 font-inter text-[10px] md:text-[12px] text-white cursor-pointer group"
        >
          {lang === "fr" ? "Contactez-moi" : "Get in touch"}
          <div className="relative overflow-hidden w-3 h-3 flex items-center justify-center">
            <span className="absolute transform -translate-x-3 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-data-[touch-hover=true]:translate-x-0 group-data-[touch-hover=true]:opacity-100 transition-all duration-300 ease-out font-mono text-[11px]">
              →
            </span>
            <span className="absolute transform translate-x-0 opacity-100 group-hover:translate-x-3 group-hover:opacity-0 group-data-[touch-hover=true]:translate-x-3 group-data-[touch-hover=true]:opacity-0 transition-all duration-300 ease-out font-mono text-[11px] text-white/50">
              →
            </span>
          </div>
        </a>
      </div>



      {/* Awwwards Curtain Redirect Overlay */}
      <div 
        ref={redirectCurtainRef}
        className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center pointer-events-none transform-gpu"
        style={{ transform: "translateY(100%)" }}
      >
        <div className="text-center space-y-6">
          <div ref={redirectTextRef} className="overflow-hidden py-2">
            <h2 className="font-syne font-bold text-[6vw] md:text-[3vw] tracking-tight uppercase text-white flex justify-center gap-1">
              {"INSTAGRAM".split("").map((char, i) => (
                <span key={i} className="reveal-char inline-block">{char}</span>
              ))}
            </h2>
          </div>
          <p className="font-mono text-[10px] md:text-[12px] tracking-[0.4em] text-white/40 uppercase animate-pulse">
            {lang === "fr" ? "Ouverture du profil..." : "Opening profile..."}
          </p>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 font-inter text-[9px] tracking-[0.2em] text-white/20 uppercase">
          Sacha Karpavicius — Editorial Photographer
        </div>
      </div>

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section
        ref={heroRef}
        id="hero"
        className="relative w-full h-screen overflow-hidden bg-[#050505]"
      >
        {/* Central Image Container (Awwwards Profile Portrait) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-6 md:mt-0" style={{ perspective: "1000px" }}>
          <div
            ref={heroImgRef}
            className="relative w-[88vw] max-w-[480px] h-[65vh] md:h-[700px] rounded-2xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.8)]"
            style={{
              WebkitMaskImage: "radial-gradient(ellipse 92% 92% at 50% 50%, black 75%, transparent 100%)",
              maskImage: "radial-gradient(ellipse 92% 92% at 50% 50%, black 75%, transparent 100%)"
            }}
          >
            <Image
              src="/principal.jpg"
              alt="Sacha Karpavicius - Visual Storyteller"
              fill
              sizes="(max-width: 768px) 90vw, 600px"
              className="object-cover object-center scale-100 transform-gpu brightness-[1.03] contrast-[1.05]"
              priority
              quality={100}
            />
            {/* Pure, smooth bottom gradient fade into #050505 for flawless title legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Hero Title Block */}
        <div className="absolute bottom-20 md:bottom-16 left-1/2 -translate-x-1/2 text-center z-20 w-full px-4 pointer-events-none">
          <div ref={heroTitleRef} style={{ opacity: 0 }}>
            <h1 className="font-syne font-semibold text-[24px] md:text-[32px] leading-[1.25] pb-2 text-white tracking-wide uppercase pointer-events-auto cursor-default flex flex-col items-center drop-shadow-2xl">
              {lang === "fr" ? (
                <>
                  <RollingText text="Sacha Karpavicius" />
                  <RollingText text="Arts Visuels" className="text-white/60 font-normal mt-1 text-[18px] md:text-[24px]" />
                </>
              ) : (
                <>
                  <RollingText text="Sacha Karpavicius" />
                  <RollingText text="Visual Arts" className="text-white/60 font-normal mt-1 text-[18px] md:text-[24px]" />
                </>
              )}
            </h1>
          </div>
          
          {/* Gyroscope Idle Guide Prompt (Discrete Styled Icon, No Text) */}
          <div 
            className={`absolute top-full mt-4 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-1000 ease-in-out md:hidden ${
              showGyroIndicator ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.03)] text-white/45 animate-phone-tilt">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="7" y="3" width="10" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="11" y1="19" x2="13" y2="19" strokeLinecap="round" />
                <path d="M4 14C3.2 12.8 3.2 11.2 4 10" strokeLinecap="round" />
                <path d="M20 10C20.8 11.2 20.8 12.8 20 14" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>


      </section>

      {/* ═══════════════════ WORKS SECTION ═══════════════════ */}
      <section ref={worksRef} id="works" className="relative bg-[#0a0a0a] pt-20 md:pt-28 pb-20 md:pb-32">
        {/* Section header */}
        <div className="px-5 md:px-16 mb-16 md:mb-24">
          <div data-text-reveal className="flex items-center gap-6 mb-6">
            <span className="font-inter text-[10px] md:text-[11px] tracking-[0.3em] text-white/40 uppercase">
              01
            </span>
            <div
              data-line-reveal
              className="flex-1 h-[1px] bg-white/10 origin-left"
            />
          </div>
          <h2
            data-text-reveal
            className="font-syne font-bold text-[8vw] md:text-[4vw] leading-none tracking-tight text-white uppercase"
          >
            {lang === "fr" ? "Projets Photos" : "Photo Projects"}
          </h2>
        </div>

        {/* Works grid */}
        <div className="px-5 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {projectsData.map((project, idx) => (
            <div
              key={project.id}
              data-work-card
              data-cursor="VIEW"
              onClick={(e) => handleProjectClick(e, project)}
              data-touch-hover={touchHoveredIndex === idx}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                touchStartPos.current = { x: touch.clientX, y: touch.clientY };
                
                if (touchHoverTimeout.current) clearTimeout(touchHoverTimeout.current);
                
                // Trigger touch-hover if they hold for 100ms
                touchHoverTimeout.current = setTimeout(() => {
                  setTouchHoveredIndex(idx);
                }, 100);
              }}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                const dx = Math.abs(touch.clientX - touchStartPos.current.x);
                const dy = Math.abs(touch.clientY - touchStartPos.current.y);
                
                // If finger moves more than 10px, assume they are scrolling -> cancel hover
                if (dx > 10 || dy > 10) {
                  if (touchHoverTimeout.current) clearTimeout(touchHoverTimeout.current);
                  setTouchHoveredIndex(null);
                }
              }}
              onTouchEnd={() => {
                if (touchHoverTimeout.current) clearTimeout(touchHoverTimeout.current);
                // Clear state after a short delay so the visual highlights react nicely
                setTimeout(() => {
                  setTouchHoveredIndex(null);
                }, 250);
              }}
              onTouchCancel={() => {
                if (touchHoverTimeout.current) clearTimeout(touchHoverTimeout.current);
                setTouchHoveredIndex(null);
              }}
              className="group relative overflow-hidden cursor-pointer"
            >
              <div
                className="relative w-full overflow-hidden bg-[#0d0d0d] rounded-xl border border-white/10 aspect-[16/11] md:aspect-[16/10]"
              >
                <div
                  data-parallax-img
                  className="absolute -top-[10%] left-0 w-full h-[120%] will-change-transform"
                >
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    fill
                    className={`object-cover ${project.objectPosition || "object-[center_35%]"} transition-transform duration-[1.2s] ease-[cubic-bezier(.25,.46,.45,.94)] group-hover:scale-105 group-data-[touch-hover=true]:scale-105`}
                    quality={96}
                    sizes="(max-width: 768px) 100vw, 1200px"
                  />
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 group-data-[touch-hover=true]:bg-black/30 transition-colors duration-700" />
              </div>

              {/* Project info */}
              <div className="mt-4 relative overflow-hidden">
                <div className="flex items-center justify-between py-1">
                  {/* Title with ultra-smooth left-to-right letter spacing expansion */}
                  <h3 className="font-syne font-bold text-[15px] md:text-[18px] tracking-tight group-hover:tracking-[0.15em] group-data-[touch-hover=true]:tracking-[0.15em] text-white/90 group-hover:text-white group-data-[touch-hover=true]:text-white uppercase transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                    {project.title}
                  </h3>

                  {/* Silky left-to-right sliding line */}
                  <div className="flex-1 mx-4 h-[1px] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/50 to-white/90 scale-x-0 group-hover:scale-x-100 group-data-[touch-hover=true]:scale-x-100 origin-left transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]" />
                  </div>

                  {/* Number & Arrow sliding smoothly from left to right */}
                  <span className="text-[12px] font-mono text-white/70 opacity-0 group-hover:opacity-100 group-data-[touch-hover=true]:opacity-100 -translate-x-3 group-hover:translate-x-0 group-data-[touch-hover=true]:translate-x-0 transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-100 shrink-0">
                    0{idx + 1} ↗
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ PROJETS VIDÉOS SECTION ═══════════════════ */}
      <section id="videos" className="relative bg-[#050505] pt-20 md:pt-28 pb-12 border-t border-white/10">
        <div className="px-5 md:px-16 mb-12 md:mb-16">
          <div data-text-reveal className="flex items-center gap-6 mb-6">
            <span className="font-inter text-[10px] md:text-[11px] tracking-[0.3em] text-white/40 uppercase">
              02
            </span>
            <div data-line-reveal className="flex-1 h-[1px] bg-white/10 origin-left" />
          </div>
          <h2
            data-text-reveal
            className="font-syne font-bold text-[8vw] md:text-[4vw] leading-none tracking-tight text-white uppercase"
          >
            {lang === "fr" ? "Projets Vidéos" : "Video Projects"}
          </h2>
        </div>

        {/* Video projects - Full-width Widescreen & Cinema Poster Adaptive Cards */}
        <div className="px-5 md:px-16 space-y-10 md:space-y-14">
          {videoProjectsData.map((project) => {
            const isPoster = project.coverImage.toLowerCase().includes("affiche");
            return (
              <div
                key={project.id}
                data-work-card
                data-cursor="PLAY"
                onClick={(e) => handleProjectClick(e, project)}
                className="group relative overflow-hidden cursor-pointer rounded-xl border border-white/10 bg-[#0d0d0d]"
              >
                <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden flex items-center justify-center">
                  {/* Ambient Blurred Background for Cinema Posters */}
                  <div className="absolute inset-0 scale-110 blur-3xl opacity-35 pointer-events-none">
                    <Image
                      src={project.coverImage}
                      alt=""
                      fill
                      className="object-cover object-center"
                      quality={30}
                    />
                  </div>

                  {/* Main Cover Media */}
                  <div data-parallax-img className="absolute inset-0 w-full h-full will-change-transform">
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      className={`${
                        isPoster ? "object-contain p-2 md:p-4" : "object-cover"
                      } object-center transition-transform duration-[1.2s] ease-[cubic-bezier(.25,.46,.45,.94)] group-hover:scale-105`}
                      quality={96}
                      sizes="100vw"
                    />
                  </div>

                  {/* Dark bottom gradient overlay for crystal clear text readability directly on the image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                  {/* Play Button Overlay (Centered) */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-700 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 border border-white/30 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-500 shadow-2xl">
                      <svg className="w-6 h-6 md:w-8 md:h-8 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Text Overlay directly OVER the image at the bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 z-10 flex items-end justify-between gap-4 pointer-events-none">
                    <div className="space-y-1 max-w-2xl">
                      <h3 className="font-syne font-bold text-[18px] md:text-[24px] tracking-tight group-hover:tracking-[0.15em] text-white uppercase drop-shadow-lg transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                        {project.title}
                      </h3>
                      {(project.descriptionFr || project.subtitle) && (
                        <p className="font-inter text-[12px] md:text-[14px] text-white/90 font-light leading-relaxed drop-shadow-md">
                          {lang === "fr" ? project.descriptionFr : (project.descriptionEn || project.descriptionFr || project.subtitle)}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">
                      <span className="font-mono text-[11px] md:text-[13px] tracking-[0.2em] text-white/80 uppercase drop-shadow-md">
                        {project.year}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════ ABOUT SECTION ═══════════════════ */}
      <section ref={aboutRef} id="about" className="relative bg-[#0a0a0a] pt-20 md:pt-28 pb-32 md:pb-[50vh] overflow-hidden">
        <div className="px-5 md:px-16">
          <div data-text-reveal className="flex items-center gap-6 mb-16 md:mb-24">
            <span className="font-inter text-[10px] md:text-[11px] tracking-[0.3em] text-white/40 uppercase">
              03
            </span>
            <div data-line-reveal className="flex-1 h-[1px] bg-white/10 origin-left" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
            {/* Left: Text Info */}
            <div className="md:col-span-4 space-y-8" data-text-reveal>
              <h2 className="font-syne font-bold text-[10vw] md:text-[4vw] leading-[0.95] tracking-tight text-white uppercase">
                Sacha<br />Karpavicius
              </h2>
              <p className="font-inter text-[13px] md:text-[14px] leading-relaxed text-white/50 max-w-md">
                {lang === "fr" ? (
                  <>
                    Visual Storyteller basé entre Paris et Milan. Spécialisé dans la photographie de mode, le portrait éditorial et la direction artistique. Chaque image est une invitation à entrer dans un univers singulier, où la lumière et l&apos;ombre racontent une histoire.
                  </>
                ) : (
                  <>
                    Visual Storyteller based between Paris and Milan. Specializing in fashion photography, editorial portraiture and art direction. Each image is an invitation to enter a singular universe, where light and shadow tell a story.
                  </>
                )}
              </p>
            </div>

            {/* Center: Interactive Portrait Card */}
            <div className="md:col-span-4 flex justify-center py-6 md:py-0 md:mt-[20px]" data-text-reveal>
              <AboutImageCard isMenuOpen={isMenuOpen} />
            </div>

            {/* Right: Interactive Lists */}
            <div className="md:col-span-4 space-y-12" data-text-reveal>
              <div>
                <h3 className="font-inter text-[10px] md:text-[11px] tracking-[0.3em] text-white/40 uppercase mb-4">
                  Services
                </h3>
                <ul className="font-inter text-[13px] md:text-[14px] text-white/70">
                  <InteractiveListItem text={lang === "fr" ? "Photographie" : "Photography"} onClick={playClickSfx} />
                  <InteractiveListItem text={lang === "fr" ? "Direction Artistique" : "Art Direction"} onClick={playClickSfx} />
                  <InteractiveListItem text={lang === "fr" ? "Éditorial de Mode" : "Fashion Editorial"} onClick={playClickSfx} />
                  <InteractiveListItem text={lang === "fr" ? "Film & Vidéo" : "Film & Motion"} onClick={playClickSfx} />
                </ul>
              </div>
              <div>
                <h3 className="font-inter text-[10px] md:text-[11px] tracking-[0.3em] text-white/40 uppercase mb-4">
                  Clients
                </h3>
                <ul className="font-inter text-[13px] md:text-[14px] text-white/70">
                  <InteractiveListItem text="Vogue — L'Officiel — Numéro" onClick={playClickSfx} />
                  <InteractiveListItem text="Dior — Chanel — Saint Laurent" onClick={playClickSfx} />
                  <InteractiveListItem text={lang === "fr" ? "Éditoriaux Indépendants" : "Independent Editorials"} onClick={playClickSfx} />
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CONTACT / FOOTER ═══════════════════ */}
      <footer ref={contactRef} id="contact" className="relative bg-[#0a0a0a] pt-20 md:pt-28 pb-4 md:pb-12 min-h-screen flex flex-col justify-between overflow-hidden">
        <div className="px-5 md:px-16 flex-1 flex flex-col justify-between">
          <div>
            <div data-text-reveal className="flex items-center gap-6 mb-16 md:mb-24">
              <span className="font-inter text-[10px] md:text-[11px] tracking-[0.3em] text-white/40 uppercase">
                03
              </span>
              <div data-line-reveal className="flex-1 h-[1px] bg-white/10 origin-left" />
            </div>

            {/* Giant Heading (Non-clickable) */}
            <div data-text-reveal className="mb-16 md:mb-20">
              <h2 className="font-syne font-bold text-[14vw] md:text-[9vw] leading-[0.85] tracking-tight text-white uppercase select-none">
                Contact
              </h2>
            </div>

            {/* Info Grid - Centered Collab Link */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8 md:pt-12" data-text-reveal>
              <div className="md:col-start-4 md:col-span-6 text-center space-y-4 flex flex-col items-center">
                <span className="font-inter text-[10px] md:text-[11px] tracking-[0.3em] text-white/30 uppercase block">
                  COLLAB
                </span>
                <div className="mt-2 w-fit mx-auto transition-transform duration-500">
                  <a
                    ref={instaFooterBtnRef}
                    href="https://www.instagram.com/sachakarpaviciusss/"
                    onClick={handleInstaClick}
                    onMouseMove={handleMagnetMove}
                    onMouseLeave={handleMagnetLeave}
                    className="group relative inline-flex items-center justify-center overflow-hidden px-6 py-3 md:px-10 md:py-4 rounded-full border border-white/10 hover:border-white/30 bg-white/[0.02] transition-[border-color,box-shadow,opacity] duration-500 font-syne font-semibold text-[14px] sm:text-[18px] md:text-[22px] text-white cursor-pointer hover:shadow-[0_0_30px_rgba(255,255,255,0.06)]"
                  >
                    <span className="absolute w-[120%] aspect-square bg-white rounded-full scale-0 group-hover:scale-[2.2] transition-transform duration-[600ms] ease-[cubic-bezier(0.76,0,0.24,1)] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />
                    
                    <span className="btn-content relative z-10 flex items-center justify-center pointer-events-none">
                      <span className="relative overflow-hidden flex items-center h-[1.2em]">
                        <span className="inline-block transition-transform duration-500 ease-out group-hover:-translate-y-[120%]">
                          @sachakarpaviciusss
                        </span>
                        <span className="absolute left-0 inline-block translate-y-[120%] transition-transform duration-500 ease-out group-hover:translate-y-0 text-black">
                          @sachakarpaviciusss
                        </span>
                      </span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar with 12-column grid layout to clear floating buttons */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-8 pb-16 md:pb-0 mt-16 border-t border-white/5 text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-white/20">
            {/* Column 1 & 2: Empty on desktop (covers left Get in Touch floating button) */}
            <div className="hidden md:block md:col-span-2" />

            {/* Copyright */}
            <div className="col-span-1 md:col-span-3 text-center md:text-left">
              <span>© 2026 Sacha Karpavicius</span>
            </div>

            {/* Credit to Adam */}
            <div className="col-span-1 md:col-span-2 text-center">
              <span className="text-white/40 font-medium tracking-[0.25em]">
                {lang === "fr" ? (
                  <>
                    Site créé par <a href="https://www.instagram.com/adam_btp/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/70 transition-colors duration-300 cursor-pointer font-bold">Adam</a>
                  </>
                ) : (
                  <>
                    Website created by <a href="https://www.instagram.com/adam_btp/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/70 transition-colors duration-300 cursor-pointer font-bold">Adam</a>
                  </>
                )}
              </span>
            </div>

            {/* All Rights Reserved */}
            <div className="col-span-1 md:col-span-3 text-center md:text-right">
              <span>{lang === "fr" ? "Tous droits réservés" : "All Rights Reserved"}</span>
            </div>

            {/* Column 11 & 12: Empty on desktop (covers right audio bars floating button) */}
            <div className="hidden md:block md:col-span-2" />
          </div>
        </div>
      </footer>
    </>
  );
}
