import React, { useState, useEffect } from 'react';

const MIN_HUE = 0;
const MAX_HUE = 360;
const DEFAULT_HUE = 0; // Red color (was 45 for gold)

// Function to convert hue to various colors for the app
const generateColorsFromHue = (hue: number) => {
  return {
    primary: `hsl(${hue}, 70%, 55%)`,
    secondary: `hsl(${(hue + 180) % 360}, 70%, 65%)`, // Complementary color
    tertiary: `hsl(${(hue + 120) % 360}, 70%, 65%)`,  // Triadic color
    buttonFrom: `hsl(${hue}, 70%, 30%)`,              // Darker version for button gradient start
    buttonTo: `hsl(${hue}, 90%, 10%)`,                // Even darker for button gradient end
    buttonHoverFrom: `hsl(${hue}, 80%, 50%)`,         // Brighter version for hover state
    buttonIcon: `hsl(${hue}, 80%, 75%)`,              // Light version for button icons
  };
};

const getStoredHue = (): number => {
  const storedHue = localStorage.getItem('appHue');
  if (storedHue) {
    try {
      return parseInt(storedHue, 10);
    } catch (e) {
      console.error('Error parsing stored hue:', e);
    }
  }
  return DEFAULT_HUE;
};

export function HueSlider() {
  const [hue, setHue] = useState<number>(getStoredHue());

  // Force reset to red on initial load
  useEffect(() => {
    // Clear any stored hue value to ensure we always start with red
    localStorage.removeItem('appHue');
    setHue(DEFAULT_HUE);
    applyHueToApp(DEFAULT_HUE);
  }, []);

  const applyHueToApp = (newHue: number) => {
    const colors = generateColorsFromHue(newHue);
    
    // Update CSS variables for the theme colors
    document.documentElement.style.setProperty('--primary-color', colors.primary);
    document.documentElement.style.setProperty('--secondary-color', colors.secondary);
    document.documentElement.style.setProperty('--tertiary-color', colors.tertiary);
    document.documentElement.style.setProperty('--button-from', colors.buttonFrom);
    document.documentElement.style.setProperty('--button-to', colors.buttonTo);
    document.documentElement.style.setProperty('--button-hover-from', colors.buttonHoverFrom);
    document.documentElement.style.setProperty('--button-icon', colors.buttonIcon);
    
    // For elements using Tailwind classes with hardcoded colors
    const goldElements = document.querySelectorAll('.text-\\[\\#D4AF37\\]');
    goldElements.forEach(el => {
      (el as HTMLElement).style.color = colors.primary;
    });
    
    // Update border colors
    const borderElements = document.querySelectorAll('.border-\\[\\#D4AF37\\]');
    borderElements.forEach(el => {
      (el as HTMLElement).style.borderColor = colors.primary;
    });

    // Update notebook lines colors
    const notebookStyle = document.createElement('style');
    notebookStyle.textContent = `
      .notebook-background {
        background-image: 
          linear-gradient(#fff 23px, ${colors.secondary} 24px, transparent 24px),
          linear-gradient(90deg, transparent 39px, ${colors.tertiary} 40px, ${colors.tertiary} 40px, transparent 41px) !important;
      }
      
      /* Update button styles */
      .bg-gradient-to-b.from-red-900.to-black {
        background-image: linear-gradient(to bottom, ${colors.buttonFrom}, ${colors.buttonTo}) !important;
      }
      
      .bg-gradient-to-b.from-red-900.to-black:hover {
        background-image: linear-gradient(to bottom, ${colors.buttonHoverFrom}, ${colors.buttonTo}) !important;
      }
      
      .text-orange-300 {
        color: ${colors.buttonIcon} !important;
      }
    `;
    
    // Remove any previously added style tag for notebook
    const oldStyle = document.getElementById('notebook-theme-style');
    if (oldStyle) {
      oldStyle.remove();
    }
    
    // Add the new style
    notebookStyle.id = 'notebook-theme-style';
    document.head.appendChild(notebookStyle);
    
    // Save hue to localStorage
    localStorage.setItem('appHue', newHue.toString());
  };

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHue = parseInt(e.target.value, 10);
    setHue(newHue);
    applyHueToApp(newHue);
  };

  // Generate slider background with full spectrum
  const sliderBackground = `linear-gradient(to right, 
    hsl(0, 70%, 55%), 
    hsl(60, 70%, 55%), 
    hsl(120, 70%, 55%), 
    hsl(180, 70%, 55%), 
    hsl(240, 70%, 55%), 
    hsl(300, 70%, 55%), 
    hsl(360, 70%, 55%)
  )`;

  return (
    <div className="inline-flex items-center space-x-2">
      <input
        type="range"
        min={MIN_HUE}
        max={MAX_HUE}
        value={hue}
        onChange={handleHueChange}
        className="w-24 h-4 appearance-none rounded cursor-pointer"
        style={{
          background: sliderBackground,
        }}
      />
      <div 
        className="w-4 h-4 rounded-full border border-white" 
        style={{ backgroundColor: generateColorsFromHue(hue).primary }}
      />
    </div>
  );
} 