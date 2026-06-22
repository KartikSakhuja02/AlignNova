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
import DriveApplication from './pages/DriveApplication';
import AdminDashboard from './pages/AdminDashboard';
import SetPassword from './pages/SetPassword';
import RequestActivation from './pages/RequestActivation';
import ForgotPassword from './pages/ForgotPassword';
import PartnerDashboard from './pages/PartnerDashboard';
import Home from './pages/Home';

// ─── Route Guards ─────────────────────────────────────────────────────────────

/** Redirects unauthenticated users to /signin; redirects admins/hr to their dashboards */
function RequireStudent() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'hr') return <Navigate to="/partner" replace />;
  return <Outlet />;
}

/** Redirects unauthenticated users to /signin; redirects non-admins appropriately */
function RequireAdmin() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  if (role !== 'admin') {
    if (role === 'hr') return <Navigate to="/partner" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

/** Redirects unauthenticated users to /signin; redirects non-hr appropriately */
function RequireHr() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  if (role !== 'hr') {
    if (role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

/** Redirects already-authenticated users away from /signin */
function RequireGuest() {
  const { isAuthenticated, role } = useAuth();
  if (isAuthenticated) {
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'hr') return <Navigate to="/partner" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

// ─── Student Layout ───────────────────────────────────────────────────────────

function StudentLayout() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    return localStorage.getItem('student-sidebar-collapsed') === 'true';
  });

  React.useEffect(() => {
    localStorage.setItem('student-sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  return (
    <div className="text-on-background">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`${isCollapsed ? 'ml-20' : 'ml-64'} min-h-screen transition-all duration-300 ease-in-out`}>
        <TopBar />
        <div key={location.pathname} className="animate-fadeIn">
          <Outlet />
        </div>
        <footer className="p-8 border-t border-outline-variant text-center opacity-40">
          <p className="text-caption">
            © 2026 Alignova Placement Portal. Professional Excellence Redefined.
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
          {/* Public: Home Page */}
          <Route path="/" element={<Home />} />

          {/* Public: Sign In */}
          <Route element={<RequireGuest />}>
            <Route path="/signin" element={<SignIn />} />
          </Route>

          {/* Public: Set Password (invitation link from email) */}
          <Route path="/set-password" element={<SetPassword />} />

          {/* Public: Request Activation Link / Forgot Password */}
          <Route path="/request-activation" element={<RequestActivation />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin routes */}
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/opportunities" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<AdminDashboard />} />
            <Route path="/admin/recruiters" element={<AdminDashboard />} />
            <Route path="/admin/settings" element={<AdminDashboard />} />
          </Route>

          {/* HR / Partner routes */}
          <Route element={<RequireHr />}>
            <Route path="/partner" element={<PartnerDashboard />} />
          </Route>

          {/* Student routes */}
          <Route element={<RequireStudent />}>
            <Route element={<StudentLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/drives" element={<Drives />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/apply/:driveId" element={<DriveApplication />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
