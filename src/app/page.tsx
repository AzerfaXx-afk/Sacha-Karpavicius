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

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [siteStarted, setSiteStarted] = useState(false);
  const [isHoveringName, setIsHoveringName] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
    
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
              start: "top 90%",
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
      const xTo = gsap.quickTo(heroImgRef.current, "x", { duration: 1.5, ease: "power2.out" });
      const yTo = gsap.quickTo(heroImgRef.current, "y", { duration: 1.5, ease: "power2.out" });
      const rotXTo = gsap.quickTo(heroImgRef.current, "rotationX", { duration: 1.5, ease: "power2.out" });
      const rotYTo = gsap.quickTo(heroImgRef.current, "rotationY", { duration: 1.5, ease: "power2.out" });

      // Desktop: Smooth, subtle mouse tracking
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 60;
        const yPos = (clientY / window.innerHeight - 0.5) * 60;

        xTo(xPos);
        yTo(yPos);
        rotYTo(xPos * 0.1);
        rotXTo(-yPos * 0.1);
      };

      // Mobile: Gyroscope / Tilt tracking
      const handleOrientation = (e: DeviceOrientationEvent) => {
        if (e.gamma === null || e.beta === null) return;
        const xPos = (e.gamma / 90) * 60; // gamma: left-to-right tilt
        const yPos = (e.beta / 90) * 60;  // beta: front-to-back tilt

        xTo(xPos);
        yTo(yPos);
        rotYTo(xPos * 0.1);
        rotXTo(-yPos * 0.1);
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
      {loading && <Preloader onComplete={onPreloaderComplete} onStart={handleStartSite} onHoverChange={setIsHoveringName} />}

      <Navbar showUI={siteStarted || isHoveringName} clickable={siteStarted} />

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
          Get in touch <span className="group-hover:translate-x-1 transition-transform">→</span >
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
              Sacha Karpavicius.<br />
              Design & Direction for those<br />
              who refuse to settle.
            </h1>
          </div>
          <div ref={heroSubRef} style={{ opacity: 0 }} className="mt-8 flex items-center justify-center gap-12 font-inter text-[12px] md:text-[14px] text-white">
            <span className="w-1.5 h-1.5 bg-white/50 block rounded-sm"></span>
            <span>2026 — Future</span>
            <span className="w-1.5 h-1.5 bg-white/50 block rounded-sm"></span>
          </div>
        </div>


      </section>

      {/* ═══════════════════ WORKS SECTION ═══════════════════ */}
      <section ref={worksRef} id="works" className="relative bg-[#0a0a0a] pt-32 md:pt-48 pb-20 md:pb-32">
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
            Selected Works
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
                  {project.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ ABOUT SECTION ═══════════════════ */}
      <section ref={aboutRef} id="about" className="relative bg-[#0a0a0a] py-32 md:py-48">
        <div className="px-5 md:px-16">
          <div data-text-reveal className="flex items-center gap-6 mb-16 md:mb-24">
            <span className="font-inter text-[10px] md:text-[11px] tracking-[0.3em] text-white/40 uppercase">
              02
            </span>
            <div data-line-reveal className="flex-1 h-[1px] bg-white/10 origin-left" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
            <div className="md:col-span-5" data-text-reveal>
              <h2 className="font-syne font-bold text-[10vw] md:text-[4vw] leading-[0.95] tracking-tight text-white uppercase mb-8">
                Sacha<br />Karpavicius
              </h2>
              <p className="font-inter text-[13px] md:text-[14px] leading-relaxed text-white/50 max-w-md">
                Visual Storyteller basé entre Paris et Milan.
                Spécialisé dans la photographie de mode, le portrait éditorial
                et la direction artistique. Chaque image est une invitation à
                entrer dans un univers singulier, où la lumière et l&apos;ombre
                racontent une histoire.
              </p>
            </div>

            <div className="md:col-start-8 md:col-span-5 space-y-12" data-text-reveal>
              <div>
                <h3 className="font-inter text-[10px] md:text-[11px] tracking-[0.3em] text-white/40 uppercase mb-4">
                  Services
                </h3>
                <ul className="font-inter text-[13px] md:text-[14px] text-white/70 space-y-2">
                  <li>Photography</li>
                  <li>Art Direction</li>
                  <li>Fashion Editorial</li>
                  <li>Film & Motion</li>
                </ul>
              </div>
              <div>
                <h3 className="font-inter text-[10px] md:text-[11px] tracking-[0.3em] text-white/40 uppercase mb-4">
                  Clients
                </h3>
                <ul className="font-inter text-[13px] md:text-[14px] text-white/70 space-y-2">
                  <li>Vogue — L&apos;Officiel — Numéro</li>
                  <li>Dior — Chanel — Saint Laurent</li>
                  <li>Independent Editorials</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CONTACT / FOOTER ═══════════════════ */}
      <footer ref={contactRef} id="contact" className="relative bg-[#0a0a0a] pt-20 md:pt-32 pb-8 overflow-hidden">
        <div className="px-5 md:px-16">
          {/* Separator line */}
          <div data-line-reveal className="w-full h-[1px] bg-white/10 origin-left mb-16 md:mb-24" />

          {/* Giant CTA */}
          <div data-text-reveal className="mb-16 md:mb-24">
            <a
              href="mailto:hello@sachakarpavicius.com"
              className="group inline-block"
            >
              <h2 className="font-syne font-bold text-[14vw] md:text-[10vw] leading-[0.9] tracking-tight text-white uppercase group-hover:text-white/60 transition-colors duration-700">
                Let&apos;s<br />Talk
              </h2>
            </a>
          </div>

          {/* Footer bottom */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-4">
            <div className="space-y-2">
              <p className="font-inter text-[10px] md:text-[11px] tracking-[0.2em] text-white/30 uppercase">
                hello@sachakarpavicius.com
              </p>
              <p className="font-inter text-[10px] md:text-[11px] tracking-[0.2em] text-white/30 uppercase">
                Paris — Milan — New York
              </p>
            </div>

            <div className="flex items-center gap-8">
              {["Instagram", "LinkedIn", "Behance"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="font-inter text-[10px] md:text-[11px] tracking-[0.2em] text-white/30 uppercase hover:text-white/70 transition-colors duration-500"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="font-inter text-[9px] md:text-[10px] tracking-[0.2em] text-white/20 uppercase">
              © 2026 Sacha Karpavicius
            </span>
            <span className="font-inter text-[9px] md:text-[10px] tracking-[0.2em] text-white/20 uppercase">
              All Rights Reserved
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
