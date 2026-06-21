import React, { useState } from 'react';
import logo from '../assets/logo.png';

export default function PartnerEmailPreview({ visible, onClose }) {
  const [partnerName, setPartnerName] = useState('Alex Thorne');
  const [companyName, setCompanyName] = useState('Microsoft India');

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm transition-all duration-300">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-[850px] overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary to-primary-container px-6 py-4 flex items-center justify-between text-white shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[24px]">drafts</span>
            <div>
              <h2 className="font-headline-md text-headline-md font-bold leading-none">Partner Welcome Email Template</h2>
              <p className="text-[12px] text-primary-fixed-dim mt-1">Network invitation alert sent to newly registered corporate partners</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 active:scale-95 transition-all outline-none"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Live Preview Controls */}
        <div className="bg-surface-container-low px-6 py-3 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">edit</span>
            <label className="text-label-md font-bold text-on-surface-variant">Live Preview Config:</label>
          </div>
          <div className="flex flex-1 flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="Partner Name..." 
              className="border border-outline-variant/60 rounded-lg px-3 py-1.5 text-body-md bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full sm:max-w-[200px] transition-all"
            />
            <input 
              type="text" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company Name..." 
              className="border border-outline-variant/60 rounded-lg px-3 py-1.5 text-body-md bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full sm:max-w-[200px] transition-all"
            />
          </div>
        </div>

        {/* Gmail Client Mockup */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#f6f8fc] text-on-surface min-h-[400px]">
          {/* Mock Gmail Header */}
          <header className="flex items-center px-4 justify-between h-14 bg-[#f6f8fc] border-b border-gray-200/50 flex-shrink-0">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-200 rounded-full" onClick={(e) => e.preventDefault()}>
                <span className="material-symbols-outlined text-gray-600">menu</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-gray-700 tracking-tight flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-red-500 fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
                  Gmail
                </span>
              </div>
            </div>
            <div className="flex-1 max-w-xl px-6">
              <div className="relative flex items-center bg-blue-50/50 px-3 py-1.5 rounded-full border-none shadow-sm focus-within:bg-white focus-within:shadow-md transition-all">
                <span className="material-symbols-outlined text-gray-500 mr-2 text-[18px]">search</span>
                <input className="bg-transparent border-none focus:ring-0 w-full text-xs" placeholder="Search mail" type="text" readOnly value="subject:(Welcome to the Network)" />
                <span className="material-symbols-outlined text-gray-500 text-[18px]">tune</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-gray-200 rounded-full"><span className="material-symbols-outlined text-gray-600 text-[20px]">help_outline</span></button>
              <button className="p-1.5 hover:bg-gray-200 rounded-full"><span className="material-symbols-outlined text-gray-600 text-[20px]">settings</span></button>
              <button className="p-1.5 hover:bg-gray-200 rounded-full"><span className="material-symbols-outlined text-gray-600 text-[20px]">apps</span></button>
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs ml-1">A</div>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            {/* Mock Gmail Sidebar */}
            <aside className="w-56 hidden md:flex flex-col py-3 px-3 gap-1 flex-shrink-0 bg-[#f6f8fc] border-r border-gray-200/50">
              <button className="flex items-center gap-3 bg-white hover:shadow-md border border-gray-200/60 shadow-sm px-4 py-3 rounded-2xl w-fit mb-3 ml-1 transition-all">
                <span className="material-symbols-outlined text-gray-700">edit</span>
                <span className="text-sm font-medium pr-3">Compose</span>
              </button>
              <nav className="flex flex-col gap-0.5">
                <a className="flex items-center gap-3 px-4 py-1.5 bg-[#d3e3fd] rounded-full text-sm font-semibold text-gray-800" href="#" onClick={(e) => e.preventDefault()}>
                  <span className="material-symbols-outlined fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>inbox</span>
                  <span>Inbox</span>
                  <span className="ml-auto font-bold text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">1</span>
                </a>
                <a className="flex items-center gap-3 px-4 py-1.5 hover:bg-gray-200/60 rounded-full text-sm text-gray-600" href="#" onClick={(e) => e.preventDefault()}>
                  <span className="material-symbols-outlined">star</span>
                  <span>Starred</span>
                </a>
                <a className="flex items-center gap-3 px-4 py-1.5 hover:bg-gray-200/60 rounded-full text-sm text-gray-600" href="#" onClick={(e) => e.preventDefault()}>
                  <span className="material-symbols-outlined">schedule</span>
                  <span>Snoozed</span>
                </a>
                <a className="flex items-center gap-3 px-4 py-1.5 hover:bg-gray-200/60 rounded-full text-sm text-gray-600" href="#" onClick={(e) => e.preventDefault()}>
                  <span className="material-symbols-outlined">send</span>
                  <span>Sent</span>
                </a>
                <a className="flex items-center gap-3 px-4 py-1.5 hover:bg-gray-200/60 rounded-full text-sm text-gray-600" href="#" onClick={(e) => e.preventDefault()}>
                  <span className="material-symbols-outlined">drafts</span>
                  <span>Drafts</span>
                </a>
              </nav>
            </aside>

            {/* Email Pane */}
            <main className="flex-1 bg-white rounded-tl-2xl shadow-inner overflow-y-auto flex flex-col">
              {/* Toolbar */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-4 py-2 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-1">
                  <button className="p-1.5 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined text-gray-600 text-[18px]">arrow_back</span></button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-full ml-2"><span className="material-symbols-outlined text-gray-600 text-[18px]">archive</span></button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined text-gray-600 text-[18px]">report</span></button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined text-gray-600 text-[18px]">delete</span></button>
                  <div className="w-px h-4 bg-gray-200 mx-1.5"></div>
                  <button className="p-1.5 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined text-gray-600 text-[18px]">mark_as_unread</span></button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined text-gray-600 text-[18px]">schedule</span></button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined text-gray-600 text-[18px]">add_task</span></button>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 mr-2">1 of 1</span>
                  <button className="p-1.5 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined text-gray-600 text-[18px]">chevron_left</span></button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined text-gray-600 text-[18px]">chevron_right</span></button>
                </div>
              </div>

              {/* Email Content Wrapper */}
              <div className="p-4 md:p-6 flex-1 bg-white">
                <div className="max-w-[700px] mx-auto">
                  {/* Subject Header */}
                  <div className="flex items-start justify-between mb-6 pl-4 border-l-2 border-primary/20">
                    <h2 className="text-lg md:text-xl font-bold text-on-surface">Welcome to the Network - Action Required</h2>
                    <div className="flex items-center gap-1.5">
                      <button className="p-1 hover:bg-gray-100 rounded"><span className="material-symbols-outlined text-gray-500 text-[16px]">print</span></button>
                      <button className="p-1 hover:bg-gray-100 rounded"><span className="material-symbols-outlined text-gray-500 text-[16px]">open_in_new</span></button>
                    </div>
                  </div>

                  {/* Sender Info */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs md:text-sm">Alignnova Placement</span>
                        <span className="text-gray-500 text-[11px]">&lt;noreply@alignnova.com&gt;</span>
                      </div>
                      <div className="text-gray-500 text-[10px]">to me</div>
                    </div>
                    <div className="text-gray-500 text-[10px]">10:42 AM (3 hours ago)</div>
                  </div>

                  {/* Welcome Transactional Email */}
                  <div className="border border-outline-variant/30 rounded-2xl overflow-hidden bg-white shadow-sm">
                    {/* Brand Header */}
                    <header className="bg-primary px-5 py-4 flex items-center justify-between text-white">
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                          <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        </div>
                        <div>
                          <h1 className="font-bold text-title-md tracking-tight leading-none">Alignova</h1>
                          <p className="text-[10px] text-white/60 font-semibold uppercase tracking-widest mt-1">Institutional Partner</p>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-white/50 font-medium">
                        Placement Portal v2.4
                      </div>
                    </header>

                    {/* Hero */}
                    <div className="relative w-full py-8 px-6 bg-[#dee8ff] flex items-center border-b border-outline-variant/10">
                      <h2 className="font-headline-md text-[24px] text-on-surface">Welcome to the Network</h2>
                    </div>

                    {/* Main Body */}
                    <div className="p-6 space-y-6">
                      <div className="space-y-4">
                        <p className="font-bold text-body-md text-on-surface">Dear {partnerName},</p>
                        <p className="font-body-md text-on-surface-variant leading-relaxed">
                          We are pleased to inform you that an institutional account has been successfully provisioned for <strong>{companyName || 'your organization'}</strong> within the <span className="font-semibold text-primary">Alignova Placement Portal</span>. 
                        </p>
                        <p className="font-body-md text-on-surface-variant leading-relaxed">
                          As an official corporate partner, you now have priority access to our elite pool of student talent. This workspace is designed to streamline your end-to-end recruitment lifecycle.
                        </p>
                      </div>

                      {/* CTA */}
                      <div className="py-4 text-center">
                        <a 
                          className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-label-md text-[13px] font-semibold rounded-xl hover:scale-[1.01] active:scale-95 transition-all shadow-md duration-200" 
                          href="#"
                          onClick={(e) => e.preventDefault()}
                        >
                          Activate Account
                          <span className="material-symbols-outlined ml-2 text-[16px]">arrow_forward</span>
                        </a>
                        <p className="mt-3 text-[11px] text-outline">Link expires in 48 hours for security reasons.</p>
                      </div>

                      <hr className="border-outline-variant/30" />

                      {/* Getting Started Features */}
                      <div className="space-y-4">
                        <h3 className="font-bold text-body-md text-on-surface">Getting Started</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 bg-slate-50 border border-outline-variant/20 rounded-xl flex flex-col gap-2">
                            <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary text-[16px]">business</span>
                            </div>
                            <div>
                              <p className="font-bold text-xs text-on-surface">Profile Setup</p>
                              <p className="text-[11px] text-on-surface-variant mt-0.5">Complete your organization's brand identity.</p>
                            </div>
                          </div>
                          <div className="p-3 bg-slate-50 border border-outline-variant/20 rounded-xl flex flex-col gap-2">
                            <div className="w-7 h-7 bg-secondary/10 rounded-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-secondary text-[16px]">campaign</span>
                            </div>
                            <div>
                              <p className="font-bold text-xs text-on-surface">Launch Drives</p>
                              <p className="text-[11px] text-on-surface-variant mt-0.5">Initiate recruitment campaigns for Q3/Q4.</p>
                            </div>
                          </div>
                          <div className="p-3 bg-slate-50 border border-outline-variant/20 rounded-xl flex flex-col gap-2">
                            <div className="w-7 h-7 bg-tertiary/10 rounded-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-tertiary text-[16px]">dynamic_feed</span>
                            </div>
                            <div>
                              <p className="font-bold text-xs text-on-surface">Live Feeds</p>
                              <p className="text-[11px] text-on-surface-variant mt-0.5">Review applicant data in real-time streams.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Image Banner */}
                      <div className="rounded-xl overflow-hidden h-28 border border-outline-variant/10">
                        <img 
                          alt="Office Lounge" 
                          className="w-full h-full object-cover" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0rTXzfrIpO6Ee40Pm-7lDnsJ43mAUb7MmU3ti_1K7f0QYi5tMtfjb83ZgLpEZG7jzP68x-oNFWjCAfrTEpj0XMggnsDBqOxIND9lxmtPLu7pU1m1pM6RswXFB4196GYSTbYpgXORufIoNX-QD3W4hCoTuV4AliPtNuo9vvRs41AoNAVEZmjMZ3oKsdVLldghnNiIRHUK_kW5EoLTxUxrZ8uu8rW0AkVXVNyWpG1DPS2eJ5NzTX-4lqZHIsOF8w-ZtA4Q_H4OVeeE" 
                        />
                      </div>
                    </div>

                    {/* Welcome Email Footer */}
                    <footer className="bg-slate-50 p-5 border-t border-slate-100">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <p className="font-bold text-xs text-on-surface">Alignnova Placement Office</p>
                          <p className="text-[11px] text-on-surface-variant">Institutional Building, South Wing, Level 4</p>
                        </div>
                        <div className="flex gap-4">
                          <a className="text-[11px] font-bold text-primary hover:underline" href="#" onClick={(e) => e.preventDefault()}>Support</a>
                          <a className="text-[11px] font-bold text-primary hover:underline" href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
                        </div>
                      </div>
                    </footer>
                  </div>

                  {/* Mail Actions */}
                  <div className="mt-6 flex gap-3 pb-8">
                    <button className="px-5 py-1.5 border border-gray-300 rounded-full flex items-center gap-1.5 hover:bg-gray-50 text-xs text-gray-600 transition-colors">
                      <span className="material-symbols-outlined text-[16px]">reply</span> Reply
                    </button>
                    <button className="px-5 py-1.5 border border-gray-300 rounded-full flex items-center gap-1.5 hover:bg-gray-50 text-xs text-gray-600 transition-colors">
                      <span className="material-symbols-outlined text-[16px]">forward</span> Forward
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Modal Controls */}
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
