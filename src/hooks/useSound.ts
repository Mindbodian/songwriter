import { useCallback } from 'react';

// Create AudioContext only when needed
let audioContext: AudioContext | null = null;

export function useSound() {
  const letterCountRef = { current: 0 };
  const audioRef = { current: null as HTMLAudioElement | null };

  // Initialize audio on first use
  const initAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/pencil.ogg');
      audioRef.current.volume = 0.3;
      // Store the duration once we have it
      audioRef.current.addEventListener('loadedmetadata', () => {
        console.log('Audio duration:', audioRef.current?.duration);
      });
    }
    return audioRef.current;
  };

  const playSound = useCallback((soundType: 'type' | 'enter' | 'panel') => {
    try {
      if (soundType === 'type') {
        letterCountRef.current++;
        
        // Only play sound every 3 letters
        if (letterCountRef.current % 3 !== 0) {
          return;
        }

        const audio = initAudio();
        
        // The pencil sound is about 0.91 seconds long
        // We'll use different segments of it for variety
        // Each segment will be ~0.1 seconds
        const segmentLength = 0.1;
        const numSegments = Math.floor(0.91 / segmentLength);
        const randomSegment = Math.floor(Math.random() * numSegments);
        
        // Set a random start time within the first 0.8 seconds
        audio.currentTime = randomSegment * segmentLength;
        
        // Add slight random speed variation
        audio.playbackRate = 0.9 + Math.random() * 0.2;
        
        const playPromise = audio.play();
        if (playPromise) {
          playPromise.catch(error => {
            console.error('Playback failed:', error);
          });
        }

        // Stop the sound after a short duration to avoid overlap
        setTimeout(() => {
          if (audio.currentTime < audio.duration) {
            audio.pause();
            audio.currentTime = 0;
          }
        }, 100); // Play for 100ms

        console.log('Playing pencil sound at letter count:', letterCountRef.current, 'from position:', audio.currentTime);
      }
    } catch (error) {
      console.error('Audio error:', error);
    }
  }, []);

  return playSound;
}