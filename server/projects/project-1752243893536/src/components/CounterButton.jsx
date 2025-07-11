import React from 'react';

const CounterButton = ({ onClick, children, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-8 py-4 rounded-full text-lg font-semibold tracking-wide
        bg-gradient-to-r from-purple-500 to-indigo-600 text-white
        shadow-lg hover:shadow-xl transform hover:scale-105
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-75
        active:scale-95 active:shadow-md
        flex items-center justify-center space-x-2
        ${disabled ? 'opacity-50 cursor-not-allowed from-gray-400 to-gray-500' : ''}
      `}
      aria-label={children === 'Increment' ? 'Increment counter' : 'Reset counter'}
    >
      {children}
    </button>
  );
};

export default CounterButton;