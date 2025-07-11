import React, { useEffect, useState } from 'react';

const CounterDisplay = ({ count }) => {
  const [displayCount, setDisplayCount] = useState(count);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger animation when count changes
    setIsAnimating(true);
    // Update displayCount after a short delay to allow animation to start from previous value
    const timer = setTimeout(() => {
      setDisplayCount(count);
      setIsAnimating(false);
    }, 100); // Small delay for effect

    return () => clearTimeout(timer);
  }, [count]);

  return (
    <div
      className={`relative inline-block px-8 py-4 bg-white rounded-2xl shadow-xl transition-all duration-300 transform
        ${isAnimating ? 'scale-105 opacity-90' : 'scale-100 opacity-100'}`}
    >
      <p
        className="text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 transition-transform duration-200 ease-out"
        aria-live="polite" // Announce changes to screen readers
        aria-atomic="true" // Announce the entire element content
      >
        {displayCount}
      </p>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent rounded-2xl animate-pulse-border"></div>
    </div>
  );
};

export default CounterDisplay;