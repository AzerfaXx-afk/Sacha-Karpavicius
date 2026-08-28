"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Project } from "@/data/projects";
import { useSiteContext } from "@/context/site-context";

interface NetflixMobilePlayerProps {
  project: Project;
  allProjects: Project[];
  onSelectProject: (p: Project) => void;
  onBack: () => void;
  lang?: "fr" | "en";
}

export default function NetflixMobilePlayer({
  project,
  allProjects,
  onSelectProject,
  onBack,
  lang = "fr",
}: NetflixMobilePlayerProps) {
  const { pauseAudio, resumeAudio, setIsHideUI } = useSiteContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);

  const [currentFilm, setCurrentFilm] = useState<Project>(project);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isUiVisible, setIsUiVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState<number | null>(null);
  const [pulseAction, setPulseAction] = useState<"play" | "pause" | "rewind" | "skip" | null>(null);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pulseTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurrentFilm(project);
  }, [project]);

  // Keep site ambient audio paused & site UI hidden on mobile video player
  useEffect(() => {
    setIsHideUI(true);
    pauseAudio(true);

    const tryFullscreenAndLandscape = async () => {
      try {
        const elem = containerRef.current || document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
          await (elem as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
        }
      } catch (_) {}

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const screenAny = screen as any;
        if (screenAny?.orientation?.lock) {
          await screenAny.orientation.lock("landscape");
        }
      } catch (_) {}
    };

    tryFullscreenAndLandscape();

    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
      setIsHideUI(false);
      resumeAudio(true);
    };
  }, [setIsHideUI, pauseAudio, resumeAudio]);

  const triggerPulse = (type: "play" | "pause" | "rewind" | "skip") => {
    setPulseAction(type);
    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = setTimeout(() => {
      setPulseAction(null);
    }, 500);
  };

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isPlaying && !isMenuOpen && !isScrubbing) {
      idleTimerRef.current = setTimeout(() => {
        setIsUiVisible(false);
      }, 3500);
    }
  }, [isPlaying, isMenuOpen, isScrubbing]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  // Autoplay with sound on load/change
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    vid.currentTime = 0;
    vid.muted = false;
    vid.play()
      .then(() => {
        setIsPlaying(true);
        pauseAudio(true);
      })
      .catch(() => {
        vid.muted = true;
        vid.play().then(() => {
          setIsPlaying(true);
          pauseAudio(true);
        }).catch(() => {});
      });
  }, [currentFilm.videoUrl, pauseAudio]);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused || vid.ended) {
      vid.play().then(() => {
        setIsPlaying(true);
        triggerPulse("play");
        resetIdleTimer();
        pauseAudio(true);
      }).catch(() => {});
    } else {
      vid.pause();
      setIsPlaying(false);
      triggerPulse("pause");
      setIsUiVisible(true);
    }
  };

  const seekRelative = (seconds: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = Math.max(0, Math.min(vid.duration || 0, vid.currentTime + seconds));
    setCurrentTime(vid.currentTime);
    triggerPulse(seconds < 0 ? "rewind" : "skip");
    resetIdleTimer();
  };

  // Robust touch scrubber handling
  const handleScrubberChange = (clientX: number) => {
    if (!scrubberRef.current || duration <= 0) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = ratio * duration;
    setScrubTime(targetTime);
    const vid = videoRef.current;
    if (vid) {
      vid.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsScrubbing(true);
    handleScrubberChange(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isScrubbing) {
      handleScrubberChange(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsScrubbing(false);
    setScrubTime(null);
    resetIdleTimer();
  };

  const handleClickScrubber = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    handleScrubberChange(e.clientX);
    resetIdleTimer();
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelectFilm = (film: Project) => {
    setCurrentFilm(film);
    onSelectProject(film);
    setIsMenuOpen(false);
    resetIdleTimer();
  };

  const displayedTime = scrubTime !== null ? scrubTime : currentTime;

  return (
    <div
      ref={containerRef}
      onClick={() => {
        if (isMenuOpen) {
          setIsMenuOpen(false);
        } else {
          setIsUiVisible((prev) => !prev);
        }
        resetIdleTimer();
      }}
      style={
        isPortrait
          ? {
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vh",
              height: "100vw",
              transformOrigin: "0 0",
              transform: "translate(100vw, 0) rotate(90deg)",
              zIndex: 99999,
              overflow: "hidden",
              touchAction: "manipulation",
              backgroundColor: "#000000",
            }
          : {
              position: "fixed",
              inset: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 99999,
              overflow: "hidden",
              touchAction: "manipulation",
              backgroundColor: "#000000",
            }
      }
      className="text-white flex flex-col justify-between select-none"
    >
      {/* 4K Cinema Video Surface (Edge-to-Edge) */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={currentFilm.videoUrl}
          playsInline
          autoPlay
          loop
          onTimeUpdate={() => {
            if (videoRef.current && !isScrubbing) {
              setCurrentTime(videoRef.current.currentTime);
              setDuration(videoRef.current.duration || 0);
            }
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration || 0);
            }
          }}
          className="w-full h-full object-cover sm:object-contain pointer-events-none"
        />
      </div>

      {/* Top & Bottom Cinematic Vignette Gradient */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-400 z-15 ${
          isUiVisible || !isPlaying || isMenuOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
      </div>

      {/* ═══════════════ TOP BAR (NETFLIX STYLE) ═══════════════ */}
      <header
        className={`relative z-30 w-full px-5 pt-4 sm:pt-5 flex items-center justify-between transition-all duration-300 ${
          isUiVisible || !isPlaying || isMenuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        {/* Left: Back Arrow Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          className="p-2 -ml-2 text-white/90 hover:text-white active:scale-90 transition-transform cursor-pointer flex items-center gap-1.5"
          aria-label="Retour"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span className="font-mono text-xs text-white/75 font-semibold hidden sm:inline">
            {lang === "fr" ? "Accueil" : "Home"}
          </span>
        </button>

        {/* Center: Title */}
        <div className="flex flex-col items-center text-center px-4 max-w-[70%]">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/60 font-semibold">
            {lang === "fr" ? "Projet Vidéo" : "Film"}
          </span>
          <h1 className="font-syne font-extrabold text-sm sm:text-base uppercase tracking-tight text-white truncate drop-shadow-md">
            {currentFilm.title}
          </h1>
        </div>

        {/* Right Balance Spacer */}
        <div className="w-12" />
      </header>

      {/* ═══════════════ CENTER CONTROLS (NETFLIX STYLE) ═══════════════ */}
      <div
        className={`relative z-30 w-full flex items-center justify-center gap-10 sm:gap-16 my-auto transition-all duration-300 pointer-events-auto ${
          (isUiVisible || !isPlaying) && !isMenuOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* Rewind -10s */}
        <button
          onClick={(e) => seekRelative(-10, e)}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 active:scale-90 transition-all flex items-center justify-center cursor-pointer text-white drop-shadow-lg"
          aria-label="Reculer de 10 secondes"
        >
          <div className="relative flex items-center justify-center">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span className="absolute font-mono text-[9px] font-bold text-white pt-0.5 pointer-events-none">10</span>
          </div>
        </button>

        {/* Big Center Play / Pause */}
        <button
          onClick={togglePlay}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-black active:scale-90 transition-all flex items-center justify-center shadow-[0_0_35px_rgba(255,255,255,0.4)] cursor-pointer"
          aria-label={isPlaying ? "Pause" : "Lecture"}
        >
          {isPlaying ? (
            <svg className="w-7 h-7 fill-black" viewBox="0 0 24 24">
              <path d="M6 4.5h4.5v15H6v-15zm7.5 0H18v15h-4.5v-15z" />
            </svg>
          ) : (
            <svg className="w-7 h-7 fill-black translate-x-0.5" viewBox="0 0 24 24">
              <path d="M7 4.5v15l13-7.5L7 4.5z" />
            </svg>
          )}
        </button>

        {/* Skip +10s */}
        <button
          onClick={(e) => seekRelative(10, e)}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 active:scale-90 transition-all flex items-center justify-center cursor-pointer text-white drop-shadow-lg"
          aria-label="Avancer de 10 secondes"
        >
          <div className="relative flex items-center justify-center">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.99 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            <span className="absolute font-mono text-[9px] font-bold text-white pt-0.5 pointer-events-none">10</span>
          </div>
        </button>
      </div>

      {/* ═══════════════ BOTTOM BAR (TIMELINE + FILMS PLAYLIST BUTTON) ═══════════════ */}
      <footer
        className={`relative z-30 w-full px-5 pb-3 sm:pb-4 flex flex-col gap-2 transition-all duration-300 ${
          isUiVisible || !isPlaying || isMenuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Touch Scrubber Progress Bar */}
        <div
          ref={scrubberRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleClickScrubber}
          className="relative w-full h-8 -my-2 flex items-center cursor-pointer touch-none group"
        >
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-red-600 rounded-full transition-all duration-75 relative shadow-[0_0_12px_rgba(220,38,38,0.9)]"
              style={{ width: `${duration > 0 ? (displayedTime / duration) * 100 : 0}%` }}
            />
          </div>
          {/* Scrubber Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(0,0,0,0.8)] border border-red-600 pointer-events-none"
            style={{ left: `calc(${duration > 0 ? (displayedTime / duration) * 100 : 0}% - 8px)` }}
          />
        </div>

        {/* Readouts & Films Playlist Dropdown Button */}
        <div className="flex items-center justify-between font-mono text-xs text-white/80">
          {/* Time Readout */}
          <div className="flex items-center gap-1.5 font-semibold tracking-wider text-[11px]">
            <span>{formatTime(displayedTime)}</span>
            <span className="text-white/40">/</span>
            <span className="text-white/60">{formatTime(duration)}</span>
          </div>

          {/* Films Playlist Menu Toggle in Bottom Right */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen((prev) => !prev);
                setIsUiVisible(true);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg active:scale-95 text-white transition-all cursor-pointer border ${
                isMenuOpen
                  ? "bg-red-600 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                  : "bg-white/10 hover:bg-white/20 border-white/20 shadow-lg"
              }`}
              aria-label="Liste des films"
              title="Autres films"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="15" height="11" rx="2" ry="2" />
                <path d="M5 4h14a2 2 0 0 1 2 2v10" />
                <path d="M9 1h12a2 2 0 0 1 2 2v10" />
              </svg>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                {lang === "fr" ? "Films" : "Videos"}
              </span>
              <svg className={`w-3 h-3 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* ═══════════════ FLOATING PLAYLIST DROPDOWN MENU ═══════════════ */}
            {isMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-12 right-0 z-50 w-72 sm:w-80 bg-black/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10 px-1">
                  <span className="font-syne font-extrabold text-[11px] uppercase tracking-wider text-white/90">
                    {lang === "fr" ? "Sélectionner un film" : "Select a film"}
                  </span>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 text-[10px] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Vertical Film Options */}
                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                  {allProjects.map((film) => {
                    const isCurrent = film.slug === currentFilm.slug;
                    return (
                      <div
                        key={film.slug}
                        onClick={() => handleSelectFilm(film)}
                        className={`relative rounded-xl p-2 flex items-center gap-3 border transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-white/15 border-red-500/80 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                            : "bg-white/5 border-white/10 hover:bg-white/10 active:scale-98"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-black shrink-0">
                          <Image
                            src={film.coverImage || film.heroImage}
                            alt={film.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                          {isCurrent && (
                            <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            </div>
                          )}
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-col min-w-0 flex-1">
                          <h4 className="font-syne font-bold text-xs uppercase text-white truncate">
                            {film.title}
                          </h4>
                          <div className="flex items-center gap-1.5 font-mono text-[9px] text-white/60">
                            <span>{film.year}</span>
                            <span>•</span>
                            <span className="truncate">{film.category || "Vidéo"}</span>
                          </div>
                          {isCurrent && (
                            <span className="font-mono text-[8px] uppercase tracking-wider text-red-400 font-bold mt-0.5">
                              ▶ {lang === "fr" ? "En cours" : "Playing"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
