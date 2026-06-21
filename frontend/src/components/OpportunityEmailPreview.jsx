import React, { useState } from 'react';
import logo from '../assets/logo.png';

export default function OpportunityEmailPreview({ visible, onClose }) {
  const [previewData, setPreviewData] = useState({
    studentName: 'Alex',
    studentCgpa: '8.41',
    minCgpa: '8.0',
    company: 'Goldman Sachs',
    role: 'Software Engineering Intern',
    division: 'Technology Division',
    location: 'Bengaluru, India',
    roleType: 'Summer Internship',
    packageOrStipend: '₹1,50,000 / month',
    deadline: 'Oct 24, 2023',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIbh98y2PTkOMyL2E2eluhl_6oFsbEkdv9wUdXndMDi-ta6-vauSUEGz2JBqgXCDm1dpNGMTtFNGgZDttuXK5JHkCdqu0w2lNlD-9ZxsD6SACDOuR2bDbgbFFQh43uulSA-lO3eAaqZKtriGQNNnwJAGCjUbllfv0md18Tj0vHC2X9Y7peW5ZyiZvyZaMzQK9987sAE27EBnXCN1teYp6xHmMKeeCpEf6VKol2zcmmoAoG4tAL3Rc0Vpl8oTPzFY6hxgyTO2fVnXM'
  });

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm transition-all duration-300">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-[700px] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary to-primary-container px-6 py-4 flex items-center justify-between text-white shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[24px]">campaign</span>
            <div>
              <h2 className="font-headline-md text-headline-md font-bold leading-tight">Opportunity Alert Preview</h2>
              <p className="text-[12px] text-primary-fixed-dim">Notification alert sent to students eligible for newly launched drives</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 active:scale-95 transition-all outline-none"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Live Controls */}
        <div className="bg-surface-container-low px-6 py-3 border-b border-outline-variant/30 grid grid-cols-1 sm:grid-cols-3 gap-3 flex-shrink-0 overflow-y-auto max-h-40">
          <div>
            <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Student Name:</label>
            <input 
              type="text" 
              value={previewData.studentName}
              onChange={(e) => setPreviewData({ ...previewData, studentName: e.target.value })}
              className="border border-outline-variant/60 rounded-lg px-2.5 py-1 text-caption bg-surface-container-lowest focus:outline-none focus:border-primary w-full"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Student CGPA:</label>
            <input 
              type="text" 
              value={previewData.studentCgpa}
              onChange={(e) => setPreviewData({ ...previewData, studentCgpa: e.target.value })}
              className="border border-outline-variant/60 rounded-lg px-2.5 py-1 text-caption bg-surface-container-lowest focus:outline-none focus:border-primary w-full"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Company Name:</label>
            <input 
              type="text" 
              value={previewData.company}
              onChange={(e) => setPreviewData({ ...previewData, company: e.target.value })}
              className="border border-outline-variant/60 rounded-lg px-2.5 py-1 text-caption bg-surface-container-lowest focus:outline-none focus:border-primary w-full"
            />
          </div>
        </div>

        {/* Mockup Email Container */}
        <div className="p-6 overflow-y-auto bg-slate-100 flex justify-center">
          <div className="max-w-[580px] w-full bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200">
            
            {/* Header: Logo & Branding */}
            <div className="bg-primary px-6 py-8 flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-6 -mt-6 blur-xl"></div>
              <div className="z-10 flex items-center gap-3">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                <span className="font-headline-md text-[24px] font-extrabold tracking-tight text-white">Alignova</span>
              </div>
            </div>

            {/* Main Body */}
            <div className="p-8 space-y-8">
              {/* Hero Announcement */}
              <div className="space-y-4">
                <p className="font-body-md text-body-md text-on-surface-variant">Hi {previewData.studentName},</p>
                <h2 className="font-headline-lg text-headline-lg text-primary leading-tight">You are eligible for a new placement drive</h2>
                
                {/* Company card */}
                <div className="p-5 bg-surface-container border border-outline-variant rounded-xl flex items-center gap-4 hover:shadow-md transition-all duration-300">
                  <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center shadow-sm p-2 overflow-hidden border border-outline-variant/30">
                    <img className="object-contain w-full h-full" src={previewData.logoUrl} alt="Logo" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-label-md text-[11px] text-secondary uppercase tracking-widest font-bold">New Opportunity</p>
                    <h3 className="font-headline-md text-[18px] text-on-surface mt-0.5 truncate">{previewData.role}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant truncate">{previewData.company} • {previewData.division}</p>
                  </div>
                </div>
              </div>

              {/* Why you're a fit */}
              <div className="bg-primary/5 p-5 rounded-xl border border-primary/10 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                  <h4 className="font-label-md text-label-md font-bold">Why you're a fit</h4>
                </div>
                <p className="font-body-md text-[14px] text-on-surface leading-relaxed">
                  Your academic performance and technical profile align with the eligibility criteria for this role. Specifically, your <strong className="font-bold">{previewData.studentCgpa} CGPA</strong> meets the minimum requirement of {previewData.minCgpa}.
                </p>
              </div>

              {/* Details Grid */}
              <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
                <div className="grid grid-cols-2 divide-x divide-y divide-outline-variant">
                  <div className="p-4">
                    <p className="font-caption text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">Location</p>
                    <p className="font-label-md text-label-md text-on-surface mt-0.5">{previewData.location}</p>
                  </div>
                  <div className="p-4 border-t-0">
                    <p className="font-caption text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">Role Type</p>
                    <p className="font-label-md text-label-md text-on-surface mt-0.5">{previewData.roleType}</p>
                  </div>
                  <div className="p-4 border-l-0">
                    <p className="font-caption text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">Package (Stipend)</p>
                    <p className="font-label-md text-label-md text-secondary font-bold mt-0.5">{previewData.packageOrStipend}</p>
                  </div>
                  <div className="p-4">
                    <p className="font-caption text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">Deadline</p>
                    <p className="font-label-md text-label-md text-error font-bold mt-0.5">{previewData.deadline}</p>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="flex flex-col items-center gap-3 pt-2">
                <button className="w-full bg-primary text-white font-label-md text-label-md py-3.5 rounded-full shadow-md hover:scale-[1.01] hover:shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2">
                  View Details & Apply
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
                <p className="font-caption text-caption text-on-surface-variant/80 text-center">
                  Applicants are reviewed on a rolling basis. Early applications are encouraged.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-6 text-center border-t border-slate-100 space-y-4">
              <div className="flex justify-center gap-6">
                <a className="text-[12px] font-semibold text-primary hover:underline" href="#" onClick={(e) => e.preventDefault()}>Dashboard</a>
                <a className="text-[12px] font-semibold text-primary hover:underline" href="#" onClick={(e) => e.preventDefault()}>Support</a>
                <a className="text-[12px] font-semibold text-primary hover:underline" href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
              </div>
              <div className="space-y-1">
                <p className="text-[12px] font-bold text-on-surface-variant">Sent by Alignova Placement Portal</p>
                <p className="text-[11px] text-outline max-w-xs mx-auto leading-relaxed">
                  This is an automated notification based on your profile preferences and eligibility. Manage your email preferences in your settings.
                </p>
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
