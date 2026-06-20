import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

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
    skills: profile.skills || [],
    languages: profile.languages || [],
    projects: profile.projects || [],
  });
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const fileInputRef = useRef(null);

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
        const MAX = 800;
        let { width, height } = img;
        if (width > height ? width > MAX : height > MAX) {
          if (width > height) { height *= MAX / width; width = MAX; }
          else { width *= MAX / height; height = MAX; }
        }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        setForm((prev) => ({ ...prev, profile_image: canvas.toDataURL('image/jpeg', 0.7) }));
      };
    };
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Education
  const handleEducationChange = (i, field, val) =>
    setForm((prev) => { const u = [...prev.education]; u[i] = { ...u[i], [field]: val }; return { ...prev, education: u }; });
  const addEducation = () =>
    setForm((prev) => ({ ...prev, education: [...prev.education, { institution: '', degree: '', timeline: '', detail: '' }] }));
  const deleteEducation = (i) =>
    setForm((prev) => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }));

  // Experience
  const handleExperienceChange = (i, field, val) =>
    setForm((prev) => { const u = [...prev.experience]; u[i] = { ...u[i], [field]: val }; return { ...prev, experience: u }; });
  const addExperience = () =>
    setForm((prev) => ({ ...prev, experience: [...prev.experience, { company: '', title: '', timeline: '', accomplishments: '' }] }));
  const deleteExperience = (i) =>
    setForm((prev) => ({ ...prev, experience: prev.experience.filter((_, idx) => idx !== i) }));

  // Skills
  const addSkill = () => {
    const s = newSkill.trim();
    if (!s || form.skills.includes(s)) return;
    setForm((prev) => ({ ...prev, skills: [...prev.skills, s] }));
    setNewSkill('');
  };
  const removeSkill = (skill) =>
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));

  // Languages
  const addLanguage = () =>
    setForm((prev) => ({ ...prev, languages: [...prev.languages, { name: '', level: 'Conversational' }] }));
  const handleLanguageChange = (i, field, val) =>
    setForm((prev) => { const u = [...prev.languages]; u[i] = { ...u[i], [field]: val }; return { ...prev, languages: u }; });
  const removeLanguage = (i) =>
    setForm((prev) => ({ ...prev, languages: prev.languages.filter((_, idx) => idx !== i) }));

  // Projects
  const addProject = () =>
    setForm((prev) => ({ ...prev, projects: [...prev.projects, { title: '', desc: '', tags: '' }] }));
  const handleProjectChange = (i, field, val) =>
    setForm((prev) => { const u = [...prev.projects]; u[i] = { ...u[i], [field]: val }; return { ...prev, projects: u }; });
  const removeProject = (i) =>
    setForm((prev) => ({ ...prev, projects: prev.projects.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const initials = form.full_name
    ? form.full_name.trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const LANGUAGE_LEVELS = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Conversational', 'Basic'];

  return (
    <div className="max-w-[1200px] mx-auto pb-24 space-y-8">
      <form onSubmit={handleSubmit}>
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Edit Professional Profile</h2>
            <p className="text-on-surface-variant font-body-md text-body-md">Refine your academic and professional identity for recruiter visibility.</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onCancel}
              className="px-6 py-2.5 border border-outline-variant text-on-surface-variant rounded-xl font-label-md text-label-md hover:bg-surface-container-low transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-label-md text-label-md shadow-md hover:scale-[1.02] hover:shadow-lg active:scale-95 transition-all disabled:opacity-60">
              {saving ? 'Saving Changes…' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="xl:col-span-4 space-y-8">
            {/* Profile Photo */}
            <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-6">Identity Photo</h3>
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-surface-container-high shadow-xl mb-6 flex items-center justify-center bg-gradient-to-br from-primary to-primary-container">
                    {form.profile_image
                      ? <img src={form.profile_image} alt="Profile" className="w-full h-full object-cover" />
                      : <span className="text-5xl font-extrabold text-white">{initials}</span>}
                  </div>
                  <button type="button" onClick={() => fileInputRef.current.click()}
                    className="absolute bottom-6 right-2 bg-primary text-on-primary p-2 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                  </button>
                  {form.profile_image && (
                    <button type="button" onClick={() => setForm((p) => ({ ...p, profile_image: '' }))}
                      className="absolute bottom-6 left-2 bg-error text-on-error p-2 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all" title="Remove Photo">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
                <p className="text-caption text-on-surface-variant text-center max-w-[200px]">Click the camera icon to upload a professional headshot.</p>
              </div>
            </section>

            {/* Contact Details */}
            <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-6">Contact & Links</h3>
              <div className="space-y-4">
                {[
                  { name: 'location', label: 'Current Location', icon: 'location_on', type: 'text' },
                  { name: 'linkedin_url', label: 'LinkedIn URL', icon: 'link', type: 'text', placeholder: 'linkedin.com/in/username' },
                  { name: 'website_url', label: 'Portfolio/Website', icon: 'language', type: 'text', placeholder: 'portfolio.com' },
                  { name: 'enrollment_id', label: 'Enrollment ID', icon: 'badge', type: 'text' },
                  { name: 'phone', label: 'Phone Number', icon: 'phone', type: 'tel' },
                  { name: 'email', label: 'Email Address', icon: 'mail', type: 'email' },
                ].map(({ name, label, icon, type, placeholder }) => (
                  <div key={name} className="space-y-1.5">
                    <label className="text-label-md font-bold text-on-surface-variant ml-1">{label}</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">{icon}</span>
                      <input name={name} value={form[name]} onChange={handleChange} placeholder={placeholder || ''}
                        className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface"
                        type={type} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Skills (Expertise) */}
            <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-4">Expertise / Skills</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {form.skills.map((skill) => (
                  <span key={skill} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-label-md">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="ml-1 text-primary/60 hover:text-error transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  placeholder="e.g. React, Python, SQL…"
                  className="flex-1 px-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-body-md focus:outline-none focus:border-primary transition-all text-on-surface" />
                <button type="button" onClick={addSkill}
                  className="px-4 py-2 bg-primary text-on-primary rounded-xl text-label-md font-semibold hover:opacity-90 transition-opacity">
                  Add
                </button>
              </div>
            </section>

            {/* Languages */}
            <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest">Languages</h3>
                <button type="button" onClick={addLanguage}
                  className="flex items-center gap-1 text-primary font-bold text-label-md hover:opacity-80 transition-opacity">
                  <span className="material-symbols-outlined text-sm">add</span> Add
                </button>
              </div>
              <div className="space-y-3">
                {form.languages.map((lang, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={lang.name} onChange={(e) => handleLanguageChange(i, 'name', e.target.value)}
                      placeholder="Language name"
                      className="flex-1 px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-body-md focus:outline-none focus:border-primary transition-all text-on-surface" />
                    <select value={lang.level} onChange={(e) => handleLanguageChange(i, 'level', e.target.value)}
                      className="px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-body-md focus:outline-none focus:border-primary transition-all text-on-surface">
                      {LANGUAGE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <button type="button" onClick={() => removeLanguage(i)} className="text-error hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
                {form.languages.length === 0 && (
                  <p className="text-on-surface-variant text-body-md">No languages added yet.</p>
                )}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="xl:col-span-8 space-y-8">
            {/* Professional Summary */}
            <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-6">Professional Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {[
                  { name: 'full_name', label: 'Full Name' },
                  { name: 'headline', label: 'Headline' },
                ].map(({ name, label }) => (
                  <div key={name} className="space-y-1.5">
                    <label className="text-label-md font-bold text-on-surface-variant ml-1">{label}</label>
                    <input name={name} value={form[name]} onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface"
                      type="text" />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <label className="text-label-md font-bold text-on-surface-variant ml-1">Professional Bio</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows="5"
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none text-on-surface" />
              </div>
            </section>

            {/* Education */}
            <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest">Education History</h3>
                <button type="button" onClick={addEducation}
                  className="flex items-center gap-2 text-primary font-bold text-label-md hover:opacity-80 transition-opacity">
                  <span className="material-symbols-outlined text-sm">add</span> Add Education
                </button>
              </div>
              <div className="space-y-8">
                {form.education.map((edu, idx) => (
                  <div key={idx} className="group relative p-6 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl hover:border-primary/30 transition-all">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { field: 'institution', label: 'Institution', cls: 'font-headline-md text-headline-md' },
                        { field: 'degree', label: 'Degree / Major', cls: 'font-body-lg text-body-lg' },
                        { field: 'timeline', label: 'Timeline', cls: 'font-body-md text-body-md' },
                        { field: 'detail', label: 'GPA / Honors', cls: 'font-body-md text-body-md' },
                      ].map(({ field, label, cls }) => (
                        <div key={field} className="space-y-1.5">
                          <label className="text-caption font-bold text-outline">{label}</label>
                          <input value={edu[field]} onChange={(e) => handleEducationChange(idx, field, e.target.value)}
                            className={`w-full px-4 py-2 bg-transparent border-b border-outline-variant ${cls} focus:border-primary outline-none transition-all text-on-surface`}
                            type="text" />
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => deleteEducation(idx)}
                      className="absolute top-4 right-4 text-error opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 active:scale-95">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Experience */}
            <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest">Work Experience</h3>
                <button type="button" onClick={addExperience}
                  className="flex items-center gap-2 text-primary font-bold text-label-md hover:opacity-80 transition-opacity">
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
                          <input value={exp.company} onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                            className="w-full px-4 py-2 bg-transparent border-b border-outline-variant font-headline-md text-headline-md focus:border-primary outline-none transition-all text-on-surface" type="text" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-caption font-bold text-outline">Job Title</label>
                          <input value={exp.title} onChange={(e) => handleExperienceChange(idx, 'title', e.target.value)}
                            className="w-full px-4 py-2 bg-transparent border-b border-outline-variant font-body-lg text-body-lg focus:border-primary outline-none transition-all text-on-surface" type="text" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption font-bold text-outline">Timeline</label>
                        <input value={exp.timeline} onChange={(e) => handleExperienceChange(idx, 'timeline', e.target.value)}
                          className="w-full px-4 py-2 bg-transparent border-b border-outline-variant font-body-md text-body-md focus:border-primary outline-none transition-all text-on-surface" type="text" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption font-bold text-outline">Key Accomplishments (one per line)</label>
                        <textarea value={exp.accomplishments} onChange={(e) => handleExperienceChange(idx, 'accomplishments', e.target.value)}
                          className="w-full px-4 py-2 bg-transparent border-b border-outline-variant font-body-md text-body-md focus:border-primary outline-none transition-all resize-none text-on-surface" rows="3" />
                      </div>
                    </div>
                    <button type="button" onClick={() => deleteExperience(idx)}
                      className="absolute top-4 right-4 text-error opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 active:scale-95">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Projects */}
            <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest">Key Projects</h3>
                <button type="button" onClick={addProject}
                  className="flex items-center gap-2 text-primary font-bold text-label-md hover:opacity-80 transition-opacity">
                  <span className="material-symbols-outlined text-sm">add</span> Add Project
                </button>
              </div>
              <div className="space-y-8">
                {form.projects.map((proj, idx) => (
                  <div key={idx} className="group relative p-6 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl hover:border-primary/30 transition-all">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-caption font-bold text-outline">Project Title</label>
                        <input value={proj.title} onChange={(e) => handleProjectChange(idx, 'title', e.target.value)}
                          className="w-full px-4 py-2 bg-transparent border-b border-outline-variant font-headline-md text-headline-md focus:border-primary outline-none transition-all text-on-surface" type="text" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption font-bold text-outline">Description</label>
                        <textarea value={proj.desc} onChange={(e) => handleProjectChange(idx, 'desc', e.target.value)}
                          className="w-full px-4 py-2 bg-transparent border-b border-outline-variant font-body-md text-body-md focus:border-primary outline-none transition-all resize-none text-on-surface" rows="2" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption font-bold text-outline">Tech Tags (comma-separated)</label>
                        <input value={proj.tags} onChange={(e) => handleProjectChange(idx, 'tags', e.target.value)}
                          placeholder="e.g. React, Python, Docker"
                          className="w-full px-4 py-2 bg-transparent border-b border-outline-variant font-body-md text-body-md focus:border-primary outline-none transition-all text-on-surface" type="text" />
                      </div>
                    </div>
                    <button type="button" onClick={() => removeProject(idx)}
                      className="absolute top-4 right-4 text-error opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 active:scale-95">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
                {form.projects.length === 0 && (
                  <p className="text-on-surface-variant text-body-md">No projects added yet. Click "Add Project" to get started.</p>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="fixed bottom-0 left-0 w-full lg:hidden bg-surface-container-highest border-t border-outline-variant p-4 flex gap-4 z-50">
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 border border-outline-variant text-on-surface-variant rounded-xl font-label-md text-label-md bg-surface">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-label-md text-label-md shadow-lg disabled:opacity-60">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseJson(val, fallback = []) {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val) || fallback; } catch (_) { return fallback; }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Profile() {
  const { token, setUser } = useAuth();

  const [profile, setProfile] = useState({
    full_name: '', email: '', phone: '', enrollment_id: '', location: '',
    linkedin_url: '', website_url: '', headline: '', bio: '',
    education: [], experience: [], profile_image: '',
    resume_name: '', resume_url: '', is_eligible: 0,
    skills: [], languages: [], projects: [],
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: 'success'|'error' }
  const resumeInputRef = useRef(null);
  const [resumeUploading, setResumeUploading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const parseProfile = (data) => ({
    ...data,
    education: parseJson(data.education),
    experience: parseJson(data.experience),
    skills: parseJson(data.skills),
    languages: parseJson(data.languages),
    projects: parseJson(data.projects),
  });

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const start = Date.now();
    try {
      const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setProfile(parseProfile(data));
      }
    } catch (_) {}
    const elapsed = Date.now() - start;
    if (elapsed < 1200) await new Promise((r) => setTimeout(r, 1200 - elapsed));
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async (form) => {
    try {
      const payload = {
        ...form,
        education: JSON.stringify(form.education),
        experience: JSON.stringify(form.experience),
        skills: JSON.stringify(form.skills),
        languages: JSON.stringify(form.languages),
        projects: JSON.stringify(form.projects),
      };
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        const parsed = parseProfile(updated);
        setProfile(parsed);
        setUser(parsed);
        showToast('Profile updated successfully!');
      } else {
        showToast('Failed to save profile. Please try again.', 'error');
      }
    } catch (_) {
      showToast('Network error. Please try again.', 'error');
    }
    setIsEditing(false);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Only PDF files are allowed.', 'error');
      return;
    }
    setResumeUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/profile/resume', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const parsed = parseProfile(data);
        setProfile(parsed);
        setUser(parsed);
        showToast('Resume uploaded! Your eligibility has been updated.');
      } else {
        const err = await res.json();
        showToast(`Upload failed: ${err.detail || 'Please try again.'}`, 'error');
      }
    } catch (_) {
      showToast('An error occurred during upload.', 'error');
    }
    setResumeUploading(false);
    // reset input so same file can be re-selected
    if (resumeInputRef.current) resumeInputRef.current.value = '';
  };

  // Tutorial state
  const [tutorialStep, setTutorialStep] = useState(0);
  useEffect(() => {
    if (window.location.search.includes('tutorial=true')) {
      setTutorialStep(1);
      const url = new URL(window.location);
      url.searchParams.delete('tutorial');
      window.history.replaceState({}, '', url);
    }
  }, []);

  const displayName = profile.full_name || profile.username || 'Your Name';
  const initials = displayName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  if (loading) {
    return (
      <div className="p-p-lg min-h-screen"
        style={{ background: 'radial-gradient(at 0% 0%, rgba(79,70,229,0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(0,108,73,0.05) 0px, transparent 50%)' }}>
        <div className="max-w-[1200px] mx-auto pb-24 space-y-8">
          <div className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="w-32 h-32 rounded-3xl skeleton-shimmer shrink-0" />
              <div className="flex-1 space-y-4 w-full">
                <div className="h-8 w-1/3 skeleton-shimmer rounded-lg" />
                <div className="h-4 w-1/4 skeleton-shimmer rounded-md" />
                <div className="flex gap-4 pt-2">
                  <div className="h-10 w-32 skeleton-shimmer rounded-xl" />
                  <div className="h-10 w-32 skeleton-shimmer rounded-xl" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm">
                <div className="h-6 w-40 skeleton-shimmer rounded mb-8" />
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-xl skeleton-shimmer shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-2/5 skeleton-shimmer rounded" />
                    <div className="h-4 w-1/4 skeleton-shimmer rounded" />
                    <div className="h-4 w-full skeleton-shimmer rounded" />
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
      <div className="p-p-lg min-h-screen"
        style={{ background: 'radial-gradient(at 0% 0%, rgba(79,70,229,0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(0,108,73,0.05) 0px, transparent 50%)' }}>
        <EditProfileForm profile={profile} onCancel={() => setIsEditing(false)} onSave={handleSave} />
      </div>
    );
  }

  return (
    <div className="p-p-lg min-h-screen"
      style={{ background: 'radial-gradient(at 0% 0%, rgba(79,70,229,0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(0,108,73,0.05) 0px, transparent 50%)' }}>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 right-6 z-50 px-6 py-3 rounded-xl text-label-md shadow-lg flex items-center gap-2 animate-bounce transition-all
          ${toast.type === 'error' ? 'bg-error text-on-error' : 'bg-secondary text-on-secondary'}`}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.message}
        </div>
      )}

      <div className="max-w-[1200px] mx-auto pb-24 space-y-8">

        {/* Eligibility Banner */}
        {profile.is_eligible ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-6 flex items-start gap-4 shadow-sm animate-fadeIn">
            <span className="material-symbols-outlined text-emerald-600 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <div>
              <h4 className="font-bold text-body-lg text-emerald-900">Placement Eligibility Active</h4>
              <p className="text-body-md text-emerald-800/90 mt-1">
                Your account is fully activated. You are eligible to apply to all placement and internship drives. Keep your profile updated for recruiters!
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-6 flex items-start gap-4 shadow-sm animate-fadeIn">
            <span className="material-symbols-outlined text-amber-600 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <div>
              <h4 className="font-bold text-body-lg text-amber-900">Account Not Fully Activated</h4>
              <p className="text-body-md text-amber-800/90 mt-1">
                You are currently <strong>ineligible</strong> to apply for placement drives. To activate, please update your profile (Full Name + Email) and upload a <strong>PDF Resume</strong> in the resume section below.
              </p>
            </div>
          </div>
        )}

        {/* Header Profile Card */}
        <section className="bg-white border border-slate-100 rounded-2xl p-p-lg flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
          <div className="w-36 h-36 rounded-2xl overflow-hidden border-4 border-surface-container-low shadow-sm flex-shrink-0 bg-primary/10 flex items-center justify-center">
            {profile.profile_image
              ? <img src={profile.profile_image} alt="Profile" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
                  <span className="text-4xl font-extrabold text-white">{initials}</span>
                </div>}
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-end gap-3 mb-2">
              <h2 className="text-headline-lg font-bold text-on-surface">{displayName}</h2>
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-md font-semibold">
                Actively Seeking
              </span>
            </div>
            <p className="text-body-lg text-on-surface-variant mb-4">
              {profile.headline || (profile.education?.length > 0
                ? `${profile.education[0].degree || 'Student'} at ${profile.education[0].institution}`
                : 'Student')}
            </p>
            <div className="flex flex-wrap gap-6 text-outline">
              {profile.enrollment_id && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>badge</span>
                  <span className="text-label-md">ID: {profile.enrollment_id}</span>
                </div>
              )}
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
              {profile.location && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>location_on</span>
                  <span className="text-label-md">{profile.location}</span>
                </div>
              )}
              {profile.linkedin_url && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>link</span>
                  <a href={`https://${profile.linkedin_url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer"
                    className="text-label-md hover:underline hover:text-primary transition-colors">
                    {profile.linkedin_url}
                  </a>
                </div>
              )}
              {profile.website_url && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>language</span>
                  <a href={profile.website_url.startsWith('http') ? profile.website_url : `https://${profile.website_url}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-label-md hover:underline hover:text-primary transition-colors">
                    {profile.website_url}
                  </a>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button className="bg-primary text-on-primary px-8 py-3 rounded-xl text-label-md shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">share</span> Share Portfolio
            </button>
            <button onClick={() => setIsEditing(true)}
              className="border border-outline-variant text-on-surface-variant px-8 py-3 rounded-xl text-label-md hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">edit</span> Edit Profile
            </button>
          </div>
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left column */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <section className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-headline-md font-bold text-on-surface mb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">description</span> Professional Summary
                </h3>
                <p className="text-on-surface-variant text-body-md leading-relaxed whitespace-pre-line">{profile.bio}</p>
              </section>
            )}

            {/* Education */}
            <section className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-headline-md font-bold text-on-surface mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">school</span> Education
              </h3>
              <div className="space-y-8">
                {profile.education?.length > 0 ? profile.education.map(({ institution, timeline, degree, detail }, idx) => (
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
                )) : <p className="text-on-surface-variant text-body-md">No education history added yet. Click Edit Profile to add.</p>}
              </div>
            </section>

            {/* Experience */}
            <section className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-headline-md font-bold text-on-surface mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">work_history</span> Experience
              </h3>
              <div className="space-y-10">
                {profile.experience?.length > 0 ? profile.experience.map(({ company, title, timeline, accomplishments }, idx) => (
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
                          {accomplishments.split('\n').map((line, i) => {
                            const c = line.trim();
                            if (!c) return null;
                            return <li key={i}>{c.startsWith('•') ? c.substring(1).trim() : c}</li>;
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                )) : <p className="text-on-surface-variant text-body-md">No work experience added yet. Click Edit Profile to add.</p>}
              </div>
            </section>

            {/* Projects — full width under experience */}
            {profile.projects?.length > 0 && (
              <section className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-headline-md font-bold text-on-surface mb-8 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">rocket_launch</span> Key Projects
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile.projects.map((proj, idx) => {
                    const tags = typeof proj.tags === 'string'
                      ? proj.tags.split(',').map((t) => t.trim()).filter(Boolean)
                      : (proj.tags || []);
                    return (
                      <div key={idx} className="border border-outline-variant rounded-2xl p-6 hover:border-primary transition-colors group cursor-default">
                        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors text-on-surface-variant">
                          <span className="material-symbols-outlined">psychology</span>
                        </div>
                        <h4 className="text-body-lg font-bold mb-2 text-on-surface">{proj.title}</h4>
                        <p className="text-on-surface-variant text-body-md mb-4 line-clamp-3">{proj.desc}</p>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((t) => (
                            <span key={t} className="text-[12px] font-bold text-outline uppercase">{t}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Right column */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Resume */}
            <section className="bg-primary text-on-primary rounded-2xl p-p-lg shadow-sm">
              <h3 className="text-headline-md font-bold mb-3">Official Resume</h3>
              {profile.resume_name ? (
                <>
                  <p className="opacity-80 mb-6 text-body-md truncate" title={profile.resume_name}>
                    📄 {profile.resume_name}
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => profile.resume_url && window.open(profile.resume_url, '_blank')}
                      className="w-full bg-white text-primary py-3 rounded-xl text-label-md font-semibold flex items-center justify-center gap-2 hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors cursor-pointer">
                      <span className="material-symbols-outlined">download</span> View / Download PDF
                    </button>
                    <button
                      onClick={() => resumeInputRef.current?.click()}
                      disabled={resumeUploading}
                      className="w-full border border-white/20 py-3 rounded-xl text-label-md font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-60">
                      <span className="material-symbols-outlined">{resumeUploading ? 'hourglass_empty' : 'upload'}</span>
                      {resumeUploading ? 'Uploading…' : 'Update Resume'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="opacity-80 mb-6 text-body-md">
                    No resume uploaded yet. Upload a PDF to activate your placement eligibility.
                  </p>
                  <button
                    onClick={() => resumeInputRef.current?.click()}
                    disabled={resumeUploading}
                    className="w-full bg-white text-primary py-3 rounded-xl text-label-md font-semibold flex items-center justify-center gap-2 hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors cursor-pointer disabled:opacity-60">
                    <span className="material-symbols-outlined">{resumeUploading ? 'hourglass_empty' : 'upload'}</span>
                    {resumeUploading ? 'Uploading…' : 'Upload PDF Resume'}
                  </button>
                </>
              )}
              <input ref={resumeInputRef} type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
            </section>

            {/* Skills */}
            {profile.skills?.length > 0 && (
              <section className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-headline-md font-bold text-on-surface mb-6">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span key={skill}
                      className="px-4 py-2 rounded-lg bg-primary/5 text-primary border border-primary/10 text-label-md hover:bg-primary hover:text-on-primary transition-colors cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {profile.languages?.length > 0 && (
              <section className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-label-md text-outline uppercase tracking-widest mb-4">Languages</h3>
                <div className="space-y-3">
                  {profile.languages.map(({ name, level }, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-body-md text-on-surface">{name}</span>
                      <span className="text-label-md text-secondary">{level}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Edit Profile prompt if sections are empty */}
            {profile.skills?.length === 0 && profile.languages?.length === 0 && (
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 text-center">
                <span className="material-symbols-outlined text-outline mb-2" style={{ fontSize: 36 }}>edit_note</span>
                <p className="text-body-md text-on-surface-variant mt-2">Add your skills and languages by clicking <strong>Edit Profile</strong>.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tutorial Modals */}
      {tutorialStep === 1 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary-container/20 text-primary rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>person_search</span>
            </div>
            <h3 className="text-headline-md font-bold text-on-surface mb-2">Step 1: Activate Your Profile</h3>
            <p className="text-body-md text-on-surface-variant mb-8 leading-relaxed">
              Welcome to AlignNova! To begin applying for placement drives, you must first activate your profile.
              Start by clicking <strong>Edit Profile</strong> on this page to complete your <strong>Full Name</strong>, <strong>University Email</strong>, and a professional <strong>Headline</strong> to let recruiters know who you are.
            </p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setTutorialStep(0)}
                className="flex-1 py-3 border border-outline-variant text-on-surface-variant font-bold rounded-xl text-label-md hover:bg-slate-50 transition-colors cursor-pointer">
                Skip
              </button>
              <button onClick={() => setTutorialStep(2)}
                className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-xl text-label-md hover:scale-[1.02] active:scale-95 transition-all shadow-md cursor-pointer">
                Next: Resume →
              </button>
            </div>
            <div className="flex gap-2 mt-6">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="w-2 h-2 rounded-full bg-outline-variant" />
            </div>
          </div>
        </div>
      )}
      {tutorialStep === 2 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-secondary-container/20 text-secondary rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: '32px' }}>upload_file</span>
            </div>
            <h3 className="text-headline-md font-bold text-on-surface mb-2">Step 2: Upload Your Resume</h3>
            <p className="text-body-md text-on-surface-variant mb-8 leading-relaxed">
              The final step to trigger placement activation is uploading your resume.
              Recruiters require a verified <strong>PDF Resume</strong> in order to shortlist candidates.
              Upload your document in the <strong>Official Resume</strong> section on the right side to get instantly activated!
            </p>
            <button onClick={() => setTutorialStep(0)}
              className="w-full py-3.5 bg-primary text-on-primary font-bold rounded-xl text-label-md hover:scale-[1.02] active:scale-95 transition-all shadow-md cursor-pointer">
              Get Started 🚀
            </button>
            <div className="flex gap-2 mt-6">
              <span className="w-2 h-2 rounded-full bg-outline-variant" />
              <span className="w-2 h-2 rounded-full bg-secondary" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
