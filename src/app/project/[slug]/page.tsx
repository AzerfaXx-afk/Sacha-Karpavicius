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
import { triggerPageTransition } from "@/utils/page-transition";

gsap.registerPlugin(ScrollTrigger);

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { hasEnteredSite, setHasEnteredSite, isPlaying, toggleAudio, pauseAudio, resumeAudio, playClickSfx, playHoverSfx, setIsHideUI } = useSiteContext();

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
  const [currentSlide, setCurrentSlide] = useState(1);

  const heroRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wasPlayingBeforeVideoRef = useRef(false);


  // Horizontal Scrollytelling Refs
  const scrollySectionRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

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

  // Launch video directly on enter & pause background music when video plays with audio
  useEffect(() => {
    if (project?.videoUrl && videoRef.current) {
      const vid = videoRef.current;
      vid.currentTime = 0;
      vid.muted = false;
      vid.play()
        .then(() => {
          setIsVideoPlaying(true);
          resetIdleTimer();
          if (isPlaying) {
            wasPlayingBeforeVideoRef.current = true;
            pauseAudio();
          }
        })
        .catch(() => {
          // Fallback to muted play if browser requires explicit unmute gesture
          vid.muted = true;
          vid.play().then(() => setIsVideoPlaying(true)).catch(() => {});
        });
    }
  }, [project?.videoUrl, isPlaying, pauseAudio, resetIdleTimer]);



  // On physical browser reload (F5 / Refresh button), return to homepage for full preloader animation
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    const isReload = navEntries.length > 0 && navEntries[0].type === "reload";
    if (isReload) {
      sessionStorage.removeItem("spa_nav");
      router.replace("/");
    }
  }, [router]);
  useEffect(() => {
    setHasEnteredSite(true);
    resumeAudio();

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const lenis = (window as any).__lenis;
      if (lenis && typeof lenis.scrollTo === "function") {
        lenis.scrollTo(0, { immediate: true });
      }
    }

    lockScrollForNavigation(2000);
    setIsScrollLockedState(true);
    setIsHideUI(false);

    const lockTimer = setTimeout(() => {
      setIsScrollLockedState(false);
    }, 2000);

    const handleLockChange = (e: CustomEvent) => {
      setIsScrollLockedState(Boolean(e.detail?.isLocked));
    };
    if (typeof window !== "undefined") {
      window.addEventListener("scroll-lock-changed", handleLockChange as EventListener);
    }

    if (typeof window !== "undefined" && navigator) {
      const userLang = navigator.language || (navigator as Navigator & { userLanguage?: string }).userLanguage;
      if (userLang && !userLang.toLowerCase().startsWith("fr")) {
        setLang("en");
      }
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        heroRef.current,
        { scale: 1.08, filter: "brightness(0.5)" },
        { scale: 1, filter: "brightness(1)", duration: 1.4, ease: "power2.out" }
      ).fromTo(
        titleRef.current,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 1.1, ease: "power4.out" },
        "-=0.9"
      );

      if (
        project.gallery.length > 0 &&
        scrollySectionRef.current &&
        horizontalTrackRef.current
      ) {
        const track = horizontalTrackRef.current;
        const section = scrollySectionRef.current;

        const getScrollAmount = () => {
          return track.scrollWidth - window.innerWidth + 80;
        };

        const horizontalTween = gsap.to(track, {
          x: () => -getScrollAmount(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1.2,
            start: "top top",
            end: () => `+=${getScrollAmount()}`,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (progressBarRef.current) {
                gsap.set(progressBarRef.current, { scaleX: self.progress });
              }
              const total = project.gallery.length;
              const idx = Math.min(total - 1, Math.floor(self.progress * total));
              setCurrentSlide(idx + 1);
            },
          },
        });

        const innerImgs = track.querySelectorAll("[data-scrolly-img]");
        innerImgs.forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: 8, scale: 1.05 },
            {
              xPercent: -8,
              scale: 1.0,
              ease: "none",
              scrollTrigger: {
                trigger: img.parentElement,
                containerAnimation: horizontalTween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            }
          );
        });

        const ro = new ResizeObserver(() => {
          ScrollTrigger.refresh();
        });
        ro.observe(track);
      }
    });

    return () => {
      clearTimeout(lockTimer);
      ctx.revert();
    };
  }, [slug, resumeAudio, setHasEnteredSite, setIsHideUI]);

  useEffect(() => {
    return () => {
      setIsHideUI(false);
      if (wasPlayingBeforeVideoRef.current) {
        wasPlayingBeforeVideoRef.current = false;
        resumeAudio();
      }
    };
  }, [setIsHideUI, resumeAudio]);

  const togglePlayVideo = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-mono">
        Projet non trouvé.
      </div>
    );
  }

  // Preload all gallery images into browser cache for 60 FPS stutter-free scrolling
  useEffect(() => {
    if (!project?.gallery || project.gallery.length === 0) return;
    project.gallery.forEach((imgSrc) => {
      const img = new window.Image();
      img.src = imgSrc;
    });
  }, [project?.gallery]);

  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-white selection:text-black">
      <Navbar
        showUI={!isIdle}
        clickable={true}
        lang={lang}
        onPlayClickSfx={playClickSfx}
        onPlayHoverSfx={playHoverSfx}
      />

      <div className={`fixed bottom-6 left-6 md:bottom-10 md:left-12 z-[100] mix-blend-difference transition-opacity duration-700 ${isIdle ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"}`}>
        <a
          href="/#contact"
          onClick={(e) => {
            e.preventDefault();
            playClickSfx();
            sessionStorage.setItem("scrollToContact", "true");
            triggerPageTransition(router, "/#contact");
          }}
          className="inline-flex items-center gap-1.5 border border-white/20 px-3 py-2 md:px-4 md:py-2.5 rounded-sm hover:bg-white hover:text-black transition-all duration-300 font-inter text-[10px] md:text-[12px] text-white cursor-pointer group"
        >
          {lang === "fr" ? "Contactez-moi" : "Get in touch"}
          <span className="font-mono text-[11px] group-hover:translate-x-1 transition-transform">→</span>
        </a>
      </div>

      <section ref={heroRef} className="relative w-full h-[100vh] min-h-screen m-0 p-0 overflow-hidden flex flex-col justify-end bg-[#050505]">
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <div ref={heroRef} className="relative w-full h-full">
            {project.videoUrl ? (
              <video
                ref={videoRef}
                src={project.videoUrl}
                poster={project.coverImage || project.heroImage}
                autoPlay
                loop
                playsInline
                preload="auto"
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-black/30 pointer-events-none" />
          </div>
        </div>

        <div className={`relative z-10 w-full px-5 md:px-16 pb-16 md:pb-20 text-left flex flex-col justify-end items-start pointer-events-none transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isIdle ? "translate-y-8 md:translate-y-12" : "translate-y-0"}`}>
          <div ref={titleRef} className="space-y-2 flex flex-col items-start max-w-full pointer-events-auto">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="font-mono text-[10px] md:text-[11px] tracking-[0.4em] text-white/70 uppercase font-semibold drop-shadow-md">
                {project.year} — {project.category}
              </span>
            </div>
            <h1 className="font-syne font-extrabold text-[7vw] sm:text-[5vw] md:text-[3.5vw] leading-[0.95] uppercase tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.95)]">
              {project.title}
            </h1>
            {project.descriptionFr && (
              <p className="font-inter text-[12px] sm:text-[13px] md:text-[14px] leading-relaxed text-white/80 max-w-xl md:max-w-2xl font-light pt-1 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                {lang === "fr" ? project.descriptionFr : (project.descriptionEn || project.descriptionFr)}
              </p>
            )}
          </div>
        </div>

        <ScrollIndicator isLocked={isScrollLockedState} />
      </section>

      {/* ═══════════════════ PINNED HORIZONTAL SCROLLYTELLING CAROUSEL (PURE AWWWARDS) ═══════════════════ */}
      {project.gallery.length > 0 && (
        <section
          ref={scrollySectionRef}
          className="relative z-10 w-full overflow-hidden bg-[#050505] py-12 md:py-20 border-t border-white/10"
        >
          {/* Track Container (Preserves Authentic Aspect Ratio of Horizontal & Vertical Photos) */}
          <div
            ref={horizontalTrackRef}
            className="flex gap-8 md:gap-14 px-5 md:px-16 will-change-transform items-center shrink-0 min-w-max py-4"
          >
            {project.gallery.map((imgSrc, i) => (
              <div
                key={i}
                data-scrolly-card
                className="relative shrink-0 h-[65vh] md:h-[75vh] w-auto max-w-[85vw] rounded-2xl overflow-hidden bg-transparent group shadow-[0_30px_80px_rgba(0,0,0,0.9)] flex items-center justify-center border border-white/10 transition-all duration-500 hover:border-white/30"
              >
                <div className="relative h-full w-auto overflow-hidden flex items-center justify-center">
                  <Image
                    data-scrolly-img
                    src={imgSrc}
                    alt={`${project.title} Shot ${i + 1}`}
                    width={1600}
                    height={1200}
                    quality={92}
                    sizes="(max-width: 768px) 90vw, 70vw"
                    priority={i < 3}
                    loading={i < 3 ? "eager" : "lazy"}
                    onLoad={() => ScrollTrigger.refresh()}
                    className="h-full w-auto max-w-full object-contain rounded-2xl transform-gpu brightness-[1.02] contrast-[1.03] saturate-[1.03] will-change-transform"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Awwwards Bottom Progress Line HUD */}
          <div className="px-5 md:px-16 mt-8 pointer-events-none">
            <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
              <div
                ref={progressBarRef}
                className="h-full w-full bg-gradient-to-r from-white/40 via-white to-white origin-left transform-gpu scale-x-0"
              />
            </div>
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


