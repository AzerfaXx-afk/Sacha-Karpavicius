"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";

interface SiteContextType {
  hasEnteredSite: boolean;
  setHasEnteredSite: (val: boolean) => void;
  isHoveringName: boolean;
  setIsHoveringName: (val: boolean) => void;
  isHideUI: boolean;
  setIsHideUI: (val: boolean) => void;
  isPlaying: boolean;
  toggleAudio: () => void;
  pauseAudio: () => void;
  playEntrance: () => void;
  playClickSfx: () => void;
  playHoverSfx: () => void;
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
  playEntrance: () => {},
  playClickSfx: () => {},
  playHoverSfx: () => {},
});

export const SiteProvider = ({ children }: { children: React.ReactNode }) => {
  const [hasEnteredSite, setHasEnteredSite] = useState(false);
  const [isHoveringName, setIsHoveringName] = useState(false);
  const [isHideUI, setIsHideUI] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/musique.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.35;

      hoverAudioRef.current = new Audio("/hover.mp3");
      hoverAudioRef.current.volume = 0.08;

      clickAudioRef.current = new Audio("/click.mp3");
      clickAudioRef.current.volume = 0.15;
    }
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const playEntrance = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    try {
      const entrance = new Audio("/entrance.mp3");
      entrance.volume = 0.3;
      entrance.play().catch(() => {});
    } catch {}
  };

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
        playEntrance,
        playClickSfx,
        playHoverSfx,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSiteContext = () => useContext(SiteContext);
