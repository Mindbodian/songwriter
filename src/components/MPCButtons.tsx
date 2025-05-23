import React, { useState, useRef, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';

interface MPCButtonsProps {
  // You can add props here if needed
}

export function MPCButtons({}: MPCButtonsProps) {
  const [activeLoop, setActiveLoop] = useState<number | null>(null);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>(Array(8).fill(null));
  const { setIsPlaying, registerAudioElement } = useAudio();
  
  // Sample beat loop labels - replace with your actual beat names
  const beatLabels = [
    "Beat 1", 
    "Beat 2", 
    "Beat 3", 
    "Beat 4", 
    "Beat 5", 
    "Beat 6", 
    "Beat 7", 
    "Beat 8"
  ];

  // Paths to audio files - replace with your actual audio files
  const audioFiles = [
    "/sounds/beat1.mp3",
    "/sounds/beat2.mp3",
    "/sounds/beat3.mp3",
    "/sounds/beat4.mp3",
    "/sounds/beat5.mp3",
    "/sounds/beat6.mp3",
    "/sounds/beat7.mp3",
    "/sounds/beat8.mp3"
  ];

  useEffect(() => {
    // Initialize audio elements
    audioRefs.current = audioRefs.current.map((_, i) => {
      const audio = new Audio(audioFiles[i]);
      audio.loop = true;
      return audio;
    });

    // Cleanup on component unmount
    return () => {
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
      setIsPlaying(false);
    };
  }, [setIsPlaying]);

  const handleButtonClick = (index: number) => {
    // If the same button is clicked again, stop the loop
    if (activeLoop === index) {
      if (audioRefs.current[index]) {
        audioRefs.current[index]?.pause();
        audioRefs.current[index]!.currentTime = 0;
      }
      setActiveLoop(null);
      setIsPlaying(false);
      registerAudioElement(null);
      return;
    }

    // Stop any currently playing loop
    if (activeLoop !== null && audioRefs.current[activeLoop]) {
      audioRefs.current[activeLoop]?.pause();
      audioRefs.current[activeLoop]!.currentTime = 0;
    }

    // Play the selected loop
    if (audioRefs.current[index]) {
      const audioElement = audioRefs.current[index]!;
      
      // Register this audio element with the context
      registerAudioElement(audioElement);
      
      audioElement.play().catch(e => {
        console.error("Error playing audio:", e);
        alert(`Could not play ${beatLabels[index]}. Please add the file: public${audioFiles[index]}`);
      });
      setActiveLoop(index);
      setIsPlaying(true);
    }
  };

  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-1 p-1">
      {beatLabels.map((label, index) => (
        <button
          type="button"
          key={index}
          onClick={() => handleButtonClick(index)}
          className={`w-8 h-8 rounded-sm flex items-center justify-center text-[7px] font-bold transition-all duration-100 border ${
            activeLoop === index 
              ? 'bg-amber-600 border-amber-800 border-b-2 border-t-amber-400 border-l-amber-400 border-r-amber-800 shadow-inner text-white active:border-b active:translate-y-0.5' 
              : 'bg-amber-500 border-amber-700 border-b-2 border-t-amber-300 border-l-amber-300 border-r-amber-700 text-black hover:bg-amber-400 active:border-b active:translate-y-0.5'
          }`}
        >
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="flex items-center justify-center mb-0.5">
              {activeLoop === index ? (
                <span className="text-[8px] animate-pulse">●</span>
              ) : (
                <span className="text-[8px]">▶</span>
              )}
            </div>
            <span className="text-[6px] leading-none text-center truncate w-full">{label}</span>
          </div>
        </button>
      ))}
    </div>
  );
} 