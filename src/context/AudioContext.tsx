import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';

interface AudioContextType {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  currentAudioElement: HTMLAudioElement | null;
  registerAudioElement: (audio: HTMLAudioElement | null, key?: string | number) => void;
  audioContext: AudioContext;
  activeAudioKey: string | number | null;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeAudioKey, setActiveAudioKey] = useState<string | number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  if (!audioContextRef.current) {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  const registerAudioElement = (audio: HTMLAudioElement | null, key?: string | number) => {
    if (audioElementRef.current && !audioElementRef.current.paused) {
      audioElementRef.current.pause();
    }
    audioElementRef.current = audio;
    setActiveAudioKey(key ?? null);
  };

  return (
    <AudioContext.Provider value={{ 
      isPlaying, 
      setIsPlaying, 
      currentAudioElement: audioElementRef.current,
      registerAudioElement,
      audioContext: audioContextRef.current,
      activeAudioKey
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  
  return context;
} 