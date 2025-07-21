import React, { useEffect, useState } from "react";

export default function WelcomeImageOverlay({ onFinish }: { onFinish: () => void }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Start fade out after 1 second
    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(onFinish, 600); // 0.6s fade duration
    }, 1000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "#000", display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 10001, transition: "opacity 0.6s", opacity: fade ? 0 : 1, pointerEvents: "none"
      }}
    >
      <img
        src="/assets/welcome2.png"
        alt="Welcome"
        style={{ width: "60vw", maxWidth: 700, borderRadius: 16, boxShadow: "0 0 40px #000" }}
      />
    </div>
  );
} 