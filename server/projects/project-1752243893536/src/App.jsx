import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import CounterDisplay from './components/CounterDisplay';
import CounterButton from './components/CounterButton';
import Footer from './components/Footer';

function App() {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const countRef = useRef(count); // To access current count in setTimeout callback

  const MAX_COUNT = 100;
  const MIN_COUNT = 0;

  useEffect(() => {
    // Simulate initial loading state
    setIsLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      // In a real app, this would be fetching data
      try {
        setCount(0); // Initialize count
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load initial counter state.");
        setIsLoading(false);
      }
    }, 1000); // Simulate 1 second loading time

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    countRef.current = count; // Keep ref updated with current count
  }, [count]);

  const incrementCount = () => {
    if (count < MAX_COUNT) {
      setCount(prevCount => prevCount + 1);
    } else {
      setError(`Cannot increment beyond ${MAX_COUNT}. Please reset.`);
      // Clear error after a few seconds
      setTimeout(() => {
        if (countRef.current >= MAX_COUNT) { // Only clear if still at max
          setError(null);
        }
      }, 3000);
    }
  };

  const resetCount = () => {
    setCount(0);
    setError(null); // Clear any errors on reset
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
          <p className="text-xl text-gray-700 font-semibold">Loading Counter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <section className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 lg:p-12 w-full max-w-md mx-auto text-center border border-gray-100 transform transition-all duration-300 hover:scale-[1.01] hover:shadow-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-6">Your Interactive Counter</h2>

          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 animate-fade-in-down"
            >
              <strong className="font-bold">Oops!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          <div className="mb-8 relative transition-all duration-300">
            <CounterDisplay count={count} />
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <CounterButton onClick={incrementCount} disabled={count >= MAX_COUNT}>
              Increment
            </CounterButton>
            <CounterButton onClick={resetCount} disabled={count === MIN_COUNT}>
              Reset
            </CounterButton>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Current range: {MIN_COUNT} to {MAX_COUNT}
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;