import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Notifications');
  
  // Notification Preferences State
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    sms: false,
  });

  // Password / Security Form State
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [securityMsg, setSecurityMsg] = useState({ type: '', text: '' });

  // General Preferences State
  const [generalForm, setGeneralForm] = useState({
    theme: 'light',
    language: 'en',
    pageSize: '10',
  });
  const [generalSaved, setGeneralSaved] = useState(false);

  // Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: true,
    indexSearch: false,
    showEmail: true,
  });
  const [privacySaved, setPrivacySaved] = useState(false);

  // Refresh Timeline Loading state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Glowing micro-interaction state
  const [glowPos, setGlowPos] = useState({ x: 6.9, y: 11.4 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setGlowPos({
      x: (x - rect.width / 2) / 20,
      y: (y - rect.height / 2) / 20,
    });
  };

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const togglePreference = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePrivacy = (key) => {
    setPrivacySettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    if (!securityForm.currentPassword || !securityForm.newPassword || !securityForm.confirmPassword) {
      setSecurityMsg({ type: 'error', text: 'All fields are required.' });
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setSecurityMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setSecurityMsg({ type: 'success', text: 'Password updated successfully!' });
    setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSecurityMsg({ type: '', text: '' }), 3000);
  };

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    setGeneralSaved(true);
    setTimeout(() => setGeneralSaved(false), 2500);
  };

  const handlePrivacySubmit = (e) => {
    e.preventDefault();
    setPrivacySaved(true);
    setTimeout(() => setPrivacySaved(false), 2500);
  };

  return (
    <div
      className="p-p-lg min-h-screen"
      style={{
        background:
          'radial-gradient(at 0% 0%, rgba(79,70,229,0.03) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(0,108,73,0.03) 0px, transparent 50%)',
      }}
    >
      <div className="max-w-[1200px] mx-auto pb-24 space-y-8">
        {/* Settings Tabs */}
        <div className="flex gap-8 border-b border-outline-variant mb-8 overflow-x-auto whitespace-nowrap">
          {['General', 'Security', 'Notifications', 'Privacy'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 font-semibold text-label-md transition-all ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary opacity-80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ─── TAB: NOTIFICATIONS ─── */}
        {activeTab === 'Notifications' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter animate-fadeIn">
            {/* Preferences Column */}
            <div className="lg:col-span-4 space-y-6 animate-slideIn">
              <div className="bg-white p-p-lg rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-body-lg text-on-surface mb-2">Notification Preferences</h3>
                <p className="text-on-surface-variant text-caption mb-6">
                  Configure how you receive updates about placement drives and application status.
                </p>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer">
                    <span className="font-semibold text-label-md text-on-surface">Email Notifications</span>
                    <input
                      checked={preferences.email}
                      onChange={() => togglePreference('email')}
                      className="w-10 h-5 rounded-full bg-outline-variant text-primary focus:ring-primary transition-all cursor-pointer accent-primary"
                      type="checkbox"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer">
                    <span className="font-semibold text-label-md text-on-surface">Push Alerts</span>
                    <input
                      checked={preferences.push}
                      onChange={() => togglePreference('push')}
                      className="w-10 h-5 rounded-full bg-outline-variant text-primary focus:ring-primary transition-all cursor-pointer accent-primary"
                      type="checkbox"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer">
                    <span className="font-semibold text-label-md text-on-surface">SMS Summaries</span>
                    <input
                      checked={preferences.sms}
                      onChange={() => togglePreference('sms')}
                      className="w-10 h-5 rounded-full bg-outline-variant text-primary focus:ring-primary transition-all cursor-pointer accent-primary"
                      type="checkbox"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Empty State Canvas */}
            <div className="lg:col-span-8 animate-slideIn" style={{ animationDelay: '100ms' }}>
              <div
                onMouseMove={handleMouseMove}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col items-center justify-center min-h-[500px] p-p-xl relative overflow-hidden"
              >
                {/* Atmospheric micro-interaction: Subtle drifting particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                  <div
                    className="absolute w-24 h-24 rounded-full bg-primary/10 blur-3xl -top-10 -right-10 transition-transform duration-200"
                    style={{ transform: `translate(${glowPos.x}px, ${glowPos.y}px)` }}
                  ></div>
                  <div className="absolute w-48 h-48 rounded-full bg-secondary/10 blur-3xl -bottom-20 -left-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                {/* Empty State Illustration */}
                <div className="relative mb-8 group">
                  <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                    <span
                      className="material-symbols-outlined text-outline-variant text-[48px] animate-bounce"
                      style={{ animationDuration: '3s' }}
                    >
                      notifications_off
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 bg-white p-1 rounded-full border border-slate-100">
                    <span className="material-symbols-outlined text-primary text-sm font-bold">do_not_disturb_on</span>
                  </div>
                </div>

                <h3 className="font-bold text-headline-lg text-on-surface mb-3 text-center">No Notifications Yet</h3>
                <p className="text-on-surface-variant text-body-md text-center max-w-sm mb-10">
                  Your activity stream is currently clear. Once you start applying for drives or receive recruiter updates, they’ll appear right here.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 z-10">
                  <button
                    onClick={() => navigate('/drives')}
                    className="px-8 py-3 bg-primary text-on-primary font-semibold text-label-md rounded-xl hover:scale-[1.01] transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">explore</span>
                    Browse Career Drives
                  </button>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="px-8 py-3 border border-outline-variant text-on-surface-variant font-semibold text-label-md rounded-xl hover:bg-surface-container-low transition-all duration-200 flex items-center justify-center gap-2 min-w-[170px] disabled:opacity-60"
                  >
                    {isRefreshing ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
                        Checking...
                      </>
                    ) : (
                      'Refresh Timeline'
                    )}
                  </button>
                </div>

                {/* Status Indicator Badge */}
                <div className="mt-16 py-2 px-4 bg-primary/5 rounded-full border border-primary/10 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-primary animate-ping' : 'bg-secondary'}`}></span>
                  <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">
                    {isRefreshing ? 'Checking Gateway' : 'All systems operational'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: GENERAL ─── */}
        {activeTab === 'General' && (
          <div className="max-w-[700px] bg-white p-p-lg border border-slate-100 rounded-2xl shadow-sm animate-fadeIn">
            <h3 className="font-bold text-body-lg text-on-surface mb-2">General Settings</h3>
            <p className="text-on-surface-variant text-caption mb-6">
              Update configuration preferences for your web client experience.
            </p>
            <form onSubmit={handleGeneralSubmit} className="space-y-6">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-2">Interface Theme</label>
                <select
                  value={generalForm.theme}
                  onChange={(e) => setGeneralForm((p) => ({ ...p, theme: e.target.value }))}
                  className="w-full h-12 px-4 border border-outline-variant rounded-xl bg-transparent outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-body-md text-on-surface"
                >
                  <option value="light">Light Mode (Default)</option>
                  <option value="dark">Dark Mode (Experimental)</option>
                </select>
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-2">Primary Language</label>
                <select
                  value={generalForm.language}
                  onChange={(e) => setGeneralForm((p) => ({ ...p, language: e.target.value }))}
                  className="w-full h-12 px-4 border border-outline-variant rounded-xl bg-transparent outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-body-md text-on-surface"
                >
                  <option value="en">English (US)</option>
                  <option value="es">Spanish (Español)</option>
                  <option value="de">German (Deutsch)</option>
                </select>
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-2">Page Size (Records per View)</label>
                <select
                  value={generalForm.pageSize}
                  onChange={(e) => setGeneralForm((p) => ({ ...p, pageSize: e.target.value }))}
                  className="w-full h-12 px-4 border border-outline-variant rounded-xl bg-transparent outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-body-md text-on-surface"
                >
                  <option value="10">10 items</option>
                  <option value="25">25 items</option>
                  <option value="50">50 items</option>
                </select>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="px-8 py-3 bg-primary text-on-primary font-semibold text-label-md rounded-xl hover:shadow-lg transition-all"
                >
                  Save Preferences
                </button>
                {generalSaved && (
                  <span className="text-secondary text-label-md flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
                    Saved!
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ─── TAB: SECURITY ─── */}
        {activeTab === 'Security' && (
          <div className="max-w-[700px] bg-white p-p-lg border border-slate-100 rounded-2xl shadow-sm animate-fadeIn">
            <h3 className="font-bold text-body-lg text-on-surface mb-2">Change Password</h3>
            <p className="text-on-surface-variant text-caption mb-6">
              Ensure your account is protected by setting a strong credential combination.
            </p>
            <form onSubmit={handleSecuritySubmit} className="space-y-6">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-2">Current Password</label>
                <input
                  type="password"
                  value={securityForm.currentPassword}
                  onChange={(e) => setSecurityForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  className="w-full h-12 px-4 border border-outline-variant rounded-xl bg-transparent outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-body-md text-on-surface"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-2">New Password</label>
                <input
                  type="password"
                  value={securityForm.newPassword}
                  onChange={(e) => setSecurityForm((p) => ({ ...p, newPassword: e.target.value }))}
                  className="w-full h-12 px-4 border border-outline-variant rounded-xl bg-transparent outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-body-md text-on-surface"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={securityForm.confirmPassword}
                  onChange={(e) => setSecurityForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className="w-full h-12 px-4 border border-outline-variant rounded-xl bg-transparent outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-body-md text-on-surface"
                  placeholder="Confirm new password"
                />
              </div>

              {securityMsg.text && (
                <div
                  className={`p-3 rounded-lg text-label-md ${
                    securityMsg.type === 'error'
                      ? 'bg-error-container text-on-error-container'
                      : 'bg-secondary-container text-on-secondary-container'
                  }`}
                >
                  {securityMsg.text}
                </div>
              )}

              <button
                type="submit"
                className="px-8 py-3 bg-primary text-on-primary font-semibold text-label-md rounded-xl hover:shadow-lg transition-all"
              >
                Update Password
              </button>
            </form>
          </div>
        )}

        {/* ─── TAB: PRIVACY ─── */}
        {activeTab === 'Privacy' && (
          <div className="max-w-[700px] bg-white p-p-lg border border-slate-100 rounded-2xl shadow-sm animate-fadeIn">
            <h3 className="font-bold text-body-lg text-on-surface mb-2">Privacy & Visibility</h3>
            <p className="text-on-surface-variant text-caption mb-6">
              Control how much of your credentials and dashboard data is shared with partner recruiters.
            </p>
            <form onSubmit={handlePrivacySubmit} className="space-y-6">
              <div className="space-y-4">
                <label className="flex items-start justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer">
                  <div className="flex-1 pr-4">
                    <p className="font-semibold text-label-md text-on-surface">Public Placement Profile</p>
                    <p className="text-[12px] text-on-surface-variant">Allow verified hiring managers to find your resume on search dashboards.</p>
                  </div>
                  <input
                    checked={privacySettings.profilePublic}
                    onChange={() => togglePrivacy('profilePublic')}
                    className="w-10 h-5 rounded-full bg-outline-variant text-primary focus:ring-primary transition-all cursor-pointer accent-primary"
                    type="checkbox"
                  />
                </label>

                <label className="flex items-start justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer">
                  <div className="flex-1 pr-4">
                    <p className="font-semibold text-label-md text-on-surface">Allow Search Indexing</p>
                    <p className="text-[12px] text-on-surface-variant">Recommend your profile metrics to automated matching bots.</p>
                  </div>
                  <input
                    checked={privacySettings.indexSearch}
                    onChange={() => togglePrivacy('indexSearch')}
                    className="w-10 h-5 rounded-full bg-outline-variant text-primary focus:ring-primary transition-all cursor-pointer accent-primary"
                    type="checkbox"
                  />
                </label>

                <label className="flex items-start justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer">
                  <div className="flex-1 pr-4">
                    <p className="font-semibold text-label-md text-on-surface">Show Contact Email</p>
                    <p className="text-[12px] text-on-surface-variant">Display your phone and academic email directly on applications.</p>
                  </div>
                  <input
                    checked={privacySettings.showEmail}
                    onChange={() => togglePrivacy('showEmail')}
                    className="w-10 h-5 rounded-full bg-outline-variant text-primary focus:ring-primary transition-all cursor-pointer accent-primary"
                    type="checkbox"
                  />
                </label>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="px-8 py-3 bg-primary text-on-primary font-semibold text-label-md rounded-xl hover:shadow-lg transition-all"
                >
                  Save Privacy Settings
                </button>
                {privacySaved && (
                  <span className="text-secondary text-label-md flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
                    Saved!
                  </span>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
