import React, { useState, useRef, useEffect, useCallback } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import OnboardingEmailPreview from '../components/OnboardingEmailPreview';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { COURSE_OPTIONS } from '../utils/constants';


// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, iconColor, iconBg, trend, label, value, sub, subColor }) {
  return (
    <div className="bg-surface-container-lowest p-p-md rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl transition-colors ${iconBg}`}>
          <span
            className={`material-symbols-outlined ${iconColor}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
        {trend && (
          <span className="text-secondary font-bold text-label-md flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_up</span>
            {trend}
          </span>
        )}
      </div>
      <p className="text-on-surface-variant text-label-md">{label}</p>
      <h3 className="text-[48px] font-extrabold text-on-surface leading-tight mt-1">{value}</h3>
      <p className={`text-caption mt-2 ${subColor}`}>{sub}</p>
    </div>
  );
}

// ─── Success Modal ────────────────────────────────────────────────────────────

function SuccessModal({ visible, companyName, onClose }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm transition-all duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`bg-white rounded-2xl p-p-lg max-w-md w-full shadow-2xl transform transition-all duration-300 ${
          visible ? 'scale-100' : 'scale-95'
        }`}
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-secondary-container text-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: '48px' }}
            >
              check_circle
            </span>
          </div>
          <h3 className="text-headline-md font-bold text-on-surface mb-2">
            Drive Launched Successfully!
          </h3>
          <p className="text-body-md text-on-surface-variant mb-8">
            The recruitment drive for <strong>{companyName || 'the company'}</strong> has been
            posted. Eligible students will be notified instantly.
          </p>
          <button
            onClick={onClose}
            className="w-full py-4 bg-primary text-on-primary font-bold rounded-xl active:scale-95 transition-transform"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Admin Profile Modal ─────────────────────────────────────────────────

function AdminSettingsView({ profile, token, onSaved }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    headline: '',
    profile_image: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        headline: profile.headline || '',
        profile_image: profile.profile_image || '',
      });
      setError('');
      setSuccess(false);
    }
  }, [profile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800;
        let { width, height } = img;
        if (width > height) {
          if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.75);
        setForm((prev) => ({ ...prev, profile_image: compressed }));
      };
    };
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || 'Failed to save profile');
      }
      const updated = await res.json();
      onSaved(updated);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden max-w-4xl">
      <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 flex items-center gap-3">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>manage_accounts</span>
        </div>
        <h2 className="text-white font-bold text-title-lg">Account Settings</h2>
      </div>

      <form onSubmit={handleSave} className="p-6 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 border-b border-outline-variant/60 pb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-primary/20 overflow-hidden bg-surface-container">
              {form.profile_image ? (
                <img src={form.profile_image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-container text-primary text-[36px] font-bold">
                  {form.full_name ? form.full_name[0].toUpperCase() : 'A'}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>photo_camera</span>
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {form.profile_image && (
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, profile_image: '' }))}
              className="text-caption text-error hover:underline"
            >
              Remove photo
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-error-container rounded-xl text-on-error-container text-label-md">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-label-md">
            <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: '18px' }}>check_circle</span>
            Profile updated successfully!
          </div>
        )}

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'Your name' },
            { label: 'Email Address', key: 'email', type: 'email', placeholder: 'your@email.com' },
            { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+91 xxxxxxxxxx' },
            { label: 'Title / Designation', key: 'headline', type: 'text', placeholder: 'e.g. Chief Placement Officer' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-label-md text-on-surface font-semibold">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                required
                className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-outline-variant/60">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-primary text-on-primary text-label-md font-semibold rounded-xl hover:scale-[1.02] active:scale-95 shadow-md transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {saving && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function RecruitersView() {
  const partners = [
    { name: 'Google India', sector: 'Technology', status: 'Active Partner', drives: 4, logo: 'G', color: 'bg-blue-500 text-white' },
    { name: 'Microsoft India', sector: 'Software & Cloud', status: 'Active Partner', drives: 6, logo: 'M', color: 'bg-red-500 text-white' },
    { name: 'Omniscient Software', sector: 'Enterprise Dev', status: 'Active Partner', drives: 2, logo: 'O', color: 'bg-purple-600 text-white' },
    { name: 'Amazon Dev Center', sector: 'E-commerce & AI', status: 'Active Partner', drives: 3, logo: 'A', color: 'bg-amber-600 text-white' },
    { name: 'Infosys', sector: 'IT Services', status: 'Active Partner', drives: 8, logo: 'I', color: 'bg-indigo-600 text-white' },
    { name: 'TCS Research', sector: 'Consulting', status: 'Pending Review', drives: 0, logo: 'T', color: 'bg-teal-600 text-white' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface">Corporate Partners</h2>
          <p className="text-body-md text-on-surface-variant">Manage relationships with placement & internship recruiters</p>
        </div>
        <button className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-label-md font-semibold hover:scale-[1.02] active:scale-95 transition-all shadow-sm flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          Add Recruiter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {partners.map((partner) => (
          <div key={partner.name} className="bg-white rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-title-lg shadow-inner ${partner.color}`}>
                  {partner.logo}
                </div>
                <div>
                  <h3 className="font-bold text-on-surface text-body-lg group-hover:text-primary transition-colors">{partner.name}</h3>
                  <p className="text-caption text-on-surface-variant">{partner.sector}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-caption font-bold border ${
                partner.status === 'Active Partner' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                {partner.status}
              </span>
            </div>
            
            <div className="mt-6 pt-4 border-t border-outline-variant flex items-center justify-between text-caption text-outline">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>campaign</span>
                {partner.drives} Drives launched
              </span>
              <button className="text-primary hover:underline font-semibold flex items-center gap-0.5">
                Manage
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpportunitiesView({ drives, loadingDrives, onEditDrive, onDeleteDrive, driveSearch, setDriveSearch }) {
  const filteredDrives = drives.filter((d) => {
    const q = driveSearch.toLowerCase();
    if (!q) return true;
    return (
      (d.company || '').toLowerCase().includes(q) ||
      (d.role || '').toLowerCase().includes(q) ||
      (d.type || '').toLowerCase().includes(q)
    );
  });

  return (
    <section className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
      <div className="p-p-lg border-b border-outline-variant">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-headline-md font-bold text-on-surface">Opportunities Management</h2>
            <p className="text-body-md text-on-surface-variant">
              {loadingDrives ? 'Loading...' : `${filteredDrives.length} of ${drives.length} active placement/internship drives`}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '20px' }}>search</span>
          <input
            type="text"
            value={driveSearch}
            onChange={(e) => setDriveSearch(e.target.value)}
            placeholder="Search by company, role or drive type..."
            className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface placeholder:text-outline/60"
          />
          {driveSearch && (
            <button
              onClick={() => setDriveSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low">
            <tr>
              {['Company', 'Job Role', 'Type', 'Min CGPA', 'Package / Stipend', 'Date', 'Actions'].map((h, i) => (
                <th key={h} className={`px-6 py-4 text-label-md text-outline font-bold uppercase tracking-wider ${i === 6 ? 'text-right' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {loadingDrives ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <svg className="animate-spin h-8 w-8 text-primary mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </td>
              </tr>
            ) : filteredDrives.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-outline text-body-md">
                  {driveSearch ? `No drives match "${driveSearch}"` : 'No placement drives launched yet.'}
                </td>
              </tr>
            ) : (
              filteredDrives.map((d) => {
                const driveDateStr = d.drive_date
                  ? new Date(d.drive_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—';
                return (
                  <tr
                    key={d.id}
                    className="hover:bg-surface-container-lowest transition-all"
                    style={{ transition: 'background 0.15s, transform 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(4px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
                  >
                    <td className="px-6 py-5 text-body-md font-bold text-on-surface">{d.company}</td>
                    <td className="px-6 py-5 text-body-md text-on-surface-variant">{d.role}</td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-1 bg-secondary-container/20 text-secondary text-caption font-semibold rounded-lg">
                        {d.type || 'Full-Time'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-body-md text-on-surface-variant">{d.eligibility ? `${d.eligibility} CGPA` : 'Open'}</td>
                    <td className="px-6 py-5 text-body-md text-on-surface-variant font-medium">
                      {d.type === 'Internship' ? (
                        <span>{d.stipend ? `₹${d.stipend} / month` : '—'}</span>
                      ) : d.type === 'Internship + PPO' ? (
                        <span>
                          {d.stipend ? `₹${d.stipend} / month` : '—'} + {d.package ? `₹${d.package} LPA PPO` : '—'}
                        </span>
                      ) : (
                        <span>{d.package ? `₹${d.package} LPA` : '—'}</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-caption text-outline">{driveDateStr}</td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => onEditDrive(d)}
                        className="p-2 hover:bg-surface-container-high rounded-lg text-outline transition-colors"
                        title="Edit drive"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteDrive(d)}
                        className="p-2 hover:bg-error-container/30 rounded-lg text-error transition-colors ml-1"
                        title="Delete drive"
                      >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─── Edit Drive Modal ────────────────────────────────────────────────────────

function EditDriveModal({ visible, drive, token, onClose, onSaved }) {
  const [form, setForm] = useState({
    company: '', role: '', type: 'Placement',
    eligibility: '', package: '', drive_date: '',
    location: '', stipend: '', description: '',
    other_benefits: '', duration: '', eligible_courses: '',
    selection_process: '', about_company: '', website: '',
    org_size: '', contact_person: '',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (drive && visible) {
      setForm({
        company: drive.company || '',
        role: drive.role || '',
        type: drive.type || 'Placement',
        eligibility: drive.eligibility || '',
        package: drive.package || '',
        drive_date: drive.drive_date || '',
        location: drive.location || '',
        stipend: drive.stipend || '',
        description: drive.description || '',
        other_benefits: drive.other_benefits || '',
        duration: drive.duration || '',
        eligible_courses: drive.eligible_courses || '',
        selection_process: drive.selection_process || '',
        about_company: drive.about_company || '',
        website: drive.website || '',
        org_size: drive.org_size || '',
        contact_person: drive.contact_person || '',
      });
      setError('');
    }
  }, [drive, visible]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    const payload = {
      ...form,
      eligibility: form.eligibility && !isNaN(form.eligibility) ? parseFloat(form.eligibility).toFixed(2) : form.eligibility,
    };
    if (form.type === 'Placement') {
      payload.stipend = '';
      payload.duration = '';
    } else if (form.type === 'Internship') {
      payload.package = '';
    }

    try {
      const res = await fetch(`/api/drives/${drive.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || 'Failed to update drive');
      }
      const updated = await res.json();
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-8">
        <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>edit_document</span>
            </div>
            <h2 className="text-white font-bold text-title-lg">Edit Placement/Internship Drive</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-error-container rounded-xl text-on-error-container text-label-md">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-label-md text-on-surface font-semibold">Company Name</label>
              <input
                name="company" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})}
                required
                className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-2.5 text-body-md bg-surface-container-lowest transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-label-md text-on-surface font-semibold">Opportunity Type</label>
              <select
                name="type" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}
                className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-2.5 text-body-md bg-surface-container-lowest transition-all"
              >
                <option value="Placement">Placement</option>
                <option value="Internship">Internship</option>
                <option value="Internship + PPO">Internship + PPO</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-label-md text-on-surface font-semibold">Job Role</label>
              <input
                name="role" value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}
                required
                className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-2.5 text-body-md bg-surface-container-lowest transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-label-md text-on-surface font-semibold">Min CGPA Requirement</label>
              <input
                name="eligibility" value={form.eligibility} onChange={(e) => setForm({...form, eligibility: e.target.value})}
                type="number" step="0.01" min="0" max="10"
                className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-2.5 text-body-md bg-surface-container-lowest transition-all"
                placeholder="8.50"
              />
            </div>

            {(form.type === 'Placement' || form.type === 'Internship + PPO') && (
              <div className="space-y-1">
                <label className="text-label-md text-on-surface font-semibold">
                  {form.type === 'Internship + PPO' ? 'PPO Package (LPA)' : 'Package (LPA)'}
                </label>
                <input
                  name="package" value={form.package} onChange={(e) => setForm({...form, package: e.target.value})}
                  required
                  className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-2.5 text-body-md bg-surface-container-lowest transition-all"
                  placeholder="12.50"
                />
              </div>
            )}

            {(form.type === 'Internship' || form.type === 'Internship + PPO') && (
              <>
                <div className="space-y-1">
                  <label className="text-label-md text-on-surface font-semibold">Monthly Stipend</label>
                  <input
                    name="stipend" value={form.stipend} onChange={(e) => setForm({...form, stipend: e.target.value})}
                    required
                    className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-2.5 text-body-md bg-surface-container-lowest transition-all"
                    placeholder="25000"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-label-md text-on-surface font-semibold">Internship Duration</label>
                  <input
                    name="duration" value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})}
                    required
                    className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-2.5 text-body-md bg-surface-container-lowest transition-all"
                    placeholder="6 Months"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-label-md text-on-surface font-semibold">Drive Date</label>
              <input
                name="drive_date" value={form.drive_date} onChange={(e) => setForm({...form, drive_date: e.target.value})}
                type="date"
                className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-2.5 text-body-md bg-surface-container-lowest transition-all"
              />
            </div>
          </div>

          <div className="border border-outline-variant rounded-xl overflow-hidden mt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-surface-container-low hover:bg-surface-container-high transition-colors text-label-md font-bold text-on-surface outline-none"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">settings_applications</span>
                Edit Placement Details / Specs
              </span>
              <span className="material-symbols-outlined transition-transform duration-200" style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none' }}>
                keyboard_arrow_down
              </span>
            </button>
            {showAdvanced && (
              <div className="p-5 bg-white border-t border-outline-variant space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">Job Location</label>
                    <input
                      name="location" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})}
                      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-surface-container-lowest outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">Company Website</label>
                    <input
                      name="website" value={form.website} onChange={(e) => setForm({...form, website: e.target.value})}
                      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-surface-container-lowest outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">Organisation Size</label>
                    <input
                      name="org_size" value={form.org_size} onChange={(e) => setForm({...form, org_size: e.target.value})}
                      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-surface-container-lowest outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">Contact Person</label>
                    <input
                      name="contact_person" value={form.contact_person} onChange={(e) => setForm({...form, contact_person: e.target.value})}
                      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-surface-container-lowest outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">Job Description & Preferred Technical Skills</label>
                  <textarea
                    name="description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                    rows={3}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-surface-container-lowest outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">Eligible Courses / Degrees</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-outline-variant rounded-xl p-3 bg-surface-container-lowest">
                    {COURSE_OPTIONS.map((course) => {
                      const selected = (form.eligible_courses || '').split('\n').filter(Boolean).includes(course);
                      return (
                        <label key={course} className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer select-none text-body-md text-on-surface">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => {
                              const current = (form.eligible_courses || '').split('\n').filter(Boolean);
                              let next;
                              if (e.target.checked) {
                                next = [...current, course];
                              } else {
                                next = current.filter((c) => c !== course);
                              }
                              setForm({ ...form, eligible_courses: next.join('\n') });
                            }}
                            className="mt-1 rounded text-primary focus:ring-primary/20"
                          />
                          <span>{course}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">Selection Process Details (One step per line)</label>
                  <textarea
                    name="selection_process" value={form.selection_process} onChange={(e) => setForm({...form, selection_process: e.target.value})}
                    rows={3}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-surface-container-lowest outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">Other Benefits & Joining Terms</label>
                  <textarea
                    name="other_benefits" value={form.other_benefits} onChange={(e) => setForm({...form, other_benefits: e.target.value})}
                    rows={2}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-surface-container-lowest outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">About the Organisation</label>
                  <textarea
                    name="about_company" value={form.about_company} onChange={(e) => setForm({...form, about_company: e.target.value})}
                    rows={3}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-surface-container-lowest outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="px-6 py-3 border border-outline-variant text-on-surface-variant text-label-md font-semibold rounded-xl hover:bg-surface-container-low transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="px-8 py-3 bg-primary text-on-primary text-label-md font-semibold rounded-xl hover:scale-[1.02] active:scale-95 shadow-md transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {saving && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Add Student Modal ────────────────────────────────────────────────────────

function AddStudentModal({ visible, token, onClose, onAdded }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    enrollment_id: '',
    course: '',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (visible) {
      setForm({ full_name: '', email: '', username: '', password: '', enrollment_id: '', course: '' });
      setError('');
      setSuccess(false);
    }
  }, [visible]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        const msg = d.detail === 'username_taken'
          ? 'Username already taken. Please choose another.'
          : d.detail === 'email_taken'
          ? 'Email already registered.'
          : d.detail || 'Failed to create student';
        throw new Error(msg);
      }
      const newStudent = await res.json();
      setSuccess(true);
      onAdded(newStudent);
      setTimeout(() => { onClose(); }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary to-secondary/80 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>person_add</span>
            </div>
            <h2 className="text-white font-bold text-title-lg">Add New Student</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {success ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-secondary-container text-secondary rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '36px' }}>check_circle</span>
            </div>
            <h3 className="text-headline-sm font-bold text-on-surface mb-2">Student Added!</h3>
            <p className="text-body-md text-on-surface-variant">
              <strong>{form.full_name}</strong> has been added to the system.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-error-container rounded-xl text-on-error-container text-label-md">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'Student full name', required: true },
                { label: 'Email Address', key: 'email', type: 'email', placeholder: 'student@example.com', required: true },
                { label: 'Username', key: 'username', type: 'text', placeholder: 'Unique login username', required: true },
                { label: 'Temporary Password', key: 'password', type: 'password', placeholder: 'Min 6 characters', required: true },
                { label: 'Enrollment ID', key: 'enrollment_id', type: 'text', placeholder: 'CS2024001', required: false },
                { label: 'Course / Stream', key: 'course', type: 'select', placeholder: 'B.Tech. - CSE', required: false },
              ].map(({ label, key, type, placeholder, required }) => (
                <div key={key} className={`space-y-1 ${key === 'enrollment_id' || key === 'course' ? 'md:col-span-2' : ''}`}>
                  <label className="text-label-md text-on-surface font-semibold">
                    {label} {required && <span className="text-error">*</span>}
                  </label>
                  {key === 'course' ? (
                    <select
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      required={required}
                      className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all outline-none appearance-none"
                    >
                      <option value="">Select Course / Stream</option>
                      {COURSE_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={type}
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      required={required}
                      minLength={key === 'password' ? 6 : undefined}
                      className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                    />
                  )}
                </div>
              ))}
            </div>

            <p className="text-caption text-on-surface-variant mt-2">
              <span className="material-symbols-outlined align-middle" style={{ fontSize: '14px' }}>info</span>
              {' '}The student can update their profile and change their password after first login.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-outline-variant text-on-surface-variant text-label-md font-semibold rounded-xl hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-8 py-3 bg-secondary text-on-secondary text-label-md font-semibold rounded-xl hover:scale-[1.02] active:scale-95 shadow-md transition-all disabled:opacity-70 flex items-center gap-2"
              >
                {creating && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {creating ? 'Creating...' : 'Create Student'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmDeleteModal({ student, onConfirm, onCancel, deleting }) {
  if (!student) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Red header strip */}
        <div className="bg-gradient-to-r from-error to-red-500 px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px' }}>delete_forever</span>
          </div>
          <h2 className="text-white font-bold text-title-md">Delete Student</h2>
        </div>
        <div className="p-6">
          <p className="text-body-md text-on-surface mb-1">
            Are you sure you want to delete
          </p>
          <p className="text-title-md font-extrabold text-on-surface mb-3">
            {student.full_name || student.username}
          </p>
          <div className="bg-error-container/20 border border-error/20 rounded-xl px-4 py-3 mb-6">
            <p className="text-caption text-error font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
              This will permanently delete the student and all their applications. This cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={deleting}
              className="flex-1 py-3 border border-outline-variant text-on-surface-variant text-label-md font-semibold rounded-xl hover:bg-surface-container-low transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 py-3 bg-error text-on-error text-label-md font-semibold rounded-xl hover:bg-error/90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '18px' }}>delete</span>
              )}
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteDriveModal({ drive, onConfirm, onCancel, deleting }) {
  if (!drive) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-error to-red-500 px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px' }}>delete_forever</span>
          </div>
          <h2 className="text-white font-bold text-title-md">Delete Opportunity</h2>
        </div>
        <div className="p-6">
          <p className="text-body-md text-on-surface mb-1">
            Are you sure you want to delete the opportunity for
          </p>
          <p className="text-title-md font-extrabold text-on-surface mb-3">
            {drive.company} - {drive.role}
          </p>
          <div className="bg-error-container/20 border border-error/20 rounded-xl px-4 py-3 mb-6">
            <p className="text-caption text-error font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
              This will permanently delete this placement/internship drive and all student applications for it.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={deleting}
              className="flex-1 py-3 border border-outline-variant text-on-surface-variant text-label-md font-semibold rounded-xl hover:bg-surface-container-low transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 py-3 bg-error text-on-error text-label-md font-semibold rounded-xl hover:bg-error/90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '18px' }}>delete</span>
              )}
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { token, user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);

  // Drive form state
  const [form, setForm] = useState({
    company: '', role: '', type: 'Placement',
    eligibility: '', package: '', drive_date: '',
    location: '', stipend: '', description: '',
    other_benefits: '', duration: '', eligible_courses: '',
    selection_process: '', about_company: '', website: '',
    org_size: '', contact_person: '',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('admin-sidebar-collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  const location = useLocation();
  const currentPath = location.pathname;

  const [students, setStudents] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loadingDrives, setLoadingDrives] = useState(true);
  const [showEditDrive, setShowEditDrive] = useState(false);
  const [driveToEdit, setDriveToEdit] = useState(null);
  const [driveSearch, setDriveSearch] = useState('');

  const [loadingStats, setLoadingStats] = useState(true);
  const [statsData, setStatsData] = useState([]);

  const fetchDrives = useCallback(async () => {
    setLoadingDrives(true);
    try {
      const res = await fetch('/api/drives');
      if (res.ok) {
        const data = await res.json();
        setDrives(data);
      }
    } catch { /* ignore */ } finally {
      setLoadingDrives(false);
    }
  }, []);

  const [driveToDelete, setDriveToDelete] = useState(null);
  const [deletingDrive, setDeletingDrive] = useState(false);

  const handleDeleteDrive = (drive) => {
    setDriveToDelete(drive);
  };

  const handleDeleteDriveConfirm = async () => {
    if (!driveToDelete) return;
    setDeletingDrive(true);
    try {
      const res = await fetch(`/api/drives/${driveToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDrives((prev) => prev.filter((d) => d.id !== driveToDelete.id));
        setDriveToDelete(null);
      } else {
        alert("Failed to delete drive");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingDrive(false);
    }
  };

  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const STUDENTS_PER_PAGE = 8;

  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch real students from backend
  const fetchStudents = useCallback(async () => {
    if (!token) return;
    setLoadingStudents(true);
    try {
      const res = await fetch('/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch { /* ignore */ } finally {
      setLoadingStudents(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStudents();
    fetchDrives();
  }, [fetchStudents, fetchDrives]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    setLoadingStats(true);

    fetch("http://localhost:8000/api/dashboard/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        console.log("Status:", res.status);
        console.log("URL:", res.url);

        const text = await res.text();
        console.log("Response Body:", text);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        return JSON.parse(text);
      })
      .then((data) => {
        setStatsData([
          {
            icon: "school",
            iconColor: "text-blue-600",
            iconBg: "bg-blue-100",
            label: "Students",
            value: data.total_students,
            sub: "Registered Students",
            subColor: "text-blue-600",
          },
          {
            icon: "campaign",
            iconColor: "text-green-600",
            iconBg: "bg-green-100",
            label: "Drives",
            value: data.total_drives,
            sub: "Total Opportunities",
            subColor: "text-green-600",
          },
          {
            icon: "description",
            iconColor: "text-purple-600",
            iconBg: "bg-purple-100",
            label: "Applications",
            value: data.total_applications,
            sub: "Applications Submitted",
            subColor: "text-purple-600",
          },
          {
            icon: "verified",
            iconColor: "text-emerald-600",
            iconBg: "bg-emerald-100",
            label: "Placement %",
            value: `${data.placement_percentage}%`,
            sub: `${data.placed_students} Students Placed`,
            subColor: "text-emerald-600",
          },
        ]);
      })
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, []);

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLaunchDrive = async (e) => {
    e.preventDefault();
    setLaunching(true);
    setFormError('');
    
    const payload = {
      company: form.company, role: form.role, type: form.type,
      eligibility: form.eligibility && !isNaN(form.eligibility) ? parseFloat(form.eligibility).toFixed(2) : form.eligibility,
      package: form.package, drive_date: form.drive_date,
      location: form.location, stipend: form.stipend, description: form.description,
      other_benefits: form.other_benefits, duration: form.duration,
      eligible_courses: form.eligible_courses, selection_process: form.selection_process,
      about_company: form.about_company, website: form.website,
      org_size: form.org_size, contact_person: form.contact_person,
    };
    if (form.type === 'Placement') {
      payload.stipend = '';
      payload.duration = '';
    } else if (form.type === 'Internship') {
      payload.package = '';
    }

    try {
      const res = await fetch('/api/drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to launch drive');
      setShowModal(true);
      fetchDrives();
      setForm({
        company: '', role: '', type: 'Placement',
        eligibility: '', package: '', drive_date: '',
        location: '', stipend: '', description: '',
        other_benefits: '', duration: '', eligible_courses: '',
        selection_process: '', about_company: '', website: '',
        org_size: '', contact_person: '',
      });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLaunching(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/signin', { replace: true }); };
  const scrollToForm = () => {
    if (location.pathname !== '/admin') {
      navigate('/admin');
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/students/${studentToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete student');
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      // Go back a page if the current page becomes empty
      const remaining = students.length - 1;
      const newTotalPages = Math.max(1, Math.ceil(remaining / STUDENTS_PER_PAGE));
      if (studentPage > newTotalPages) setStudentPage(newTotalPages);
      setStudentToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // Search + Pagination
  const filteredStudents = students.filter((s) => {
    const q = studentSearch.toLowerCase();
    if (!q) return true;
    return (
      (s.full_name || '').toLowerCase().includes(q) ||
      (s.username || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.enrollment_id || '').toLowerCase().includes(q) ||
      (s.course || '').toLowerCase().includes(q)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE));
  const pagedStudents = filteredStudents.slice((studentPage - 1) * STUDENTS_PER_PAGE, studentPage * STUDENTS_PER_PAGE);

  // Admin display info
  const adminName = user?.full_name || user?.username || 'Admin';
  const adminTitle = user?.headline || 'Administrator';
  const adminAvatar = user?.profile_image;
  const adminInitial = adminName[0]?.toUpperCase() || 'A';

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} onPostDrive={scrollToForm} />

      <main className={`flex-1 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} min-h-screen pb-20 transition-all duration-300 ease-in-out`}>
        {/* TopBar */}
        <header className="w-full h-16 sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant flex items-center justify-between px-p-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30">
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '20px' }}>search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-body-md ml-2 w-64 placeholder:text-outline/60 outline-none"
                placeholder="Search students, companies..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors active:scale-95">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
            </button>
            <div className="h-8 w-px bg-outline-variant mx-1" />

            {/* Clickable profile area */}
            <button
              onClick={() => navigate('/admin/settings')}
              className="flex items-center gap-3 cursor-pointer hover:bg-surface-container-low px-3 py-1.5 rounded-xl transition-colors active:scale-[0.98]"
              title="Settings"
            >
              <div className="text-right hidden sm:block">
                <p className="text-label-md font-bold text-on-surface">{adminName}</p>
                <p className="text-caption text-on-surface-variant">{adminTitle}</p>
              </div>
              <div className="relative">
                {adminAvatar ? (
                  <img
                    className="w-10 h-10 rounded-full border-2 border-primary-container object-cover"
                    src={adminAvatar}
                    alt={adminName}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-primary-container bg-primary-container text-primary flex items-center justify-center font-bold text-label-md">
                    {adminInitial}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center border border-outline-variant">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '10px' }}>settings</span>
                </span>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="ml-1 flex items-center gap-1 text-on-surface-variant hover:text-error transition-colors text-label-md"
              title="Logout"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            </button>
          </div>
        </header>

        <div className="max-w-[1400px] mx-auto p-p-lg space-y-8">
          {currentPath === '/admin' && (
            <>
              {/* ── Welcome Banner ── */}
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/10 px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-caption text-primary font-semibold uppercase tracking-wider mb-1">Admin Portal</p>
                  <h1 className="text-headline-lg font-extrabold text-on-surface">
                    Welcome, {adminName.split(' ')[0]} 👋
                  </h1>
                  <p className="text-body-md text-on-surface-variant mt-1">{adminTitle}</p>
                </div>
                <div className="hidden md:flex items-center gap-3">
                  <button
                    onClick={() => setShowAddStudent(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-label-md font-semibold hover:scale-[1.02] active:scale-95 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                    Add Student
                  </button>
                  <button
                    onClick={scrollToForm}
                    className="flex items-center gap-2 px-5 py-2.5 border border-primary text-primary rounded-xl text-label-md font-semibold hover:bg-primary/5 transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>campaign</span>
                    Launch Drive
                  </button>
                </div>
              </div>

              {/* ── Section 1: Stats ── */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-headline-lg font-bold text-on-surface">Institutional Intelligence</h2>
                  <p className="text-body-md text-on-surface-variant">Real-time placement analytics</p>
                </div>
                {loadingStats ? (
                  <div className="flex justify-center py-10">
                    <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {statsData.map((s) => (
                      <StatCard key={s.label} {...s} />
                    ))}
                  </div>
                )}
              </section>

              {/* ── Section 2+3: Drive Form + Live Feed ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Launch Drive Form */}
                <section className="lg:col-span-7" ref={formRef}>
                  <div className="bg-white p-p-lg rounded-2xl border border-outline-variant shadow-sm h-full">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-primary-container text-on-primary rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined">campaign</span>
                      </div>
                      <div>
                        <h2 className="text-headline-md font-bold text-on-surface">Launch Internship Drive</h2>
                        <p className="text-caption text-on-surface-variant">Drives will be visible to all eligible students</p>
                      </div>
                    </div>

                    {formError && (
                      <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-error-container rounded-xl text-on-error-container text-label-md">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                        {formError}
                      </div>
                    )}

                    <form onSubmit={handleLaunchDrive} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-label-md text-on-surface font-semibold">Company Name</label>
                          <input
                            name="company" value={form.company} onChange={handleFormChange}
                            required
                            className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                            placeholder="Microsoft India"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-label-md text-on-surface font-semibold">Opportunity Type</label>
                          <select
                            name="type" value={form.type} onChange={handleFormChange}
                            className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                          >
                            <option value="Placement">Placement</option>
                            <option value="Internship">Internship</option>
                            <option value="Internship + PPO">Internship + PPO</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-label-md text-on-surface font-semibold">Job Role</label>
                          <input
                            name="role" value={form.role} onChange={handleFormChange}
                            required
                            className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                            placeholder="Software Engineer I"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-label-md text-on-surface font-semibold">Min CGPA Requirement</label>
                          <input
                            name="eligibility" value={form.eligibility} onChange={handleFormChange}
                            type="number" step="0.01" min="0" max="10"
                            className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                            placeholder="8.50"
                          />
                        </div>

                        {(form.type === 'Placement' || form.type === 'Internship + PPO') && (
                          <div className="space-y-2">
                            <label className="text-label-md text-on-surface font-semibold">
                              {form.type === 'Internship + PPO' ? 'PPO Package (LPA)' : 'Package (LPA)'}
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">₹</span>
                              <input
                                name="package" value={form.package} onChange={handleFormChange}
                                required
                                className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none pl-8 pr-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                                placeholder="12.50"
                              />
                            </div>
                          </div>
                        )}

                        {(form.type === 'Internship' || form.type === 'Internship + PPO') && (
                          <>
                            <div className="space-y-2">
                              <label className="text-label-md text-on-surface font-semibold">Monthly Stipend</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">₹</span>
                                <input
                                  name="stipend" value={form.stipend} onChange={handleFormChange}
                                  required
                                  className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none pl-8 pr-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                                  placeholder="25000"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-label-md text-on-surface font-semibold">Internship Duration</label>
                              <input
                                name="duration" value={form.duration} onChange={handleFormChange}
                                required
                                className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                                placeholder="6 Months"
                              />
                            </div>
                          </>
                        )}

                        <div className="space-y-2">
                          <label className="text-label-md text-on-surface font-semibold">Drive Date</label>
                          <input
                            name="drive_date" value={form.drive_date} onChange={handleFormChange}
                            type="date"
                            className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                          />
                        </div>
                      </div>

                      {/* Collapsible Rich Details Section */}
                      <div className="border border-outline-variant rounded-xl overflow-hidden mt-6">
                        <button
                          type="button"
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className="w-full flex items-center justify-between px-5 py-4 bg-surface-container-low hover:bg-surface-container-high transition-colors text-label-md font-bold text-on-surface outline-none"
                        >
                          <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">settings_applications</span>
                            Placement Specification / Details (Optional)
                          </span>
                          <span className="material-symbols-outlined transition-transform duration-200" style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none' }}>
                            keyboard_arrow_down
                          </span>
                        </button>
                        
                        {showAdvanced && (
                          <div className="p-5 bg-white border-t border-outline-variant space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">Job Location</label>
                                <input
                                  name="location" value={form.location} onChange={handleFormChange}
                                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-surface-container-lowest outline-none focus:border-primary transition-all"
                                  placeholder="Pune (Koregaon Park)"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">Company Website</label>
                                <input
                                  name="website" value={form.website} onChange={handleFormChange}
                                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-surface-container-lowest outline-none focus:border-primary transition-all"
                                  placeholder="https://www.omniscient.co.in/"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">Organisation Size</label>
                                <input
                                  name="org_size" value={form.org_size} onChange={handleFormChange}
                                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-surface-container-lowest outline-none focus:border-primary transition-all"
                                  placeholder="10,000+"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">Contact Person</label>
                                <input
                                  name="contact_person" value={form.contact_person} onChange={handleFormChange}
                                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-surface-container-lowest outline-none focus:border-primary transition-all"
                                  placeholder="Dr. Swati More"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">Job Description & Preferred Technical Skills</label>
                              <textarea
                                name="description" value={form.description} onChange={handleFormChange}
                                rows={3}
                                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-surface-container-lowest outline-none focus:border-primary transition-all"
                                placeholder="Specify role description, tech stack requirements (Java, Angular, React)..."
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">Eligible Courses / Degrees</label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-outline-variant rounded-xl p-3 bg-surface-container-lowest">
                                {COURSE_OPTIONS.map((course) => {
                                  const selected = (form.eligible_courses || '').split('\n').filter(Boolean).includes(course);
                                  return (
                                    <label key={course} className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer select-none text-body-md text-on-surface">
                                      <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={(e) => {
                                          const current = (form.eligible_courses || '').split('\n').filter(Boolean);
                                          let next;
                                          if (e.target.checked) {
                                            next = [...current, course];
                                          } else {
                                            next = current.filter((c) => c !== course);
                                          }
                                          setForm({ ...form, eligible_courses: next.join('\n') });
                                        }}
                                        className="mt-1 rounded text-primary focus:ring-primary/20"
                                      />
                                      <span>{course}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">Selection Process Details (One step per line)</label>
                              <textarea
                                name="selection_process" value={form.selection_process} onChange={handleFormChange}
                                rows={3}
                                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-surface-container-lowest outline-none focus:border-primary transition-all"
                                placeholder="1st Round – Aptitude Test&#10;2nd Round- Group Discussions&#10;3rd Round – Technical Round"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">Other Benefits & Joining Terms</label>
                              <textarea
                                name="other_benefits" value={form.other_benefits} onChange={handleFormChange}
                                rows={2}
                                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-surface-container-lowest outline-none focus:border-primary transition-all"
                                placeholder="Join us on 1st January 2027. Work from Office Koregaon Park."
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">About the Organisation</label>
                              <textarea
                                name="about_company" value={form.about_company} onChange={handleFormChange}
                                rows={3}
                                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-surface-container-lowest outline-none focus:border-primary transition-all"
                                placeholder="Company background, treasury details, domain expertise..."
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">Selection Process Details (One step per line)</label>
                              <textarea
                                name="selection_process" value={form.selection_process} onChange={handleFormChange}
                                rows={3}
                                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-surface-container-lowest outline-none focus:border-primary transition-all"
                                placeholder="1st Round – Aptitude Test&#10;2nd Round- Group Discussions&#10;3rd Round – Technical Round"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">Other Benefits & Joining Terms</label>
                              <textarea
                                name="other_benefits" value={form.other_benefits} onChange={handleFormChange}
                                rows={2}
                                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-surface-container-lowest outline-none focus:border-primary transition-all"
                                placeholder="e.g. Join us on 1st January 2027. Work from Office Koregaon Park."
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider block">About the Organisation</label>
                              <textarea
                                name="about_company" value={form.about_company} onChange={handleFormChange}
                                rows={3}
                                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-surface-container-lowest outline-none focus:border-primary transition-all"
                                placeholder="Company background, treasury details, domain expertise..."
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-4">
                        <button
                          type="button"
                          className="px-6 py-3 border border-outline-variant text-on-surface-variant text-label-md font-semibold rounded-xl hover:bg-surface-container-low transition-colors"
                        >
                          Save as Draft
                        </button>
                        <button
                          type="submit"
                          disabled={launching}
                          className="px-8 py-3 bg-primary text-on-primary text-label-md font-semibold rounded-xl hover:scale-[1.02] active:scale-95 shadow-md transition-all disabled:opacity-70 flex items-center gap-2"
                        >
                          {launching && (
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          )}
                          {launching ? 'Launching...' : 'Launch Drive'}
                        </button>
                      </div>
                    </form>
                  </div>
                </section>

                {/* Quick Stats Panel */}
                <section className="lg:col-span-5">
                  <div className="bg-white p-p-lg rounded-2xl border border-outline-variant shadow-sm h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined">people</span>
                        </div>
                        <h2 className="text-headline-md font-bold text-on-surface">Student Overview</h2>
                      </div>
                      <span className="px-3 py-1 bg-secondary-container/20 text-secondary text-caption rounded-full font-bold">
                        {students.length} Total
                      </span>
                    </div>

                    {loadingStudents ? (
                      <div className="flex-1 flex items-center justify-center">
                        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                    ) : students.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                        <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
                          <span className="material-symbols-outlined text-outline" style={{ fontSize: '32px' }}>person_off</span>
                        </div>
                        <p className="text-body-md font-semibold text-on-surface">No students yet</p>
                        <p className="text-caption text-on-surface-variant mt-1">Add your first student to get started</p>
                        <button
                          onClick={() => setShowAddStudent(true)}
                          className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-label-md font-semibold hover:scale-[1.02] transition-transform shadow-sm"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                          Add First Student
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 space-y-3 overflow-y-auto max-h-[420px] pr-1 custom-scrollbar">
                        {students.slice(0, 6).map((s) => {
                          const initials = s.full_name
                            ? s.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                            : s.username[0].toUpperCase();
                          return (
                            <div key={s.id} className="p-3 rounded-xl border border-outline-variant/50 hover:bg-surface-container-low transition-colors flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border border-outline-variant">
                                {s.profile_image ? (
                                  <img src={s.profile_image} alt={s.full_name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-primary-container text-primary flex items-center justify-center font-bold text-label-md">
                                    {initials}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-label-md font-bold text-on-surface truncate">{s.full_name || s.username}</p>
                                <p className="text-caption text-outline truncate">{s.email || s.username}</p>
                              </div>
                              {s.enrollment_id && (
                                <span className="text-[10px] bg-primary-container/20 text-primary px-2 py-0.5 rounded font-semibold flex-shrink-0">
                                  {s.enrollment_id}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <button
                      onClick={() => setShowAddStudent(true)}
                      className="w-full mt-6 py-2.5 border border-dashed border-primary/40 text-primary text-label-md font-semibold hover:bg-primary/5 transition-colors rounded-xl flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                      Add New Student
                    </button>
                  </div>
                </section>
              </div>
            </>
          )}

          {currentPath === '/admin/opportunities' && (
            <OpportunitiesView
              drives={drives}
              loadingDrives={loadingDrives}
              onEditDrive={(d) => { setDriveToEdit(d); setShowEditDrive(true); }}
              onDeleteDrive={handleDeleteDrive}
              driveSearch={driveSearch}
              setDriveSearch={setDriveSearch}
            />
          )}

          {currentPath === '/admin/students' && (
            <section className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="p-p-lg border-b border-outline-variant">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-headline-md font-bold text-on-surface">Student Management</h2>
                    <p className="text-body-md text-on-surface-variant">
                      {loadingStudents ? 'Loading...' : `${filteredStudents.length} of ${students.length} student${students.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => setShowEmailPreview(true)}
                      className="px-4 py-2 border border-outline-variant text-on-surface-variant text-label-md font-semibold rounded-xl hover:bg-surface-container-low transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>drafts</span>
                      Preview Welcome Email
                    </button>
                    <button className="px-4 py-2 border border-outline-variant text-on-surface-variant text-label-md font-semibold rounded-xl hover:bg-surface-container-low transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>file_upload</span>
                      Bulk Import
                    </button>
                    <button
                      onClick={() => setShowAddStudent(true)}
                      className="px-6 py-2 bg-primary text-on-primary text-label-md font-semibold rounded-xl hover:scale-[1.02] active:scale-95 shadow-md transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                      Add Student
                    </button>
                  </div>
                </div>
                {/* Search Bar */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '20px' }}>search</span>
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => { setStudentSearch(e.target.value); setStudentPage(1); }}
                    placeholder="Search by name, email, username or enrollment ID…"
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface placeholder:text-outline/60"
                  />
                  {studentSearch && (
                    <button
                      onClick={() => { setStudentSearch(''); setStudentPage(1); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low">
                    <tr>
                      {['Student Name', 'Email', 'Enrollment ID', 'Course', 'Account Status', 'Joined', 'Actions'].map((h, i) => (
                        <th key={h} className={`px-6 py-4 text-label-md text-outline font-bold uppercase tracking-wider ${i === 6 ? 'text-right' : ''}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {loadingStudents ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">
                          <svg className="animate-spin h-6 w-6 text-primary mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Loading students...
                        </td>
                      </tr>
                    ) : pagedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <span className="material-symbols-outlined text-outline" style={{ fontSize: '40px' }}>person_search</span>
                            <p className="text-body-md text-on-surface-variant font-semibold">
                              {studentSearch ? `No students match "${studentSearch}"` : 'No students found'}
                            </p>
                            {!studentSearch && (
                              <button
                                onClick={() => setShowAddStudent(true)}
                                className="mt-2 px-5 py-2 bg-primary text-on-primary rounded-xl text-label-md font-semibold hover:scale-[1.02] transition-transform shadow-sm"
                              >
                                Add First Student
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pagedStudents.map((s) => {
                        const initials = s.full_name
                          ? s.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                          : s.username[0].toUpperCase();
                        const joinedDate = s.created_at
                          ? new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—';
                        
                        const isEligible = s.is_eligible === 1;
                        const isPendingSetup = s.must_change_password === '1';
                        const hasResume = !!s.resume_name;
                        const hasEmail = !!s.email;
                        const hasName = !!s.full_name;
                        const isProfileDone = hasEmail && hasName;

                        let statusLabel, statusBg, statusText, statusIcon;
                        if (isEligible) {
                          statusLabel = 'Eligible';
                          statusBg = 'bg-emerald-50 border-emerald-200';
                          statusText = 'text-emerald-700';
                          statusIcon = 'verified';
                        } else if (isPendingSetup) {
                          statusLabel = 'Pending Setup';
                          statusBg = 'bg-amber-50 border-amber-200';
                          statusText = 'text-amber-700';
                          statusIcon = 'schedule';
                        } else if (!isProfileDone) {
                          statusLabel = 'Profile Incomplete';
                          statusBg = 'bg-slate-50 border-slate-200';
                          statusText = 'text-slate-600';
                          statusIcon = 'person_alert';
                        } else if (!hasResume) {
                          statusLabel = 'Resume Missing';
                          statusBg = 'bg-orange-50 border-orange-200';
                          statusText = 'text-orange-700';
                          statusIcon = 'description';
                        } else {
                          statusLabel = 'Education Missing';
                          statusBg = 'bg-amber-50 border-amber-200';
                          statusText = 'text-amber-700';
                          statusIcon = 'school';
                        }

                        return (
                          <tr
                            key={s.id}
                            className="hover:bg-surface-container-lowest transition-all"
                            style={{ transition: 'background 0.15s, transform 0.15s' }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(4px)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant flex-shrink-0">
                                  {s.profile_image ? (
                                    <img src={s.profile_image} alt={s.full_name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-primary-container text-primary flex items-center justify-center font-bold text-caption">
                                      {initials}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-body-md font-bold text-on-surface">{s.full_name || s.username}</p>
                                  <p className="text-caption text-outline">@{s.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-body-md text-on-surface-variant">{s.email || '—'}</td>
                            <td className="px-6 py-5">
                              {s.enrollment_id ? (
                                <span className="px-2 py-1 bg-primary-container/20 text-primary text-caption font-semibold rounded-lg">
                                  {s.enrollment_id}
                                </span>
                              ) : (
                                <span className="text-outline text-caption">Not set</span>
                              )}
                            </td>
                            <td className="px-6 py-5">
                              {s.course ? (
                                <span className="px-2 py-1 bg-secondary-container/20 text-secondary text-caption font-semibold rounded-lg">
                                  {s.course}
                                </span>
                              ) : (
                                <span className="text-outline text-caption">—</span>
                              )}
                            </td>
                            <td className="px-6 py-5">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-label-md font-semibold ${statusBg} ${statusText}`}>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>{statusIcon}</span>
                                {statusLabel}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-caption text-outline">{joinedDate}</td>
                            <td className="px-6 py-5 text-right">
                              <button className="p-2 hover:bg-surface-container-high rounded-lg text-outline transition-colors" title="Edit student">
                                <span className="material-symbols-outlined">edit</span>
                              </button>
                              <button className="p-2 hover:bg-error-container/20 rounded-lg text-error transition-colors ml-1" title="Reset password">
                                <span className="material-symbols-outlined">key</span>
                              </button>
                              <button
                                onClick={() => setStudentToDelete(s)}
                                className="p-2 hover:bg-error-container/30 rounded-lg text-error transition-colors ml-1"
                                title="Delete student"
                              >
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-6 bg-surface-container-low/50 flex items-center justify-between border-t border-outline-variant">
                  <p className="text-caption text-on-surface-variant">
                    Showing {pagedStudents.length} of {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                    {studentSearch && ` matching "${studentSearch}"`}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={studentPage === 1}
                      onClick={() => setStudentPage((p) => p - 1)}
                      className="p-2 border border-outline-variant rounded-lg bg-white text-outline disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        onClick={() => setStudentPage(n)}
                        className={`w-8 h-8 rounded-lg text-label-md font-semibold ${n === studentPage ? 'bg-primary text-on-primary' : 'hover:bg-surface-container-high text-on-surface'}`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      disabled={studentPage === totalPages}
                      onClick={() => setStudentPage((p) => p + 1)}
                      className="p-2 border border-outline-variant rounded-lg bg-white text-outline disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {currentPath === '/admin/recruiters' && <RecruitersView />}

          {currentPath === '/admin/settings' && (
            <AdminSettingsView
              profile={user || {}}
              token={token}
              onSaved={(updated) => setUser(updated)}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <SuccessModal
        visible={showModal}
        companyName={form.company}
        onClose={() => setShowModal(false)}
      />

      <EditDriveModal
        visible={showEditDrive}
        drive={driveToEdit}
        token={token}
        onClose={() => { setShowEditDrive(false); setDriveToEdit(null); }}
        onSaved={() => fetchDrives()}
      />
      <AddStudentModal
        visible={showAddStudent}
        token={token}
        onClose={() => setShowAddStudent(false)}
        onAdded={(newStudent) => setStudents((prev) => [newStudent, ...prev])}
      />
      <ConfirmDeleteModal
        student={studentToDelete}
        onConfirm={handleDeleteStudent}
        onCancel={() => setStudentToDelete(null)}
        deleting={deleting}
      />
      <ConfirmDeleteDriveModal
        drive={driveToDelete}
        onConfirm={handleDeleteDriveConfirm}
        onCancel={() => setDriveToDelete(null)}
        deleting={deletingDrive}
      />
      <OnboardingEmailPreview
        visible={showEmailPreview}
        onClose={() => setShowEmailPreview(false)}
      />
    </div>
  );
}
