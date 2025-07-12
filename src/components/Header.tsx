import React, { useEffect, useRef, useState } from 'react';
// import { HueSlider } from './ColorWheel';
import { MPCButtons } from './MPCButtons';
import { SmokeAnimation } from './SmokeAnimation';
import { FrequencyEqualizer } from './FrequencyEqualizer';
// import { FrequencyEqualizer } from './FrequencyEqualizer';
import './Equalizer.css'; // Import the original equalizer css
import './GlitchOverlay.css';
import { useAudio } from '../context/AudioContext';
import { AudioUploadModal } from './AudioUploadModal';
import type { MPCPad } from '../App';

interface HeaderProps {
  charCount: number;
  wordCount: number;
  mpcPads: MPCPad[];
  onPadAudioSave: (padId: number, audioUrl: string, isLooping: boolean, fileName: string) => void;
  activePadIndex: number | null;
  setActivePadIndex: (pad: number | null) => void;
  onPadSpeedChange: (padId: number, speed: number) => void;
}

// CameraFlashEffect: flashes appear randomly, fade out, and are behind content
const FLASH_IMAGE = '/images/flash.png';

interface Flash {
  id: number;
  left: number;
  top: number;
  size: number;
  opacity: number;
}

function CameraFlashEffect() {
  const [flashes, setFlashes] = useState<Flash[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    let running = true;
    function spawnFlash() {
      if (!running) return;
      // Random position (as % of header area)
      const left = Math.random() * 80 + 5; // 5% to 85%
      const top = Math.random() * 40 + 5; // 5% to 45%
      const size = Math.random() * 120 + 80; // 80px to 200px
      const id = nextId.current++;
      setFlashes(fls => [...fls, { id, left, top, size, opacity: 1 }]);
      // Remove after 3s
      setTimeout(() => {
        setFlashes(fls => fls.filter(f => f.id !== id));
      }, 3000);
    }
    // Spawn flashes at random intervals (0.6-2.4s for less frequent effect)
    function loop() {
      if (!running) return;
      spawnFlash();
      const next = 600 + Math.random() * 1800; // 0.6s to 2.4s
      setTimeout(loop, next);
    }
    loop();
    return () => { running = false; };
  }, []);

  // Animate opacity fade out
  useEffect(() => {
    if (flashes.length === 0) return;
    const interval = setInterval(() => {
      setFlashes(fls => fls.map(f => ({ ...f, opacity: Math.max(0, f.opacity - 0.04) })));
    }, 120);
    return () => clearInterval(interval);
  }, [flashes.length]);

  return (
    <div className="pointer-events-none absolute inset-0 z-15" style={{ overflow: 'hidden' }}>
      {flashes.map(flash => (
        <img
          key={flash.id}
          src={FLASH_IMAGE}
          alt="flash"
          style={{
            position: 'absolute',
            left: `${flash.left}%`,
            top: `${flash.top}%`,
            width: flash.size,
            height: flash.size,
            opacity: flash.opacity,
            pointerEvents: 'none',
            transition: 'opacity 0.2s',
            filter: 'drop-shadow(0 0 32px white)',
            zIndex: 15,
            userSelect: 'none',
          }}
        />
      ))}
    </div>
  );
}

