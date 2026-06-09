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

  return (
    <div
      ref={cardRef}
      className="relative w-full max-w-[300px] aspect-[3/4] rounded-lg overflow-hidden border border-white/10 shadow-2xl cursor-pointer group will-change-transform"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-about-img
    >
      <img
        ref={imgRef}
        src="/1.jpg"
        alt="Sacha Karpavicius Portrait"
        className="w-full h-full object-cover transition-transform duration-700 ease-out"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
};

/* ──── Interactive List Item ──── */
const InteractiveListItem = ({ text }: { text: string }) => {
  return (
    <li className="group flex items-center justify-between py-2.5 border-b border-white/[0.04] transition-colors duration-300 hover:text-white cursor-pointer">
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

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [siteStarted, setSiteStarted] = useState(false);
  const [isHoveringName, setIsHoveringName] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsMounted(true);

    // Language detection
    if (typeof window !== "undefined" && navigator) {
      const userLang = navigator.language || (navigator as any).userLanguage;
      if (userLang && !userLang.toLowerCase().startsWith("fr")) {
        setLang("en");
      }
    }

    audioRef.current = new Audio("/musique.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const handleStartSite = useCallback(() => {
    setSiteStarted(true);
    if (audioRef.current) {
      audioRef.current.play().catch(() => { /* ignore 404 audio error */ });
      setIsPlaying(true);
      gsap.to(audioRef.current, { volume: 0.5, duration: 4 });
    }
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      setIsPlaying(false);
      gsap.to(audioRef.current, {
        volume: 0,
        duration: 1.5,
        onComplete: () => audioRef.current?.pause()
      });
    } else {
      audioRef.current.play().catch(e => console.warn("No audio file yet:", e));
      setIsPlaying(true);
      gsap.to(audioRef.current, { volume: 0.5, duration: 1.5 });
    }
  };

  /* Refs */
  const heroRef = useRef<HTMLElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLDivElement>(null);
  const heroSubRef = useRef<HTMLDivElement>(null);
  const heroScrollRef = useRef<HTMLDivElement>(null);
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
        const xPos = (e.gamma / 90) * 20; // gamma: left-to-right tilt
        const yPos = (e.beta / 90) * 20;  // beta: front-to-back tilt

        if (heroImgRef.current) {
          gsap.to(heroImgRef.current, {
            x: xPos,
            y: yPos,
            rotationY: xPos * 0.1,
            rotationX: -yPos * 0.1,
            duration: 2.5,
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

      <Navbar showUI={siteStarted || isHoveringName} clickable={siteStarted} lang={lang} />

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
        <a href="#contact" className="inline-flex items-center gap-2 border border-white/20 px-4 py-2.5 rounded-sm hover:bg-white hover:text-black transition-all duration-300 font-inter text-[11px] md:text-[12px] text-white cursor-pointer group">
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

        {/* Text Overlay at bottom center */}
        <div className="absolute bottom-24 md:bottom-20 left-1/2 -translate-x-1/2 text-center z-20 w-full px-4 pointer-events-none">
          <div ref={heroTitleRef} style={{ opacity: 0 }}>
            <h1 className="font-syne font-medium text-[22px] md:text-[28px] leading-[1.2] pb-2 text-white">
              {lang === "fr" ? (
                <>
                  Sacha Karpavicius.<br />
                  Design & Direction pour ceux<br />
                  qui refusent les compromis.
                </>
              ) : (
                <>
                  Sacha Karpavicius.<br />
                  Design & Direction for those<br />
                  who refuse to settle.
                </>
              )}
            </h1>
          </div>
          <div ref={heroSubRef} style={{ opacity: 0 }} className="mt-8 flex items-center justify-center gap-12 font-inter text-[12px] md:text-[14px] text-white">
            <span className="w-1.5 h-1.5 bg-white/50 block rounded-sm"></span>
            <span>{lang === "fr" ? "2026 — Futur" : "2026 — Future"}</span>
            <span className="w-1.5 h-1.5 bg-white/50 block rounded-sm"></span>
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
              className={`group relative overflow-hidden cursor-pointer ${idx === 0 ? "md:col-span-2" : ""
                }`}
            >
              <div
                className={`relative w-full overflow-hidden bg-[#111] ${idx === 0 ? "aspect-[16/9]" : "aspect-[4/5] md:aspect-[3/4]"
                  }`}
              >
                <Image
                  src={project.src}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.25,.46,.45,.94)] group-hover:scale-105"
                  quality={90}
                  sizes={idx === 0 ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-700" />
              </div>

              {/* Project info */}
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="font-syne font-semibold text-[14px] md:text-[16px] tracking-tight text-white group-hover:translate-x-2 transition-transform duration-500">
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
                  <InteractiveListItem text={lang === "fr" ? "Photographie" : "Photography"} />
                  <InteractiveListItem text={lang === "fr" ? "Direction Artistique" : "Art Direction"} />
                  <InteractiveListItem text={lang === "fr" ? "Éditorial de Mode" : "Fashion Editorial"} />
                  <InteractiveListItem text={lang === "fr" ? "Film & Vidéo" : "Film & Motion"} />
                </ul>
              </div>
              <div>
                <h3 className="font-inter text-[10px] md:text-[11px] tracking-[0.3em] text-white/40 uppercase mb-4">
                  Clients
                </h3>
                <ul className="font-inter text-[13px] md:text-[14px] text-white/70">
                  <InteractiveListItem text="Vogue — L'Officiel — Numéro" />
                  <InteractiveListItem text="Dior — Chanel — Saint Laurent" />
                  <InteractiveListItem text={lang === "fr" ? "Éditoriaux Indépendants" : "Independent Editorials"} />
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
                {lang === "fr" ? (
                  <>
                    Créer<br />Ensemble
                  </>
                ) : (
                  <>
                    Let&apos;s<br />Create
                  </>
                )}
              </h2>
            </div>

            {/* Info Grid - Centered Collab Link */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8 md:pt-12 border-t border-white/5" data-text-reveal>
              <div className="md:col-start-4 md:col-span-6 text-center space-y-4">
                <span className="font-inter text-[10px] md:text-[11px] tracking-[0.3em] text-white/30 uppercase block">
                  COLLAB
                </span>
                <a
                  href="https://www.instagram.com/sachakarpaviciusss/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 font-syne font-semibold text-[22px] md:text-[32px] text-white hover:text-white/60 transition-colors duration-500 mt-2 break-all justify-center"
                >
                  @sachakarpaviciusss
                  <span className="inline-block transform group-hover:translate-x-1.5 group-hover:-translate-y-1.5 transition-transform duration-300 font-mono text-[20px] text-white/40">
                    ↗
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
                    Site créé par <span className="text-white hover:text-white/70 transition-colors duration-300 cursor-pointer font-bold">Adam</span>
                  </>
                ) : (
                  <>
                    Website created by <span className="text-white hover:text-white/70 transition-colors duration-300 cursor-pointer font-bold">Adam</span>
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
