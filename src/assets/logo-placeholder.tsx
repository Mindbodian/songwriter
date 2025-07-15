import React from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  // This is a simple SVG logo placeholder that can be replaced with a PNG
  return (
    <svg 
      width="40" 
      height="40" 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="40" height="40" rx="8" fill="var(--primary-color)" />
      <path d="M10 20L18 28L30 12" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 16A8 8 0 0 1 16 8H24A8 8 0 0 1 32 16V24A8 8 0 0 1 24 32H16A8 8 0 0 1 8 24V16Z" stroke="white" strokeWidth="2" />
    </svg>
  );
}

// Note: To use a PNG image instead, replace this component with:
// export const logoImage = '/path-to-your-image.png';
// Then import it in the Header component as shown in the comments 