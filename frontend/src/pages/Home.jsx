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

  return (
    <div className="bg-background text-on-background font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-surface-container-high shadow-sm transition-all duration-200 cubic-bezier(0.4, 0, 0.2, 1) bg-surface/80">
        <div className="max-w-container-max mx-auto px-margin-page h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
            <img alt="AlignNova Logo" className="h-10 w-10 object-contain rounded-md" src={logo} />
            <span className="font-display-lg text-[24px] font-black tracking-tighter text-primary">AlignNova</span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-body-md text-body-md">
            <a 
              className="text-on-surface-variant hover:text-primary transition-colors duration-200 hover:scale-[1.01]" 
              href="#network" 
              onClick={(e) => { e.preventDefault(); navigate('/opportunities'); }}
            >
              Network
            </a>
            <a 
              className="text-on-surface-variant hover:text-primary transition-colors duration-200 hover:scale-[1.01]" 
              href="#internships"
              onClick={(e) => { e.preventDefault(); navigate('/opportunities'); }}
            >
              Internships
            </a>
            <a 
              className="text-on-surface-variant hover:text-primary transition-colors duration-200 hover:scale-[1.01]" 
              href="#students"
              onClick={(e) => { e.preventDefault(); handleAction(); }}
            >
              Students
            </a>
            <a 
              className="text-on-surface-variant hover:text-primary transition-colors duration-200 hover:scale-[1.01]" 
              href="#recruiters"
              onClick={(e) => { e.preventDefault(); navigate('/signin'); }}
            >
              Recruiters
            </a>
          </div>

          <div className="flex items-center gap-4 font-body-md text-body-md">
            {isAuthenticated ? (
              <button 
                onClick={handleAction}
                className="bg-primary-container text-on-primary px-6 py-2 rounded-lg font-semibold hover:scale-[1.01] shadow-sm hover:shadow-md transition-all duration-200"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/signin')}
                  className="text-primary font-semibold hover:scale-[1.01] transition-transform duration-200"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/signin')}
                  className="bg-primary-container text-on-primary px-6 py-2 rounded-lg font-semibold hover:scale-[1.01] shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-24 pb-16 flex flex-col gap-20 max-w-container-max mx-auto px-margin-page w-full">
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-12 mt-12">
          {/* Hero Text */}
          <div className="flex-1 flex flex-col gap-6 items-start">
            <div className="inline-flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full border border-surface-container-high text-primary font-label-md text-label-md">
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              New Platform Launch v2.0
            </div>
            
            <h1 className="font-display-lg text-display-lg md:text-[64px] leading-tight text-on-surface max-w-2xl">
              The Future of{' '}
              <span className="text-primary relative inline-block">
                Elite Placements
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-secondary-container" preserveAspectRatio="none" viewBox="0 0 100 10">
                  <path d="M0 5 Q 50 10 100 0" fill="none" stroke="currentColor" strokeWidth="4"></path>
                </svg>
              </span>
            </h1>

            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              A highly sophisticated placement ecosystem designed to connect top-tier academic institutions with premium global recruiters through intelligent matching algorithms.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button 
                onClick={handleAction}
                className="bg-primary-container text-on-primary px-8 py-3 rounded-lg font-label-md text-label-md hover:scale-[1.01] shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              
              <button 
                onClick={() => navigate('/opportunities')}
                className="border-2 border-outline-variant text-on-surface px-8 py-3 rounded-lg font-label-md text-label-md hover:border-primary hover:text-primary hover:bg-surface-container-low transition-all duration-200"
              >
                Explore Network
              </button>
            </div>

            <div className="flex items-center gap-4 mt-8 text-on-surface-variant font-caption text-caption">
              <div className="flex -space-x-2">
                <img 
                  className="w-8 h-8 rounded-full border-2 border-surface object-cover" 
                  alt="Corporate Executive"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3Kq_cltlg1xQ6BAOuYnFq1wJUy7Nj0fijOQHe8Z8QysvPWualEw2KW6-PglOSDTos2T166qcCmjRICliBbnQE936GFfF6GD4WsRc0O4-nIDN-QxNGB61a7KS0QRbsCBUVI61iPkb07upGK1ervX4KIroPuZi1SqJnh-jN-aqzrx2Vaq-3c3Lc6-4eyiskH-ABYJKEjmDBPlrdouje_fWctlg-zm0NhkFlTtpUSTF6cAnc-WbTmIuH" 
                />
                <img 
                  className="w-8 h-8 rounded-full border-2 border-surface object-cover" 
                  alt="Tech Recruiter"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-OGSu92D81fHIM3qFaRT8E-e-2rDv5db84YDmNXB0apqbzzV_lSdc_gDqTZAAXc8Wg4lBBL8tFYgObLFeTsoLhPITeo5aEuF9wM4A_exYecd0scWCqKXtJQEOS1K5a0kBilb5JOtWb5nrJeJ6gxS-bxJ0b73Y_gnghxZxwoyVlpK7bLgLMYMBjdf41Wnfv-IJsj8qQCjQLizm4bvhfqFNdR8AqOuhHTDJApUdtcR4HX41FIbi4h3T" 
                />
                <img 
                  className="w-8 h-8 rounded-full border-2 border-surface object-cover" 
                  alt="Academic Advisor"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbw-q6h-kLhTNvwb4ijWZRByccNZVNBiERmJakj4oeNmDYIFv3yj81pmQp77GJOmNcirAosFNR3CTi6t3c7O6HMdb1GbjVw3-dOZrhkxcWB4wzR3hmVljL9VhcliAI0X-LVaOsF_I2c8K2NjMtHnFRNJpEKkpYoI9oDJRbTxQk4LY3Jt2wfiDdyp71gNeMr4aRRF94JsEhW9flxKCLMZZHCc_7Q5OuqyBUbtHIkn9_YwqgRx8Mp_ez" 
                />
              </div>
              <p>Trusted by 500+ elite recruiters globally.</p>
            </div>
          </div>

          {/* Hero 3D Card Visual */}
          <div className="flex-1 w-full flex justify-end relative perspective-[1000px]">
            <div className="relative w-full max-w-md bg-surface rounded-2xl border border-surface-container-high shadow-[0_20px_25px_-5px_rgba(0,0,0,0.04),0_8px_10px_-6px_rgba(0,0,0,0.04)] overflow-hidden transform md:rotate-y-[-10deg] md:rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 ease-out p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-surface-container-high pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                  </div>
                  <div>
                    <h3 className="font-label-md text-label-md text-on-surface">Match Probability</h3>
                    <p className="font-caption text-caption text-on-surface-variant">Live Algorithm active</p>
                  </div>
                </div>
                <span className="bg-secondary-container/20 text-on-secondary-container px-2 py-1 rounded-md font-caption text-[10px] uppercase font-bold tracking-wider">
                  98% Match
                </span>
              </div>

              <div className="flex-grow flex flex-col justify-center gap-3">
                <div className="flex flex-col gap-4">
                  {/* Talent Distribution */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-label-md text-caption text-on-surface-variant uppercase tracking-wider">Talent Distribution</span>
                      <span className="material-symbols-outlined text-primary text-[16px]">insights</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-semibold text-on-surface-variant">
                          <span>Technical Skills</span>
                          <span>92%</span>
                        </div>
                        <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                          <div className="bg-primary-container h-full w-[92%] rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-semibold text-on-surface-variant">
                          <span>Soft Skills</span>
                          <span>88%</span>
                        </div>
                        <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                          <div className="bg-secondary-container h-full w-[88%] rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-semibold text-on-surface-variant">
                          <span>Domain Expertise</span>
                          <span>75%</span>
                        </div>
                        <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                          <div className="bg-tertiary-container h-full w-[75%] rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Placement Velocity */}
                  <div className="pt-2 border-t border-surface-container-high">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="font-label-md text-caption text-on-surface-variant uppercase tracking-wider">Placement Velocity</p>
                        <p className="text-headline-md font-bold text-on-surface">+24.8%</p>
                      </div>
                      <div className="flex items-end gap-1 h-8 pb-1">
                        <div className="w-1.5 bg-primary-container/20 h-3 rounded-full"></div>
                        <div className="w-1.5 bg-primary-container/40 h-5 rounded-full"></div>
                        <div className="w-1.5 bg-primary-container/60 h-4 rounded-full"></div>
                        <div className="w-1.5 bg-primary-container/80 h-6 rounded-full"></div>
                        <div className="w-1.5 bg-primary-container h-8 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto bg-surface-container-low p-4 rounded-xl border border-surface-container-high">
                <div className="flex items-center gap-3">
                  <img 
                    className="w-8 h-8 rounded-full" 
                    alt="Sarah Jenkins Avatar" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVtDtHyvRh5hSD9yZujMbYbkZRypTmGqpY5-Mu0LkdGtc0HYqlaIV-wZjQuRDkAKS72tEd0G4vDk-1kiBKJ_rSo6k-izidR_q83rMyWjdWmXAgxwaTKavBm2eveSRnMIIfpA3vrCrcwXtixi-U-_u3Ff50o1-fTrSLJwjKwtBDz2B3C7V7y4NcUzzYKJeRbiB4-pqskoc7YQdDuPP5127wo7ZNLPvWCkz67RNENfjmSQT9YD2mbTBL" 
                  />
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Sarah Jenkins</p>
                    <p className="font-caption text-caption text-on-surface-variant">Matched with TechNova Corp</p>
                  </div>
                  <button className="ml-auto text-primary hover:bg-surface-container-high p-1 rounded-md transition-colors">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Decorative Blur behind card */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary-container/20 blur-[100px] rounded-full"></div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-p-xl bg-surface border-t border-surface-container-high mt-auto">
        <div className="max-w-container-max mx-auto px-margin-page flex flex-col md:flex-row justify-between items-center gap-gutter">
          <div className="flex items-center gap-3">
            <span className="font-headline-md text-headline-md font-bold text-on-surface">AlignNova</span>
            <span className="font-caption text-caption text-on-surface-variant ml-4 border-l border-surface-container-high pl-4">
              © 2026 AlignNova Placement Network. All rights reserved.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-6 font-caption text-caption">
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200" href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200" href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200" href="#" onClick={(e) => e.preventDefault()}>Cookie Policy</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200" href="#" onClick={(e) => e.preventDefault()}>Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
