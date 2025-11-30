"use client";

import { useState } from 'react';

export default function TubeLightNavbar() {
  const [activeItem, setActiveItem] = useState('Home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = ['Home', 'Convert', 'Pricing', 'About'];

  return (
    <nav className="absolute top-0 left-0 right-0 z-20">
      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <div className="flex justify-center pt-8">
          <div className="relative flex items-center justify-center rounded-full bg-neutral-800/90 backdrop-blur-md px-2 py-2 shadow-lg">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveItem(item)}
                className={`relative px-6 py-2 rounded-full text-white text-sm font-medium transition-all duration-300
                  ${activeItem === item ? 'bg-neutral-700 shadow-inner' : 'hover:text-neutral-300'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="md:hidden">
        <div className="flex justify-center pt-6 px-4">
          <div className="relative flex items-center justify-center rounded-full bg-neutral-800/90 backdrop-blur-md px-2 py-2 shadow-lg">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="px-4 py-2 rounded-full text-white text-sm font-medium"
            >
              {isMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-16 left-4 right-4 z-20">
            <div className="bg-neutral-800/90 backdrop-blur-md rounded-2xl shadow-lg p-4">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setActiveItem(item);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-full text-white text-sm font-medium transition-all duration-300 text-left
                    ${activeItem === item ? 'bg-neutral-700' : 'hover:text-neutral-300'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
