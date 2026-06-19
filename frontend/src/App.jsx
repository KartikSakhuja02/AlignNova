import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import FAB from './components/FAB';

import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Drives from './pages/Drives';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Premium from './pages/Premium';
import AdminDashboard from './pages/AdminDashboard';

// ─── Route Guards ─────────────────────────────────────────────────────────────

/** Redirects unauthenticated users to /signin; redirects admins to /admin */
function RequireStudent() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <Outlet />;
}

/** Redirects unauthenticated users to /signin; redirects students to / */
function RequireAdmin() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}

/** Redirects already-authenticated users away from /signin */
function RequireGuest() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : '/'} replace />;
  return <Outlet />;
}

// ─── Student Layout ───────────────────────────────────────────────────────────

function StudentLayout() {
  const location = useLocation();

  return (
    <div className="text-on-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <TopBar />
        <div key={location.pathname} className="animate-fadeIn">
          <Outlet />
        </div>
        <footer className="p-8 border-t border-outline-variant text-center opacity-40">
          <p className="text-caption">
            © 2024 Alignova Placement Portal. Professional Excellence Redefined.
          </p>
        </footer>
      </main>
      <FAB />
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public: Sign In */}
          <Route element={<RequireGuest />}>
            <Route path="/signin" element={<SignIn />} />
          </Route>

          {/* Admin routes */}
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Student routes */}
          <Route element={<RequireStudent />}>
            <Route element={<StudentLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/drives" element={<Drives />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/premium" element={<Premium />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
