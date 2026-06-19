import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

// ─── Static Data (Read Only) ──────────────────────────────────────────────────

const SKILLS = ['Python', 'Java', 'C++', 'TypeScript', 'React.js', 'Kubernetes', 'SQL', 'PyTorch', 'AWS', 'Git'];

const LANGUAGES = [
  { name: 'English', level: 'Native', color: 'text-secondary' },
  { name: 'Spanish', level: 'Fluent', color: 'text-secondary' },
  { name: 'Mandarin', level: 'Basic', color: 'text-outline' },
];

const PROJECTS = [
  {
    icon: 'database',
    title: 'Distributed Ledger System',
    desc: 'A high-performance blockchain implementation focused on consensus efficiency in low-latency networks.',
    tags: ['Go', 'Docker', 'gRPC'],
  },
  {
    icon: 'smart_toy',
    title: 'Algorithmic Trade Bot',
    desc: 'Quantitative trading engine that utilises sentiment analysis on social media feeds to predict crypto volatility.',
    tags: ['Python', 'Pandas', 'NLTK'],
  },
  {
    icon: 'psychology',
    title: 'HealthTrack AI',
    desc: 'Deep learning model for early detection of diabetic retinopathy using retinal scans.',
    tags: ['PyTorch', 'Scikit-learn', 'FastAPI'],
  },
];

// ─── Edit Profile Form Component ─────────────────────────────────────────────

