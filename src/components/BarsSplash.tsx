import React, { useEffect, useState } from "react";

const COLORS = [
  "#ff1744", "#ffea00", "#00e676", "#2979ff", "#f50057", "#00bcd4", "#ff9100", "#d500f9", "#76ff03", "#ff3d00"
];
const FONTS = [
  'Impact, Charcoal, sans-serif',
  'Arial Black, Gadget, sans-serif',
  'Bebas Neue, Arial, sans-serif',
  'Anton, Arial, sans-serif',
  'Oswald, Arial, sans-serif'
];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

interface BarConfig {
  top: string;
  left: string;
  rotate: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  shadow: string;
  delay: number;
}

// Play a sound file with no pitch shift
function playSoundSimple(path: string) {
  const audio = new Audio(path);
  audio.volume = 1.0;
  audio.play().catch(() => {});
}

export default function BarsSplash({ onFinish }: { onFinish: () => void }) {
  const [show, setShow] = useState(true);
  const [visibleBars, setVisibleBars] = useState<number[]>([]);
  const [fade, setFade] = useState(false);
  const punchCountRef = React.useRef(0);
  const ahhPlayedRef = React.useRef(false);

  // Precompute configs for all bars
  const [barConfigs] = useState<BarConfig[]>(() =>
    Array.from({ length: 10 }).map((_, i) => ({
      top: randomBetween(5, 75) + "%",
      left: randomBetween(5, 75) + "%",
      rotate: randomBetween(-40, 40),
      fontSize: randomBetween(48, 120),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      fontFamily: FONTS[Math.floor(Math.random() * FONTS.length)],
      shadow: `0 0 16px ${COLORS[Math.floor(Math.random() * COLORS.length)]}`,
      delay: randomBetween(0, 2000), // appear at random time in first 2s
    }))
  );

  useEffect(() => {
    // Schedule each bar to appear at its delay
    barConfigs.forEach((cfg, i) => {
      setTimeout(() => {
        setVisibleBars(bars => {
          return [...bars, i];
        });
        if (i < 6) {
          playSoundSimple('/sounds/punch.mp3');
          punchCountRef.current += 1;
          if (punchCountRef.current === 6 && !ahhPlayedRef.current) {
            playSoundSimple('/sounds/ahhhhh.mp3');
            ahhPlayedRef.current = true;
          }
        }
      }, cfg.delay);
    });
    // Fade out after 3s
    const fadeTimer = setTimeout(() => setFade(true), 3000);
    // Remove after fade
    const endTimer = setTimeout(() => setShow(false), 4200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [barConfigs]);

  useEffect(() => {
    if (!show) onFinish();
  }, [show, onFinish]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 10000,
        pointerEvents: "none",
        transition: "opacity 1.2s", opacity: fade ? 0 : 1
      }}
    >
      {barConfigs.map((cfg, i) =>
        visibleBars.includes(i) && (
          <span
            key={i}
            style={{
              position: "absolute",
              top: cfg.top,
              left: cfg.left,
              transform: `rotate(${cfg.rotate}deg)`,
              fontSize: cfg.fontSize,
              fontWeight: 900,
              color: cfg.color,
              fontFamily: cfg.fontFamily,
              textShadow: cfg.shadow,
              letterSpacing: 2,
              userSelect: "none",
              whiteSpace: "nowrap",
              textTransform: "uppercase",
              filter: "brightness(1.2)",
              opacity: fade ? 0 : 1,
              transition: "opacity 1.2s"
            }}
          >
            BARS!
          </span>
        )
      )}
    </div>
  );
} 