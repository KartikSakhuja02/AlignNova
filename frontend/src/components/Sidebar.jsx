import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const navLinks = [
  { icon: 'dashboard', label: 'Dashboard', path: '/', fill: true },
  { icon: 'work', label: 'Drives', path: '/drives' },
  { icon: 'assignment_turned_in', label: 'Applications', path: '/applications' },
  { icon: 'person', label: 'Profile', path: '/profile' },
  { icon: 'settings', label: 'Settings', path: '/settings' },
];

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/signin', { replace: true });
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen ${isCollapsed ? 'w-20' : 'w-64'} border-r border-outline-variant bg-surface flex flex-col py-p-md z-50 transition-all duration-300 ease-in-out`}>
      {/* Toggle Button */}
      <button 
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-6 -right-3 w-6 h-6 bg-white border border-outline-variant rounded-full flex items-center justify-center shadow-md text-on-surface-variant hover:text-primary transition-all active:scale-95 z-50 hover:bg-surface-container"
        aria-label="Toggle Sidebar"
      >
        <span className="material-symbols-outlined text-[16px] transition-transform duration-300" style={{ transform: isCollapsed ? 'rotate(180deg)' : 'none' }}>
          chevron_left
        </span>
      </button>

      {/* Logo */}
      <div className={`px-4 mb-8 flex flex-col items-center justify-center transition-all ${isCollapsed ? 'h-16' : ''}`}>
        {isCollapsed ? (
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-title-lg shadow-sm">
            A
          </div>
        ) : (
          <>
            <img src={logo} alt="AlignNova Logo" className="h-12 w-auto object-contain" />
            <p className="text-caption text-on-surface-variant font-bold tracking-wider uppercase mt-2 select-none">Placement Portal</p>
          </>
        )}
      </div>

      {/* Nav Links */}
      <nav className={`flex-1 space-y-1 ${isCollapsed ? 'px-2' : 'px-4'} overflow-y-auto custom-scrollbar`}>
        {navLinks.map(({ icon, label, path, fill }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`group relative w-full flex items-center gap-3 transition-all duration-200 text-left ${
                isCollapsed ? 'justify-center px-0 py-3 rounded-xl' : 'px-4 py-3 rounded-lg'
              } ${
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
              {!isCollapsed && <span className="text-body-md">{label}</span>}
              {isCollapsed && (
                <div className="absolute left-16 px-2.5 py-1.5 bg-on-surface text-surface text-[10px] rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all shadow-md whitespace-nowrap z-50">
                  {label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Upgrade Card + Logout */}
      <div className={`mt-auto space-y-3 ${isCollapsed ? 'px-2' : 'px-6'}`}>
        {isCollapsed ? (
          <button
            type="button"
            onClick={() => navigate('/premium')}
            className="group relative w-10 h-10 mx-auto bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            <div className="absolute left-16 px-2.5 py-1.5 bg-on-surface text-surface text-[10px] rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all shadow-md whitespace-nowrap z-50">
              Upgrade to Premium
            </div>
          </button>
        ) : (
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
        )}

        <button
          onClick={handleLogout}
          className={`group relative flex items-center gap-2 transition-all duration-200 text-left rounded-lg text-label-md ${
            isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'w-full px-4 py-2'
          } text-on-surface-variant hover:text-error hover:bg-error/10`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
          {!isCollapsed && <span>Logout</span>}
          {isCollapsed && (
            <div className="absolute left-16 px-2.5 py-1.5 bg-on-surface text-surface text-[10px] rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all shadow-md whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
