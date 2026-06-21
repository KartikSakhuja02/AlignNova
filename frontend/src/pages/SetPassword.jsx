import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const token = searchParams.get('token') || '';
  const isReset = (() => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(jsonPayload).purpose === 'reset_password';
    } catch (e) {
      return false;
    }
  })();

  const [step, setStep] = useState('form'); // 'form' | 'success' | 'expired'
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password rules validation
  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  const mismatch = confirm && password !== confirm;
  const canSubmit = rules.length && rules.upper && rules.number && rules.special && password === confirm && !loading;

  // If no token in URL, show expired/invalid state
  useEffect(() => {
    if (!token) setStep('expired');
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.detail === 'invalid_or_expired_token') {
          setStep('expired');
          return;
        }
        if (data.detail === 'password_too_short') {
          setError('Password must be at least 8 characters.');
          return;
        }
        throw new Error(data.detail || 'Something went wrong');
      }
      
      // Auto-login with the returned token
      login(data.access_token, data.role);
      setStep('success');
      
      // Redirect after 2s
      setTimeout(() => {
        const dest = data.role === 'admin' ? '/admin' : (data.role === 'hr' ? '/partner' : (isReset ? '/' : '/profile?tutorial=true'));
        navigate(dest, { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to set password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Inject background style overrides
  useEffect(() => {
    document.body.style.backgroundImage = `
      radial-gradient(at 0% 0%, rgba(53, 37, 205, 0.03) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(53, 37, 205, 0.02) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(53, 37, 205, 0.03) 0px, transparent 50%),
      radial-gradient(at 0% 100%, rgba(53, 37, 205, 0.02) 0px, transparent 50%)
    `;
    document.body.style.backgroundColor = "#f9f9ff";
    return () => {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundColor = "";
    };
  }, []);

  // ─── Expired / Invalid Token ─────────────────────────────────────────────────
  if (step === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center p-gutter w-full">
        <div className="w-full max-w-[480px] bg-white rounded-2xl border border-[#F1F5F9] p-8 text-center shadow-md backdrop-blur-xl">
          <div className="w-20 h-20 bg-error-container text-error rounded-full flex items-center justify-center mx-auto mb-6 border border-error-container/40">
            <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>link_off</span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface mb-3">Link Expired</h1>
          <p className="text-on-surface-variant text-body-md leading-relaxed mb-8">
            This invitation link is invalid or has expired. Please contact your placement coordinator to resend it.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/request-activation')}
              className="w-full py-4 bg-primary text-on-primary font-bold rounded-xl hover:scale-[1.01] active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 group"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              Request New Link
            </button>
            <button
              onClick={() => navigate('/signin')}
              className="w-full py-3.5 border border-outline-variant text-on-surface-variant font-semibold rounded-xl hover:bg-surface-container-low transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Success ──────────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-gutter w-full">
        <div className="w-full max-w-[480px] bg-white rounded-2xl border border-[#F1F5F9] p-8 text-center shadow-md backdrop-blur-xl">
          <div className="w-20 h-20 bg-secondary-container text-secondary rounded-full flex items-center justify-center mx-auto mb-6 border border-secondary-container/40 animate-bounce">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: '40px' }}
            >
              check_circle
            </span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface mb-3">
            {isReset ? "Password Reset! 🎉" : "Account Activated! 🎉"}
          </h1>
          <p className="text-on-surface-variant text-body-md leading-relaxed mb-4">
            Your password has been successfully {isReset ? "updated" : "configured"}.
          </p>
          <p className="text-outline text-caption">Redirecting you to the dashboard...</p>
          <div className="mt-6 w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full animate-[progressBar_2s_linear_forwards]" style={{ width: '100%' }} />
          </div>
          <style>{`@keyframes progressBar { from { width: 0% } to { width: 100% } }`}</style>
        </div>
      </div>
    );
  }

  // ─── Set Password Form ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-gutter w-full relative overflow-hidden">
      
      {/* Main Content Box */}
      <main className="w-full max-w-[480px] flex flex-col items-center z-10">
        
        {/* Logo Header */}
        <div className="mb-8">
          <img alt="AlignNova" className="h-12 w-auto object-contain" src={logo}/>
        </div>

        {/* Central Card */}
        <div className="bg-white/80 border border-[#F1F5F9] rounded-2xl p-8 w-full shadow-md backdrop-blur-xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
              {isReset ? "Reset Your Password" : "Secure Your Account"}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-[340px] mx-auto">
              {isReset 
                ? "Choose a strong password to secure and access your AlignNova account."
                : "Welcome to AlignNova. Create a strong password to access your placement dashboard."
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-error-container rounded-xl text-on-error-container text-body-md border border-error-container/30">
                <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '18px' }}>error</span>
                {error}
              </div>
            )}

            {/* New Password */}
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant block" htmlFor="new-password">New Password</label>
              <div className="relative group border border-outline-variant rounded-lg bg-surface-container-lowest focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                <input
                  id="new-password"
                  name="new-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  className="w-full bg-transparent border-none focus:ring-0 py-3 pl-10 pr-10 font-body-md text-body-md text-on-surface placeholder:text-outline/60 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPw ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant block" htmlFor="confirm-password">Confirm Password</label>
              <div className={`relative group border rounded-lg bg-surface-container-lowest focus-within:ring-2 transition-all duration-200 ${
                mismatch 
                  ? 'border-error focus-within:border-error focus-within:ring-error/10'
                  : confirm && !mismatch
                  ? 'border-secondary focus-within:border-secondary focus-within:ring-secondary/10'
                  : 'border-outline-variant focus-within:border-primary focus-within:ring-primary/10'
              }`}>
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">verified_user</span>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className="w-full bg-transparent border-none focus:ring-0 py-3 pl-10 pr-10 font-body-md text-body-md text-on-surface placeholder:text-outline/60 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirm ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {mismatch && (
                <p className="text-caption text-error flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
                  Passwords don't match
                </p>
              )}
            </div>

            {/* Password Checklist */}
            <div className="bg-surface-container-low rounded-lg p-4 space-y-3">
              <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider text-[11px]">Password Strength</h3>
              <ul className="space-y-2">
                {[
                  { key: 'length', text: 'At least 8 characters', check: rules.length },
                  { key: 'upper', text: 'One uppercase letter (A-Z)', check: rules.upper },
                  { key: 'number', text: 'One number (0-9)', check: rules.number },
                  { key: 'special', text: 'One special character (!@#$..._)', check: rules.special }
                ].map(({ key, text, check }) => (
                  <li 
                    key={key} 
                    className={`flex items-center gap-3 font-caption text-caption transition-colors duration-200 ${
                      check ? 'text-secondary font-semibold' : 'text-on-surface-variant'
                    }`}
                  >
                    <span 
                      className="material-symbols-outlined text-[16px] transition-all"
                      style={{ fontVariationSettings: check ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {check ? 'check_circle' : 'circle'}
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Activate Account Button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-primary-container text-white font-label-md text-label-md py-4 rounded-lg shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isReset ? "Resetting Password..." : "Activating Account..."}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                    {isReset ? "lock_reset" : "rocket_launch"}
                  </span>
                  {isReset ? "Reset Password" : "Activate My Account"}
                </>
              )}
            </button>

          </form>

          {/* Footer Back Link */}
          <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
            <button
              onClick={() => navigate('/signin')}
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1 group outline-none"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
              Back to Sign In
            </button>
          </div>

        </div>

      </main>

      {/* Decorative Pattern Background */}
      <div className="fixed top-0 right-0 w-64 h-64 opacity-5 pointer-events-none -mr-12 -mt-12">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,88.5,-0.9C87.1,14.5,81.6,29,73.8,42.3C66,55.6,56,67.7,43.2,74.9C30.4,82.2,15.2,84.6,0.4,83.9C-14.4,83.2,-28.8,79.5,-42.2,72.6C-55.6,65.7,-68,55.6,-76.4,42.7C-84.8,29.8,-89.2,14.9,-88.9,0.2C-88.6,-14.5,-83.6,-29,-75.2,-41.9C-66.8,-54.8,-55.1,-66.1,-41.5,-73.7C-27.9,-81.3,-14,-85.2,0.3,-85.7C14.6,-86.2,29.1,-83.3,44.7,-76.4Z" fill="#4f46e5" transform="translate(100 100)"></path>
        </svg>
      </div>

    </div>
  );
}
