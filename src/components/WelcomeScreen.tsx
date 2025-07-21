import React, { useEffect, useState, useRef } from "react";

export default function WelcomeScreen({ onFinish }: { onFinish: () => void }) {
  const [started, setStarted] = useState(false);
  const [showImage, setShowImage] = useState(true);
  const [fadeImage, setFadeImage] = useState(false);
  const [scale, setScale] = useState(0.7);
  const [colorIndex, setColorIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const COLORS = ["#ff1744", "#ffea00"];

  // Animate image scale from 0.7 to 1
  useEffect(() => {
    if (!started) {
      setScale(0.7);
      const grow = setTimeout(() => setScale(1), 300);
      return () => clearTimeout(grow);
    }
  }, [started]);

  // Animate Start text color
  useEffect(() => {
    if (!started && showImage) {
      const interval = setInterval(() => {
        setColorIndex(idx => (idx + 1) % COLORS.length);
      }, 120);
      return () => clearInterval(interval);
    }
  }, [started, showImage]);

  // When user clicks Start, play video and sound (sound after 1s)
  const handleStart = () => {
    setStarted(true);
    setShowImage(false);
    setTimeout(() => {
      const audio = new Audio('/sounds/gear.mp3');
      audio.volume = 0.7;
      audioRef.current = audio;
      audio.play().catch(() => {});
      // Play soulman.mp3 after 0.5s
      setTimeout(() => {
        const soulman = new Audio('/sounds/soulman.mp3');
        soulman.volume = 1.0;
        soulman.play().catch(() => {});
      }, 500);
      // Fade out after 3s
      setTimeout(() => {
        const fadeInterval = setInterval(() => {
          if (audioRef.current && audioRef.current.volume > 0.01) {
            audioRef.current.volume -= 0.01;
          } else if (audioRef.current) {
            audioRef.current.pause();
            clearInterval(fadeInterval);
          }
        }, 50); // Fade out over ~3 seconds
      }, 3000);
    }, 1000);
    setTimeout(() => {
      videoRef.current?.play();
    }, 100); // slight delay to ensure sound starts after video
  };

  // When video ends, continue as before
  const handleVideoEnded = () => {
    setTimeout(() => {
      setFadeImage(true);
      setTimeout(onFinish, 1200); // fade duration 1.2s
    }, 500); // 0.5s delay after video ends
  };

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "#000", display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, pointerEvents: fadeImage ? "none" : "auto"
      }}
    >
      <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "80vh", width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {showImage && !started && (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src="/assets/welcome2.png"
              alt="Welcome"
              style={{
                maxWidth: "90vw",
                maxHeight: "80vh",
                width: "auto",
                height: "auto",
                borderRadius: 16,
                boxShadow: "0 0 40px #000",
                display: 'block',
                margin: '0 auto',
                transform: `scale(${scale})`,
                transition: 'transform 0.5s cubic-bezier(.68,-0.55,.27,1.55)'
              }}
            />
            <button
              onClick={handleStart}
              style={{
                position: 'absolute',
                left: '50%',
                top: '38%',
                transform: 'translate(-50%, -50%)',
                fontSize: 18,
                fontWeight: 900,
                color: COLORS[colorIndex],
                background: 'none',
                border: 'none',
                borderRadius: 0,
                padding: 0,
                cursor: 'pointer',
                letterSpacing: 2,
                boxShadow: 'none',
                textTransform: 'uppercase',
                outline: 'none',
                transition: 'color 0.1s',
                userSelect: 'none',
              }}
            >
              Start
            </button>
          </div>
        )}
        {started && (
          <video
            ref={videoRef}
            src="/assets/welcome.mp4"
            autoPlay={false}
            muted
            onEnded={handleVideoEnded}
            style={{
              width: "100%",
              maxWidth: 500,
              borderRadius: 16,
              boxShadow: "0 0 40px #000",
              position: "relative",
              zIndex: 1,
              opacity: fadeImage ? 0 : 1,
              transition: "opacity 1.2s"
            }}
          />
        )}
      </div>
    </div>
  );
} 