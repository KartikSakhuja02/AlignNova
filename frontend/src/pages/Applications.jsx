import React, { useEffect, useRef, useState } from 'react';

// ─── Data ─────────────────────────────────────────────────────────────────────

const ALL_APPLICATIONS = [
  {
    abbr: 'GS',
    company: 'Goldman Sachs',
    role: 'Investment Banking Analyst',
    date: 'Oct 12, 2023',
    status: 'Selected',
    statusClass: 'bg-secondary/10 text-secondary',
  },
  {
    abbr: 'MC',
    company: 'McKinsey & Co.',
    role: 'Junior Consultant',
    date: 'Oct 28, 2023',
    status: 'Interviewing',
    statusClass: 'bg-primary/10 text-primary',
  },
  {
    abbr: 'MS',
    company: 'Morgan Stanley',
    role: 'Data Scientist',
    date: 'Nov 02, 2023',
    status: 'Shortlisted',
    statusClass: 'bg-tertiary/10 text-tertiary',
  },
  {
    abbr: 'BB',
    company: 'BlackRock',
    role: 'Portfolio Manager Intern',
    date: 'Nov 05, 2023',
    status: 'Under Review',
    statusClass: 'bg-outline-variant/30 text-on-surface-variant',
  },
  {
    abbr: 'AP',
    company: 'Apple Inc.',
    role: 'Product Design Intern',
    date: 'Nov 10, 2023',
    status: 'Applied',
    statusClass: 'bg-outline-variant/20 text-on-surface-variant',
  },
  {
    abbr: 'GO',
    company: 'Google',
    role: 'Software Engineer',
    date: 'Nov 15, 2023',
    status: 'Interviewing',
    statusClass: 'bg-primary/10 text-primary',
  },
  {
    abbr: 'AM',
    company: 'Amazon',
    role: 'Product Manager Intern',
    date: 'Nov 18, 2023',
    status: 'Applied',
    statusClass: 'bg-outline-variant/20 text-on-surface-variant',
  },
];

const INTERVIEWS = [
  { day: '18', month: 'Nov', title: 'Technical Assessment', sub: 'Google • 10:00 AM' },
  { day: '22', month: 'Nov', title: 'Final Partner Round', sub: 'McKinsey • 02:30 PM' },
];

