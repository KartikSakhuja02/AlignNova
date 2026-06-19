import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TopBar() {
  const headerRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/signin', { replace: true });
  };

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
        
        {/* User Profile Dropdown Trigger */}
        <div ref={dropdownRef} className="relative flex items-center gap-3 cursor-pointer select-none">
          <div onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-label-md text-on-surface font-bold">Alex Rivers</p>
              <p className="text-[10px] text-on-surface-variant">Student ID: #8829</p>
            </div>
            <img
              alt="User Profile"
              className="w-10 h-10 rounded-full border-2 border-primary-fixed shadow-sm object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_ZLAJginhm5aZ9DEg7Tltbu55Hb8bhUGt7xAiGjZF_V3CmtLhl9a68HvqFf0UUG0F0z03m_nDZvxvQWbA9hjuZJ061d3jtTOsg9bh1ujhy6d8pcpJVzQxas5yvuFRw15ULsVn7j_J2NX_MimcNuJ6onMPMLx_PJOj8IQEQlX5T89zW8Zn8d4FUVluZkCTCPtOAfD7k5mUl3m3U6xR1poEHvD42-M5ImtT_Lgze8hXHRUITVwXzbmsABD6hG92PRnrP8elDEXD0_g"
            />
            <span className={`material-symbols-outlined text-on-surface-variant text-sm transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </div>

          {/* Profile Dropdown Menu */}
          <div
            className={`absolute top-full right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-2xl py-2 z-50 transition-all duration-200 transform origin-top-right ${
              dropdownOpen
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <button
              onClick={() => {
                setDropdownOpen(false);
                navigate('/profile');
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-on-surface-variant hover:bg-surface-container-high transition-colors text-left"
            >
              <span className="material-symbols-outlined text-body-md" style={{ fontSize: 20 }}>person</span>
              <span className="font-semibold text-label-md">My Profile</span>
            </button>
            <button
              onClick={() => {
                setDropdownOpen(false);
                navigate('/settings');
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-on-surface-variant hover:bg-surface-container-high transition-colors text-left"
            >
              <span className="material-symbols-outlined text-body-md" style={{ fontSize: 20 }}>settings</span>
              <span className="font-semibold text-label-md">Settings</span>
            </button>
            <div className="h-px bg-outline-variant/30 my-1" />
            <button
              onClick={() => {
                setDropdownOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-error hover:bg-error-container/10 transition-colors text-left font-semibold"
            >
              <span className="material-symbols-outlined text-body-md" style={{ fontSize: 20 }}>logout</span>
              <span className="font-semibold text-label-md">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
