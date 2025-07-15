import React from 'react';
import './SmokeAnimation.css';

/**
 * Smoke Animation Component
 * Creates a seamless looping smoke effect for the background
 */
export function SmokeAnimation() {
  return (
    <div className="smoke-container">
      <div className="smoke smoke-1"></div>
      <div className="smoke smoke-2"></div>
      <div className="smoke smoke-3"></div>
      <div className="smoke smoke-4"></div>
      <div className="smoke smoke-5"></div>
    </div>
  );
} 