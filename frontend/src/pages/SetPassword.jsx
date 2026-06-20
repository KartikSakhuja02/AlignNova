import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Password strength calculator
function getStrength(password) {
  let score = 0;
  if (!password) return { score: 0, label: '', color: '' };
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: 'Very Weak', color: '#ef4444' };
  if (score === 2) return { score, label: 'Weak', color: '#f97316' };
  if (score === 3) return { score, label: 'Fair', color: '#eab308' };
  if (score === 4) return { score, label: 'Strong', color: '#22c55e' };
  return { score, label: 'Very Strong', color: '#16a34a' };
}

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const token = searchParams.get('token') || '';

  const [step, setStep] = useState('form'); // 'form' | 'success' | 'expired'
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = getStrength(password);
  const mismatch = confirm && password !== confirm;
  const canSubmit = password.length >= 6 && password === confirm && !loading;

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
          setError('Password must be at least 6 characters.');
          return;
        }
        throw new Error(data.detail || 'Something went wrong');
      }
      // Auto-login with the returned token
      login(data.access_token, data.role);
      setStep('success');
      // Redirect after 2s
      setTimeout(() => {
        navigate(data.role === 'admin' ? '/admin' : '/', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to set password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Expired / Invalid Token ─────────────────────────────────────────────────
  if (step === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 text-center shadow-2xl">
          <div className="w-20 h-20 bg-error/20 text-error rounded-full flex items-center justify-center mx-auto mb-6 border border-error/30">
            <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>link_off</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-3">Link Expired</h1>
          <p className="text-white/70 text-base leading-relaxed mb-8">
            This invitation link is invalid or has expired. Please contact your placement coordinator to resend it.
          </p>
          <button
            onClick={() => navigate('/signin')}
            className="w-full py-3.5 bg-white text-slate-900 font-bold rounded-2xl hover:bg-white/90 transition-all active:scale-[0.98]"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // ─── Success ──────────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 text-center shadow-2xl">
          {/* Animated check */}
          <div className="w-24 h-24 bg-green-500/20 border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <span
              className="material-symbols-outlined text-green-400"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: '48px' }}
            >
              check_circle
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3">You're All Set! 🎉</h1>
          <p className="text-white/70 text-base leading-relaxed mb-4">
            Your password has been set successfully.
          </p>
          <p className="text-white/50 text-sm">Redirecting you to the dashboard...</p>
          <div className="mt-6 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-400 to-indigo-400 rounded-full animate-[loading_2s_ease-in-out_forwards]" style={{ width: '100%', animation: 'progressBar 2s linear forwards' }} />
          </div>
          <style>{`@keyframes progressBar { from { width: 0% } to { width: 100% } }`}</style>
        </div>
      </div>
    );
  }

  // ─── Set Password Form ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl px-5 py-3">
            <img src="/logo.png" alt="AlignNova Logo" className="h-8 w-auto object-contain rounded-md" />
            <span className="text-white font-bold text-lg tracking-tight">AlignNova</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-violet-400/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span
                className="material-symbols-outlined text-violet-300"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: '32px' }}
              >
                lock_reset
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-2">Set Your Password</h1>
            <p className="text-white/60 text-sm leading-relaxed">
              Welcome to AlignNova! Create a secure password to<br />activate your account and access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300 text-sm">
                <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '18px' }}>error</span>
                {error}
              </div>
            )}

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80">New Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>lock</span>
                </div>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPw ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {/* Strength bar */}
              {password && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: i <= strength.score ? strength.color : 'rgba(255,255,255,0.15)',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-semibold" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80">Confirm Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>lock_clock</span>
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className={`w-full bg-white/10 border rounded-xl text-white placeholder-white/30 pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                    mismatch
                      ? 'border-red-400/50 focus:ring-red-400/30'
                      : confirm && !mismatch
                      ? 'border-green-400/50 focus:ring-green-400/30'
                      : 'border-white/20 focus:ring-violet-400/50 focus:border-violet-400/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showConfirm ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
                {confirm && !mismatch && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 text-green-400">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '18px' }}>check_circle</span>
                  </div>
                )}
              </div>
              {mismatch && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
                  Passwords don't match
                </p>
              )}
            </div>

            {/* Password tips */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Password Tips</p>
              {[
                { check: password.length >= 8, text: 'At least 8 characters' },
                { check: /[A-Z]/.test(password), text: 'One uppercase letter (A-Z)' },
                { check: /[0-9]/.test(password), text: 'One number (0-9)' },
                { check: /[^A-Za-z0-9]/.test(password), text: 'One special character (!@#$...)' },
              ].map(({ check, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined transition-colors`}
                    style={{
                      fontSize: '14px',
                      fontVariationSettings: "'FILL' 1",
                      color: check ? '#4ade80' : 'rgba(255,255,255,0.25)',
                    }}
                  >
                    {check ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className={`text-xs transition-colors ${check ? 'text-green-400' : 'text-white/40'}`}>{text}</span>
                </div>
              ))}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl text-base hover:from-violet-500 hover:to-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Activating Account...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px' }}>rocket_launch</span>
                  Activate My Account
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-white/40">
            Already have a password?{' '}
            <button
              onClick={() => navigate('/signin')}
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © 2024 AlignNova Placement Portal
        </p>
      </div>
    </div>
  );
}
