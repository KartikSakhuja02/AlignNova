import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { icon: 'dashboard', label: 'Dashboard', path: '/admin' },
  { icon: 'work', label: 'Internships', path: '/admin/internships' },
  { icon: 'group', label: 'Students', path: '/admin/students' },
  { icon: 'business_center', label: 'Recruiters', path: '/admin/recruiters' },
  { icon: 'settings', label: 'Settings', path: '/admin/settings' },
];

export default function AdminSidebar({ onPostDrive }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/signin', { replace: true });
  };

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface border-r border-outline-variant py-p-md z-50">
      {/* Brand */}
      <div className="px-6 mb-8 flex flex-col items-center">
        <img src="/logo.png" alt="AlignNova Logo" className="h-16 w-auto object-contain" />
        <p className="text-caption text-on-surface-variant font-bold tracking-wider uppercase mt-2">Admin Portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-4">
        {navLinks.map(({ icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left active:scale-[0.98] ${
                isActive
                  ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span className="text-label-md">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto px-4 py-6 border-t border-outline-variant space-y-3">
        <button
          onClick={onPostDrive}
          className="w-full bg-primary text-on-primary py-3 px-4 rounded-xl text-label-md font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
          Post Internship
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-error transition-colors rounded-xl"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-label-md">Logout</span>
        </button>
      </div>
    </aside>
  );
}
