import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        throw new Error('Failed to send reset link. Please try again.');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen text-on-surface p-p-md relative overflow-hidden bg-background">
      {/* Atmospheric Subtle Background Element */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50">
        <div className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]"></div>
      </div>

      {/* Main Container */}
      <main className="w-full max-w-md relative z-10">
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-10">
          <img alt="Alignova Logo" className="h-16 w-16 mb-4 object-contain" src={logo} />
          <h1 className="font-headline-md text-headline-md text-primary tracking-tight">Alignova</h1>
          <p className="font-label-md text-label-md text-on-surface-variant/70 uppercase tracking-[0.2em] mt-1">Executive Precision</p>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-p-xl shadow-sm">
          {!submitted ? (
            <>
              <div className="mb-8">
                <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Forgot Password?</h2>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Forgot Password Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-error-container text-on-error-container rounded-xl font-semibold text-label-md border border-error/15 fade-in">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="email">Email Address</label>
                  <div className="relative group transition-transform duration-200 focus-within:scale-[1.01]">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">mail</span>
                    </div>
                    <input
                      className="block w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-md text-on-surface font-body-md placeholder-on-surface-variant/40 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                      id="email"
                      name="email"
                      placeholder=""
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 px-6 rounded-md shadow-sm hover:brightness-110 active:scale-[0.98] transition-all duration-200 uppercase tracking-wider font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-4">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-secondary-container rounded-full text-on-secondary-container">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Email Sent</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
                If an account exists for that email, you will receive a password reset link shortly.
              </p>
              <button
                className="text-primary font-label-md text-label-md hover:underline outline-none"
                onClick={() => setSubmitted(false)}
              >
                Resend Email
              </button>
            </div>
          )}

          {/* Footer Link */}
          <div className="mt-8 pt-8 border-t border-outline-variant/30 text-center">
            <button
              onClick={() => navigate('/signin')}
              className="inline-flex items-center gap-2 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200 outline-none"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back to Sign In
            </button>
          </div>
        </div>

        {/* System Status/Metadata Footer */}
        <div className="mt-8 text-center">
          <p className="font-caption text-caption text-outline-variant select-none">
            © 2026 Alignova Executive Precision. Secure Access Protocol Enabled.
          </p>
        </div>
      </main>
    </div>
  );
}
