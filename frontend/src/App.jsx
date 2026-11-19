import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import FAB from './components/FAB';
import Home from './pages/Home';

const SignIn = lazy(() => import('./pages/SignIn'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Drives = lazy(() => import('./pages/Drives'));
const Applications = lazy(() => import('./pages/Applications'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Premium = lazy(() => import('./pages/Premium'));
const DriveApplication = lazy(() => import('./pages/DriveApplication'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SetPassword = lazy(() => import('./pages/SetPassword'));
const RequestActivation = lazy(() => import('./pages/RequestActivation'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const PartnerDashboard = lazy(() => import('./pages/PartnerDashboard'));

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
  React.useEffect(() => {
    const isDark = localStorage.getItem('alignnova_dark_mode') === 'true';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className="p-8 text-on-surface-variant" role="status">Loading…</div>}>
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
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
