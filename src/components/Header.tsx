import React from 'react';
import { HueSlider } from './ColorWheel';
import { MPCButtons } from './MPCButtons';

export function Header() {
  return (
    <header className="bg-gradient-to-b from-gray-900 via-gray-700 to-gray-500 border-b border-[#D4AF37]">
      <div className="container mx-auto px-2 py-2">
        <div className="flex items-center">
          {/* Left side: MPC Buttons */}
          <div className="w-auto mr-2">
            <MPCButtons />
          </div>
          
          {/* Center: Title with gradient background - takes up most space */}
          <div className="flex-1 relative text-center px-6 py-2 rounded-lg">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-800 to-white opacity-60 rounded-lg"></div>
            <h1 className="text-[#D4AF37] text-2xl font-serif relative z-10">
              Mindbodian Soulman Lyric Writer
            </h1>
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