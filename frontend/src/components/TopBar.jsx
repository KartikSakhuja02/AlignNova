import React, { useEffect, useRef, useState } from 'react';

export default function TopBar() {
  const headerRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-40 flex justify-between items-center px-p-lg h-16 w-full bg-surface/80 backdrop-blur-md border-b border-outline-variant transition-shadow duration-200 ${
        scrolled ? 'shadow-sm' : ''
      }`}
    >
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-outline" style={{ fontSize: '18px' }}>
            search
          </span>
          <input
            className="bg-transparent border-none focus:ring-0 text-label-md w-48 outline-none text-on-surface placeholder:text-on-surface-variant"
            placeholder="Search opportunities..."
            type="text"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        <button className="text-on-surface-variant hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="h-8 w-px bg-outline-variant" />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-label-md text-on-surface font-bold">Alex Rivers</p>
            <p className="text-[10px] text-on-surface-variant">Student ID: #8829</p>
          </div>
          <img
            alt="User Profile"
            className="w-10 h-10 rounded-full border-2 border-primary-fixed shadow-sm object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_ZLAJginhm5aZ9DEg7Tltbu55Hb8bhUGt7xAiGjZF_V3CmtLhl9a68HvqFf0UUG0F0z03m_nDZvxvQWbA9hjuZJ061d3jtTOsg9bh1ujhy6d8pcpJVzQxas5yvuFRw15ULsVn7j_J2NX_MimcNuJ6onMPMLx_PJOj8IQEQlX5T89zW8Zn8d4FUVluZkCTCPtOAfD7k5mUl3m3U6xR1poEHvD42-M5ImtT_Lgze8hXHRUITVwXzbmsABD6hG92PRnrP8elDEXD0_g"
          />
        </div>
      </div>
    </header>
  );
}
