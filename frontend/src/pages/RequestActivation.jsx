import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function RequestActivation() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/request-activation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.detail === 'email_not_found'
            ? 'No registered account found with this email.'
            : 'Failed to request link. Please try again later.'
        );
      }

      setSuccess(true);
      // Wait a few seconds then navigate back to sign in
      setTimeout(() => {
        navigate('/signin');
      }, 3500);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-p-md md:py-8">
      {/* Main Content Shell */}
      <main className="w-full max-w-[480px] flex flex-col items-center gap-y-4">
        
        {/* Logo Section */}
        <div className="w-20 h-20 md:w-24 md:h-24">
          <img alt="AlignNova Logo" className="w-full h-full object-contain" src={logo} />
        </div>

        {/* Auth Card */}
        <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm transition-all duration-300 hover:shadow-md px-6 py-6">
          <div className="text-center mb-6">
            <h1 className="font-headline-lg text-headline-lg text-on-background tracking-tight mb-2">
              Link Expired?
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Don't worry, these things happen. Enter your email address below and we'll send you a fresh activation link to get you started.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-error-container rounded-xl text-on-error-container text-caption border border-error-container/30">
                <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '18px' }}>error</span>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-background block" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  mail
                </span>
                <input 
                  id="email" 
                  name="email" 
                  type="email"
                  required
                  disabled={loading || success}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address" 
                  className="w-full pl-12 pr-4 bg-surface-container-low border border-outline-variant rounded-lg text-body-md font-body-md focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all duration-200 placeholder:text-outline py-2.5 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Primary Action Button */}
            {success ? (
              <button 
                type="button" 
                disabled
                className="w-full bg-secondary-container text-on-secondary-container font-label-md text-label-md px-6 rounded-lg shadow-sm flex items-center justify-center gap-2 py-3 transition-all duration-200"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Link Sent Successfully
              </button>
            ) : loading ? (
              <button 
                type="button" 
                disabled
                className="w-full bg-primary-container text-on-primary font-label-md text-label-md px-6 rounded-lg shadow-sm flex items-center justify-center gap-2 py-3 transition-all duration-200 cursor-wait"
              >
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </button>
            ) : (
              <button 
                type="submit"
                className="w-full bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md px-6 rounded-lg shadow-sm transform transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 group py-3"
              >
                Resend Activation Link
                <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-1">
                  arrow_forward
                </span>
              </button>
            )}
          </form>

          {/* Secondary Actions */}
          <div className="border-t border-outline-variant flex justify-center pt-4 mt-4">
            <button 
              onClick={() => navigate('/signin')}
              className="font-label-md text-label-md text-primary-container hover:text-primary transition-colors duration-200 flex items-center gap-1 group outline-none"
            >
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
                arrow_back
              </span>
              Back to Sign In
            </button>
          </div>
        </div>

        {/* System Footer */}
        <footer className="text-center space-y-4">
          <p className="font-caption text-caption text-on-surface-variant opacity-70">
            © 2026 AlignNova Platform. All rights reserved. 
          </p>
          <div className="flex justify-center gap-x-6">
            <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Support Center</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
