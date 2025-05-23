import React, { useRef, useEffect, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import './FrequencyEqualizer.css';

interface FrequencyEqualizerProps {
  audioElement?: HTMLAudioElement | null;
}

export function FrequencyEqualizer({ audioElement }: FrequencyEqualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isPlaying, audioContext } = useAudio();
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Initialize the analyser and connect audio element
  useEffect(() => {
    if (!isPlaying || !audioElement || !audioContext) return;

    // Create a new AnalyserNode for this context
    const newAnalyser = audioContext.createAnalyser();
    newAnalyser.fftSize = 1024;
    newAnalyser.smoothingTimeConstant = 0.8;

    // Cache the MediaElementSourceNode on the audio element itself for this context
    let newSource;
    if (!(audioElement as any)._mediaSourceNode || (audioElement as any)._mediaSourceNode.context !== audioContext) {
      newSource = audioContext.createMediaElementSource(audioElement);
      (audioElement as any)._mediaSourceNode = newSource;
    } else {
      newSource = (audioElement as any)._mediaSourceNode;
    }
    newSource.connect(newAnalyser);
    newAnalyser.connect(audioContext.destination);

    setAnalyser(newAnalyser);
    sourceRef.current = newSource;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      try {
        newSource.disconnect();
        newAnalyser.disconnect();
      } catch (e) {}
      // Do not close the shared audioContext
    };
  }, [isPlaying, audioElement, audioContext]);

  // Draw the visualization
  useEffect(() => {
    if (!analyser || !canvasRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    // Set canvas dimensions to match container
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Display only 60 bars by sampling from the frequency data
    const barCount = 60;
    const barWidth = canvas.width / barCount;
    
    // Animation function that draws the equalizer
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background with slight gradient
      const bgGradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, 'rgba(0, 0, 30, 0.7)');
      bgGradient.addColorStop(1, 'rgba(0, 0, 10, 0.7)');
      canvasCtx.fillStyle = bgGradient;
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw reflection surface
      canvasCtx.fillStyle = 'rgba(0, 150, 200, 0.1)';
      canvasCtx.fillRect(0, canvas.height * 0.65, canvas.width, canvas.height * 0.35);
      
      // Calculate step size to sample from the frequency data
      const step = Math.floor(bufferLength / barCount);
      
      for (let i = 0; i < barCount; i++) {
        // Sample frequency data - use average of surrounding frequencies for smoother visualization
        let sum = 0;
        const startIndex = i * step;
        const endIndex = Math.min(startIndex + step, bufferLength);
        
        for (let j = startIndex; j < endIndex; j++) {
          sum += dataArray[j];
        }
        
        const value = sum / (endIndex - startIndex);
        const barHeight = value * (canvas.height / 255) * 0.65;
        
        // Skip rendering bars with very low values
        if (barHeight < 1) continue;
        
        // Color gradient based on frequency intensity - GREEN to RED spectrum
        const intensity = value / 255;
        let r, g, b;
        
        // Green to Red transition (via yellow)
        if (intensity < 0.5) {
          // Green to Yellow
          const t = intensity * 2;
          r = Math.floor(255 * t);
          g = 255;
          b = 0;
        } else {
          // Yellow to Red
          const t = (intensity - 0.5) * 2;
          r = 255;
          g = Math.floor(255 * (1 - t));
          b = 0;
        }
        
        // Main bar
        const barGradient = canvasCtx.createLinearGradient(
          0, canvas.height - barHeight, 
          0, canvas.height
        );
        barGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
        barGradient.addColorStop(1, `rgba(0, 200, 0, 0.6)`); // Green base
        
        canvasCtx.fillStyle = barGradient;
        canvasCtx.fillRect(
          i * barWidth, 
          canvas.height - barHeight, 
          barWidth - 1, 
          barHeight
        );
        
        // Reflection
        const reflectionHeight = barHeight * 0.4;
        canvasCtx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
        canvasCtx.fillRect(
          i * barWidth, 
          canvas.height, 
          barWidth - 1, 
          reflectionHeight
        );
        
        // Add glow effect for high frequencies
        if (intensity > 0.7) {
          canvasCtx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.7)`;
          canvasCtx.shadowBlur = 15;
          canvasCtx.beginPath();
          canvasCtx.arc(
            i * barWidth + barWidth/2,
            canvas.height - barHeight,
            barWidth/2,
            0, Math.PI * 2
          );
          canvasCtx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.7)`;
          canvasCtx.fill();
          canvasCtx.shadowBlur = 0;
        }
      }
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [analyser, isPlaying]);

  // Don't render anything when not playing
  if (!isPlaying) {
    return null;
  }

  return (
    <div className="frequency-equalizer-container">
      <canvas ref={canvasRef} className="frequency-equalizer-canvas" />
    </div>
  );
} 