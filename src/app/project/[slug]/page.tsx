"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/navbar";
import ProjectNav from "@/components/project-nav";
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
  const isVideoProject = Boolean(project?.isVideo || project?.videoUrl);
  const targetDataset = isVideoProject ? videoProjectsData : projectsData;
  const currentIndex = targetDataset.findIndex((p) => p.slug === project?.slug);
  const validIndex = currentIndex !== -1 ? currentIndex : 0;
  const nextProject = targetDataset[(validIndex + 1) % targetDataset.length];
  const prevProject = targetDataset[(validIndex - 1 + targetDataset.length) % targetDataset.length];

  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [isIdle, setIsIdle] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isScrollLockedState, setIsScrollLockedState] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(1);

  // Video player controls state — start unmuted on project entry
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [videoDur, setVideoDur] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Horizontal Scrollytelling Refs
  const scrollySectionRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // 100% Bulletproof Inactivity Idle Timer (hides navbar, contact badge & audio signal after 2.5s mouse inactivity)
  const isVideoPlayingRef = useRef(isVideoPlaying);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    isVideoPlayingRef.current = isVideoPlaying;
    if (!isVideoPlaying) {
      setIsIdle(false);
      setIsHideUI(false);
    }
  }, [isVideoPlaying, setIsHideUI]);

  useEffect(() => {
    if (!project?.videoUrl) return;

    lastActivityRef.current = Date.now();

    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
      setIsIdle(false);
      setIsHideUI(false);
    };

    const checkIdleInterval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= 2500 && isVideoPlayingRef.current) {
        setIsIdle(true);
        setIsHideUI(true);
      }
    }, 400);

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("mousedown", handleUserActivity);
    window.addEventListener("touchstart", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);

    return () => {
      clearInterval(checkIdleInterval);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("mousedown", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
    };
  }, [project?.videoUrl, setIsHideUI]);

  // Clean up isHideUI & resume site background music on unmount
  useEffect(() => {
    return () => {
      setIsHideUI(false);
      resumeAudio(true);
    };
  }, [setIsHideUI, resumeAudio]);

  // Launch video directly on enter with robust instant playback (like Netflix)
  useEffect(() => {
    if (!project?.videoUrl) {
      resumeAudio(true);
      return;
    }

    const vid = videoRef.current;
    if (!vid) return;

    const startPlayback = async () => {
      try {
        vid.muted = false;
        setIsVideoMuted(false);
        await vid.play();
        setIsVideoPlaying(true);
        pauseAudio(true);
      } catch {
        // Browser blocked unmuted autoplay -> immediately play muted without delay
        try {
          vid.muted = true;
          setIsVideoMuted(true);
          await vid.play();
          setIsVideoPlaying(true);
          pauseAudio(true);
        } catch {
          // Waiting for user interaction
        }
      }
    };

    startPlayback();

    // Also attach once to window for instant unmute/play on ANY first interaction
    const handleFirstInteraction = () => {
      if (vid && vid.paused) {
        startPlayback();
      }
    };
    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstInteraction, { once: true });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      resumeAudio(true);
    };
  }, [project?.slug, project?.videoUrl, pauseAudio, resumeAudio]);

  // On physical browser reload (F5 / Refresh button directly on project URL), return to homepage
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    const isSpaNav = sessionStorage.getItem("spa_nav") === "true";
    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    const isDirectReload = !isSpaNav && navEntries.length > 0 && navEntries[0].type === "reload";
    if (isDirectReload) {
      sessionStorage.removeItem("spa_nav");
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    setHasEnteredSite(true);

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
        project?.gallery?.length > 0 &&
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
  }, [project, setHasEnteredSite, setIsHideUI]);

  // Fullscreen state listener
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Preload & GPU-decode all gallery images into browser cache
  useEffect(() => {
    if (!project?.gallery || project.gallery.length === 0) return;
    project.gallery.forEach((imgSrc) => {
      const img = new window.Image();
      img.src = imgSrc;
      if ("decode" in img) {
        img.decode().catch(() => {});
      }
    });
  }, [project?.gallery]);

  const [playPulseState, setPlayPulseState] = useState<"play" | "pause" | null>(null);
  const pulseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [videoVolume, setVideoVolume] = useState<number>(1.0);

  const triggerPulse = useCallback((type: "play" | "pause") => {
    setPlayPulseState(type);
    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = setTimeout(() => {
      setPlayPulseState(null);
    }, 600);
  }, []);

  const changeVolume = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVideoVolume(clamped);
    const vid = videoRef.current;
    if (vid) {
      vid.volume = clamped;
      if (clamped === 0) {
        vid.muted = true;
        setIsVideoMuted(true);
        resumeAudio(true);
      } else {
        vid.muted = false;
        setIsVideoMuted(false);
        if (!vid.paused) {
          pauseAudio(true);
        }
      }
    }
  }, [pauseAudio, resumeAudio]);

  const toggleMuteVideo = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (isVideoMuted || videoVolume === 0) {
      changeVolume(1.0);
    } else {
      changeVolume(0);
    }
  }, [isVideoMuted, videoVolume, changeVolume]);

  const togglePlayVideo = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      triggerPulse("play");
    } else {
      vid.pause();
      triggerPulse("pause");
    }
  }, [triggerPulse]);

  const toggleFullscreen = useCallback(() => {
    const container = heroRef.current;
    const vid = videoRef.current;
    if (!container || !vid) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {});
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else if ((vid as any).webkitEnterFullscreen) {
        (vid as any).webkitEnterFullscreen();
      }
    }
  }, []);

  const handleSeekPointer = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    if (width > 0 && videoDur > 0 && videoRef.current) {
      const ratio = Math.max(0, Math.min(1, clickX / width));
      const newTime = ratio * videoDur;
      videoRef.current.currentTime = newTime;
      setVideoTime(newTime);
    }
  }, [videoDur]);

  const handleVolumePointer = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    if (width > 0) {
      const ratio = Math.max(0, Math.min(1, clickX / width));
      changeVolume(ratio);
    }
  }, [changeVolume]);

  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [hoverSeekTime, setHoverSeekTime] = useState<number | null>(null);
  const [hoverSeekPos, setHoverSeekPos] = useState<number>(0);
  const [isScrubberHovered, setIsScrubberHovered] = useState<boolean>(false);

  const cyclePlaybackRate = useCallback(() => {
    const rates = [1, 1.25, 1.5, 2, 0.75];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
    }
  }, [playbackRate]);

  const seekRelative = useCallback((seconds: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    const target = Math.max(0, Math.min(vid.duration || 0, vid.currentTime + seconds));
    vid.currentTime = target;
    setVideoTime(target);
    triggerPulse(seconds > 0 ? "play" : "pause");
  }, [triggerPulse]);

  const handleScrubberMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    if (width > 0 && videoDur > 0) {
      const ratio = Math.max(0, Math.min(1, clickX / width));
      setHoverSeekTime(ratio * videoDur);
      setHoverSeekPos(clickX);
    }
  }, [videoDur]);

  // Keyboard shortcuts (Space: Play/Pause, F: Fullscreen, M: Mute, Arrows: Seek & Volume)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      const vid = videoRef.current;

      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        togglePlayVideo();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMuteVideo();
      } else if (e.key === "ArrowRight") {
        if (vid) {
          e.preventDefault();
          seekRelative(10);
        }
      } else if (e.key === "ArrowLeft") {
        if (vid) {
          e.preventDefault();
          seekRelative(-10);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        changeVolume(videoVolume + 0.1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        changeVolume(videoVolume - 0.1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayVideo, toggleFullscreen, toggleMuteVideo, changeVolume, videoVolume, seekRelative]);

  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (vid) {
      setVideoTime(vid.currentTime);
      setVideoDur(vid.duration || 0);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-mono">
        Projet non trouvé.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-white selection:text-black">
      <Navbar
        showUI={!isIdle}
        clickable={true}
        lang={lang}
        onPlayClickSfx={playClickSfx}
        onPlayHoverSfx={playHoverSfx}
      />

      <div className={`fixed bottom-6 left-6 md:bottom-10 md:left-12 z-[100] mix-blend-difference transition-all duration-700 ${isIdle ? "opacity-0 pointer-events-none translate-y-4" : "opacity-100 translate-y-0 pointer-events-auto"}`}>
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

      <section
        ref={heroRef}
        onClick={() => {
          if (project?.videoUrl) {
            togglePlayVideo();
          }
        }}
        onDoubleClick={() => {
          if (project?.videoUrl) {
            toggleFullscreen();
          }
        }}
        className={`relative w-full h-[100vh] min-h-screen m-0 p-0 overflow-hidden flex flex-col justify-end bg-[#050505] group select-none transition-all duration-500 ${
          isIdle && isVideoPlaying ? "cursor-none" : "cursor-pointer"
        } ${isFullscreen ? "fixed inset-0 z-[9999] w-screen h-screen" : ""}`}
      >
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <div className="relative w-full h-full">
            {project.videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={project.videoUrl}
                  poster={project.coverImage || project.heroImage}
                  autoPlay
                  loop
                  muted={isVideoMuted}
                  playsInline
                  preload="auto"
                  crossOrigin="anonymous"
                  onLoadedMetadata={(e) => {
                    const vid = e.currentTarget;
                    setVideoDur(vid.duration || 0);
                    setVideoTime(vid.currentTime || 0);
                    if (vid.paused) {
                      vid.play().then(() => setIsVideoPlaying(true)).catch(() => {});
                    }
                  }}
                  onCanPlay={(e) => {
                    const vid = e.currentTarget;
                    if (vid.paused) {
                      vid.play().then(() => setIsVideoPlaying(true)).catch(() => {});
                    }
                  }}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => {
                    setIsVideoPlaying(true);
                    if (!videoRef.current?.muted && videoVolume > 0) {
                      pauseAudio(true);
                    } else {
                      resumeAudio(true);
                    }
                  }}
                  onPause={() => {
                    setIsVideoPlaying(false);
                    resumeAudio(true);
                  }}
                  onEnded={() => {
                    setIsVideoPlaying(false);
                    resumeAudio(true);
                  }}
                  className="object-cover w-full h-full min-h-full min-w-full transform-gpu brightness-[1.03] contrast-[1.03] saturate-[1.04] will-change-transform"
                >
                  {!project.videoUrl.startsWith("http") && project.videoUrl.endsWith(".mp4") && (
                    <source
                      src={project.videoUrl.replace(/\.mp4$/, ".webm")}
                      type="video/webm"
                    />
                  )}
                  <source src={project.videoUrl} type={project.videoUrl.endsWith(".webm") ? "video/webm" : "video/mp4"} />
                </video>

                {/* Netflix-style Top Navigation Bar */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute top-0 inset-x-0 z-50 px-6 md:px-12 py-6 flex items-center justify-between pointer-events-none transition-all duration-500 bg-gradient-to-b from-black/90 via-black/40 to-transparent ${
                    isIdle && isVideoPlaying ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      playClickSfx();
                      sessionStorage.setItem("targetSection", "#videos");
                      triggerPageTransition(router, "/#videos");
                    }}
                    className="pointer-events-auto flex items-center gap-2.5 text-white/80 hover:text-white group bg-black/50 hover:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 hover:border-white/40 transition-all duration-300 shadow-xl cursor-pointer"
                    title="Retour aux vidéos"
                  >
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="font-mono text-xs uppercase tracking-widest font-semibold hidden sm:inline-block">
                      {lang === "fr" ? "Vidéos" : "Videos"}
                    </span>
                  </button>

                  <div className="pointer-events-auto flex items-center gap-3">
                    <span className="font-syne font-extrabold text-xs md:text-sm tracking-[0.25em] text-white/90 uppercase drop-shadow-md">
                      SACHA KARPAVICIUS
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-white/70 border border-white/20 px-3 py-1 rounded-full backdrop-blur-md bg-black/40">
                      4K DCI
                    </span>
                  </div>
                </div>

                {/* Floating Unmute Quick Action Pill (when muted autoplay starts) */}
                {isVideoMuted && isVideoPlaying && !isIdle && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      toggleMuteVideo();
                    }}
                    className="absolute top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-black/85 hover:bg-white text-white hover:text-black px-5 py-2.5 rounded-full border border-white/25 shadow-[0_0_30px_rgba(0,0,0,0.9)] font-inter text-[11px] uppercase tracking-widest transition-all duration-300 animate-bounce cursor-pointer group"
                  >
                    <svg className="w-4 h-4 text-amber-400 group-hover:text-black transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                    <span className="font-semibold">{lang === "fr" ? "Activer le son" : "Unmute Audio"}</span>
                  </button>
                )}

                {/* Awwwards Center Play/Pause Animated Pulse Feedback */}
                <div
                  className={`absolute inset-0 z-30 flex items-center justify-center pointer-events-none transition-all duration-500 ease-out ${
                    playPulseState ? "opacity-100 scale-100" : "opacity-0 scale-75"
                  }`}
                >
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-black/75 backdrop-blur-2xl border border-white/25 flex items-center justify-center shadow-[0_0_60px_rgba(0,0,0,0.9)] transition-transform duration-300">
                    {playPulseState === "pause" ? (
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    ) : (
                      <svg className="w-10 h-10 text-white translate-x-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Netflix-style Left Paused Overlay (Now Watching Card) */}
                <div
                  className={`absolute inset-0 z-20 pointer-events-none flex flex-col justify-end p-8 md:p-16 pb-32 md:pb-36 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    !isVideoPlaying
                      ? "opacity-100 translate-y-0 bg-black/40 backdrop-blur-[2px]"
                      : isIdle
                      ? "opacity-0 translate-y-8 pointer-events-none"
                      : "opacity-90 translate-y-0"
                  }`}
                >
                  <div className="max-w-xl md:max-w-2xl space-y-3 pointer-events-auto">
                    <div className="flex items-center gap-2">
                      <span className="font-inter text-xs md:text-sm tracking-widest uppercase text-white/60 font-semibold">
                        {lang === "fr" ? "Vous regardez" : "Now watching"}
                      </span>
                    </div>
                    <h1 className="font-syne font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.95)]">
                      {project.title}
                    </h1>
                    <div className="flex items-center flex-wrap gap-3 font-mono text-[11px] text-white/80 font-medium pt-1">
                      <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded border border-white/20">{project.year}</span>
                      <span className="border border-white/30 px-1.5 py-0.5 rounded text-[10px] text-white/90">4K ULTRA HD</span>
                      <span className="text-white/40">•</span>
                      <span>{project.category || (lang === "fr" ? "Réalisation & DA" : "Direction & Art")}</span>
                      {videoDur > 0 && (
                        <>
                          <span className="text-white/40">•</span>
                          <span>{formatTime(videoDur)}</span>
                        </>
                      )}
                    </div>
                    {project.descriptionFr && (
                      <p className="font-inter text-xs sm:text-sm text-white/80 leading-relaxed max-w-lg pt-1 drop-shadow-md">
                        {lang === "fr" ? project.descriptionFr : (project.descriptionEn || project.descriptionFr)}
                      </p>
                    )}
                  </div>

                  {/* Netflix "En pause" Indicator */}
                  {!isVideoPlaying && (
                    <div className="absolute right-8 md:right-16 bottom-32 md:bottom-36 font-inter text-xs uppercase tracking-widest text-white/70 font-semibold flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,1)]" />
                      <span>{lang === "fr" ? "En pause" : "Paused"}</span>
                    </div>
                  )}
                </div>

                {/* Netflix-style Cinema Bottom HUD Overlay (Black & White Awwwards Theme) */}
                <div
                  onClick={(e) => { e.stopPropagation(); }}
                  onMouseDown={(e) => { e.stopPropagation(); }}
                  onTouchStart={(e) => { e.stopPropagation(); }}
                  onDoubleClick={(e) => { e.stopPropagation(); }}
                  className={`absolute inset-x-0 bottom-0 z-40 px-6 md:px-12 pb-6 md:pb-8 pt-20 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isIdle && isVideoPlaying
                      ? "opacity-0 translate-y-6 pointer-events-none"
                      : "opacity-100 translate-y-0 pointer-events-auto"
                  }`}
                >
                  {/* Full-width Scrubber Progress Bar */}
                  <div className="relative w-full flex items-center gap-4">
                    <div
                      onPointerDown={handleSeekPointer}
                      onPointerMove={(e) => {
                        if (e.buttons === 1) handleSeekPointer(e);
                        handleScrubberMouseMove(e);
                      }}
                      onMouseEnter={() => setIsScrubberHovered(true)}
                      onMouseLeave={() => {
                        setIsScrubberHovered(false);
                        setHoverSeekTime(null);
                      }}
                      className="relative flex-1 h-1.5 hover:h-2.5 bg-white/20 hover:bg-white/30 rounded-full cursor-pointer group/scrubber transition-all duration-200"
                    >
                      {/* Floating Hover Time Tooltip */}
                      {isScrubberHovered && hoverSeekTime !== null && (
                        <div
                          className="absolute -top-9 -translate-x-1/2 bg-black/95 text-white border border-white/20 font-mono text-[11px] px-2.5 py-0.5 rounded shadow-2xl pointer-events-none font-semibold"
                          style={{ left: `${hoverSeekPos}px` }}
                        >
                          {formatTime(hoverSeekTime)}
                        </div>
                      )}

                      {/* Progress Fill (Black & White Theme - Pure White with Glow) */}
                      <div
                        className="h-full bg-white rounded-full relative transition-all duration-75 origin-left shadow-[0_0_15px_rgba(255,255,255,0.7)]"
                        style={{ width: `${videoDur > 0 ? (videoTime / videoDur) * 100 : 0}%` }}
                      >
                        {/* Scrubber Thumb */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,1)] transform scale-75 group-hover/scrubber:scale-125 transition-transform" />
                      </div>
                    </div>

                    {/* Remaining Time readout */}
                    <span className="font-mono text-xs text-white/85 shrink-0 font-medium tracking-wider">
                      {videoDur > 0 ? `-${formatTime(Math.max(0, videoDur - videoTime))}` : "00:00"}
                    </span>
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center justify-between pt-1">
                    {/* Left Control Group */}
                    <div className="flex items-center gap-3 sm:gap-5">
                      {/* Play / Pause button */}
                      <button
                        onClick={togglePlayVideo}
                        className="text-white hover:text-white/80 p-2 cursor-pointer transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
                        title={isVideoPlaying ? "Pause (Espace)" : "Lecture (Espace)"}
                      >
                        {isVideoPlaying ? (
                          <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-current" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-current translate-x-0.5" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>

                      {/* Rewind 10s */}
                      <button
                        onClick={() => seekRelative(-10)}
                        className="text-white/85 hover:text-white p-2 cursor-pointer transition-transform hover:scale-110 active:scale-95 relative flex items-center justify-center group"
                        title="Reculer de 10s (←)"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 4a8.5 8.5 0 1 0 7.8 5.1M12.5 4l3-2.5m-3 2.5l3 2.5" />
                        </svg>
                        <span className="absolute font-mono text-[9px] font-bold text-white pt-1">10</span>
                      </button>

                      {/* Fast Forward 10s */}
                      <button
                        onClick={() => seekRelative(10)}
                        className="text-white/85 hover:text-white p-2 cursor-pointer transition-transform hover:scale-110 active:scale-95 relative flex items-center justify-center group"
                        title="Avancer de 10s (→)"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.5 4a8.5 8.5 0 1 1-7.8 5.1M11.5 4l-3-2.5m3 2.5l-3 2.5" />
                        </svg>
                        <span className="absolute font-mono text-[9px] font-bold text-white pt-1">10</span>
                      </button>

                      {/* Volume Button & Expanding Slider */}
                      <div className="flex items-center gap-2 group/vol">
                        <button
                          onClick={toggleMuteVideo}
                          className="text-white/85 hover:text-white p-2 cursor-pointer transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
                          title={isVideoMuted || videoVolume === 0 ? "Activer le son (M)" : "Couper le son (M)"}
                        >
                          {isVideoMuted || videoVolume === 0 ? (
                            <svg className="w-6 h-6 text-white/50 fill-current" viewBox="0 0 24 24">
                              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                            </svg>
                          )}
                        </button>

                        {/* Expandable Volume Slider */}
                        <div
                          onPointerDown={handleVolumePointer}
                          onPointerMove={(e) => {
                            if (e.buttons === 1) handleVolumePointer(e);
                          }}
                          className="relative w-16 sm:w-20 h-1.5 bg-white/20 rounded-full cursor-pointer overflow-hidden transition-all duration-300 hover:h-2"
                          title="Volume"
                        >
                          <div
                            className="h-full bg-white rounded-full transition-all duration-75 origin-left"
                            style={{ width: `${isVideoMuted ? 0 : videoVolume * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Center Project Title */}
                    <div className="hidden md:flex items-center justify-center">
                      <span className="font-syne font-bold text-sm tracking-wider text-white/90 uppercase truncate max-w-xs drop-shadow">
                        {project.title}
                      </span>
                    </div>

                    {/* Right Control Group */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Playback Speed Button */}
                      <button
                        onClick={cyclePlaybackRate}
                        className="font-mono text-xs font-semibold text-white/80 hover:text-white px-2.5 py-1 rounded border border-white/20 hover:border-white/50 transition-all cursor-pointer"
                        title="Vitesse de lecture"
                      >
                        {playbackRate}x
                      </button>

                      {/* Fullscreen Button */}
                      <button
                        onClick={toggleFullscreen}
                        className="text-white/85 hover:text-white p-2 cursor-pointer transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
                        title={isFullscreen ? "Quitter le plein écran (F)" : "Plein écran (F)"}
                      >
                        {isFullscreen ? (
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                            <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/20 pointer-events-none" />
          </div>
        </div>

        {!project.videoUrl && (
          <div className={`relative z-10 w-full px-5 md:px-16 pb-28 sm:pb-32 md:pb-20 text-left flex flex-col justify-end items-start transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
            isIdle
              ? "opacity-0 translate-y-8 pointer-events-none"
              : "opacity-100 translate-y-0 pointer-events-auto"
          }`}>
            <div ref={titleRef} className="space-y-2 flex flex-col items-start max-w-full pointer-events-auto">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] md:text-[11px] tracking-[0.4em] text-white/70 uppercase font-semibold drop-shadow-md">
                  {project.year}
                </span>
              </div>
              <h1 className="font-syne font-extrabold text-[7.5vw] sm:text-[5vw] md:text-[2.2vw] leading-[0.95] uppercase tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.95)]">
                {project.title}
              </h1>
              {project.descriptionFr && (
                <p className="font-inter text-[12px] sm:text-[13px] md:text-[14px] leading-relaxed text-white/80 max-w-xl md:max-w-2xl font-light pt-1 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                  {lang === "fr" ? project.descriptionFr : (project.descriptionEn || project.descriptionFr)}
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════ PINNED HORIZONTAL SCROLLYTELLING CAROUSEL (PURE AWWWARDS) ═══════════════════ */}
      {project.gallery.length > 0 && (
        <section
          ref={scrollySectionRef}
          className="relative z-10 w-full overflow-hidden bg-[#050505] pt-24 md:pt-28 pb-10 md:pb-14 border-t border-white/10"
        >
          {/* Track Container (Preserves Authentic Aspect Ratio of Horizontal & Vertical Photos) */}
          <div
            ref={horizontalTrackRef}
            className="flex gap-8 md:gap-14 px-5 md:px-16 will-change-transform items-start shrink-0 min-w-max py-2"
          >
            {project.gallery.map((imgSrc, i) => (
              <div
                key={i}
                data-scrolly-card
                className="relative shrink-0 h-[64vh] md:h-[72vh] w-auto max-w-[85vw] group flex items-center justify-center transition-transform duration-500 hover:scale-[1.015]"
              >
                <Image
                  data-scrolly-img
                  src={imgSrc}
                  alt={`${project.title} Shot ${i + 1}`}
                  width={1600}
                  height={1200}
                  quality={96}
                  sizes="(max-width: 768px) 90vw, 80vw"
                  priority={i < 4}
                  loading="eager"
                  onLoad={() => ScrollTrigger.refresh()}
                  className="h-full w-auto max-w-full object-contain rounded-xl drop-shadow-[0_20px_60px_rgba(0,0,0,0.85)] transform-gpu brightness-[1.02] contrast-[1.03] saturate-[1.03] will-change-transform"
                />
              </div>
            ))}
          </div>

          {/* Awwwards Bottom Progress Line HUD - Positioned right above contact button */}
          <div className="px-6 md:px-20 mt-6 md:mt-8 mb-2 md:mb-4 pointer-events-none">
            <div className="w-full h-[2px] bg-white/20 rounded-full overflow-hidden shadow-sm">
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
