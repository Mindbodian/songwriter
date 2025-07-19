import React, { useRef, useState, useEffect } from 'react';import { useAudio } from '../context/AudioContext';
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
    
    // If user uploaded audio, respect their loop setting
    if (pad && pad.audioUrl) {
      return {
        src: pad.audioUrl,
        loop: pad.isLooping
      };
    }
    
    // For default beats, assume they should loop (original behavior)
    return {
      src: audioFiles[index],
      loop: true
    };
  };

  // Create refs for each audio element
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  const handleButtonClick = (index: number) => {
    console.log('MPC button clicked:', index, 'beat:', beatLabels[index]);
    setActivePadIndex(index);
    
    // Ensure audio context is resumed on user interaction
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        console.log('Audio context resumed');
      }).catch(e => {
        console.error('Failed to resume audio context:', e);
      });
    }
    
    if (activeIndex === index) {
      console.log('Stopping audio for pad:', index);
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
    console.log('Audio element for index', index, ':', audio);
    if (audio) {
      console.log('Playing audio for pad:', index, 'src:', audio.src, 'duration:', audio.duration);
      audio.currentTime = 0;
      const { loop } = getPadAudio(index);
      audio.loop = loop;
      console.log('Setting loop to:', loop);
      // Set playback rate from pad speed
      audio.playbackRate = mpcPads[index]?.speed ?? 1.0;
      
      audio.play().then(() => {
        console.log('Audio started playing successfully for pad:', index);
        setActiveIndex(index);
        setIsPlaying(true);
        registerAudioElement(audio, index);
      }).catch(e => {
        console.error('Error playing audio for pad', index, ':', e);
        alert(`Could not play ${beatLabels[index]}. Please add the file: public${audioFiles[index]}`);
      });
      
      if (!loop) {
        // If not looping, clear active state when playback ends
        audio.onended = () => {
          console.log('Audio ended for pad:', index);
          setActiveIndex(null);
          setIsPlaying(false);
          registerAudioElement(null, undefined);
        };
      } else {
        audio.onended = null;
      }
    } else {
      console.error('Audio element not found for index:', index);
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