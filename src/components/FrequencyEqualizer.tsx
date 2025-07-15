import React, { useRef, useEffect, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import './FrequencyEqualizer.css';

export function FrequencyEqualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isPlaying, audioContext, activeAudioKey } = useAudio();
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Get the correct audio element from the DOM using the active index
  function getCurrentAudioElement(): HTMLAudioElement | null {
    if (typeof activeAudioKey === 'number') {
      const audios = document.querySelectorAll('audio');
      return audios[activeAudioKey] || null;
    }
    return null;
  }

  useEffect(() => {
    const audioElement = getCurrentAudioElement();
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
    };
  }, [isPlaying, audioContext, activeAudioKey]);

  useEffect(() => {
    if (!analyser || !canvasRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barCount = 60;
    const barWidth = canvas.width / barCount;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background with slight gradient
      const bgGradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, 'rgba(0, 10, 20, 0.8)');
      bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
      canvasCtx.fillStyle = bgGradient;
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw reflection surface
      canvasCtx.fillStyle = 'rgba(0, 150, 200, 0.15)';
      canvasCtx.fillRect(0, canvas.height * 0.65, canvas.width, canvas.height * 0.35);
      
      const step = Math.floor(bufferLength / barCount);
      for (let i = 0; i < barCount; i++) {
        let sum = 0;
        const startIndex = i * step;
        const endIndex = Math.min(startIndex + step, bufferLength);
        for (let j = startIndex; j < endIndex; j++) {
          sum += dataArray[j];
        }
        const value = sum / (endIndex - startIndex);
        const barHeight = value * (canvas.height / 255) * 0.65;
        if (barHeight < 1) continue;
        
        // Color gradient based on frequency intensity - Electric Blue to White-Hot
        const intensity = value / 255;
        let r, g, b;

        const t = intensity; // 0 -> 1
        // Start from blue (0,0,255), move to cyan (0,255,255), then to white (255,255,255)
        r = Math.floor(255 * Math.max(0, (t - 0.5) * 2));
        g = Math.floor(255 * Math.min(1, t * 2));
        b = 255;
        
        // Main bar
        const barGradient = canvasCtx.createLinearGradient(
          0, canvas.height - barHeight, 
          0, canvas.height
        );
        barGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1.0)`);
        barGradient.addColorStop(1, `rgba(0, 100, 200, 0.8)`);
        
        canvasCtx.fillStyle = barGradient;
        canvasCtx.fillRect(
          i * barWidth, 
          canvas.height - barHeight, 
          barWidth - 1, 
          barHeight
        );
        
        // Reflection
        const reflectionHeight = barHeight * 0.4;
        canvasCtx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
        canvasCtx.fillRect(
          i * barWidth, 
          canvas.height, 
          barWidth - 1, 
          reflectionHeight
        );
        
        // Add glow effect for high frequencies
        if (intensity > 0.6) {
          canvasCtx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
          canvasCtx.shadowBlur = 20;
          canvasCtx.beginPath();
          canvasCtx.arc(
            i * barWidth + barWidth/2,
            canvas.height - barHeight,
            barWidth/2,
            0, Math.PI * 2
          );
          canvasCtx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
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

  if (!isPlaying) {
    return null;
  }

  return (
    <div className="frequency-equalizer-container">
      <canvas ref={canvasRef} className="frequency-equalizer-canvas" />
    </div>
  );
} 