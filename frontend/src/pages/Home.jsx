import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const handleAction = () => {
    if (isAuthenticated) {
      const dest = role === 'admin' ? '/admin' : (role === 'hr' ? '/partner' : '/dashboard');
      navigate(dest);
    } else {
      navigate('/signin');
    }
  };

  const handleFeaturesScroll = (e) => {
    e.preventDefault();
    const section = document.getElementById('features-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden min-h-screen flex flex-col">
      {/* TopNavBar Component */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-outline-variant/50 fixed top-0 w-full z-50">
        <div className="flex justify-between items-center w-full px-p-lg max-w-container-max mx-auto h-20">
          <div className="flex items-center h-10 cursor-pointer" onClick={() => navigate('/')}>
            <img alt="AlignNova Logo" className="h-10 w-auto object-contain" src={logo} />
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a 
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-all duration-200" 
              href="#features"
              onClick={handleFeaturesScroll}
            >
              Features
            </a>
            <a 
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-all duration-200" 
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Pricing
            </a>
            <a 
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-all duration-200" 
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              About
            </a>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button 
                onClick={handleAction}
                className="bg-primary px-6 py-2.5 rounded-lg font-label-md text-on-primary shadow-sm hover:shadow-primary/20 hover:bg-primary/90 transition-all duration-200"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/signin')}
                  className="px-6 py-2 rounded-lg font-label-md text-on-surface-variant hover:text-primary transition-all duration-200"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('/signin')}
                  className="bg-primary px-6 py-2.5 rounded-lg font-label-md text-on-primary shadow-sm hover:shadow-primary/20 hover:bg-primary/90 transition-all duration-200"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col md:flex-row pt-20">
        {/* Left Panel: Marketing Content */}
        <section className="w-full md:w-1/2 flex flex-col justify-center px-p-lg md:px-p-xl py-p-xl bg-surface-container-lowest">
          <div className="max-w-2xl mx-auto md:mx-0">
            {/* Hero Section */}
            <div className="mb-12">
              <div className="mb-6">
                <img src={logo} alt="AlignNova Logo" className="h-32 w-auto object-contain" />
              </div>
              <h1 className="font-display-lg text-display-lg text-on-surface leading-tight mb-4 tracking-tighter">
                AlignNova
              </h1>
              <h2 className="font-headline-lg text-headline-lg text-secondary mb-6">One Platform. Endless Opportunities.</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mb-10">
                Empowering students, campuses, and recruiters through a secure and smart placement ecosystem. Streamline your hiring journey with professional precision.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={handleAction}
                  className="bg-primary text-on-primary px-8 py-4 rounded-xl font-label-md shadow-lg shadow-primary/10 hover:bg-primary/90 transition-all duration-200 flex items-center gap-2"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
                <button 
                  onClick={handleFeaturesScroll}
                  className="border border-outline px-8 py-4 rounded-xl font-label-md text-on-surface hover:bg-surface-container transition-all duration-200"
                >
                  Explore Features
                </button>
              </div>
            </div>

            {/* Feature Highlights */}
            <div id="features-section" className="grid grid-cols-1 md:grid-cols-3 gap-4 scroll-mt-24">
              <div className="p-p-md bg-white border border-outline-variant/60 rounded-xl shadow-sm hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <h3 className="font-label-md text-on-surface mb-1">For Students</h3>
                <p className="text-caption text-on-surface-variant">Accelerate your career path with job matching.</p>
              </div>
              <div className="p-p-md bg-white border border-outline-variant/60 rounded-xl shadow-sm hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <span className="material-symbols-outlined">work</span>
                </div>
                <h3 className="font-label-md text-on-surface mb-1">For HRs</h3>
                <p className="text-caption text-on-surface-variant">High-fidelity tools for top-tier recruitment.</p>
              </div>
              <div className="p-p-md bg-white border border-outline-variant/60 rounded-xl shadow-sm hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <span className="material-symbols-outlined">admin_panel_settings</span>
                </div>
                <h3 className="font-label-md text-on-surface mb-1">For Admins</h3>
                <p className="text-caption text-on-surface-variant">Centralized control for campus placements.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel: Animated Showcase */}
        <section className="w-full md:w-1/2 h-[600px] md:h-auto bg-surface-container relative overflow-hidden flex items-center justify-center border-l border-outline-variant/30">
          {/* Animated Stack Container */}
          <div className="relative w-full h-full flex flex-col items-center">
            <div className="dashboard-stack flex flex-col gap-12 py-12 px-8 w-full max-w-xl">
              {/* Dashboard Card 1: Student Portal */}
              <div className="bg-white border border-outline-variant/50 rounded-2xl shadow-xl overflow-hidden select-none">
                <div className="h-12 bg-slate-50 border-b border-outline-variant/30 px-6 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                  </div>
                  <div className="text-caption text-on-surface-variant font-medium">Student Portal — Alex Johnson</div>
                </div>
                <div className="p-8 flex gap-6">
                  <div className="w-1/3 space-y-4">
                    <div className="h-24 bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="w-full h-2 bg-primary/10 rounded-full mb-3"></div>
                      <div className="w-3/4 h-2 bg-primary/10 rounded-full"></div>
                    </div>
                    <div className="h-8 bg-primary/5 rounded-lg border border-primary/10"></div>
                    <div className="h-8 bg-slate-50 rounded-lg"></div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="h-40 bg-slate-50 rounded-xl border border-slate-100 relative">
                      <div className="absolute top-4 left-4 right-4 h-4 bg-white rounded"></div>
                      <div className="absolute top-12 left-4 w-1/2 h-4 bg-white rounded"></div>
                      <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                        <div className="h-12 flex-1 bg-primary rounded-lg"></div>
                        <div className="h-12 flex-1 bg-slate-200/50 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Card 2: Analytics Engine */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden select-none">
                <div className="h-12 bg-slate-800/50 border-b border-slate-800 px-6 flex items-center justify-between">
                  <div className="text-caption text-slate-400 uppercase tracking-widest font-bold">Talent Analytics Engine</div>
                  <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px] text-primary">bolt</span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="h-12 bg-slate-800 rounded-lg"></div>
                    <div className="h-12 bg-slate-800 rounded-lg"></div>
                    <div className="h-12 bg-slate-800 rounded-lg"></div>
                    <div className="h-12 bg-primary/80 rounded-lg"></div>
                  </div>
                  <div className="h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-xl border border-slate-800"></div>
                </div>
              </div>

              {/* Dashboard Card 3: Admin Console */}
              <div className="bg-white border border-outline-variant/50 rounded-2xl shadow-xl overflow-hidden select-none">
                <div className="h-12 bg-slate-50 px-6 flex items-center justify-between border-b border-outline-variant/30">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px]">security</span>
                    <span className="text-caption font-bold text-on-surface">Admin Master Terminal</span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="h-4 w-32 bg-slate-100 rounded"></div>
                    <div className="flex -space-x-3">
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-primary"></div>
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-12 bg-slate-50 rounded-lg border border-slate-100"></div>
                    <div className="h-12 bg-slate-50 rounded-lg border border-slate-100"></div>
                  </div>
                </div>
              </div>

              {/* Duplicate for loop */}
              <div className="bg-white border border-outline-variant/50 rounded-2xl shadow-xl overflow-hidden opacity-50 select-none">
                <div className="h-12 bg-slate-50 border-b border-outline-variant/30 px-6"></div>
                <div className="p-8 h-32"></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Component */}
      <footer className="bg-white border-t border-outline-variant/30">
        <div className="max-w-4xl mx-auto py-12 px-p-md flex flex-col items-center gap-6 text-center">
          <div className="font-headline-md text-headline-md text-primary font-bold">
            AlignNova
          </div>
          <div className="flex flex-wrap justify-center gap-8 mb-4">
            <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
            <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Terms &amp; Conditions</a>
            <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Contact</a>
          </div>
          <div className="font-caption text-caption text-on-surface-variant opacity-60">
            © 2026 AlignNova. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
