"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Preloader from "@/components/preloader";
import Navbar from "@/components/navbar";

gsap.registerPlugin(ScrollTrigger);

/* ──── Project data ──── */
const projects = [
  { src: "/2.jpg", title: "EDITORIAL I", category: "Fashion" },
  { src: "/3.jpg", title: "EDITORIAL II", category: "Portrait" },
  { src: "/4.jpg", title: "AMBIANCE", category: "Mode" },
  { src: "/5.jpg", title: "LUMIÈRE", category: "Story" },
  { src: "/6.jpg", title: "NOCTURNE", category: "Film" },
];

/* ──── About Image Card with 3D Tilt Glare Effect ──── */
const AboutImageCard = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const isTouching = useRef(false);
  const touchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !imgRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;

    gsap.to(cardRef.current, {
      rotateY: x * 20,
      rotateX: -y * 20,
      transformPerspective: 1000,
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto",
    });

    gsap.to(imgRef.current, {
      x: -x * 12,
      y: -y * 12,
      scale: 1.08,
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current || !imgRef.current) return;
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
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || !imgRef.current) return;
    isTouching.current = true;
    if (touchTimeout.current) clearTimeout(touchTimeout.current);

    const touch = e.touches[0];
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (touch.clientX - left) / width - 0.5;
    const y = (touch.clientY - top) / height - 0.5;

    gsap.to(cardRef.current, {
      rotateY: x * 25,
      rotateX: -y * 25,
      transformPerspective: 1000,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });

    gsap.to(imgRef.current, {
      x: -x * 15,
      y: -y * 15,
      scale: 1.1,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || !imgRef.current) return;
    const touch = e.touches[0];
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (touch.clientX - left) / width - 0.5;
    const y = (touch.clientY - top) / height - 0.5;

    gsap.to(cardRef.current, {
      rotateY: x * 25,
      rotateX: -y * 25,
      transformPerspective: 1000,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });

    gsap.to(imgRef.current, {
      x: -x * 15,
      y: -y * 15,
      scale: 1.1,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleTouchEnd = () => {
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
      if (isTouching.current || e.gamma == null || e.beta == null || !cardRef.current || !imgRef.current) return;
      
      // Increased sensitivity (clamp limit -28 to 28, factor 0.9)
      const xRot = gsap.utils.clamp(-28, 28, e.gamma * 0.9);
      const yRot = gsap.utils.clamp(-28, 28, (e.beta - 50) * 0.9);

      gsap.to(cardRef.current, {
        rotateY: xRot,
        rotateX: -yRot,
        transformPerspective: 1000,
        duration: 1.0,
        ease: "power2.out",
        overwrite: "auto",
      });

      gsap.to(imgRef.current, {
        x: -xRot * 0.5,
        y: -yRot * 0.5,
        scale: 1.05,
        duration: 1.0,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      if (touchTimeout.current) clearTimeout(touchTimeout.current);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="relative w-full max-w-[300px] aspect-[3/4] rounded-lg overflow-hidden border border-white/10 shadow-2xl cursor-pointer group will-change-transform select-none touch-pan-y"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      data-about-img
    >
      <img
        ref={imgRef}
        src="/1.jpg"
        alt="Sacha Karpavicius Portrait"
        className="w-full h-full object-cover transition-transform duration-700 ease-out pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
};

/* ──── Interactive List Item ──── */
const InteractiveListItem = ({ text, onMouseEnter, onClick }: { text: string; onMouseEnter?: () => void; onClick?: () => void }) => {
  return (
    <li 
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className="group flex items-center justify-between py-2.5 border-b border-white/[0.04] transition-colors duration-300 hover:text-white cursor-pointer"
    >
      <span className="transition-transform duration-300 group-hover:translate-x-2 flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-white opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
        {text}
      </span>
      <div className="relative overflow-hidden w-4 h-4 flex items-center justify-end">
        <span className="absolute transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out font-mono text-[10px]">
          →
        </span>
        <span className="absolute transform translate-x-0 opacity-100 group-hover:translate-x-4 group-hover:opacity-0 transition-all duration-300 ease-out font-mono text-[10px] text-white/30">
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
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [siteStarted, setSiteStarted] = useState(false);
  const [isHoveringName, setIsHoveringName] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [lang, setLang] = useState<"fr" | "en">("fr");
  
  // Mobile responsive enhancements: Touch-hover and Gyroscope Guide
  const [touchHoveredIndex, setTouchHoveredIndex] = useState<number | null>(null);
  const [showGyroIndicator, setShowGyroIndicator] = useState(false);
  const touchHoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  
  const [isInstaTouchHovered, setIsInstaTouchHovered] = useState(false);
  const instaTouchTimeout = useRef<NodeJS.Timeout | null>(null);
  const instaTouchStartPos = useRef({ x: 0, y: 0 });

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

      // Language detection
      if (typeof window !== "undefined" && navigator) {
        const userLang = navigator.language || (navigator as Navigator & { userLanguage?: string }).userLanguage;
        if (userLang && !userLang.toLowerCase().startsWith("fr")) {
          setLang("en");
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
  }, []);

  // Play hover sound when user hovers Sacha's name in the preloader
  useEffect(() => {
    if (isHoveringName) {
      playHoverSfx();
    }
  }, [isHoveringName, playHoverSfx]);

  const handleStartSite = useCallback(() => {
    // ★ This runs inside a user click – the ONLY reliable place to unlock audio
    unlockAllAudio();

    setSiteStarted(true);

    // Small delay so the browser registers the gesture before we play
    setTimeout(() => {
      playEntranceSfx();
      if (playerRef.current) {
        playerRef.current.play(0.5, 4);
        setIsPlaying(true);
      }
    }, 50);
  }, [playEntranceSfx, unlockAllAudio]);

  const toggleAudio = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      setIsPlaying(false);
      playerRef.current.pause(1.5);
    } else {
      setIsPlaying(true);
      playerRef.current.play(0.5, 1.5);
    }
  };

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
    let hasInteracted = false;
    let initialGamma: number | null = null;
    let initialBeta: number | null = null;

    const startTimer = () => {
      timer = setTimeout(() => {
        if (!hasInteracted) {
          setShowGyroIndicator(true);
        }
      }, 3000);
    };

    const handleInteraction = () => {
      hasInteracted = true;
      setShowGyroIndicator(false);
      clearTimeout(timer);
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
      // If phone tilts by more than 3 degrees, consider it active and hide guide
      if (deltaGamma > 3 || deltaBeta > 3) {
        handleInteraction();
      }
    };

    const handleScroll = () => {
      handleInteraction();
    };

    const handleTouch = () => {
      handleInteraction();
    };

    startTimer();

    window.addEventListener("deviceorientation", handleOrientation);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchstart", handleTouch, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchstart", handleTouch);
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

  /* Preloader done callback */
  const onPreloaderComplete = useCallback(() => {
    setLoading(false);
  }, []);

  /* ── UI animations (audio, get in touch) ── */
  useEffect(() => {
    const uiElements = [getInTouchRef.current, audioIconRef.current].filter(Boolean);
    if (uiElements.length === 0) return;

    if (siteStarted || isHoveringName) {
      gsap.to(uiElements, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", overwrite: true });
    } else {
      gsap.to(uiElements, { y: 20, opacity: 0, duration: 0.5, ease: "power3.in", overwrite: true });
    }
  }, [siteStarted, isHoveringName]);

  /* Page entry animations */
  useEffect(() => {
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

      heroTl.fromTo(
        heroSubRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        0.4
      );

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
        if (e.gamma == null || e.beta == null) return;
        
        // Map tilt angles to wider translation limits (-55px to 55px) and center around normal holding angle (45-50deg)
        const xPos = gsap.utils.clamp(-55, 55, e.gamma * 1.5); // increased from 20
        const yPos = gsap.utils.clamp(-55, 55, (e.beta - 50) * 1.5);  // increased from 20

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
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("deviceorientation", handleOrientation);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("deviceorientation", handleOrientation);
      };
    });
    return () => ctx.revert();
  }, []);

  if (!isMounted) return <div className="bg-[#0a0a0a] min-h-screen" />;

  return (
    <>
      {/* Preloader */}
      {loading && <Preloader onComplete={onPreloaderComplete} onStart={handleStartSite} onHoverChange={setIsHoveringName} lang={lang} />}

      <Navbar 
        showUI={siteStarted || isHoveringName} 
        clickable={siteStarted} 
        lang={lang} 
        onPlayClickSfx={playClickSfx}
      />

      <style>{`
        @keyframes sound {
          0% { transform: scaleY(0.2); }
          50% { transform: scaleY(1); }
          100% { transform: scaleY(0.2); }
        }
        .music-bar { transform-origin: center; }
      `}</style>

      {/* Persistent Audio Icon (Bottom Right) */}
      <div
        ref={audioIconRef}
        className={`fixed bottom-6 right-6 md:bottom-10 md:right-12 z-[100] cursor-pointer group mix-blend-difference flex items-center justify-center gap-[4px] h-4 w-8 opacity-0 ${siteStarted ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onClick={toggleAudio}
      >
        <div className={`music-bar w-[3px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${isPlaying ? 'bg-white h-full animate-[sound_1.2s_ease-in-out_infinite]' : 'bg-white/40 h-[3px] group-hover:h-[6px] group-hover:bg-white'}`} />
        <div className={`music-bar w-[3px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${isPlaying ? 'bg-white h-full animate-[sound_0.8s_ease-in-out_infinite_0.2s]' : 'bg-white/40 h-[3px] group-hover:h-[10px] group-hover:bg-white'}`} />
        <div className={`music-bar w-[3px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${isPlaying ? 'bg-white h-full animate-[sound_1.5s_ease-in-out_infinite_0.4s]' : 'bg-white/40 h-[3px] group-hover:h-[6px] group-hover:bg-white'}`} />
        <div className={`music-bar w-[3px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${isPlaying ? 'bg-white h-full animate-[sound_1.0s_ease-in-out_infinite_0.1s]' : 'bg-white/40 h-[3px] group-hover:h-[8px] group-hover:bg-white'}`} />
      </div>

      {/* Persistent Get In Touch (Bottom Left) */}
      <div ref={getInTouchRef} className={`fixed bottom-6 left-6 md:bottom-10 md:left-12 z-[100] mix-blend-difference opacity-0 ${siteStarted ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <a 
          href="#contact" 
          onClick={playClickSfx}
          className="inline-flex items-center gap-2 border border-white/20 px-4 py-2.5 rounded-sm hover:bg-white hover:text-black transition-all duration-300 font-inter text-[11px] md:text-[12px] text-white cursor-pointer group"
        >
          {lang === "fr" ? "Contactez-moi" : "Get in touch"}
          <div className="relative overflow-hidden w-3 h-3 flex items-center justify-center">
            <span className="absolute transform -translate-x-3 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out font-mono text-[11px]">
              →
            </span>
            <span className="absolute transform translate-x-0 opacity-100 group-hover:translate-x-3 group-hover:opacity-0 transition-all duration-300 ease-out font-mono text-[11px] text-white/50">
              →
            </span>
          </div>
        </a>
      </div>

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section
        ref={heroRef}
        id="hero"
        className="relative w-full h-screen overflow-hidden bg-[#050505]"
      >
        {/* Central Image Container */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-10 md:mt-0" style={{ perspective: "1000px" }}>
          <div
            ref={heroImgRef}
            className="relative w-[85vw] h-[65vh] md:w-[600px] md:h-[700px] object-cover"
          >
            <Image
              src="/5.jpg"
              alt="Sacha Karpavicius - Visual Storyteller"
              fill
              className="object-cover object-center"
              priority
              quality={100}
            />
            {/* Extreme dark vignette to blend the image edges completely into the background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_#050505_80%)] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505] opacity-100 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] opacity-100 pointer-events-none" />
            {/* Optional subtle red/warm tint overlay to match the vibe */}
            <div className="absolute inset-0 bg-red-900 mix-blend-overlay opacity-10 pointer-events-none" />
          </div>
        </div>

        <div className="absolute bottom-24 md:bottom-20 left-1/2 -translate-x-1/2 text-center z-20 w-full px-4 pointer-events-none">
          <div ref={heroTitleRef} style={{ opacity: 0 }}>
            <h1 className="font-syne font-medium text-[26px] md:text-[34px] leading-[1.25] pb-2 text-white tracking-wide uppercase pointer-events-auto cursor-default flex flex-col items-center">
              {lang === "fr" ? (
                <>
                  <RollingText text="Sacha Karpavicius" />
                  <RollingText text="Arts Visuels" className="text-white/60 font-normal mt-1 text-[20px] md:text-[26px]" />
                </>
              ) : (
                <>
                  <RollingText text="Sacha Karpavicius" />
                  <RollingText text="Visual Arts" className="text-white/60 font-normal mt-1 text-[20px] md:text-[26px]" />
                </>
              )}
            </h1>
          </div>
          <div ref={heroSubRef} style={{ opacity: 0 }} className="mt-8 flex items-center justify-center gap-12 font-inter text-[12px] md:text-[14px] text-white">
            <span className="w-1.5 h-1.5 bg-white/50 block rounded-sm"></span>
            <span>{lang === "fr" ? "2026 — Futur" : "2026 — Future"}</span>
            <span className="w-1.5 h-1.5 bg-white/50 block rounded-sm"></span>
          </div>
          
          {/* Gyroscope Idle Guide Prompt */}
          <div 
            className={`absolute top-full mt-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 transition-all duration-1000 ease-in-out md:hidden ${
              showGyroIndicator ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="7" y="3" width="10" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="11" y1="19" x2="13" y2="19" strokeLinecap="round" />
              <path d="M4 14C3.2 12.8 3.2 11.2 4 10" strokeLinecap="round" />
              <path d="M20 10C20.8 11.2 20.8 12.8 20 14" strokeLinecap="round" />
            </svg>
            <span className="font-inter text-[7px] tracking-[0.25em] uppercase whitespace-nowrap">
              {lang === "fr" ? "Inclinez pour explorer" : "Tilt to explore"}
            </span>
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
            {lang === "fr" ? "Projets Sélectionnés" : "Selected Works"}
          </h2>
        </div>

        {/* Works grid */}
        <div className="px-5 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {projects.map((project, idx) => (
            <div
              key={idx}
              data-work-card
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
              className={`group relative overflow-hidden cursor-pointer ${idx === 0 ? "md:col-span-2" : ""
                }`}
            >
              <div
                className={`relative w-full overflow-hidden bg-[#111] ${idx === 0 ? "aspect-[16/9]" : "aspect-[4/5] md:aspect-[3/4]"
                  }`}
              >
                <div
                  data-parallax-img
                  className="absolute -top-[10%] left-0 w-full h-[120%] will-change-transform"
                >
                  <Image
                    src={project.src}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.25,.46,.45,.94)] group-hover:scale-105 group-data-[touch-hover=true]:scale-105"
                    quality={90}
                    sizes={idx === 0 ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                  />
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 group-data-[touch-hover=true]:bg-black/30 transition-colors duration-700" />
              </div>

              {/* Project info */}
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="font-syne font-semibold text-[14px] md:text-[16px] tracking-tight text-white group-hover:translate-x-2 group-data-[touch-hover=true]:translate-x-2 transition-transform duration-500">
                  {project.title}
                </h3>
                <span className="font-inter text-[9px] md:text-[10px] tracking-[0.2em] text-white/40 uppercase">
                  {project.category === "Fashion" && lang === "fr" ? "Mode" :
                    project.category === "Story" && lang === "fr" ? "Histoire" :
                      project.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ ABOUT SECTION ═══════════════════ */}
      <section ref={aboutRef} id="about" className="relative bg-[#0a0a0a] pt-20 md:pt-28 pb-32 md:pb-[50vh] overflow-hidden">
        <div className="px-5 md:px-16">
          <div data-text-reveal className="flex items-center gap-6 mb-16 md:mb-24">
            <span className="font-inter text-[10px] md:text-[11px] tracking-[0.3em] text-white/40 uppercase">
              02
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
              <AboutImageCard />
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
      <footer ref={contactRef} id="contact" className="relative bg-[#0a0a0a] pt-20 md:pt-28 pb-8 md:pb-12 min-h-screen flex flex-col justify-between overflow-hidden">
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
                <a
                  href="https://www.instagram.com/sachakarpaviciusss/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseMove={handleMagnetMove}
                  onMouseLeave={handleMagnetLeave}
                  onClick={playClickSfx}
                  data-touch-hover={isInstaTouchHovered}
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    instaTouchStartPos.current = { x: touch.clientX, y: touch.clientY };
                    
                    if (instaTouchTimeout.current) clearTimeout(instaTouchTimeout.current);
                    
                    instaTouchTimeout.current = setTimeout(() => {
                      setIsInstaTouchHovered(true);
                    }, 100);
                  }}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    const dx = Math.abs(touch.clientX - instaTouchStartPos.current.x);
                    const dy = Math.abs(touch.clientY - instaTouchStartPos.current.y);
                    
                    if (dx > 10 || dy > 10) {
                      if (instaTouchTimeout.current) clearTimeout(instaTouchTimeout.current);
                      setIsInstaTouchHovered(false);
                    }
                  }}
                  onTouchEnd={() => {
                    if (instaTouchTimeout.current) clearTimeout(instaTouchTimeout.current);
                    setTimeout(() => {
                      setIsInstaTouchHovered(false);
                    }, 350);
                  }}
                  onTouchCancel={() => {
                    if (instaTouchTimeout.current) clearTimeout(instaTouchTimeout.current);
                    setIsInstaTouchHovered(false);
                  }}
                  className={`group relative inline-flex items-center justify-center overflow-hidden px-10 py-4 rounded-full border border-white/10 hover:border-white/30 bg-white/[0.02] transition-all duration-500 font-syne font-semibold text-[18px] md:text-[22px] text-white cursor-pointer mt-2 w-fit mx-auto hover:shadow-[0_0_30px_rgba(255,255,255,0.06)] ${isInstaTouchHovered ? "animate-wiggle" : ""}`}
                >
                  <span className="absolute w-[120%] aspect-square bg-white rounded-full scale-0 group-hover:scale-[2.2] group-data-[touch-hover=true]:scale-[2.2] transition-transform duration-[600ms] ease-[cubic-bezier(0.76,0,0.24,1)] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />
                  
                  <span className="btn-content relative z-10 flex items-center justify-center pointer-events-none">
                    <span className="relative overflow-hidden flex items-center h-[1.2em]">
                      <span className="inline-block transition-transform duration-500 ease-out group-hover:-translate-y-[120%] group-data-[touch-hover=true]:-translate-y-[120%]">
                        @sachakarpaviciusss
                      </span>
                      <span className="absolute left-0 inline-block translate-y-[120%] transition-transform duration-500 ease-out group-hover:translate-y-0 group-data-[touch-hover=true]:translate-y-0 text-black">
                        @sachakarpaviciusss
                      </span>
                    </span>
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar with 12-column grid layout to clear floating buttons */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-8 mt-16 border-t border-white/5 text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-white/20">
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
