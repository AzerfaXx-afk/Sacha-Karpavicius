"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/navbar";
import ProjectNav from "@/components/project-nav";
import ScrollIndicator from "@/components/scroll-indicator";
import { projectsData, videoProjectsData, getProjectBySlug } from "@/data/projects";
import { useSiteContext } from "@/context/site-context";
import { lockScrollForNavigation } from "@/utils/scroll-lock";

gsap.registerPlugin(ScrollTrigger);

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { hasEnteredSite, setHasEnteredSite, isPlaying, toggleAudio, pauseAudio, playClickSfx, playHoverSfx, setIsHideUI } = useSiteContext();

  const project = getProjectBySlug(slug) || projectsData[0];
  const isVideoProject = Boolean(project.isVideo || project.videoUrl);
  const targetDataset = isVideoProject ? videoProjectsData : projectsData;
  const currentIndex = targetDataset.findIndex((p) => p.slug === project.slug);
  const validIndex = currentIndex !== -1 ? currentIndex : 0;
  const nextProject = targetDataset[(validIndex + 1) % targetDataset.length];
  const prevProject = targetDataset[(validIndex - 1 + targetDataset.length) % targetDataset.length];

  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [isIdle, setIsIdle] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isScrollLockedState, setIsScrollLockedState] = useState(true);

  const heroRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Horizontal Scrollytelling Refs
  const scrollySectionRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);

  // Inactivity auto-hide UI (Netflix style: hides navbar, contact badge & audio signal only while playing and idle)
  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    setIsHideUI(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (project?.videoUrl && isVideoPlaying) {
      idleTimerRef.current = setTimeout(() => {
        setIsIdle(true);
        setIsHideUI(true);
      }, 2500); // 2.5s inactivity
    }
  }, [project?.videoUrl, isVideoPlaying, setIsHideUI]);

  useEffect(() => {
    if (!project?.videoUrl) return;

    resetIdleTimer();

    const handleUserActivity = () => {
      resetIdleTimer();
    };

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("mousedown", handleUserActivity);
    window.addEventListener("touchstart", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("mousedown", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [project?.videoUrl, resetIdleTimer]);

  // Clean up isHideUI on unmount
  useEffect(() => {
    return () => {
      setIsHideUI(false);
    };
  }, [setIsHideUI]);

  // Auto-pause background music and play unmuted video on video projects
  useEffect(() => {
    if (project?.videoUrl) {
      pauseAudio();
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.play().then(() => setIsVideoPlaying(true)).catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().then(() => setIsVideoPlaying(true)).catch(() => {});
          }
        });
      }
    }
  }, [project?.videoUrl, pauseAudio]);

  useEffect(() => {
    setHasEnteredSite(true);
    // Lock scroll for transition + 1.8s wait after page load (perfect Awwwards handoff)
    lockScrollForNavigation(1800);
    setIsScrollLockedState(true);

    const handleLockChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ isLocked: boolean }>;
      setIsScrollLockedState(customEvt.detail.isLocked);
    };

    window.addEventListener("scroll-lock-changed", handleLockChange);

    if (typeof window !== "undefined") {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    setIsHideUI(false);

    // Language detection
    if (typeof window !== "undefined" && navigator) {
      const userLang = navigator.language || (navigator as Navigator & { userLanguage?: string }).userLanguage;
      if (userLang && !userLang.toLowerCase().startsWith("fr")) {
        setLang("en");
      }
    }

    const ctx = gsap.context(() => {
      // Hero & Title silky reveal — perfectly matched to incoming FLIP zoom
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (heroImgRef.current) {
        gsap.set(heroImgRef.current, { scale: 1.0, filter: "brightness(1.0)" });
      }

      if (titleRef.current) {
        tl.fromTo(
          titleRef.current.children,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "cubic-bezier(0.16, 1, 0.3, 1)" },
          0.1
        );
      }

      // Horizontal Scrollytelling Setup (Only for Projects with Gallery)
      if (
        project.gallery.length > 0 &&
        scrollySectionRef.current &&
        horizontalTrackRef.current
      ) {
        const track = horizontalTrackRef.current;
        const section = scrollySectionRef.current;

        const getScrollDistance = () => {
          const trackWidth = track.scrollWidth;
          const padding = window.innerWidth < 768 ? 40 : 120;
          return Math.max(0, trackWidth - window.innerWidth + padding);
        };

        gsap.set(track, { force3D: true, willChange: "transform" });

        gsap.to(track, {
          x: () => -getScrollDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            pin: true,
            pinSpacing: true,
            scrub: true,
            start: "top top",
            end: () => `+=${getScrollDistance() * 1.2}`,
            invalidateOnRefresh: true,
          },
        });
      }
    });

    return () => {
      ctx.revert();
      window.removeEventListener("scroll-lock-changed", handleLockChange);
    };
  }, [slug]);

  return (
    <main className="min-h-screen bg-[#050505] text-white font-inter selection:bg-white selection:text-black">
      {/* Navbar */}
      <Navbar
        showUI={!isIdle}
        clickable={true}
        lang={lang}
        onPlayClickSfx={playClickSfx}
        onPlayHoverSfx={playHoverSfx}
      />


      {/* Persistent Contact Link (Bottom Left) -> Smooth transition to #contact on homepage */}
      <div className={`fixed bottom-6 left-6 md:bottom-10 md:left-12 z-[100] mix-blend-difference transition-opacity duration-700 ${isIdle ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"}`}>
        <a
          href="/#contact"
          onClick={(e) => {
            e.preventDefault();
            playClickSfx();
            sessionStorage.setItem("scrollToContact", "true");

            const overlay = document.createElement("div");
            overlay.style.position = "fixed";
            overlay.style.inset = "0";
            overlay.style.backgroundColor = "#050505";
            overlay.style.opacity = "0";
            overlay.style.zIndex = "99999";
            overlay.style.transition = "opacity 0.4s ease";
            document.body.appendChild(overlay);

            requestAnimationFrame(() => {
              overlay.style.opacity = "1";
            });

            setTimeout(() => {
              router.push("/");
              setTimeout(() => {
                overlay.style.opacity = "0";
                setTimeout(() => overlay.remove(), 400);
              }, 300);
            }, 400);
          }}
          className="inline-flex items-center gap-1.5 border border-white/20 px-3 py-2 md:px-4 md:py-2.5 rounded-sm hover:bg-white hover:text-black transition-all duration-300 font-inter text-[10px] md:text-[12px] text-white cursor-pointer group"
        >
          {lang === "fr" ? "Contactez-moi" : "Get in touch"}
          <span className="font-mono text-[11px] group-hover:translate-x-1 transition-transform">→</span>
        </a>
      </div>

      {/* ═══════════════════ HERO COVER (GRAND ÉCRAN AWWWARDS) ═══════════════════ */}
      <section ref={heroRef} className="relative w-full h-[100vh] min-h-screen m-0 p-0 overflow-hidden flex flex-col justify-end bg-[#050505]">
        {/* Fullscreen 100vw x 100vh Image */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <div ref={heroImgRef} className="relative w-full h-full">
            {project.videoUrl ? (
              <video
                ref={videoRef}
                src={project.videoUrl}
                poster={project.coverImage || project.heroImage}
                autoPlay
                loop
                playsInline
                preload="auto"
                controls
                onPlay={() => {
                  setIsVideoPlaying(true);
                  resetIdleTimer();
                }}
                onPause={() => {
                  setIsVideoPlaying(false);
                  setIsIdle(false);
                  setIsHideUI(false);
                }}
                className="object-cover w-full h-full min-h-full min-w-full"
              />
            ) : (
              <Image
                src={project.heroImage}
                alt={project.title}
                fill
                priority
                quality={96}
                sizes="100vw"
                className={`object-cover ${project.objectPosition || "object-[center_35%]"} w-full h-full min-h-full min-w-full`}
              />
            )}
            {/* Smooth dark vignette gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-black/30 pointer-events-none" />
          </div>
        </div>

        {/* Hero Meta & Title Overlay (LEFT ALIGNED - SAFELY ABOVE FLOATING CONTACT BADGE) */}
        <div className={`relative z-10 w-full px-5 md:px-16 pb-16 md:pb-24 text-left flex flex-col items-start pointer-events-none transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isIdle ? "translate-y-8 md:translate-y-12" : "translate-y-0"}`}>
          <div ref={titleRef} className="space-y-2 flex flex-col items-start max-w-full pointer-events-auto">
            <span className="font-mono text-[10px] md:text-[12px] tracking-[0.4em] text-white/60 uppercase block">
              {project.year}
            </span>

            <h1 className="font-syne font-bold text-[6vw] sm:text-[4.5vw] md:text-[3.2vw] lg:text-[2.6vw] leading-none uppercase tracking-tight text-white whitespace-nowrap drop-shadow-2xl">
              {project.title}
            </h1>

            {project.descriptionFr && (
              <p className="font-inter text-[12px] sm:text-[13px] md:text-[14px] leading-relaxed text-white/80 max-w-xl md:max-w-2xl font-light pt-1.5 drop-shadow-md">
                {lang === "fr" ? project.descriptionFr : (project.descriptionEn || project.descriptionFr)}
              </p>
            )}
          </div>
        </div>

        {/* Awwwards Scroll Indicator (Mouse wheel on Desktop / Touch gesture swipe on Mobile) */}
        <ScrollIndicator isLocked={isScrollLockedState} />
      </section>

      {/* ═══════════════════ PINNED HORIZONTAL SCROLLYTELLING CAROUSEL ═══════════════════ */}
      {project.gallery.length > 0 && (
        <section
          ref={scrollySectionRef}
          className="relative z-10 w-full overflow-hidden bg-[#050505] py-16 md:py-28 border-t border-white/10"
        >
          {/* Track Container (Preserves Authentic Aspect Ratio of Horizontal & Vertical Photos) */}
          <div
            ref={horizontalTrackRef}
            className="flex gap-8 md:gap-12 px-5 md:px-16 will-change-transform items-center shrink-0 min-w-max"
          >
            {project.gallery.map((imgSrc, i) => (
              <div
                key={i}
                className="relative shrink-0 h-[65vh] md:h-[75vh] w-auto max-w-[85vw] rounded-xl overflow-hidden bg-black/40 border border-white/10 group shadow-2xl flex items-center justify-center"
              >
                <Image
                  src={imgSrc}
                  alt={`${project.title} Shot ${i + 1}`}
                  width={1600}
                  height={1200}
                  quality={85}
                  sizes="(max-width: 768px) 90vw, 70vw"
                  priority={i < 3}
                  loading={i < 3 ? "eager" : "lazy"}
                  className="h-full w-auto max-w-full object-contain rounded-xl transform-gpu brightness-[1.02] contrast-[1.03] saturate-[1.03]"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════ NAVIGATION PRÉCÉDENT / SUIVANT ═══════════════════ */}
      <ProjectNav
        prevProject={prevProject}
        nextProject={nextProject}
        lang={lang}
        onPlayClickSfx={playClickSfx}
        onPlayHoverSfx={playHoverSfx}
      />
    </main>
  );
}
