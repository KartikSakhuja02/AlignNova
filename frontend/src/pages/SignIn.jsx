import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function SignIn() {
  const navigate = useNavigate();
  const { login, isAuthenticated, role } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const queryParams = new URLSearchParams(window.location.search);
  const isExpired = queryParams.get('expired') === 'true';


  // Redirect if already signed in
  useEffect(() => {
    if (isAuthenticated) {
      const dest = role === 'admin' ? '/admin' : (role === 'hr' ? '/partner' : '/');
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setStatus('loading');
    setErrorMsg('');

    try {
      // OAuth2PasswordRequestForm expects x-www-form-urlencoded
      const body = new URLSearchParams();
      body.append('username', email); // backend treats email as username
      body.append('password', password);

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.detail === 'invalid_credentials'
            ? 'Invalid email or password. Please try again.'
            : 'Login failed. Please try again.'
        );
      }

      const data = await res.json();
      login(data.access_token, data.role);
      setStatus('success');

      setTimeout(() => {
        const dest = data.role === 'admin' ? '/admin' : (data.role === 'hr' ? '/partner' : '/');
        navigate(dest, { replace: true });
      }, 900);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  const isLoading = status === 'loading';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#F8FAFC]">
      {/* Background Pattern Decorative Element */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none">
        <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern height="40" id="grid" patternUnits="userSpaceOnUse" width="40">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"></path>
            </pattern>
          </defs>
          <rect fill="url(#grid)" height="100%" width="100%"></rect>
        </svg>
      </div>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-[480px] px-p-md fade-in">
        {/* Branding Header */}
        <div className="text-center mb-p-xl">
          <img src={logo} alt="AlignNova Logo" className="h-32 mx-auto mb-p-md object-contain" />
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Elevating high-stakes career placement.</p>
        </div>

        {/* Sign In Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-p-xl shadow-sm">
          <header className="mb-p-lg">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Sign In</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Enter your university credentials to continue.</p>
          </header>

          {isExpired && (
            <div className="flex items-center gap-3 px-4 py-3 bg-error-container text-on-error-container rounded-xl font-semibold text-label-md border border-error/15 fade-in mb-6">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                info
              </span>
              <span>Session expired. Please sign in again.</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider block" htmlFor="email">
                University Email
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  mail
                </span>
                <input
                  required
                  id="email"
                  type="email"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  className={`w-full pl-12 pr-4 py-4 border rounded-xl font-body-md text-body-md transition-all duration-200 outline-none
                    ${isLoading 
                      ? 'bg-surface-container-low text-on-surface-variant cursor-not-allowed border-outline-variant/30' 
                      : 'bg-transparent border-outline-variant text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10'
                    }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="font-label-md text-label-md text-primary hover:underline outline-none"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  lock
                </span>
                <input
                  required
                  id="password"
                  type="password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  className={`w-full pl-12 pr-4 py-4 border rounded-xl font-body-md text-body-md transition-all duration-200 outline-none
                    ${isLoading 
                      ? 'bg-surface-container-low text-on-surface-variant cursor-not-allowed border-outline-variant/30' 
                      : 'bg-transparent border-outline-variant text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10'
                    }`}
                />
              </div>
            </div>

            {/* Error state alert banner */}
            {status === 'error' && (
              <div className="flex items-center gap-3 px-4 py-3 bg-error-container text-on-error-container rounded-xl font-semibold text-label-md border border-error/15 fade-in">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  error
                </span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Loading / Action Button */}
            {isLoading ? (
              <button
                disabled
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-primary/80 text-on-primary rounded-xl font-label-md text-label-md transition-all duration-200 cursor-wait relative overflow-hidden"
              >
                {/* Shimmer effect overlay for button */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                <div className="spinner"></div>
                <span>Verifying Credentials...</span>
              </button>
            ) : status === 'success' ? (
              <button
                disabled
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-secondary text-on-secondary rounded-xl font-label-md text-label-md transition-all duration-200 cursor-wait"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px' }}>
                  check_circle
                </span>
                <span>Redirecting...</span>
              </button>
            ) : (
              <button
                type="submit"
                className="w-full py-4 px-6 bg-primary text-on-primary rounded-xl font-label-md text-label-md hover:scale-[1.01] hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.99]"
              >
                Sign In
              </button>
            )}
          </form>

          {/* Footer Registrar Link */}
          <div className="mt-p-lg pt-p-md border-t border-outline-variant/20 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Don't have an account?{' '}
              <a className="text-primary font-bold hover:underline cursor-not-allowed opacity-50" href="#">
                Contact Registrar
              </a>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-on-surface-variant/40">
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span className="font-label-md text-caption uppercase tracking-widest">Encrypted Tier 1 Security</span>
        </div>
      </main>

      {/* Footer Identity */}
      <footer className="fixed bottom-8 w-full text-center px-p-md pointer-events-none opacity-40">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="font-label-md text-caption">© 2026 AlignNova Placement Technologies</p>
          <div className="flex gap-6 mt-2 md:mt-0">
            <span className="font-label-md text-caption">Privacy Architecture</span>
            <span className="font-label-md text-caption">System Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
