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

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isUiVisible, setIsUiVisible] = useState(true);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [pulseAction, setPulseAction] = useState<"play" | "pause" | "rewind" | "skip" | null>(null);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pulseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Guarantee site UI is hidden & background music paused
  useEffect(() => {
    setIsHideUI(true);
    pauseAudio(true);

    // Try locking screen orientation to landscape if supported
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const screenAny = screen as any;
      if (screenAny?.orientation?.lock) {
        screenAny.orientation.lock("landscape").catch(() => {});
      }
    } catch (_) {}

    return () => {
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
    setIsUiVisible(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isPlaying && !isPlaylistOpen) {
      idleTimerRef.current = setTimeout(() => {
        setIsUiVisible(false);
      }, 3000);
    }
  }, [isPlaying, isPlaylistOpen]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

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
  }, [project.videoUrl, pauseAudio]);

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
      resumeAudio(true);
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

  const handleScrubberTouch = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clickX = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = ratio * duration;
    const vid = videoRef.current;
    if (vid) {
      vid.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
    resetIdleTimer();
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      onClick={resetIdleTimer}
      className="fixed inset-0 z-[99999] bg-black text-white flex flex-col justify-between overflow-hidden select-none"
      style={{ touchAction: "manipulation" }}
    >
      {/* 4K Cinema Video Frame */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={project.videoUrl}
          poster={project.coverImage || project.heroImage}
          playsInline
          autoPlay
          loop
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
              setDuration(videoRef.current.duration || 0);
            }
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration || 0);
            }
          }}
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>

      {/* Tap Overlay to Toggle UI */}
      <div
        onClick={() => setIsUiVisible((prev) => !prev)}
        className="absolute inset-0 z-10 cursor-pointer"
      />

      {/* Top & Bottom Cinematic Vignette Gradient */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-400 z-15 ${
          isUiVisible || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
      </div>

      {/* ═══════════════ TOP BAR (NETFLIX STYLE) ═══════════════ */}
      <header
        className={`relative z-30 w-full px-5 pt-4 sm:pt-6 flex items-center justify-between transition-all duration-300 ${
          isUiVisible || !isPlaying ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        {/* Left: Back Arrow */}
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
        </button>

        {/* Center: Title */}
        <div className="flex flex-col items-center text-center px-4 max-w-[70%]">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/60 font-semibold">
            {lang === "fr" ? "Projet Vidéo" : "Film"}
          </span>
          <h1 className="font-syne font-extrabold text-sm sm:text-base uppercase tracking-tight text-white truncate drop-shadow-md">
            {project.title}
          </h1>
        </div>

        {/* Right Balance Spacer */}
        <div className="w-8" />
      </header>

      {/* ═══════════════ CENTER CONTROLS (NETFLIX STYLE) ═══════════════ */}
      <div
        className={`relative z-30 w-full flex items-center justify-center gap-8 sm:gap-14 my-auto transition-all duration-300 pointer-events-auto ${
          isUiVisible || !isPlaying ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
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
        className={`relative z-30 w-full px-5 pb-4 sm:pb-6 flex flex-col gap-2 transition-all duration-300 ${
          isUiVisible || !isPlaying ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Scrubber Progress Bar */}
        <div
          onTouchStart={handleScrubberTouch}
          onClick={handleScrubberTouch}
          className="relative w-full h-5 flex items-center cursor-pointer group py-1.5"
        >
          <div className="w-full h-1 bg-white/25 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-red-600 rounded-full transition-all duration-75 relative shadow-[0_0_10px_rgba(220,38,38,0.8)]"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Readouts & Films Drawer Button */}
        <div className="flex items-center justify-between font-mono text-xs text-white/80">
          {/* Time Readout */}
          <div className="flex items-center gap-1.5 font-semibold tracking-wider text-[11px]">
            <span>{formatTime(currentTime)}</span>
            <span className="text-white/40">/</span>
            <span className="text-white/60">{formatTime(duration)}</span>
          </div>

          {/* Films Playlist Button in Bottom Right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaylistOpen(true);
              setIsUiVisible(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-90 text-white transition-all cursor-pointer border border-white/20 shadow-lg"
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
          </button>
        </div>
      </footer>

      {/* ═══════════════ PLAYLIST DRAWER (CLEAN VERTICAL LIST) ═══════════════ */}
      {isPlaylistOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsPlaylistOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col justify-end animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[80vh] bg-[#121212] border-t border-white/15 rounded-t-3xl p-5 sm:p-6 flex flex-col gap-4 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="15" height="11" rx="2" ry="2" />
                  <path d="M5 4h14a2 2 0 0 1 2 2v10" />
                  <path d="M9 1h12a2 2 0 0 1 2 2v10" />
                </svg>
                <h3 className="font-syne font-extrabold text-sm uppercase tracking-wider text-white">
                  {lang === "fr" ? "Autres Films & Vidéos" : "Other Films"}
                </h3>
              </div>

              <button
                onClick={() => setIsPlaylistOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white/80 transition-all cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Vertical Cards List */}
            <div className="flex flex-col gap-2.5">
              {allProjects.map((p) => {
                const isCurrent = p.slug === project.slug;
                return (
                  <div
                    key={p.slug}
                    onClick={() => {
                      onSelectProject(p);
                      setIsPlaylistOpen(false);
                    }}
                    className={`relative rounded-xl overflow-hidden p-2.5 flex items-center gap-3.5 border transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-white/15 border-red-500/80 shadow-[0_0_25px_rgba(220,38,38,0.3)]"
                        : "bg-white/5 border-white/10 hover:bg-white/10 active:scale-98"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-black shrink-0">
                      <Image
                        src={p.coverImage || p.heroImage}
                        alt={p.title}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                      {isCurrent && (
                        <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <h4 className="font-syne font-bold text-xs sm:text-sm uppercase text-white truncate">
                        {p.title}
                      </h4>
                      <div className="flex items-center gap-2 font-mono text-[10px] text-white/60 pt-0.5">
                        <span>{p.year}</span>
                        <span>•</span>
                        <span className="truncate">{p.category || "Vidéo"}</span>
                      </div>
                      {isCurrent && (
                        <span className="font-mono text-[9px] uppercase tracking-wider text-red-400 font-bold mt-1">
                          ▶ {lang === "fr" ? "En cours de lecture" : "Currently playing"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
