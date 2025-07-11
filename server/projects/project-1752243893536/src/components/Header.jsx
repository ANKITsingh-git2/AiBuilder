import React from 'react';

const Header = () => {
  return (
    <header className="w-full py-6 bg-white shadow-sm">
      <div className="container mx-auto px-4 flex justify-center items-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 drop-shadow-md">
          Quantum Counter
        </h1>
      </div>
    </header>
  );
};

export default Header;