const PAGE_SIZE = 5;

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart({ percent }) {
  const r = 58;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - percent / 100);
  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="transparent" stroke="currentColor" strokeWidth="12"
          className="text-surface-container-high" />
        <circle cx="64" cy="64" r={r} fill="transparent" stroke="currentColor" strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={offset}
          className="text-primary transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-on-surface">
        {percent}%
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Applications() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const glowRef = useRef(null);

  // Cursor glow effect
  useEffect(() => {
    const handler = (e) => {
      if (!glowRef.current) return;
      glowRef.current.style.left = `${e.clientX}px`;
      glowRef.current.style.top = `${e.clientY}px`;
      glowRef.current.style.opacity = '1';
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  // Filter & paginate
  const filtered = ALL_APPLICATIONS.filter((a) =>
    a.company.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase()) ||
    a.status.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  return (
    <div className="relative">
      {/* Cursor glow */}
      <div
        ref={glowRef}
        className="fixed w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 z-0"
        style={{ opacity: 0, left: 0, top: 0 }}
      />

      {/* Page content */}
      <div className="relative z-10 p-p-lg max-w-[1280px] mx-auto space-y-8">

        {/* ── Header ── */}
        <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-headline-lg font-bold text-on-surface leading-tight">
              Application Tracker
            </h2>
            <p className="text-body-md text-on-surface-variant mt-1">
              Manage and monitor your professional journey across global firms.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button className="px-6 py-3 border border-outline-variant text-on-surface text-label-md rounded-xl hover:bg-surface-container-low transition-all">
              Export Report
            </button>
            <button className="px-6 py-3 bg-primary text-on-primary text-label-md rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
              New Application
            </button>
          </div>
        </section>

        {/* ── Stats Bento Grid ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Applied */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-p-md shadow-sm hover:border-primary/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-primary/10 p-3 rounded-xl text-primary">
                <span className="material-symbols-outlined">send</span>
              </div>
              <span className="text-secondary text-label-md">+12% from last month</span>
            </div>
            <div className="text-[48px] font-extrabold leading-tight text-on-surface">24</div>
            <div className="text-label-md text-on-surface-variant uppercase tracking-wider">Total Applied</div>
          </div>

          {/* In Progress */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-p-md shadow-sm hover:border-primary/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-tertiary/10 p-3 rounded-xl text-tertiary">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              <span className="text-on-surface-variant text-label-md">8 pending review</span>
            </div>
            <div className="text-[48px] font-extrabold leading-tight text-on-surface">14</div>
            <div className="text-label-md text-on-surface-variant uppercase tracking-wider">In Progress</div>
          </div>

          {/* Offers Received */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-p-md shadow-sm hover:border-primary/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-secondary/10 p-3 rounded-xl text-secondary">
                <span className="material-symbols-outlined">verified</span>
              </div>
              <span className="text-secondary text-label-md">95th Percentile</span>
            </div>
            <div className="text-[48px] font-extrabold leading-tight text-on-surface">03</div>
            <div className="text-label-md text-on-surface-variant uppercase tracking-wider">Offers Received</div>
          </div>
        </section>

        {/* ── Applications Table ── */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
          {/* Table header bar */}
          <div className="p-p-md border-b border-outline-variant flex justify-between items-center bg-surface-bright">
            <h3 className="text-headline-md font-bold text-on-surface">Current Submissions</h3>
            <div className="flex gap-2">
              {/* Search */}
              <div className="flex items-center gap-2 bg-surface-container-low rounded-lg px-3 py-1.5 border border-outline-variant/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <span className="material-symbols-outlined text-outline" style={{ fontSize: 18 }}>search</span>
                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search…"
                  className="bg-transparent border-none outline-none text-body-md text-on-surface w-40"
                />
              </div>
              <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
              <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant">
                <span className="material-symbols-outlined">sort</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-container-low/30">
                  {['Company', 'Role', 'Applied Date', 'Status', 'Actions'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-p-md py-4 text-label-md text-on-surface-variant border-b border-outline-variant ${i === 4 ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {visible.length > 0 ? visible.map(({ abbr, company, role, date, status, statusClass }) => (
                  <tr
                    key={`${company}-${role}`}
                    className="hover:bg-surface-container-low/20 transition-all duration-200 group"
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                    style={{ transition: 'transform 0.2s ease, background 0.2s ease' }}
                  >
                    <td className="px-p-md py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center font-bold text-primary text-label-md flex-shrink-0">
                          {abbr}
                        </div>
                        <span className="text-body-md text-on-surface font-semibold">{company}</span>
                      </div>
                    </td>
                    <td className="px-p-md py-6 text-body-md text-on-surface-variant">{role}</td>
                    <td className="px-p-md py-6 text-body-md text-on-surface-variant">{date}</td>
                    <td className="px-p-md py-6">
                      <span className={`px-3 py-1.5 rounded-full text-[12px] font-bold uppercase ${statusClass}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-p-md py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button className="text-primary text-label-md hover:underline transition-all">
                          View Details
                        </button>
                        <button className="text-error/70 text-label-md hover:text-error transition-colors">
                          Withdraw
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-p-md py-12 text-center text-on-surface-variant text-body-md">
                      No applications match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-p-md flex justify-between items-center border-t border-outline-variant bg-surface-bright">
            <span className="text-caption text-on-surface-variant">
              Showing {Math.min(visible.length, PAGE_SIZE)} of {filtered.length} applications
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {/* ── Secondary Insight Grid ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Interviews */}
          <div className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-2xl p-p-md">
            <h4 className="text-headline-md font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">calendar_today</span>
              Upcoming Interviews
            </h4>
            <div className="space-y-4">
              {INTERVIEWS.map(({ day, month, title, sub }) => (
                <div
                  key={`${day}-${month}-${title}`}
                  className="flex items-center p-4 bg-surface-container-low/50 rounded-xl border border-outline-variant/20 hover:border-primary/30 transition-colors group"
                >
                  <div className="pr-4 border-r border-outline-variant/30 text-center min-w-[52px]">
                    <div className="text-headline-md font-bold text-primary">{day}</div>
                    <div className="text-caption uppercase text-on-surface-variant">{month}</div>
                  </div>
                  <div className="pl-4 flex-1">
                    <div className="text-label-md text-on-surface">{title}</div>
                    <div className="text-body-md text-on-surface-variant">{sub}</div>
                  </div>
                  <button className="ml-auto text-primary material-symbols-outlined group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Application Success Rate */}
          <div className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-2xl p-p-md overflow-hidden relative">
            <h4 className="text-headline-md font-bold text-on-surface mb-6">
              Application Success Rate
            </h4>
            <div className="flex items-center justify-center py-4">
              <DonutChart percent={70} />
              <div className="ml-8 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-label-md text-on-surface">Shortlisted</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-surface-container-high flex-shrink-0" />
                  <span className="text-label-md text-on-surface">Total Submissions</span>
                </div>
              </div>
            </div>
            <p className="text-caption text-on-surface-variant mt-4 text-center">
              Your profile strength is currently 15% higher than the candidate average for Finance roles.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
