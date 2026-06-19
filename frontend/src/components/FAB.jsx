import React, { useState } from 'react';

export default function FAB() {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed bottom-10 right-10 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-50"
      aria-label="Update Resume"
    >
      <span className="material-symbols-outlined text-3xl">add</span>
      {/* Tooltip */}
      <span
        className={`absolute right-full mr-4 px-4 py-2 bg-inverse-surface text-inverse-on-surface rounded-xl text-caption font-bold whitespace-nowrap pointer-events-none transition-opacity duration-200 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Update Resume
      </span>
    </button>
  );
}
