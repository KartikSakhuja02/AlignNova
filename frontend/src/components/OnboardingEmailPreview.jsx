import React, { useState } from 'react';
import logo from '../assets/logo.png';

export default function OnboardingEmailPreview({ visible, onClose }) {
  const [studentName, setStudentName] = useState('Kartik Sakhuja');

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm transition-all duration-300">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-[700px] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary to-primary-container px-6 py-4 flex items-center justify-between text-white shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[24px]">drafts</span>
            <div>
              <h2 className="font-headline-md text-headline-md font-bold leading-tight">Welcome Email Template</h2>
              <p className="text-[12px] text-primary-fixed-dim">Onboarding invitation sent to newly registered students</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 active:scale-95 transition-all outline-none"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Live Name Editor Control */}
        <div className="bg-surface-container-low px-6 py-3 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">edit</span>
            <label className="text-label-md font-bold text-on-surface-variant">Live Preview Name:</label>
          </div>
          <input 
            type="text" 
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Type student name..." 
            className="border border-outline-variant/60 rounded-lg px-3 py-1.5 text-body-md bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full sm:max-w-[240px] transition-all"
          />
        </div>

        {/* Mockup Email Body Container */}
        <div className="p-6 overflow-y-auto bg-slate-100 flex justify-center">
          {/* Main Email Card */}
          <div className="max-w-[580px] w-full bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200">
            
            {/* Header: Logo & Branding */}
            <div className="h-28 w-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
              <div className="flex items-center gap-3">
                <img 
                  alt="Alignova Logo" 
                  className="h-10 w-10 object-contain brightness-0 invert" 
                  src={logo}
                />
                <span className="font-headline-md text-[24px] font-extrabold tracking-tight text-white">Alignova</span>
              </div>
            </div>

            {/* Body Content */}
            <div className="p-8">
              <h1 className="font-headline-lg text-[24px] text-on-surface mb-6">
                Welcome to the Career Network, <span className="text-primary font-bold">{studentName || 'Student'}</span>!
              </h1>
              <p className="font-body-md text-on-surface-variant mb-6 leading-relaxed">
                Your executive account is now fully provisioned. You have been selected to join the Alignova placement ecosystem, where high-performance students meet industry-leading recruiters.
              </p>

              {/* Action Button */}
              <div className="flex justify-center my-8">
                <a 
                  className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-label-md text-[14px] font-semibold rounded-xl hover:scale-[1.01] active:scale-95 shadow-md hover:shadow-lg transition-all duration-200" 
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Join Now
                  <span className="material-symbols-outlined ml-2 text-[18px]">arrow_forward</span>
                </a>
              </div>

              {/* Steps Section */}
              <div className="mt-8 pt-8 border-t border-slate-100">
                <h2 className="font-headline-md text-[18px] text-on-surface mb-6">What happens next?</h2>
                <div className="space-y-6">
                  
                  {/* Step 1 */}
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-bold text-[14px] shadow-sm">
                      1
                    </div>
                    <div>
                      <h3 className="font-label-md text-[14px] font-bold text-on-surface mb-1">Set your password</h3>
                      <p className="text-[13px] text-on-surface-variant leading-relaxed">Secure your account by configuring your corporate credentials and MFA settings.</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-bold text-[14px] shadow-sm">
                      2
                    </div>
                    <div>
                      <h3 className="font-label-md text-[14px] font-bold text-on-surface mb-1">Complete your profile</h3>
                      <p className="text-[13px] text-on-surface-variant leading-relaxed">Upload your professional portfolio and academic transcripts for recruiter review.</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-bold text-[14px] shadow-sm">
                      3
                    </div>
                    <div>
                      <h3 className="font-label-md text-[14px] font-bold text-on-surface mb-1">Apply to drives</h3>
                      <p className="text-[13px] text-on-surface-variant leading-relaxed">Browse available executive placement drives and submit your applications directly.</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
              <div className="flex justify-center gap-6 mb-4">
                <a className="text-[12px] font-semibold text-primary hover:underline transition-all" href="#" onClick={(e) => e.preventDefault()}>Support</a>
                <a className="text-[12px] font-semibold text-primary hover:underline transition-all" href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                <a className="text-[12px] font-semibold text-primary hover:underline transition-all" href="#" onClick={(e) => e.preventDefault()}>Preference Center</a>
              </div>
              <p className="text-[11px] text-on-surface-variant mb-1">
                Sent by Alignova Placement Portal • Executive precision in career placement.
              </p>
              <p className="text-[11px] text-outline">
                © 2024 Alignova International. All rights reserved.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200/50 flex justify-center opacity-30">
                <img 
                  alt="Alignova Small Logo" 
                  className="h-6 w-6 grayscale filter" 
                  src={logo}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-surface-container px-6 py-4 flex items-center justify-end border-t border-outline-variant/30 flex-shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-primary text-on-primary text-label-md font-semibold rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-md"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
}
