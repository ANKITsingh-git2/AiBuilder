import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 animate-fade-in">
            AI Generated React App
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            This beautiful React application was created by AI based on your requirements.
          </p>
        </header>
        
        <main className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">Welcome to Your App</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Here's a complete, modern, responsive, and visually stunning React counter application, built with a clean component structure, modern React hooks, and styled beautifully with Tailwind CSS.

---

## P...
            </p>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Get Started
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;