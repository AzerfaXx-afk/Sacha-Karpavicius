"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/navbar";
import ProjectNav from "@/components/project-nav";
import RotatePhonePrompt from "@/components/rotate-phone-prompt";
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

  // Mobile orientation & horizontal cinema state
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [hasDismissedRotate, setHasDismissedRotate] = useState(false);
  const [isForcedLandscapeCSS, setIsForcedLandscapeCSS] = useState(false);

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

  // Mobile orientation detection
  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkOrientation = () => {
      const isMob = window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches;
      setIsMobileDevice(isMob);
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
      if (!portrait) {
        setIsForcedLandscapeCSS(false);
      }
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);
    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  // Clean up isHideUI & resume site background music on unmount
  useEffect(() => {
    return () => {
      setIsHideUI(false);
      resumeAudio(true);
    };
  }, [setIsHideUI, resumeAudio]);

  // Launch video directly on enter (on desktop immediately; on mobile only after intro video finishes)
  useEffect(() => {
    if (!project?.videoUrl) {
      resumeAudio(true);
      return;
    }

    // On mobile, do NOT start the main video until the Rotate Phone intro finishes
    if (isMobileDevice && !hasDismissedRotate) {
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

    return () => {
      resumeAudio(true);
    };
  }, [project?.slug, project?.videoUrl, isMobileDevice, hasDismissedRotate, pauseAudio, resumeAudio]);

  // Ensure scroll position is reset on page entry
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

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

  const scrollPosBeforeFs = useRef<number>(0);

  // Fullscreen state listener
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onFsChange = () => {
      const isFs = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFs);

      if (!isFs) {
        // Restore scroll position cleanly without instant jump or resize glitch
        const targetY = scrollPosBeforeFs.current || 0;
        const lenis = (window as any).__lenis;
        if (lenis && typeof lenis.scrollTo === "function") {
          lenis.scrollTo(targetY, { immediate: true });
        } else {
          window.scrollTo({ top: targetY, left: 0, behavior: "instant" });
        }
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 350);
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
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

  const [playPulseState, setPlayPulseState] = useState<"play" | "pause" | "rewind" | "skip" | null>(null);
  const pulseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [videoVolume, setVideoVolume] = useState<number>(1.0);

  const triggerPulse = useCallback((type: "play" | "pause" | "rewind" | "skip") => {
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
    if (vid.paused || vid.ended) {
      vid.play().then(() => {
        setIsVideoPlaying(true);
        triggerPulse("play");
      }).catch(() => {});
    } else {
      vid.pause();
      setIsVideoPlaying(false);
      triggerPulse("pause");
    }
  }, [triggerPulse]);

  const toggleFullscreen = useCallback(() => {
    const container = heroRef.current;
    const vid = videoRef.current;
    if (!container || !vid) return;

    if (
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    ) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    } else {
      scrollPosBeforeFs.current = window.scrollY || document.documentElement.scrollTop || 0;
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
    triggerPulse(seconds > 0 ? "skip" : "rewind");
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

  // Keyboard shortcuts (Space: Play/Pause, F: Fullscreen, M: Mute, Left/Right Arrows: Rewind/Skip, Up/Down: Volume)
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
        e.preventDefault();
        if (vid) seekRelative(10);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (vid) seekRelative(-10);
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

      {/* Mobile Rotate Phone Video Intro Modal */}
      {isVideoProject && isMobileDevice && !hasDismissedRotate && (
        <RotatePhonePrompt
          lang={lang}
          onComplete={() => {
            setHasDismissedRotate(true);
            const isCurrentlyPortrait = window.innerHeight > window.innerWidth;
            setIsForcedLandscapeCSS(isCurrentlyPortrait);
            const vid = videoRef.current;
            if (vid) {
              vid.muted = false;
              setIsVideoMuted(false);
              vid.play().then(() => {
                setIsVideoPlaying(true);
                pauseAudio(true);
              }).catch(() => {
                vid.muted = true;
                setIsVideoMuted(true);
                vid.play().then(() => {
                  setIsVideoPlaying(true);
                  pauseAudio(true);
                }).catch(() => {});
              });
            }
          }}
        />
      )}

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
        style={
          isForcedLandscapeCSS
            ? {
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vh",
                height: "100vw",
                transformOrigin: "0 0",
                transform: "translate(100vw, 0) rotate(90deg)",
                zIndex: 120,
                overflow: "hidden",
              }
            : undefined
        }
        className={`relative w-full h-[100vh] min-h-screen m-0 p-0 overflow-hidden flex flex-col justify-end bg-[#050505] group select-none transition-all duration-500 ${
          isIdle && isVideoPlaying ? "cursor-none" : "cursor-pointer"
        }`}
      >
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <div className="relative w-full h-full">
            {project.videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={project.videoUrl}
                  poster={project.coverImage || project.heroImage}
                  autoPlay={!isMobileDevice}
                  loop
                  muted={isVideoMuted}
                  playsInline
                  preload="auto"
                  onLoadedMetadata={(e) => {
                    const vid = e.currentTarget;
                    setVideoDur(vid.duration || 0);
                    setVideoTime(vid.currentTime || 0);
                    if ((!isMobileDevice || hasDismissedRotate) && vid.paused) {
                      vid.play().then(() => setIsVideoPlaying(true)).catch(() => {});
                    }
                  }}
                  onCanPlay={(e) => {
                    const vid = e.currentTarget;
                    if ((!isMobileDevice || hasDismissedRotate) && vid.paused) {
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
                  className="object-contain w-full h-full min-h-full min-w-full transform-gpu will-change-transform"
                  style={{
                    imageRendering: "crisp-edges",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                />

                {/* Floating Unmute Quick Action Pill (when muted autoplay starts) */}
                {isVideoMuted && isVideoPlaying && !isIdle && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      toggleMuteVideo();
                    }}
                    className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-black/85 hover:bg-white text-white hover:text-black px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-white/25 shadow-[0_0_30px_rgba(0,0,0,0.9)] font-inter text-[10px] sm:text-[11px] uppercase tracking-widest transition-all duration-300 animate-bounce cursor-pointer group"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 group-hover:text-black transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                    <span className="font-semibold">{lang === "fr" ? "Activer le son" : "Unmute Audio"}</span>
                  </button>
                )}

                {/* Awwwards Center Play/Pause/Rewind/Skip Animated Pulse Feedback */}
                <div
                  className={`absolute inset-0 z-30 flex items-center justify-center pointer-events-none transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    playPulseState ? "opacity-100 scale-100" : "opacity-0 scale-75"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)]">
                    {playPulseState === "pause" && (
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white fill-current filter drop-shadow-[0_0_25px_rgba(255,255,255,0.6)]" viewBox="0 0 24 24">
                        <path d="M6 4.5h4.5v15H6v-15zm7.5 0H18v15h-4.5v-15z" />
                      </svg>
                    )}
                    {playPulseState === "play" && (
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white fill-current translate-x-1 filter drop-shadow-[0_0_25px_rgba(255,255,255,0.6)]" viewBox="0 0 24 24">
                        <path d="M7 4.5v15l13-7.5L7 4.5z" />
                      </svg>
                    )}
                    {playPulseState === "rewind" && (
                      <div className="relative flex items-center justify-center filter drop-shadow-[0_0_25px_rgba(255,255,255,0.7)] text-white">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                        </svg>
                        <span className="absolute font-mono text-xs sm:text-sm md:text-base font-bold text-white pt-1 pointer-events-none">10</span>
                      </div>
                    )}
                    {playPulseState === "skip" && (
                      <div className="relative flex items-center justify-center filter drop-shadow-[0_0_25px_rgba(255,255,255,0.7)] text-white">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.99 6.74 2.74L21 8" />
                          <path d="M21 3v5h-5" />
                        </svg>
                        <span className="absolute font-mono text-xs sm:text-sm md:text-base font-bold text-white pt-1 pointer-events-none">10</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dynamic Cinema Bottom Gradient (Smoothly visible when UI is visible or paused, fades out when idle & playing) */}
                <div
                  className={`absolute inset-x-0 bottom-0 pointer-events-none h-48 sm:h-72 md:h-[440px] bg-gradient-to-t from-black/95 via-black/50 to-transparent transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-15 ${
                    !isIdle || !isVideoPlaying ? "opacity-100" : "opacity-0"
                  }`}
                />

                {/* Minimal Paused Info Card (Clean, unobtrusive, positioned above the bottom controls) */}
                <div
                  className={`absolute inset-0 z-20 pointer-events-none flex flex-col justify-end p-4 sm:p-8 md:p-16 pb-20 sm:pb-28 md:pb-36 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    !isVideoPlaying
                      ? "opacity-100 translate-y-0"
                      : isIdle
                      ? "opacity-0 translate-y-8 pointer-events-none"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="max-w-md sm:max-w-xl md:max-w-2xl space-y-1.5 sm:space-y-3 pointer-events-auto">
                    <div className="flex items-center gap-2">
                      <span className="font-inter text-[10px] sm:text-xs md:text-sm tracking-widest uppercase text-white/70 font-semibold drop-shadow-md">
                        {lang === "fr" ? "Vous regardez" : "Now watching"}
                      </span>
                    </div>
                    <h1 className="font-syne font-black text-xl sm:text-3xl md:text-5xl lg:text-6xl text-white tracking-tight uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.95)]">
                      {project.title}
                    </h1>
                    <div className="flex items-center flex-wrap gap-2 sm:gap-3 font-mono text-[10px] sm:text-[11px] text-white/80 font-medium pt-0.5">
                      <span className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded border border-white/20">{project.year}</span>
                      <span className="text-white/40">•</span>
                      <span>{project.category || (lang === "fr" ? "Vidéo" : "Video")}</span>
                      {videoDur > 0 && (
                        <>
                          <span className="text-white/40">•</span>
                          <span>{formatTime(videoDur)}</span>
                        </>
                      )}
                    </div>
                    {project.descriptionFr && (
                      <p className="font-inter text-[10px] sm:text-xs md:text-sm text-white/80 leading-relaxed max-w-lg pt-0.5 drop-shadow-md line-clamp-2 sm:line-clamp-none">
                        {lang === "fr" ? project.descriptionFr : (project.descriptionEn || project.descriptionFr)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Awwwards Seamless Cinema Bottom HUD (No box/rectangle, pure floating elegance centered between Contact & Audio) */}
                <div
                  onClick={(e) => { e.stopPropagation(); }}
                  onMouseDown={(e) => { e.stopPropagation(); }}
                  onTouchStart={(e) => { e.stopPropagation(); }}
                  onDoubleClick={(e) => { e.stopPropagation(); }}
                  className={`absolute inset-x-0 bottom-2 sm:bottom-4 md:bottom-10 z-40 px-3 sm:px-6 md:px-44 lg:px-56 xl:px-64 flex flex-col items-center justify-end pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isIdle && isVideoPlaying
                      ? "opacity-0 translate-y-6"
                      : "opacity-100 translate-y-0"
                  }`}
                >
                  <div className="w-full max-w-4xl lg:max-w-5xl flex flex-col gap-3 pointer-events-auto">
                    {/* Centered Timeline Progress Scrubber Bar with Delicate Fading & Glow */}
                    <div className="relative w-full flex items-center gap-3">
                      <span className="font-mono text-[10px] sm:text-[11px] text-white/75 shrink-0 font-semibold tracking-wider select-none drop-shadow">
                        {formatTime(videoTime)}
                      </span>

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
                        className="relative flex-1 h-1 hover:h-2 bg-white/20 hover:bg-white/35 rounded-full cursor-pointer group/scrubber transition-all duration-200 backdrop-blur-[2px]"
                      >
                        {/* Floating Hover Time Tooltip */}
                        {isScrubberHovered && hoverSeekTime !== null && (
                          <div
                            className="absolute -top-8 -translate-x-1/2 bg-black/95 text-white border border-white/20 backdrop-blur-md font-mono text-[10px] px-2 py-0.5 rounded shadow-xl pointer-events-none font-semibold"
                            style={{ left: `${hoverSeekPos}px` }}
                          >
                            {formatTime(hoverSeekTime)}
                          </div>
                        )}

                        {/* Progress Fill with Pure White Glow */}
                        <div
                          className="h-full bg-gradient-to-r from-white/75 via-white to-white rounded-full relative transition-all duration-75 origin-left shadow-[0_0_12px_rgba(255,255,255,0.9)]"
                          style={{ width: `${videoDur > 0 ? (videoTime / videoDur) * 100 : 0}%` }}
                        >
                          {/* Scrubber Thumb */}
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,1)] transform scale-0 group-hover/scrubber:scale-100 transition-transform duration-200" />
                        </div>
                      </div>

                      {/* Remaining Time Readout */}
                      <span className="font-mono text-[10px] sm:text-[11px] text-white/75 shrink-0 font-semibold tracking-wider select-none drop-shadow">
                        {videoDur > 0 ? `-${formatTime(Math.max(0, videoDur - videoTime))}` : "00:00"}
                      </span>
                    </div>

                    {/* Controls Row (Pure floating elements, no rectangle border) */}
                    <div className="relative flex items-center justify-between w-full">
                      {/* Left Group */}
                      <div className="flex items-center gap-1 sm:gap-2.5 z-10">
                        {/* Play / Pause button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlayVideo();
                          }}
                          className="text-white hover:text-white/80 p-1 cursor-pointer transition-all duration-200 hover:scale-115 active:scale-90 flex items-center justify-center group/playbtn drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                          title={isVideoPlaying ? "Pause (Espace)" : "Lecture (Espace)"}
                        >
                          {isVideoPlaying ? (
                            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                              <path d="M6 4.5h4.5v15H6v-15zm7.5 0H18v15h-4.5v-15z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 fill-white translate-x-0.5" viewBox="0 0 24 24">
                              <path d="M7 4.5v15l13-7.5L7 4.5z" />
                            </svg>
                          )}
                        </button>

                        {/* Rewind 10s (Left button: Counter-Clockwise Arrow pointing Left with 10) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            seekRelative(-10);
                          }}
                          className="text-white/85 hover:text-white p-1 cursor-pointer transition-transform hover:scale-110 active:scale-90 flex items-center justify-center group drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] relative"
                          title="Reculer de 10s (←)"
                        >
                          <div className="relative flex items-center justify-center">
                            <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                              <path d="M3 3v5h5" />
                            </svg>
                            <span className="absolute font-mono text-[8px] font-bold text-white leading-none pt-0.5 pointer-events-none">10</span>
                          </div>
                        </button>

                        {/* Skip 10s (Right button: Clockwise Arrow pointing Right with 10) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            seekRelative(10);
                          }}
                          className="text-white/85 hover:text-white p-1 cursor-pointer transition-transform hover:scale-110 active:scale-90 flex items-center justify-center group drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] relative"
                          title="Avancer de 10s (→)"
                        >
                          <div className="relative flex items-center justify-center">
                            <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.99 6.74 2.74L21 8" />
                              <path d="M21 3v5h-5" />
                            </svg>
                            <span className="absolute font-mono text-[8px] font-bold text-white leading-none pt-0.5 pointer-events-none">10</span>
                          </div>
                        </button>

                        {/* Ultra-Stylized Awwwards Speaker & Volume Control */}
                        <div className="flex items-center gap-1.5 group/vol pl-1">
                          <button
                            onClick={toggleMuteVideo}
                            className="text-white/85 hover:text-white p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95 flex items-center justify-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                            title={isVideoMuted || videoVolume === 0 ? "Activer le son (M)" : "Couper le son (M)"}
                          >
                            {isVideoMuted || videoVolume === 0 ? (
                              <svg className="w-4.5 h-4.5 text-white/50" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25M9.75 6.75l-4.5 3.75H3a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75h2.25l4.5 3.75V6.75z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                              </svg>
                            ) : videoVolume <= 0.35 ? (
                              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 6.75l-4.5 3.75H3a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75h2.25l4.5 3.75V6.75z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75a4.5 4.5 0 010 4.5" />
                              </svg>
                            ) : videoVolume <= 0.7 ? (
                              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 6.75l-4.5 3.75H3a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75h2.25l4.5 3.75V6.75z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75a4.5 4.5 0 010 4.5" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.8 7.2a7.5 7.5 0 010 9.6" />
                              </svg>
                            ) : (
                              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 6.75l-4.5 3.75H3a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75h2.25l4.5 3.75V6.75z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75a4.5 4.5 0 010 4.5" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.8 7.2a7.5 7.5 0 010 9.6" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.35 4.65a11 11 0 010 14.7" />
                              </svg>
                            )}
                          </button>

                          {/* Sleek Volume Slider with Glow */}
                          <div
                            onPointerDown={handleVolumePointer}
                            onPointerMove={(e) => {
                              if (e.buttons === 1) handleVolumePointer(e);
                            }}
                            className="relative w-12 sm:w-16 h-1 bg-white/20 rounded-full cursor-pointer overflow-hidden transition-all duration-300 hover:h-1.5 group-hover/vol:bg-white/35 backdrop-blur-[2px]"
                            title={`Volume: ${Math.round((isVideoMuted ? 0 : videoVolume) * 100)}%`}
                          >
                            <div
                              className="h-full bg-white rounded-full transition-all duration-75 origin-left shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                              style={{ width: `${isVideoMuted ? 0 : videoVolume * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Video Title Perfectly Centered in Bottom Controls */}
                      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none px-2 max-w-[45%] text-center">
                        <span className="font-syne font-bold text-xs sm:text-sm tracking-wider text-white uppercase truncate drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                          {project.title}
                        </span>
                      </div>

                      {/* Right Group */}
                      <div className="flex items-center gap-1.5 sm:gap-2.5 z-10">
                        {/* Playback Speed Button */}
                        <button
                          onClick={cyclePlaybackRate}
                          className="font-mono text-[10px] sm:text-[11px] font-semibold text-white/85 hover:text-white px-2 py-0.5 rounded border border-white/20 hover:border-white/50 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all cursor-pointer drop-shadow"
                          title="Vitesse de lecture"
                        >
                          {playbackRate}x
                        </button>

                        {/* Fullscreen Button */}
                        <button
                          onClick={toggleFullscreen}
                          className="text-white/85 hover:text-white p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95 flex items-center justify-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                          title={isFullscreen ? "Quitter le plein écran (F)" : "Plein écran (F)"}
                        >
                          {isFullscreen ? (
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                            </svg>
                          )}
                        </button>
                      </div>
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
            {!project.videoUrl && (
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/20 pointer-events-none" />
            )}
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
