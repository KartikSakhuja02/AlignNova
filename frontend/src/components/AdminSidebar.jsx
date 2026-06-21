import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const navLinks = [
  { icon: 'dashboard', label: 'Dashboard', path: '/admin' },
  { icon: 'work', label: 'Opportunities', path: '/admin/opportunities' },
  { icon: 'group', label: 'Students', path: '/admin/students' },
  { icon: 'business_center', label: 'Recruiters', path: '/admin/recruiters' },
  { icon: 'settings', label: 'Settings', path: '/admin/settings' },
];

export default function AdminSidebar({ isCollapsed, setIsCollapsed, onPostDrive }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/signin', { replace: true });
  };

  return (
    <aside className={`hidden md:flex flex-col h-screen ${isCollapsed ? 'w-20' : 'w-64'} fixed left-0 top-0 bg-surface border-r border-outline-variant py-p-md z-50 transition-all duration-300 ease-in-out`}>
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

      {/* Brand */}
      <div className={`px-4 mb-8 flex flex-col items-center justify-center transition-all ${isCollapsed ? 'h-16' : ''}`}>
        {isCollapsed ? (
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-title-lg shadow-sm">
            A
          </div>
        ) : (
          <>
            <img src={logo} alt="AlignNova Logo" className="h-12 w-auto object-contain" />
            <p className="text-caption text-on-surface-variant font-bold tracking-wider uppercase mt-2 select-none">Admin Portal</p>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 space-y-1 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        {navLinks.map(({ icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`group relative w-full flex items-center gap-3 transition-all duration-200 text-left active:scale-[0.98] ${
                isCollapsed ? 'justify-center px-0 py-3 rounded-xl' : 'px-4 py-3 rounded-xl'
              } ${
                isActive
                  ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined">{icon}</span>
              {!isCollapsed && <span className="text-label-md">{label}</span>}
              {isCollapsed && (
                <div className="absolute left-16 px-2.5 py-1.5 bg-on-surface text-surface text-[10px] rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all shadow-md whitespace-nowrap z-50">
                  {label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className={`mt-auto border-t border-outline-variant space-y-3 ${isCollapsed ? 'px-2 py-4' : 'px-4 py-6'}`}>
        {isCollapsed ? (
          <button
            type="button"
            onClick={onPostDrive}
            className="group relative w-10 h-10 mx-auto bg-primary text-on-primary rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined">add</span>
            <div className="absolute left-16 px-2.5 py-1.5 bg-on-surface text-surface text-[10px] rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all shadow-md whitespace-nowrap z-50">
              Post Internship
            </div>
          </button>
        ) : (
          <button
            onClick={onPostDrive}
            className="w-full bg-primary text-on-primary py-3 px-4 rounded-xl text-label-md font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
            Post Internship
          </button>
        )}

        <button
          onClick={handleLogout}
          className={`group relative flex items-center gap-3 transition-colors duration-200 text-left rounded-xl ${
            isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'w-full px-4 py-3'
          } text-on-surface-variant hover:text-error hover:bg-error/10`}
        >
          <span className="material-symbols-outlined">logout</span>
          {!isCollapsed && <span className="text-label-md">Logout</span>}
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
