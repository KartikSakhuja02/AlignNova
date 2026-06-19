import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

// ─── Static Data ──────────────────────────────────────────────────────────────

const SKILLS = ['Python', 'Java', 'C++', 'TypeScript', 'React.js', 'Kubernetes', 'SQL', 'PyTorch', 'AWS', 'Git'];

const LANGUAGES = [
  { name: 'English', level: 'Native', color: 'text-secondary' },
  { name: 'Spanish', level: 'Fluent', color: 'text-secondary' },
  { name: 'Mandarin', level: 'Basic', color: 'text-outline' },
];

const EDUCATION = [
  {
    icon: 'account_balance',
    institution: 'Stanford University',
    period: '2021 — 2025',
    degree: 'B.S. in Computer Science, Minor in Economics',
    detail:
      'GPA: 3.92/4.00. Focus on Distributed Systems and Machine Learning. Relevant coursework includes Algorithm Design, Data Mining, and Quantitative Finance.',
  },
];

const EXPERIENCE = [
  {
    icon: 'code',
    title: 'Software Engineer Intern',
    period: 'Jun 2023 — Aug 2023',
    company: 'Google Cloud Platform (GCP)',
    bullets: [
      'Optimized latency for internal observability dashboards by 15% using Go and gRPC.',
      'Implemented a high-throughput data pipeline using Apache Kafka for real-time log analysis.',
      'Collaborated with cross-functional teams to deploy containerized microservices via Kubernetes.',
    ],
  },
  {
    icon: 'analytics',
    title: 'Data Science Research Assistant',
    period: 'Sep 2022 — May 2023',
    company: 'Stanford AI Lab',
    bullets: [
      'Developed predictive models for urban traffic flow using Python and TensorFlow.',
      'Processed large-scale sensor data representing over 10M distinct events.',
    ],
  },
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

// ─── Edit Profile Modal ───────────────────────────────────────────────────────

function EditModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    email: profile.email || '',
    phone: profile.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-error transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <h3 className="text-headline-md font-bold text-on-surface mb-6">Edit Profile</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name', name: 'full_name', type: 'text' },
            { label: 'Email Address', name: 'email', type: 'email' },
            { label: 'Phone Number', name: 'phone', type: 'tel' },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className="block text-label-md text-on-surface-variant mb-1">{label}</label>
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                className="w-full h-12 px-4 border border-outline-variant rounded-xl bg-transparent outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-body-md text-on-surface"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-outline-variant rounded-xl text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-primary text-on-primary rounded-xl text-label-md font-semibold hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Profile() {
  const { token } = useAuth();

  const [profile, setProfile] = useState({ full_name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
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
        setProfile(data);
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
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setSaveMsg('Profile updated!');
        setTimeout(() => setSaveMsg(''), 3000);
      }
    } catch (_) {}
    setEditOpen(false);
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
                  {/* Experience Item 1 */}
                  <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-xl skeleton-shimmer shrink-0"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-2/5 skeleton-shimmer rounded"></div>
                      <div className="h-4 w-1/4 skeleton-shimmer rounded"></div>
                      <div className="h-4 w-full skeleton-shimmer rounded"></div>
                      <div className="h-4 w-3/4 skeleton-shimmer rounded"></div>
                    </div>
                  </div>
                  {/* Experience Item 2 */}
                  <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-xl skeleton-shimmer shrink-0"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-1/3 skeleton-shimmer rounded"></div>
                      <div className="h-4 w-1/5 skeleton-shimmer rounded"></div>
                      <div className="h-4 w-5/6 skeleton-shimmer rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Education Section */}
              <div className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div className="h-6 w-32 skeleton-shimmer rounded"></div>
                  <div className="h-8 w-8 skeleton-shimmer rounded-full"></div>
                </div>
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-xl skeleton-shimmer shrink-0"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-1/2 skeleton-shimmer rounded"></div>
                      <div className="h-4 w-1/4 skeleton-shimmer rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Skills & Details */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Skills Chip Cloud */}
              <div className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm">
                <div className="h-6 w-24 skeleton-shimmer rounded mb-6"></div>
                <div className="flex flex-wrap gap-2">
                  <div className="h-8 w-20 skeleton-shimmer rounded-full"></div>
                  <div className="h-8 w-24 skeleton-shimmer rounded-full"></div>
                  <div className="h-8 w-16 skeleton-shimmer rounded-full"></div>
                  <div className="h-8 w-28 skeleton-shimmer rounded-full"></div>
                  <div className="h-8 w-20 skeleton-shimmer rounded-full"></div>
                  <div className="h-8 w-24 skeleton-shimmer rounded-full"></div>
                  <div className="h-8 w-14 skeleton-shimmer rounded-full"></div>
                  <div className="h-8 w-22 skeleton-shimmer rounded-full"></div>
                </div>
              </div>

              {/* Profile Completeness / Stats */}
              <div className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm">
                <div className="h-6 w-48 skeleton-shimmer rounded mb-6"></div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-slate-200 skeleton-shimmer"></div>
                  <div className="flex-1">
                    <div className="h-4 w-3/4 skeleton-shimmer rounded"></div>
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t border-outline-variant/20">
                  <div className="flex justify-between">
                    <div className="h-4 w-20 skeleton-shimmer rounded"></div>
                    <div className="h-4 w-10 skeleton-shimmer rounded"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 w-24 skeleton-shimmer rounded"></div>
                    <div className="h-4 w-12 skeleton-shimmer rounded"></div>
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm">
                <div className="h-6 w-32 skeleton-shimmer rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="h-5 w-full skeleton-shimmer rounded"></div>
                  <div className="h-5 w-5/6 skeleton-shimmer rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
      {editOpen && (
        <EditModal profile={profile} onClose={() => setEditOpen(false)} onSave={handleSave} />
      )}

      <div className="max-w-[1200px] mx-auto pb-24 space-y-8">


        {/* ── Save success toast ── */}
        {saveMsg && (
          <div className="fixed top-24 right-6 z-50 bg-secondary text-on-secondary px-6 py-3 rounded-xl text-label-md shadow-lg flex items-center gap-2 animate-bounce">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
            {saveMsg}
          </div>
        )}

        {/* ── 1. Header Profile Card ── */}
        <section className="bg-white border border-slate-100 rounded-2xl p-p-lg flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {/* decorative corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />

          {/* Avatar */}
          <div className="w-36 h-36 rounded-2xl overflow-hidden border-4 border-surface-container-low shadow-sm flex-shrink-0 bg-primary/10 flex items-center justify-center">
            {loading ? (
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 48 }}>person</span>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
                <span className="text-4xl font-extrabold text-white">{initials}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-end gap-3 mb-2">
              <h2 className="text-headline-lg font-bold text-on-surface">
                {loading ? (
                  <span className="inline-block w-40 h-8 bg-surface-container rounded-lg animate-pulse" />
                ) : displayName}
              </h2>
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-md">
                Actively Seeking
              </span>
            </div>
            <p className="text-body-lg text-on-surface-variant mb-4">
              Computer Science &amp; Data Analytics @ Stanford University
            </p>
            <div className="flex flex-wrap gap-6 text-outline">
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
                <span className="text-label-md">Palo Alto, CA</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>link</span>
                <span className="text-label-md">linkedin.com/in/alignnova</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button className="bg-primary text-on-primary px-8 py-3 rounded-xl text-label-md shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">share</span> Share Portfolio
            </button>
            <button
              onClick={() => setEditOpen(true)}
              className="border border-outline-variant text-on-surface-variant px-8 py-3 rounded-xl text-label-md hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">edit</span> Edit Profile
            </button>
          </div>
        </section>

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-12 gap-6">

          {/* Left column — Education + Experience */}
          <div className="col-span-12 lg:col-span-8 space-y-6">

            {/* Education */}
            <section className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-headline-md font-bold text-on-surface mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">school</span> Education
              </h3>
              <div className="space-y-8">
                {EDUCATION.map(({ icon, institution, period, degree, detail }) => (
                  <div key={institution} className="flex gap-6">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary">{icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-body-lg font-bold">{institution}</h4>
                        <span className="text-outline text-label-md whitespace-nowrap ml-4">{period}</span>
                      </div>
                      <p className="text-primary text-label-md mb-2">{degree}</p>
                      <p className="text-on-surface-variant text-body-md">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Experience */}
            <section className="bg-white border border-slate-100 rounded-2xl p-p-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-headline-md font-bold text-on-surface mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">work_history</span> Experience
              </h3>
              <div className="space-y-10">
                {EXPERIENCE.map(({ icon, title, period, company, bullets }) => (
                  <div key={title} className="flex gap-6">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary">{icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-body-lg font-bold">{title}</h4>
                        <span className="text-outline text-label-md whitespace-nowrap ml-4">{period}</span>
                      </div>
                      <p className="text-primary text-label-md mb-2">{company}</p>
                      <ul className="text-on-surface-variant list-disc ml-4 space-y-2 text-body-md">
                        {bullets.map((b) => <li key={b}>{b}</li>)}
                      </ul>
                    </div>
                  </div>
                ))}
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