export function Header({ charCount, wordCount, mpcPads, onPadAudioSave, activePadIndex, setActivePadIndex, onPadSpeedChange }: HeaderProps) {
  const { currentAudioElement, audioContext } = useAudio();
  const [glitch, setGlitch] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Rapper swap logic
  const [showRapper2, setShowRapper2] = useState(false);
  const swapIntervalRef = useRef<number | null>(null);
  const swapTimeoutRef = useRef<number | null>(null);
  const mainIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    function startSwapping() {
      let toggle = false;
      setShowRapper2(false); // Always start with default
      let swaps = 0;
      swapIntervalRef.current = setInterval(() => {
        toggle = !toggle;
        setShowRapper2(toggle);
        swaps++;
        if (swaps >= 6) {
          if (swapIntervalRef.current) clearInterval(swapIntervalRef.current);
          setShowRapper2(false); // End on default
        }
      }, 2000 / 6); // 2 seconds divided by 6 swaps
    }
    // Start the main interval
    mainIntervalRef.current = setInterval(() => {
      startSwapping();
    }, 10000);
    // Start immediately as well
    startSwapping();
    return () => {
      if (mainIntervalRef.current) clearInterval(mainIntervalRef.current);
      if (swapIntervalRef.current) clearInterval(swapIntervalRef.current);
      if (swapTimeoutRef.current) clearTimeout(swapTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    function triggerGlitch() {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 300);
      // Schedule next glitch randomly between 10-15 seconds
      const next = 10000 + Math.random() * 5000;
      timeoutRef.current = setTimeout(triggerGlitch, next);
    }
    // Start the first glitch after a random interval
    const initial = 10000 + Math.random() * 5000;
    timeoutRef.current = setTimeout(triggerGlitch, initial);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Get speed for active pad
  const activeSpeed = activePadIndex != null ? mpcPads[activePadIndex]?.speed ?? 1.0 : 1.0;
  const activePadId = activePadIndex != null ? mpcPads[activePadIndex]?.id : null;

  return (
    <header className="relative border-b border-[#D4AF37]">
      {/* Background with slight gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 to-black"></div>
      {/* Camera flashes effect (z-15, behind text/buttons but above bg) */}
      <CameraFlashEffect />
      {/* Glitchy TV rolling lines overlay */}
      <div className="glitch-overlay pointer-events-none absolute inset-0 z-10" />
      {/* Thin rolling lines and noise flashes overlay */}
      <div className="glitch-overlay-lines pointer-events-none absolute inset-0 z-20" />
      {/* Smoke animation */}
      <SmokeAnimation />
      {/* Live Frequency Equalizer */}
      <FrequencyEqualizer />
      {/* Counter positioned in bottom right */}
      <div className="word-char-counter absolute bottom-2 right-4 z-20">
        {charCount} characters | {wordCount} words
      </div>
      <div className="container mx-auto px-2 py-2 relative z-20">
        <div className="flex items-end" style={{ minHeight: 110 }}>
          {/* Left side: Rapper image */}
          <img
            src={showRapper2 ? "/assets/rapper2.png" : "/assets/rapper%20-%20Copy.png"}
            alt="Rapper"
            style={{ height: 110, width: 'auto', marginRight: 16, marginLeft: -12, marginBottom: -8, position: 'relative', zIndex: 30, alignSelf: 'flex-end' }}
            className="block"
          />
          {/* Left side: MPC Buttons with Upload Audio link above */}
          <div className="w-auto mr-2 flex flex-col items-center">
            <span
              className="text-xs text-cyan-400 underline hover:text-cyan-300 cursor-pointer mb-1"
              onClick={() => setIsModalOpen(true)}
              style={{ lineHeight: 1 }}
            >
              Upload Audio
            </span>
            <MPCButtons mpcPads={mpcPads} activePadIndex={activePadIndex} setActivePadIndex={setActivePadIndex} />
            {/* Speed slider under MPC buttons, always enabled */}
            <div className="w-32 mt-2 flex flex-col items-center">
              <label className="text-xs text-gray-300 mb-1">Speed: {Math.round(activeSpeed * 100)}%</label>
              <input
                type="range"
                min={0.5}
                max={1.5}
                step={0.01}
                value={activeSpeed}
                onChange={e => activePadId && onPadSpeedChange(activePadId, parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>
          {/* Center: Title with gradient background - takes up most space */}
          <div className="flex-1 relative text-center px-6 py-2">
            <h1
              className={`gothic-title relative z-10 cursor-pointer${glitch ? ' glitch-jitter' : ''}`}
              onClick={() => window.open('http://www.reverbnation.com/mindbodiansoulman', '_blank')}
            >
              the Mindbodian Soulman Song Writer
            </h1>
          </div>
          {/* Right side: Hue Slider */}
          {/* 
          <div className="w-auto ml-2">
            <HueSlider />
          </div>
          */}
        </div>
      </div>
      {/* Pencil image absolutely positioned, not inside the flex row */}
      <img
        src="/assets/here.png"
        alt="Pencil"
        style={{
          position: 'absolute',
          top: 220,
          right: 400,
          height: 400,
          zIndex: 25,
          transform: 'rotate(-18deg)',
          filter: 'drop-shadow(8px 8px 4px rgba(0, 0, 0, 0.5))'
        }}
      />
      <AudioUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onPadAudioSave}
        audioContext={audioContext}
        padCount={8}
      />
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