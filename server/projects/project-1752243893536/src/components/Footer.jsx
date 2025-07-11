import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full py-6 mt-12 bg-white shadow-inner text-center text-gray-600 text-sm">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} Modern Counter App. All rights reserved.</p>
        <p className="mt-1">Built with React and Tailwind CSS for a beautiful user experience.</p>
      </div>
    </footer>
  );
};

export default Footer;