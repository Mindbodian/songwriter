import React from 'react';
import { HueSlider } from './ColorWheel';
import { MPCButtons } from './MPCButtons';
import { SmokeAnimation } from './SmokeAnimation';
// import { FrequencyEqualizer } from './FrequencyEqualizer';
import './Equalizer.css'; // Import the original equalizer css
// import { useAudio } from '../context/AudioContext';

interface HeaderProps {
  charCount: number;
  wordCount: number;
}

export function Header({ charCount, wordCount }: HeaderProps) {
  // const { isPlaying, currentAudioElement } = useAudio();

  return (
    <header className="relative border-b border-[#D4AF37]">
      {/* Background with slight gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 to-black"></div>
      
      {/* Smoke animation */}
      <SmokeAnimation />
      
      {/* Frequency visualizer - shows real audio frequencies when music plays */}
      {/* <FrequencyEqualizer audioElement={currentAudioElement} /> */}
      
      <div className="container mx-auto px-2 py-2 relative z-20">
        <div className="flex items-center">
          {/* Left side: MPC Buttons */}
          <div className="w-auto mr-2">
            <MPCButtons />
          </div>
          
          {/* Center: Title with gradient background - takes up most space */}
          <div className="flex-1 relative text-center px-6 py-2 rounded-lg">
            <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg"></div>
            <h1 className="text-[#FFD700] text-2xl relative z-10 drop-shadow-lg" style={{ fontFamily: 'Handwritania, cursive' }}>
              Mindbodian Soulman Lyric Writer
            </h1>
            <div className="text-xs text-gray-400 relative z-10">
              {charCount} characters | {wordCount} words
            </div>
          </div>
          
          {/* Right side: Hue Slider */}
          <div className="w-auto ml-2">
            <HueSlider />
          </div>
        </div>
      </div>
    </header>
  );
}

/* 
To use a PNG image instead:

1. Add your PNG file to src/assets/ folder
2. Change the import to:
   import logoImage from '../assets/your-logo.png';
3. Replace the Logo component with:
   <img src={logoImage} alt="Logo" className="h-10 w-auto" />
*/