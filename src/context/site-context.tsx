"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";

interface SiteContextType {
  hasEnteredSite: boolean;
  setHasEnteredSite: (val: boolean) => void;
  isHoveringName: boolean;
  setIsHoveringName: (val: boolean) => void;
  isHideUI: boolean;
  setIsHideUI: (val: boolean) => void;
  isPlaying: boolean;
  toggleAudio: () => void;
  pauseAudio: (fade?: boolean) => void;
  resumeAudio: (fade?: boolean) => void;
  playEntrance: () => void;
  playClickSfx: () => void;
  playHoverSfx: () => void;
  stopAllVideos: () => void;
  stopAllMedia: () => void;
}

const SiteContext = createContext<SiteContextType>({
  hasEnteredSite: false,
  setHasEnteredSite: () => {},
  isHoveringName: false,
  setIsHoveringName: () => {},
  isHideUI: false,
  setIsHideUI: () => {},
  isPlaying: false,
  toggleAudio: () => {},
  pauseAudio: () => {},
  resumeAudio: () => {},
  playEntrance: () => {},
  playClickSfx: () => {},
  playHoverSfx: () => {},
  stopAllVideos: () => {},
  stopAllMedia: () => {},
});


export const SiteProvider = ({ children }: { children: React.ReactNode }) => {
  const [hasEnteredSite, setHasEnteredSite] = useState(false);
  const [isHoveringName, setIsHoveringName] = useState(false);
  const [isHideUI, setIsHideUI] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);

  // User preference: true by default on cinematic experience unless explicitly muted
  const userWantsAudioRef = useRef(true);

  // Background audio pause/resume tracking refs
  const wasPlayingBeforeBackgroundRef = useRef(false);
  const isAutoPausedRef = useRef(false);
  const isPlayingRef = useRef(isPlaying);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (sessionStorage.getItem("userWantsAudio") === "false") {
      userWantsAudioRef.current = false;
    } else {
      userWantsAudioRef.current = true;
    }

    const audio = new Audio("/musique.mp3");
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = "auto";

    // Direct binding of HTML5 media events to React isPlaying state
    const handlePlaying = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("play", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    audioRef.current = audio;

    hoverAudioRef.current = new Audio("/hover.mp3");
    hoverAudioRef.current.volume = 0.08;

    clickAudioRef.current = new Audio("/click.mp3");
    clickAudioRef.current.volume = 0.15;

    // Heartbeat sync loop: guarantees zero desynchronization between audio and visualizer at all times
    const syncInterval = setInterval(() => {
      if (!audioRef.current) return;
      const isActuallyPlaying = !audioRef.current.paused && !audioRef.current.ended && audioRef.current.currentTime > 0;
      setIsPlaying((prev) => (prev !== isActuallyPlaying ? isActuallyPlaying : prev));
    }, 150);

    return () => {
      clearInterval(syncInterval);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("play", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
    };
  }, []);

  const stopAllVideos = useCallback(() => {
    if (typeof document === "undefined") return;
    document.querySelectorAll("video").forEach((vid) => {
      try {
        vid.pause();
        vid.currentTime = 0;
      } catch (_) {}
    });
  }, []);

  const stopAllMedia = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    stopAllVideos();
  }, [stopAllVideos]);

  const handleBackground = useCallback(() => {
    if (isAutoPausedRef.current) return;

    const audio = audioRef.current;
    const currentlyPlaying = audio && !audio.paused && audio.currentTime > 0;

    if (currentlyPlaying) {
      wasPlayingBeforeBackgroundRef.current = true;
      isAutoPausedRef.current = true;
      audio.pause();
      setIsPlaying(false);
    }

    // Pause all videos immediately when tab or app is hidden/backgrounded
    if (typeof document !== "undefined") {
      document.querySelectorAll("video").forEach((vid) => {
        try { vid.pause(); } catch (_) {}
      });
    }
  }, []);

  const handleForeground = useCallback(() => {
    if (!isAutoPausedRef.current) return;

    const audio = audioRef.current;
    if (wasPlayingBeforeBackgroundRef.current && audio && userWantsAudioRef.current) {
      audio.volume = 0.35;
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn("Audio resume interrupted by browser policy:", err);
          setIsPlaying(false);
        });
    }

    wasPlayingBeforeBackgroundRef.current = false;
    isAutoPausedRef.current = false;
  }, []);

  // Centralized listeners: tab switching, mobile app minimize, lock screen, pagehide, freeze
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const onVisibilityChange = () => {
      if (document.hidden || document.visibilityState === "hidden") {
        handleBackground();
      } else {
        handleForeground();
      }
    };

    const onPageHide = () => handleBackground();
    const onFreeze = () => handleBackground();

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("freeze" as any, onFreeze);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("freeze" as any, onFreeze);
    };
  }, [handleBackground, handleForeground]);


  const toggleAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    wasPlayingBeforeBackgroundRef.current = false;
    isAutoPausedRef.current = false;

    const isCurrentlyPlaying = !audio.paused && audio.currentTime > 0;

    if (isCurrentlyPlaying) {
      // User clicked while playing -> IMMEDIATELY turn OFF sound and update UI to dots
      userWantsAudioRef.current = false;
      if (typeof window !== "undefined") sessionStorage.setItem("userWantsAudio", "false");
      audio.pause();
      setIsPlaying(false);
    } else {
      // User clicked while stopped -> IMMEDIATELY turn ON sound and update UI to animated bars
      userWantsAudioRef.current = true;
      if (typeof window !== "undefined") sessionStorage.setItem("userWantsAudio", "true");
      audio.volume = 0.35;
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn("Audio play blocked by browser policy:", err);
          setIsPlaying(false);
        });
    }
  }, []);

  const pauseAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setIsPlaying(false);
  }, []);

  const resumeAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!userWantsAudioRef.current) return;

    audio.volume = 0.35;
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((err) => {
        console.warn("Audio resume interrupted:", err);
        setIsPlaying(false);
      });
  }, []);

  const playEntrance = useCallback(() => {
    wasPlayingBeforeBackgroundRef.current = false;
    isAutoPausedRef.current = false;
    userWantsAudioRef.current = true;
    if (typeof window !== "undefined") sessionStorage.setItem("userWantsAudio", "true");

    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.35;
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
    try {
      const entrance = new Audio("/entrance.mp3");
      entrance.volume = 0.3;
      entrance.play().catch(() => {});
    } catch {}
  }, []);

  const playClickSfx = () => {
    if (clickAudioRef.current) {
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.play().catch(() => {});
    }
  };

  const playHoverSfx = () => {
    if (hoverAudioRef.current) {
      hoverAudioRef.current.currentTime = 0;
      hoverAudioRef.current.play().catch(() => {});
    }
  };

  return (
    <SiteContext.Provider
      value={{
        hasEnteredSite,
        setHasEnteredSite,
        isHoveringName,
        setIsHoveringName,
        isHideUI,
        setIsHideUI,
        isPlaying,
        toggleAudio,
        pauseAudio,
        resumeAudio,
        playEntrance,
        playClickSfx,
        playHoverSfx,
        stopAllVideos,
        stopAllMedia,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};


export const useSiteContext = () => useContext(SiteContext);

