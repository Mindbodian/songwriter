import React, { useRef, useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import type { MPCPad } from '../App';

interface MPCButtonsProps {
  mpcPads: MPCPad[];
  activePadIndex: number | null;
  setActivePadIndex: (pad: number | null) => void;
}

export function MPCButtons({ mpcPads, activePadIndex, setActivePadIndex }: MPCButtonsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { setIsPlaying, registerAudioElement, audioContext } = useAudio();

  const beatLabels = [
    'Beat 1', 'Beat 2', 'Beat 3', 'Beat 4',
    'Beat 5', 'Beat 6', 'Beat 7', 'Beat 8'
  ];
  const audioFiles = [
    '/sounds/beat1.mp3', '/sounds/beat2.mp3', '/sounds/beat3.mp3', '/sounds/beat4.mp3',
    '/sounds/beat5.mp3', '/sounds/beat6.mp3', '/sounds/beat7.mp3', '/sounds/beat8.mp3'
  ];

  // Helper to get audio src and loop for each pad
  const getPadAudio = (index: number) => {
    const pad = mpcPads[index];
    return {
      src: pad && pad.audioUrl ? pad.audioUrl : audioFiles[index],
      loop: pad && pad.audioUrl ? pad.isLooping : true
    };
  };

  // Create refs for each audio element
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  const handleButtonClick = (index: number) => {
    setActivePadIndex(index);
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
    if (activeIndex === index) {
      const audio = audioRefs.current[index];
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setActiveIndex(null);
      setIsPlaying(false);
      registerAudioElement(null, undefined);
      return;
    }
    if (activeIndex !== null && audioRefs.current[activeIndex]) {
      const prevAudio = audioRefs.current[activeIndex];
      prevAudio?.pause();
      prevAudio && (prevAudio.currentTime = 0);
    }
    const audio = audioRefs.current[index];
    if (audio) {
      audio.currentTime = 0;
      const { loop } = getPadAudio(index);
      audio.loop = loop;
      // Set playback rate from pad speed
      audio.playbackRate = mpcPads[index]?.speed ?? 1.0;
      audio.play().catch(e => {
        console.error('Error playing audio:', e);
        alert(`Could not play ${beatLabels[index]}. Please add the file: public${audioFiles[index]}`);
      });
      setActiveIndex(index);
      setIsPlaying(true);
      registerAudioElement(audio, index);
      if (!loop) {
        // If not looping, clear active state when playback ends
        audio.onended = () => {
          setActiveIndex(null);
          setIsPlaying(false);
          registerAudioElement(null, undefined);
        };
      } else {
        audio.onended = null;
      }
    }
  };

  // Update playbackRate in real time when speed changes for the active pad
  useEffect(() => {
    if (activeIndex !== null && audioRefs.current[activeIndex]) {
      const audio = audioRefs.current[activeIndex];
      if (audio) {
        audio.playbackRate = mpcPads[activeIndex]?.speed ?? 1.0;
      }
    }
  }, [mpcPads, activeIndex]);

  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-1 p-1">
      {/* Render audio elements in the DOM */}
      {beatLabels.map((label, i) => {
        const { src, loop } = getPadAudio(i);
        return (
          <audio
            key={src + '-' + i}
            ref={el => (audioRefs.current[i] = el)}
            src={src}
            preload="auto"
            loop={loop}
          />
        );
      })}
      {beatLabels.map((label, index) => (
        <button
          type="button"
          key={index}
          onClick={() => handleButtonClick(index)}
          className={`w-8 h-8 rounded-sm flex items-center justify-center transition-all duration-100 border overflow-hidden p-0 leading-tight text-ellipsis whitespace-nowrap
            ${
              activeIndex === index
                ? 'bg-amber-600 border-amber-800 border-b-2 border-t-amber-400 border-l-amber-400 border-r-amber-800 shadow-inner text-white active:border-b active:translate-y-0.5'
                : activePadIndex === index
                  ? 'border-cyan-400 border-2 bg-amber-500 text-black'
                  : mpcPads[index]?.audioUrl
                    ? 'bg-amber-900 border-amber-900 text-white'
                    : 'bg-amber-500 border-amber-700 border-b-2 border-t-amber-300 border-l-amber-300 border-r-amber-700 text-black hover:bg-amber-400 active:border-b active:translate-y-0.5'
            }`
          }
        >
          <div className="flex items-center justify-center w-full h-full">
            {activeIndex === index ? (
              <span className="text-[26px] animate-pulse leading-none" style={{ fontFamily: 'Dampfplatz, serif' }}>●</span>
            ) : (
              <span className="text-[26px] leading-none" style={{ fontFamily: 'Dampfplatz, serif' }}>▶</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
} 