function EditProfileForm({ profile, onCancel, onSave }) {
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    headline: profile.headline || '',
    bio: profile.bio || '',
    location: profile.location || '',
    linkedin_url: profile.linkedin_url || '',
    website_url: profile.website_url || '',
    education: profile.education || [],
    experience: profile.experience || [],
    email: profile.email || '',
    phone: profile.phone || '',
    enrollment_id: profile.enrollment_id || '',
    profile_image: profile.profile_image || '',
  });
  const [saving, setSaving] = useState(false);

  const fileInputRef = React.useRef(null);

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
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Export as compressed JPEG base64 Data URL (0.7 quality)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setForm((prev) => ({ ...prev, profile_image: compressedDataUrl }));
      };
    };
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Education Helpers
  const handleEducationChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const addEducation = () => {
    setForm((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { institution: '', degree: '', timeline: '', detail: '' },
      ],
    }));
  };

  const deleteEducation = (index) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.filter((_, idx) => idx !== index),
    }));
  };

  // Experience Helpers
  const handleExperienceChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  const addExperience = () => {
    setForm((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company: '', title: '', timeline: '', accomplishments: '' },
      ],
    }));
  };

  const deleteExperience = (index) => {
    setForm((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const initials = form.full_name
    ? form.full_name.trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <div className="max-w-[1200px] mx-auto pb-24 space-y-8">
      {/* Page Header / Actions */}
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Edit Professional Profile</h2>
            <p className="text-on-surface-variant font-body-md text-body-md">Refine your academic and professional identity for recruiter visibility.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 border border-outline-variant text-on-surface-variant rounded-xl font-label-md text-label-md hover:bg-surface-container-low transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-label-md text-label-md shadow-md hover:scale-[1.02] hover:shadow-lg active:scale-95 transition-all disabled:opacity-60"
            >
              {saving ? 'Saving Changes…' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Column: Core Identity */}
          <div className="xl:col-span-4 space-y-8">
            {/* Profile Photo Card */}
            <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-6">Identity Photo</h3>
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-surface-container-high shadow-xl mb-6 flex items-center justify-center bg-gradient-to-br from-primary to-primary-container">
                    {form.profile_image ? (
                      <img src={form.profile_image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl font-extrabold text-white">{initials}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="absolute bottom-6 right-2 bg-primary text-on-primary p-2 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                  </button>
                  {form.profile_image && (
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, profile_image: '' }))}
                      className="absolute bottom-6 left-2 bg-error text-on-error p-2 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all"
                      title="Remove Photo"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="text-caption text-on-surface-variant text-center max-w-[200px]">Click the camera icon to upload a professional headshot.</p>
              </div>
            </section>

            {/* Contact Details Card */}
            <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-6">Global Contact</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-label-md font-bold text-on-surface-variant ml-1">Current Location</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">location_on</span>
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface"
                      type="text"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-label-md font-bold text-on-surface-variant ml-1">LinkedIn URL</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">link</span>
                    <input
                      name="linkedin_url"
                      value={form.linkedin_url}
                      onChange={handleChange}
                      placeholder="linkedin.com/in/username"
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface"
                      type="text"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-label-md font-bold text-on-surface-variant ml-1">Portfolio/Website</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">language</span>
                    <input
                      name="website_url"
                      value={form.website_url}
                      onChange={handleChange}
                      placeholder="portfolio.com"
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface"
                      type="text"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-label-md font-bold text-on-surface-variant ml-1">Enrollment ID</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">badge</span>
                    <input
                      name="enrollment_id"
                      value={form.enrollment_id}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface"
                      type="text"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-label-md font-bold text-on-surface-variant ml-1">Phone Number</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">phone</span>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface"
                      type="tel"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-label-md font-bold text-on-surface-variant ml-1">Email Address</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">mail</span>
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface"
                      type="email"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Main Form Area */}
          <div className="xl:col-span-8 space-y-8">
            {/* Bio & Core Info Card */}
            <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-6">Professional Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-1.5">
                  <label className="text-label-md font-bold text-on-surface-variant ml-1">Full Name</label>
                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface"
                    type="text"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-label-md font-bold text-on-surface-variant ml-1">Headline</label>
                  <input
                    name="headline"
                    value={form.headline}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface"
                    type="text"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-label-md font-bold text-on-surface-variant ml-1">Professional Bio</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none text-on-surface"
                  rows="5"
                />
              </div>
            </section>

            {/* Education Section */}
            <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest">Education History</h3>
                <button
                  type="button"
                  onClick={addEducation}
                  className="flex items-center gap-2 text-primary font-bold text-label-md hover:opacity-80 transition-opacity"
                >
                  <span className="material-symbols-outlined text-sm">add</span> Add Education
                </button>
              </div>
              <div className="space-y-8">
                {form.education.map((edu, idx) => (
                  <div key={idx} className="group relative p-6 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl hover:border-primary/30 transition-all">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-caption font-bold text-outline">Institution</label>
                        <input
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                          className="w-full px-4 py-2 bg-transparent border-b border-outline-variant font-headline-md text-headline-md focus:border-primary outline-none transition-all text-on-surface"
                          type="text"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption font-bold text-outline">Degree / Major</label>
                        <input
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                          className="w-full px-4 py-2 bg-transparent border-b border-outline-variant font-body-lg text-body-lg focus:border-primary outline-none transition-all text-on-surface"
                          type="text"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption font-bold text-outline">Timeline</label>
                        <input
                          value={edu.timeline}
                          onChange={(e) => handleEducationChange(idx, 'timeline', e.target.value)}
                          className="w-full px-4 py-2 bg-transparent border-b border-outline-variant font-body-md text-body-md focus:border-primary outline-none transition-all text-on-surface"
                          type="text"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption font-bold text-outline">GPA / Honors</label>
                        <input
                          value={edu.detail}
                          onChange={(e) => handleEducationChange(idx, 'detail', e.target.value)}
                          className="w-full px-4 py-2 bg-transparent border-b border-outline-variant font-body-md text-body-md focus:border-primary outline-none transition-all text-on-surface"
                          type="text"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteEducation(idx)}
                      className="absolute top-4 right-4 text-error opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 active:scale-95"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Experience Section */}
            <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest">Work Experience</h3>
                <button
                  type="button"
                  onClick={addExperience}
                  className="flex items-center gap-2 text-primary font-bold text-label-md hover:opacity-80 transition-opacity"
                >
                  <span className="material-symbols-outlined text-sm">add</span> Add Experience
                </button>
              </div>
              <div className="space-y-8">
                {form.experience.map((exp, idx) => (
                  <div key={idx} className="group relative p-6 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl hover:border-primary/30 transition-all">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-caption font-bold text-outline">Company</label>
                          <input
                            value={exp.company}
                            onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                            className="w-full px-4 py-2 bg-transparent border-b border-outline-variant font-headline-md text-headline-md focus:border-primary outline-none transition-all text-on-surface"
                            type="text"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-caption font-bold text-outline">Job Title</label>
                          <input
                            value={exp.title}
                            onChange={(e) => handleExperienceChange(idx, 'title', e.target.value)}
                            className="w-full px-4 py-2 bg-transparent border-b border-outline-variant font-body-lg text-body-lg focus:border-primary outline-none transition-all text-on-surface"
                            type="text"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption font-bold text-outline">Timeline</label>
                        <input
                          value={exp.timeline}
                          onChange={(e) => handleExperienceChange(idx, 'timeline', e.target.value)}
                          className="w-full px-4 py-2 bg-transparent border-b border-outline-variant font-body-md text-body-md focus:border-primary outline-none transition-all text-on-surface"
                          type="text"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption font-bold text-outline">Key Accomplishments (One bullet point per line)</label>
                        <textarea
                          value={exp.accomplishments}
                          onChange={(e) => handleExperienceChange(idx, 'accomplishments', e.target.value)}
                          className="w-full px-4 py-2 bg-transparent border-b border-outline-variant font-body-md text-body-md focus:border-primary outline-none transition-all resize-none text-on-surface"
                          rows="3"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteExperience(idx)}
                      className="absolute top-4 right-4 text-error opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 active:scale-95"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Footer Action Bar (Mobile Responsive / Floating Action Panel) */}
        <div className="fixed bottom-0 left-0 w-full lg:hidden bg-surface-container-highest border-t border-outline-variant p-4 flex gap-4 z-50">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 border border-outline-variant text-on-surface-variant rounded-xl font-label-md text-label-md bg-surface"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-label-md text-label-md shadow-lg disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Profile() {
  const { token, setUser } = useAuth();

  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    enrollment_id: '',
    location: '',
    linkedin_url: '',
    website_url: '',
    headline: '',
    bio: '',
    education: [],
    experience: [],
    profile_image: '',
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Fetch real profile from backend
  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const start = Date.now();
    try {
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();

        let parsedEducation = [];
        try {
          parsedEducation = typeof data.education === 'string' ? JSON.parse(data.education) : (data.education || []);
        } catch (_) {
          parsedEducation = [];
        }

        let parsedExperience = [];
        try {
          parsedExperience = typeof data.experience === 'string' ? JSON.parse(data.experience) : (data.experience || []);
        } catch (_) {
          parsedExperience = [];
        }

        setProfile({
          ...data,
          education: parsedEducation,
          experience: parsedExperience,
        });
      }
    } catch (_) {}

    // Ensure loading state page is shown for a short period to make it visually clear
    const elapsed = Date.now() - start;
    const minDelay = 1500;
    if (elapsed < minDelay) {
      await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed));
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async (form) => {
    try {
      const payload = {
        ...form,
        education: JSON.stringify(form.education),
        experience: JSON.stringify(form.experience),
      };
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();

        let parsedEducation = [];
        try {
          parsedEducation = typeof updated.education === 'string' ? JSON.parse(updated.education) : (updated.education || []);
        } catch (_) {
          parsedEducation = [];
        }

        let parsedExperience = [];
        try {
          parsedExperience = typeof updated.experience === 'string' ? JSON.parse(updated.experience) : (updated.experience || []);
        } catch (_) {
          parsedExperience = [];
        }

        const finalProfile = {
          ...updated,
          education: parsedEducation,
          experience: parsedExperience,
        };
        setProfile(finalProfile);
        setUser(finalProfile);
        setSaveMsg('Profile updated!');
        setTimeout(() => setSaveMsg(''), 3000);
      }
    } catch (_) {}
    setIsEditing(false);
  };

  // Derived display values
  const displayName = profile.full_name || profile.username || 'Your Name';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (loading) {
    return (
      <div
        className="p-p-lg min-h-screen"
        style={{
          background:
            'radial-gradient(at 0% 0%, rgba(79,70,229,0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(0,108,73,0.05) 0px, transparent 50%)',
        }}
      >
        <div className="max-w-[1200px] mx-auto pb-24 space-y-8 overflow-hidden">
          {/* Header Skeleton Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="w-32 h-32 rounded-3xl skeleton-shimmer shrink-0"></div>
              <div className="flex-1 space-y-4 w-full">
                <div className="h-8 w-1/3 skeleton-shimmer rounded-lg"></div>
                <div className="h-4 w-1/4 skeleton-shimmer rounded-md"></div>
                <div className="flex gap-4 pt-2">
                  <div className="h-10 w-32 skeleton-shimmer rounded-xl"></div>
                  <div className="h-10 w-32 skeleton-shimmer rounded-xl"></div>
                </div>
              </div>
              <div className="hidden md:block space-y-2 text-right">
                <div className="h-4 w-32 skeleton-shimmer rounded ml-auto"></div>
                <div className="h-4 w-24 skeleton-shimmer rounded ml-auto"></div>
              </div>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column: Experience & Education */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Experience Section */}
              <div className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div className="h-6 w-40 skeleton-shimmer rounded"></div>
                  <div className="h-8 w-8 skeleton-shimmer rounded-full"></div>
                </div>
                <div className="space-y-10">
                  <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-xl skeleton-shimmer shrink-0"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-2/5 skeleton-shimmer rounded"></div>
                      <div className="h-4 w-1/4 skeleton-shimmer rounded"></div>
                      <div className="h-4 w-full skeleton-shimmer rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div
        className="p-p-lg min-h-screen"
        style={{
          background:
            'radial-gradient(at 0% 0%, rgba(79,70,229,0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(0,108,73,0.05) 0px, transparent 50%)',
        }}
      >
        <EditProfileForm
          profile={profile}
          onCancel={() => setIsEditing(false)}
          onSave={handleSave}
        />
      </div>
    );
  }

  return (
    <div
      className="p-p-lg min-h-screen"
      style={{
        background:
          'radial-gradient(at 0% 0%, rgba(79,70,229,0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(0,108,73,0.05) 0px, transparent 50%)',
      }}
    >
      {/* ── Save success toast ── */}
      {saveMsg && (
        <div className="fixed top-24 right-6 z-50 bg-secondary text-on-secondary px-6 py-3 rounded-xl text-label-md shadow-lg flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
          {saveMsg}
        </div>
      )}

      <div className="max-w-[1200px] mx-auto pb-24 space-y-8">
        {/* ── 1. Header Profile Card ── */}
        <section className="bg-white border border-slate-100 rounded-2xl p-p-lg flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />

          {/* Avatar */}
          <div className="w-36 h-36 rounded-2xl overflow-hidden border-4 border-surface-container-low shadow-sm flex-shrink-0 bg-primary/10 flex items-center justify-center">
            {profile.profile_image ? (
              <img src={profile.profile_image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
                <span className="text-4xl font-extrabold text-white">{initials}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-end gap-3 mb-2">
              <h2 className="text-headline-lg font-bold text-on-surface">{displayName}</h2>
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-md font-semibold">
                Actively Seeking
              </span>
            </div>
            <p className="text-body-lg text-on-surface-variant mb-4">
              {profile.headline || (
                profile.education && profile.education.length > 0
                  ? `${profile.education[0].degree || 'Student'} at ${profile.education[0].institution}`
                  : 'Student'
              )}
            </p>
            <div className="flex flex-wrap gap-6 text-outline">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>badge</span>
                <span className="text-label-md">Enrollment ID: {profile.enrollment_id || 'Not Set'}</span>
              </div>
              {profile.email && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>mail</span>
                  <span className="text-label-md">{profile.email}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>phone</span>
                  <span className="text-label-md">{profile.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>location_on</span>
                <span className="text-label-md">{profile.location || 'Location Not Set'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>link</span>
                <span className="text-label-md">
                  {profile.linkedin_url ? (
                    <a href={`https://${profile.linkedin_url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary transition-colors">
                      {profile.linkedin_url}
                    </a>
                  ) : (
                    'LinkedIn Not Set'
                  )}
                </span>
              </div>
              {profile.website_url && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>language</span>
                  <span className="text-label-md">
                    <a href={profile.website_url.startsWith('http') ? profile.website_url : `https://${profile.website_url}`} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary transition-colors">
                      {profile.website_url}
                    </a>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button className="bg-primary text-on-primary px-8 py-3 rounded-xl text-label-md shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">share</span> Share Portfolio
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="border border-outline-variant text-on-surface-variant px-8 py-3 rounded-xl text-label-md hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">edit</span> Edit Profile
            </button>
          </div>
        </section>

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left column — Bio + Education + Experience */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Bio Summary Section */}
            {profile.bio && (
              <section className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-headline-md font-bold text-on-surface mb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">description</span> Professional Summary
                </h3>
                <p className="text-on-surface-variant text-body-md leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
              </section>
            )}

            {/* Education */}
            <section className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-headline-md font-bold text-on-surface mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">school</span> Education
              </h3>
              <div className="space-y-8">
                {profile.education && profile.education.length > 0 ? (
                  profile.education.map(({ institution, timeline, degree, detail }, idx) => (
                    <div key={idx} className="flex gap-6">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary">school</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-body-lg font-bold">{institution}</h4>
                          <span className="text-outline text-label-md whitespace-nowrap ml-4">{timeline}</span>
                        </div>
                        <p className="text-primary text-label-md mb-2">{degree}</p>
                        <p className="text-on-surface-variant text-body-md">{detail}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-on-surface-variant text-body-md">No education history added yet.</p>
                )}
              </div>
            </section>

            {/* Experience */}
            <section className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-headline-md font-bold text-on-surface mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">work_history</span> Experience
              </h3>
              <div className="space-y-10">
                {profile.experience && profile.experience.length > 0 ? (
                  profile.experience.map(({ company, title, timeline, accomplishments }, idx) => (
                    <div key={idx} className="flex gap-6">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary">work</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-body-lg font-bold">{title}</h4>
                          <span className="text-outline text-label-md whitespace-nowrap ml-4">{timeline}</span>
                        </div>
                        <p className="text-primary text-label-md mb-2">{company}</p>
                        {accomplishments && (
                          <ul className="text-on-surface-variant list-disc ml-4 space-y-2 text-body-md">
                            {accomplishments.split('\n').map((line, lineIdx) => {
                              const cleanedLine = line.trim();
                              if (!cleanedLine) return null;
                              return (
                                <li key={lineIdx}>
                                  {cleanedLine.startsWith('•') ? cleanedLine.substring(1).trim() : cleanedLine}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-on-surface-variant text-body-md">No work experience added yet.</p>
                )}
              </div>
            </section>
          </div>

          {/* Right column — Skills, Resume, Languages */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Skills */}
            <section className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-headline-md font-bold text-on-surface mb-6">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 rounded-lg bg-primary/5 text-primary border border-primary/10 text-label-md hover:bg-primary hover:text-on-primary transition-colors cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Resume */}
            <section className="bg-primary text-on-primary rounded-2xl p-p-lg shadow-sm">
              <h3 className="text-headline-md font-bold mb-3">Official Resume</h3>
              <p className="opacity-80 mb-6 text-body-md">Last updated: Oct 24, 2023. Version 4.2 (ATS Optimised)</p>
              <div className="space-y-3">
                <button className="w-full bg-white text-primary py-3 rounded-xl text-label-md font-semibold flex items-center justify-center gap-2 hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors">
                  <span className="material-symbols-outlined">download</span> Download PDF
                </button>
                <button className="w-full border border-white/20 py-3 rounded-xl text-label-md font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                  <span className="material-symbols-outlined">upload</span> Update Resume
                </button>
              </div>
            </section>

            {/* Languages */}
            <section className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-label-md text-outline uppercase tracking-widest mb-4">Languages</h3>
              <div className="space-y-3">
                {LANGUAGES.map(({ name, level, color }) => (
                  <div key={name} className="flex justify-between items-center">
                    <span className="text-body-md text-on-surface">{name}</span>
                    <span className={`text-label-md ${color}`}>{level}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Key Projects — full width */}
          <section className="col-span-12 bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-headline-md font-bold text-on-surface">Key Projects</h3>
              <a href="#" className="text-primary text-label-md flex items-center gap-1 hover:underline">
                View GitHub <span className="material-symbols-outlined" style={{ fontSize: 18 }}>open_in_new</span>
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROJECTS.map(({ icon, title, desc, tags }) => (
                <div
                  key={title}
                  className="border border-outline-variant rounded-2xl p-6 hover:border-primary transition-colors group cursor-default"
                >
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors text-on-surface-variant">
                    <span className="material-symbols-outlined">{icon}</span>
                  </div>
                  <h4 className="text-body-lg font-bold mb-2 text-on-surface">{title}</h4>
                  <p className="text-on-surface-variant text-body-md mb-4 line-clamp-2">{desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <span key={t} className="text-[12px] font-bold text-outline uppercase">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
