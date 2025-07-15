import React, { useEffect, useState } from 'react';
import './ParentalAdvisoryWarning.css';

interface ParentalAdvisoryWarningProps {
  show: boolean;
  animate: boolean;
  onAnimationEnd?: () => void;
}

export const ParentalAdvisoryWarning: React.FC<ParentalAdvisoryWarningProps> = ({ show, animate, onAnimationEnd }) => {
  const [showCenter, setShowCenter] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const timerRef = React.useRef<number | null>(null);

  useEffect(() => {
    if (show && animate) {
      setShowCenter(true);
      setShowBadge(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setShowCenter(false);
        setShowBadge(true);
        if (onAnimationEnd) onAnimationEnd();
      }, 2000); // 2 seconds
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else if (!show) {
      setShowCenter(false);
      setShowBadge(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [show, animate, onAnimationEnd]);

  if (!showCenter && !showBadge) return null;

  return (
    <>
      {showCenter && (
        <img
          src="/images/parent.jpg"
          alt="Parental Advisory"
          className="parental-advisory-center"
        />
      )}
      {showBadge && (
        <img
          src="/images/parent.jpg"
          alt="Parental Advisory"
          className="parental-advisory-badge-left"
        />
      )}
    </>
  );
}; 