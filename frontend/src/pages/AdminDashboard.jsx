import React, { useState, useRef } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ─── Data ─────────────────────────────────────────────────────────────────────

const statsData = [
  {
    icon: 'person_check',
    iconColor: 'text-primary',
    iconBg: 'bg-primary-container/10 group-hover:bg-primary-container/20',
    trend: '+4.2%',
    label: 'Student Eligibility',
    value: '86.4%',
    sub: '2,410 Students eligible',
    subColor: 'text-outline',
  },
  {
    icon: 'rocket_launch',
    iconColor: 'text-secondary',
    iconBg: 'bg-secondary-container/10 group-hover:bg-secondary-container/20',
    trend: '+12%',
    label: 'Placement Rate',
    value: '72.1%',
    sub: 'Target: 85% by June',
    subColor: 'text-outline',
  },
  {
    icon: 'corporate_fare',
    iconColor: 'text-tertiary',
    iconBg: 'bg-tertiary-container/10 group-hover:bg-tertiary-container/20',
    trend: null,
    label: 'Corporate Partners',
    value: '142',
    sub: '12 New this quarter',
    subColor: 'text-outline',
  },
  {
    icon: 'pending_actions',
    iconColor: 'text-error',
    iconBg: 'bg-error-container/20 group-hover:bg-error-container/30',
    trend: null,
    label: 'Pending Approvals',
    value: '28',
    sub: 'Requires immediate action',
    subColor: 'text-error font-bold',
  },
];

const feedItems = [
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoUdDbkt6QeibMXaAhnvpnfrUdZZCQz4esSnujDY82QhVUl3mqeqSlmiLAt49x-vjItTVqJ20tGgwv54mMX_Gq3L8oe_B8uvVrzaFBxIxrRuFx0d_8HRrtb24IFktnksRqGOtninUyjdD1_Vmm2W0aKiVKwxlpN0VB73EiqMLUcqk6w_AE2_kUZGnm7wft6SidS60akzqciDs9aiIot3Hs8biUdyFSRMDq-UnyLVF6xAWu5ofv_v1Vy1deZVIVCSaJXFqSH2ukg7A',
    name: 'Aditya Sharma',
    status: 'Approved',
    statusClass: 'text-secondary bg-secondary-container/20',
    role: 'Senior Developer @ Google',
    cgpa: '8.92',
    time: '2m ago',
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_7B4qPFXMM1ihbVPblBWljlXITmJq3Zz2zHWJtHWB2iinMCd8QiCw3qreKx0UldWXSOkLz9GdU290JYvRhoQvq_EFe5SafE29PrM_OMAr3qWmv0fvo8Ru4GlovlL5Dc8uVy2Pm4VuDwTJY1hZyEV53gFgWgEl-zkQqeJD7I15exzlt5hz8d3iGCmtj_Jcw5hFxTQvFkhsrIHYulaOyGuUynRf3JiZlvixCdl8Mcwuz8h57KUZ46-Q0jBqAFGcZjrFAlC_eKDK0W0',
    name: 'Priya Verma',
    status: 'Pending',
    statusClass: 'text-on-tertiary-fixed-variant bg-tertiary-fixed/30',
    role: 'Product Analyst @ Zomato',
    cgpa: '7.84',
    time: '15m ago',
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXAqM9rYs8KT_vQyW-Ad3ImxomME1PYO-3svaCiq3lZ16-W_lTuuX7PBbMGfXQ9DzVUVJh25UbTEnGN9kIN3Cz930Q3prUp4gV_j7CQ0phS-RbDluFP9fDND_OURdKII-4HTHgd08HRKY1D0RXPWYA5DtIwIbXdc8jGEl9FiUrb-SXliRtjAQYJe0MU6Y52poi-Dmdtc8T16bYkmXTWFElRzSPQmcoJmQXrwgXmEsrT_SeOb-qD9g7h-VgiM2sW-_hU8T3m13-fg8',
    name: 'Rahul Iyer',
    status: 'Approved',
    statusClass: 'text-secondary bg-secondary-container/20',
    role: 'Backend Intern @ Swiggy',
    cgpa: '9.10',
    time: '1h ago',
  },
];

