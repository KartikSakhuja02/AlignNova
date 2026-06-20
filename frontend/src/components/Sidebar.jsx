import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { icon: 'dashboard', label: 'Dashboard', path: '/', fill: true },
  { icon: 'work', label: 'Drives', path: '/drives' },
  { icon: 'assignment_turned_in', label: 'Applications', path: '/applications' },
  { icon: 'person', label: 'Profile', path: '/profile' },
  { icon: 'settings', label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/signin', { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-outline-variant bg-surface flex flex-col py-p-md z-50 sidebar-transition">
      {/* Logo */}
      <div className="px-6 mb-8 flex flex-col items-center">
        <img src="/logo.png" alt="AlignNova Logo" className="h-16 w-auto object-contain" />
        <p className="text-caption text-on-surface-variant font-bold tracking-wider uppercase mt-2">Placement Portal</p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 px-4 overflow-y-auto custom-scrollbar">
        {navLinks.map(({ icon, label, path, fill }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                isActive
                  ? 'text-primary font-bold border-r-4 border-primary bg-primary/10'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive && fill ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {icon}
              </span>
              <span className="text-body-md">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Upgrade Card + Logout */}
      <div className="px-6 mt-auto space-y-3">
        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
          <p className="text-caption font-bold text-primary mb-1">Upgrade to Premium</p>
          <p className="text-[10px] text-on-surface-variant mb-3">
            Get advanced interview coaching and resume reviews.
          </p>
          <button
            onClick={() => navigate('/premium')}
            className="w-full py-2 bg-primary text-white text-caption rounded-lg font-bold hover:scale-[1.02] transition-transform cursor-pointer"
          >
            Learn More
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-on-surface-variant hover:text-error transition-colors rounded-lg text-label-md"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
