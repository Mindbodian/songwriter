import React from 'react';
import './EqualizerAnimation.css';

/**
 * Equalizer Animation Component
 * Creates an animated background that looks like a colorful audio equalizer waveform
 */
export function EqualizerAnimation() {
  // Creates columns of dots with animations
  const renderEqBars = () => {
    const bars = [];
    const barCount = 40; // Total number of columns
    
    for (let i = 0; i < barCount; i++) {
      const dotCount = 5 + Math.floor(Math.random() * 4); // Between 5 and 8 dots per column
      const dots = [];
      
      // Create dots for this column - mirrored up and down from center
      for (let j = 0; j < dotCount; j++) {
        // Calculate animation parameters - vary them to make it look more natural
        const animationDuration = 0.8 + Math.random() * 1.5; // Between 0.8s and 2.3s
        const animationDelay = Math.random() * 1.2; // Random delay up to 1.2s
        
        // Add dot above center
        dots.push(
          <div 
            key={`up-${j}`}
            className="eq-dot"
            style={{
              animationDuration: `${animationDuration}s`,
              animationDelay: `${animationDelay}s`,
            }}
          />
        );
        
        // Add dot below center (mirror) with slightly different timing
        if (j > 0) { // Skip mirroring the center dot
          dots.push(
            <div 
              key={`down-${j}`}
              className="eq-dot"
              style={{
                animationDuration: `${animationDuration * 0.9}s`,
                animationDelay: `${animationDelay * 1.1}s`,
              }}
            />
          );
        }
      }
      
      // Create the column with its dots
      bars.push(
        <div key={i} className="eq-bar">
          {dots}
        </div>
      );
    }
    
    return bars;
  };
  
  return (
    <div className="equalizer-container">
      <div className="equalizer-wrapper">
        {renderEqBars()}
      </div>
    </div>
  );
} 