const studentsData = [
  { initials: 'AS', bg: 'bg-primary-container/10', color: 'text-primary', name: 'Ananya Singh', email: 'ananya.s@university.edu', dept: 'Computer Science', status: 'Active', statusColor: 'text-secondary', dotColor: 'bg-secondary', lastLogin: 'Today, 10:45 AM' },
  { initials: 'MK', bg: 'bg-secondary-container/10', color: 'text-secondary', name: 'Manish Kumar', email: 'manish.k@university.edu', dept: 'Information Technology', status: 'Never', statusColor: 'text-outline', dotColor: 'bg-outline', lastLogin: '—' },
  { initials: 'RP', bg: 'bg-tertiary-container/10', color: 'text-tertiary', name: 'Rohan Patel', email: 'rohan.p@university.edu', dept: 'Electronics & Comm.', status: 'Active', statusColor: 'text-secondary', dotColor: 'bg-secondary', lastLogin: 'Yesterday, 4:20 PM' },
];

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

function FeedItem({ item }) {
  return (
    <div className="p-4 rounded-xl border border-outline-variant/50 hover:bg-surface-container-low transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-surface-dim overflow-hidden border border-outline-variant flex-shrink-0">
          <img className="w-full h-full object-cover" src={item.img} alt={item.name} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h4 className="text-label-md font-bold text-on-surface">{item.name}</h4>
            <span className={`text-caption px-2 py-0.5 rounded font-semibold ${item.statusClass}`}>
              {item.status}
            </span>
          </div>
          <p className="text-caption text-on-surface-variant truncate">
            Applied for: {item.role}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-outline">
              CGPA: {item.cgpa}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-outline">
              {item.time}
            </span>
          </div>
        </div>
      </div>
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

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);

  // Drive form state
  const [form, setForm] = useState({
    company: '', role: '', type: 'Full-Time Graduate',
    eligibility: '', package: '', drive_date: '',
  });
  const [launching, setLaunching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLaunchDrive = async (e) => {
    e.preventDefault();
    setLaunching(true);
    setFormError('');
    try {
      const res = await fetch('/api/drives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company: form.company,
          role: form.role,
          type: form.type,
          eligibility: form.eligibility,
          package: form.package,
          drive_date: form.drive_date,
        }),
      });
      if (!res.ok) throw new Error('Failed to launch drive');
      setShowModal(true);
      setForm({ company: '', role: '', type: 'Full-Time Graduate', eligibility: '', package: '', drive_date: '' });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLaunching(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/signin', { replace: true });
  };

  // Scroll to form from sidebar
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <AdminSidebar onPostDrive={scrollToForm} />

      <main className="flex-1 md:ml-64 min-h-screen pb-20">
        {/* TopBar */}
        <header className="w-full h-16 sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant flex items-center justify-between px-p-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30">
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '20px' }}>search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-body-md ml-2 w-64 placeholder:text-outline/60 outline-none"
                placeholder="Search applicants, companies..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors active:scale-95">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
            </button>
            <button className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors active:scale-95">
              <span className="material-symbols-outlined">help</span>
            </button>
            <div className="h-8 w-px bg-outline-variant mx-1" />
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-label-md font-bold text-on-surface">Dr. Sarah Jenkins</p>
                <p className="text-caption text-on-surface-variant">Chief Placement Officer</p>
              </div>
              <img
                className="w-10 h-10 rounded-full border-2 border-primary-container object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3LfnyVLVG7lIVx0TROiGnkgQC-_h9ZsNlrqFFLdF7DNwH5uXRaZuwbT-UXFQM_TNTRe-1vxFU4GmpBT6uVYRqo6b06YcXaIw8gh8tRCvmjrv-M_Fu_h4HrNeb-Px8C4G-KzbwUJXyBQFBMWZZ4Mtd2XDiWwcwlWLhfLeRIvOoxK4o95SLSPrbgmJD-VLHfVB2vtADyQPEEfD9lzZuDwoQ6zLepHEFS3Gbnya1QS__CMol-TYNzqRSEXUEu0LQ_ep-hUtVF5xV8Js"
                alt="Admin"
              />
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 flex items-center gap-1 text-on-surface-variant hover:text-error transition-colors text-label-md"
              title="Logout"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            </button>
          </div>
        </header>

        <div className="max-w-[1400px] mx-auto p-p-lg space-y-10">

          {/* ── Section 1: Stats ── */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-headline-lg font-bold text-on-surface">Institutional Intelligence</h2>
              <p className="text-body-md text-on-surface-variant">Real-time placement analytics</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {statsData.map((s) => <StatCard key={s.label} {...s} />)}
            </div>
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
                  <h2 className="text-headline-md font-bold text-on-surface">Launch New Drive</h2>
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
                      <label className="text-label-md text-on-surface">Company Name</label>
                      <input
                        name="company" value={form.company} onChange={handleFormChange}
                        required
                        className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                        placeholder="e.g. Microsoft India"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface">Opportunity Type</label>
                      <select
                        name="type" value={form.type} onChange={handleFormChange}
                        className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                      >
                        <option>Full-Time Graduate</option>
                        <option>Summer Internship</option>
                        <option>6-Month Co-op</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface">Job Role</label>
                      <input
                        name="role" value={form.role} onChange={handleFormChange}
                        required
                        className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                        placeholder="e.g. Software Engineer I"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface">Min CGPA Requirement</label>
                      <input
                        name="eligibility" value={form.eligibility} onChange={handleFormChange}
                        type="number" step="0.1" min="0" max="10"
                        className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                        placeholder="e.g. 7.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface">Package (LPA)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">₹</span>
                        <input
                          name="package" value={form.package} onChange={handleFormChange}
                          className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none pl-8 pr-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                          placeholder="e.g. 12.5"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface">Drive Date</label>
                      <input
                        name="drive_date" value={form.drive_date} onChange={handleFormChange}
                        type="date"
                        className="w-full border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none px-4 py-3 text-body-md bg-surface-container-lowest transition-all"
                      />
                    </div>
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
                      {launching ? 'Launching...' : 'Launch Recruitment Drive'}
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {/* Live Feed */}
            <section className="lg:col-span-5">
              <div className="bg-white p-p-lg rounded-2xl border border-outline-variant shadow-sm h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined">pause</span>
                    </div>
                    <h2 className="text-headline-md font-bold text-on-surface">Live Feed</h2>
                  </div>
                  <span className="px-3 py-1 bg-secondary-container/20 text-secondary text-caption rounded-full font-bold">
                    12 Active Now
                  </span>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-1 custom-scrollbar">
                  {feedItems.map((item) => <FeedItem key={item.name} item={item} />)}
                </div>
                <button className="w-full mt-6 py-2 text-primary text-label-md font-semibold hover:underline decoration-2 underline-offset-4">
                  View All Applications
                </button>
              </div>
            </section>
          </div>

          {/* ── Section 4: Student Management Table ── */}
          <section className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-p-lg border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-headline-md font-bold text-on-surface">Student Management</h2>
                <p className="text-body-md text-on-surface-variant">Manage credentials and dashboard access</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 border border-outline-variant text-on-surface-variant text-label-md font-semibold rounded-xl hover:bg-surface-container-low transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>file_upload</span>
                  Bulk Import
                </button>
                <button className="px-6 py-2 bg-primary text-on-primary text-label-md font-semibold rounded-xl hover:scale-[1.02] active:scale-95 shadow-md transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                  Add Student
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low">
                  <tr>
                    {['Student Name', 'Department', 'Login Status', 'Last Login', 'Actions'].map((h, i) => (
                      <th key={h} className={`px-6 py-4 text-label-md text-outline font-bold uppercase tracking-wider ${i === 4 ? 'text-right' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {studentsData.map((s) => (
                    <tr
                      key={s.email}
                      className="hover:bg-surface-container-lowest transition-all"
                      style={{ transition: 'background 0.15s, transform 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(4px)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-caption ${s.bg} ${s.color}`}>
                            {s.initials}
                          </div>
                          <div>
                            <p className="text-body-md font-bold text-on-surface">{s.name}</p>
                            <p className="text-caption text-outline">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-body-md text-on-surface-variant">{s.dept}</td>
                      <td className="px-6 py-5">
                        <span className={`flex items-center gap-2 font-bold text-label-md ${s.statusColor}`}>
                          <span className={`w-2 h-2 rounded-full ${s.dotColor}`} />
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-caption text-outline">{s.lastLogin}</td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 hover:bg-surface-container-high rounded-lg text-outline transition-colors">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button className="p-2 hover:bg-error-container/20 rounded-lg text-error transition-colors ml-1">
                          <span className="material-symbols-outlined">key</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-surface-container-low/50 flex items-center justify-between border-t border-outline-variant">
              <p className="text-caption text-on-surface-variant">Showing 3 of 2,410 students</p>
              <div className="flex items-center gap-2">
                <button disabled className="p-2 border border-outline-variant rounded-lg bg-white text-outline disabled:opacity-50">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    className={`w-8 h-8 rounded-lg text-label-md font-semibold ${n === 1 ? 'bg-primary text-on-primary' : 'hover:bg-surface-container-high text-on-surface'}`}
                  >
                    {n}
                  </button>
                ))}
                <button className="p-2 border border-outline-variant rounded-lg bg-white text-outline">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Success Modal */}
      <SuccessModal
        visible={showModal}
        companyName={form.company}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
