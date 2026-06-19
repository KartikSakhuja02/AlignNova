import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── FloatingInput ─────────────────────────────────────────────────────────

function FloatingInput({ id, label, type = 'text', value, onChange, required }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className={`w-full h-14 px-4 pt-3 border rounded-xl bg-transparent outline-none transition-all text-body-md text-on-surface
          ${focused
            ? 'border-primary ring-4 ring-primary/10'
            : 'border-outline-variant'
          }`}
      />
      <label
        htmlFor={id}
        className={`absolute left-4 pointer-events-none transition-all duration-200 ${
          lifted
            ? '-top-2.5 text-xs bg-white px-1 text-primary font-semibold'
            : 'top-4 text-label-md text-on-surface-variant'
        }`}
      >
        {label}
      </label>
    </div>
  );
}

// ─── SignIn Page ─────────────────────────────────────────────────────────────

export default function SignIn() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  // Parallax blob refs
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);

  // Redirect if already signed in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const moveX = (e.clientX - window.innerWidth / 2) / 50;
      const moveY = (e.clientY - window.innerHeight / 2) / 50;
      if (blob1Ref.current)
        blob1Ref.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
      if (blob2Ref.current)
        blob2Ref.current.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      // OAuth2PasswordRequestForm expects x-www-form-urlencoded
      const body = new URLSearchParams();
      body.append('username', email); // backend supports email as username
      body.append('password', password);

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail === 'invalid_credentials'
          ? 'Invalid email or password. Please try again.'
          : 'Login failed. Please try again.');
      }

      const data = await res.json();
      login(data.access_token, data.role);
      setStatus('success');

      setTimeout(() => {
        navigate(data.role === 'admin' ? '/admin' : '/', { replace: true });
      }, 900);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          ref={blob1Ref}
          className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] transition-transform duration-75"
        />
        <div
          ref={blob2Ref}
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary-container/20 blur-[120px] transition-transform duration-75"
        />
      </div>

      {/* Main card */}
      <main className="relative z-10 w-full max-w-[480px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px' }}
              >
                insights
              </span>
            </div>
            <h1 className="text-[48px] font-extrabold text-primary leading-none tracking-tight">
              Alignova
            </h1>
          </div>
          <p className="text-body-md text-on-surface-variant">
            The future of executive career placement
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_-2px_rgba(0,0,0,0.02)] transition-all duration-300">
          <div className="mb-6">
            <h2 className="text-headline-md font-bold text-on-surface mb-1">Welcome Back</h2>
            <p className="text-body-md text-on-surface-variant">
              Access your professional network and opportunities.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FloatingInput
              id="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FloatingInput
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Error message */}
            {status === 'error' && (
              <div className="flex items-center gap-2 px-4 py-3 bg-error-container rounded-xl text-on-error-container text-label-md">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                {errorMsg}
              </div>
            )}

            {/* Actions row */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                />
                <span className="text-label-md text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Remember me
                </span>
              </label>
              <a href="#" className="text-label-md text-primary hover:underline decoration-2 underline-offset-4">
                Forgot password?
              </a>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className={`w-full h-14 font-semibold text-label-md rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]
                ${status === 'success'
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-primary text-on-primary hover:shadow-lg hover:scale-[1.01]'
                }
                ${(status === 'loading' || status === 'success') ? 'opacity-90 cursor-not-allowed' : ''}`}
            >
              {status === 'loading' && (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              )}
              {status === 'success' && (
                <>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px' }}>check_circle</span>
                  <span>Success! Redirecting...</span>
                </>
              )}
              {(status === 'idle' || status === 'error') && (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface-container-lowest px-4 text-caption text-outline">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button className="h-12 border border-outline-variant rounded-xl text-label-md text-on-surface flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors">
              <img
                alt="Google"
                className="w-5 h-5"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVq-ED0OZ1HsKAZdV3zD7mtETPQRGn0A-cTqF0_HBbkQwRsZ4BcWXt7yZpg0MO_VDCczZmL3F_u6akShwWPNmDgGd5SR9jw7x3Gao83L6eNITyAIqYbSeyqehKWEHa73jB9Vcx-4ETJMjrbyCW25zjzizLzL8RqclMRqdlUMRJsLet7ZKoFPgm-HqIg-tmrqo3pZx0FSulIUQTrAb5vzlbK6jhr1_lmeAsHja0iAsUEO9CmD4iBYXCP5mz_1OmtnbUNkLQuEVUyPA"
              />
              Google
            </button>
            <button className="h-12 border border-outline-variant rounded-xl text-label-md text-on-surface flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px', color: '#0077b5' }}
              >
                work
              </span>
              LinkedIn
            </button>
          </div>
        </div>

        {/* Sign up link */}
        <div className="mt-8 text-center">
          <p className="text-body-md text-on-surface-variant">
            Don't have an account?{' '}
            <a href="#" className="text-label-md text-primary font-bold hover:underline decoration-2 underline-offset-4">
              Sign up
            </a>
          </p>
        </div>

        {/* Animated bars */}
        <div className="mt-12 flex justify-center opacity-40">
          <div className="flex space-x-4 items-end">
            {[
              { h: 'h-8', color: 'bg-outline-variant', dur: '3s' },
              { h: 'h-12', color: 'bg-primary', dur: '4s' },
              { h: 'h-6', color: 'bg-secondary', dur: '2s' },
              { h: 'h-10', color: 'bg-outline-variant', dur: '5s' },
              { h: 'h-8', color: 'bg-primary/50', dur: '3.5s' },
            ].map((bar, i) => (
              <div
                key={i}
                className={`w-1 ${bar.h} ${bar.color} rounded-full`}
                style={{ animation: `pulse ${bar.dur} infinite` }}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="fixed bottom-8 left-8 hidden lg:block">
        <p className="text-caption text-outline select-none">
          © 2026 AlignNova Executive Placement. Confidential Platform.
        </p>
      </div>
    </div>
  );
}
