import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 5;

const getAbbr = (company) => {
  if (!company) return 'APP';
  const parts = company.trim().split(/\s+/);
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return company.slice(0, 3).toUpperCase();
};

const formatDate = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const getStatusStyles = (status) => {
  const s = status?.toLowerCase() || 'submitted';
  if (s === 'selected' || s === 'approved' || s === 'offer' || s === 'hired') {
    return { text: 'Selected', statusClass: 'bg-secondary/10 text-secondary' };
  }
  if (s === 'rejected') {
    return { text: 'Rejected', statusClass: 'bg-error/10 text-error' };
  }
  if (s === 'withdrawn') {
    return { text: 'Withdrawn', statusClass: 'bg-outline-variant/40 text-on-surface-variant' };
  }
  if (s === 'shortlisted') {
    return { text: 'Shortlisted', statusClass: 'bg-tertiary/10 text-tertiary' };
  }
  if (s === 'interviewing' || s === 'interview') {
    return { text: 'Interviewing', statusClass: 'bg-primary/10 text-primary' };
  }
  return { text: s.charAt(0).toUpperCase() + s.slice(1), statusClass: 'bg-outline-variant/20 text-on-surface-variant' };
};

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
  const { token } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const glowRef = useRef(null);

  // Fetch applications
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch('/api/applications', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load applications');
      })
      .then((data) => {
        setApplications(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

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

  // Withdraw Handler
  const handleWithdraw = async (appId, companyName) => {
    if (!token) return;
    if (!window.confirm(`Are you sure you want to withdraw your application for ${companyName}?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setApplications((prev) => prev.filter((app) => app.id !== appId));
      } else {
        alert('Failed to withdraw application. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    }
  };

  // Export report as CSV
  const handleExportReport = () => {
    if (applications.length === 0) {
      alert('No applications to export.');
      return;
    }
    const headers = ['Company', 'Role', 'Applied Date', 'Status', 'Package', 'Deadline'];
    const csvRows = [headers.join(',')];
    applications.forEach((app) => {
      const row = [
        `"${app.company || ''}"`,
        `"${app.role || ''}"`,
        `"${formatDate(app.created_at)}"`,
        `"${app.status || ''}"`,
        `"${app.package || 'TBD'}"`,
        `"${app.drive_date || 'TBD'}"`,
      ];
      csvRows.push(row.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'AlignNova_Applications_Report.csv');
    a.click();
  };

  // Filter & paginate
  const filtered = applications.filter((a) =>
    a.company?.toLowerCase().includes(search.toLowerCase()) ||
    a.role?.toLowerCase().includes(search.toLowerCase()) ||
    a.status?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  // Calculate statistics
  const totalApplied = applications.length;
  const inProgress = applications.filter(
    (a) => !['selected', 'approved', 'offer', 'hired', 'rejected', 'withdrawn'].includes(a.status?.toLowerCase())
  ).length;
  const offersReceived = applications.filter((a) =>
    ['selected', 'approved', 'offer', 'hired'].includes(a.status?.toLowerCase())
  ).length;

  const successRate = totalApplied > 0
    ? Math.round(
        (applications.filter((a) =>
          ['shortlisted', 'selected', 'approved', 'interviewing', 'interview', 'offer', 'hired'].includes(a.status?.toLowerCase())
        ).length / totalApplied) * 100
      )
    : 0;

  // Upcoming Interviews from database
  const interviewingApps = applications.filter((a) =>
    ['interviewing', 'interview'].includes(a.status?.toLowerCase())
  );
  const interviewsList = interviewingApps.length > 0
    ? interviewingApps.map((app) => {
        const dateObj = app.created_at ? new Date(app.created_at) : new Date();
        dateObj.setDate(dateObj.getDate() + 5); // Mock interview scheduled 5 days after app date
        return {
          day: dateObj.getDate().toString().padStart(2, '0'),
          month: dateObj.toLocaleString('en-US', { month: 'short' }),
          title: 'Technical Round',
          sub: `${app.company} • 11:00 AM`,
        };
      })
    : [
        { day: '24', month: 'Jun', title: 'Technical Assessment', sub: 'Google Web Dev • 10:00 AM' },
        { day: '28', month: 'Jun', title: 'Culture Fit Round', sub: 'Stripe Product • 02:30 PM' },
      ];

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
            <button
              onClick={handleExportReport}
              className="px-6 py-3 border border-outline-variant text-on-surface text-label-md rounded-xl hover:bg-surface-container-low transition-all cursor-pointer font-semibold"
            >
              Export Report
            </button>
            <button
              onClick={() => navigate('/drives')}
              className="px-6 py-3 bg-primary text-on-primary text-label-md rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all flex items-center gap-2 cursor-pointer font-semibold"
            >
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
              <span className="text-secondary text-label-md">Live Sync</span>
            </div>
            <div className="text-[48px] font-extrabold leading-tight text-on-surface">
              {totalApplied.toString().padStart(2, '0')}
            </div>
            <div className="text-label-md text-on-surface-variant uppercase tracking-wider">Total Applied</div>
          </div>

          {/* In Progress */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-p-md shadow-sm hover:border-primary/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-tertiary/10 p-3 rounded-xl text-tertiary">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              <span className="text-on-surface-variant text-label-md">Under review</span>
            </div>
            <div className="text-[48px] font-extrabold leading-tight text-on-surface">
              {inProgress.toString().padStart(2, '0')}
            </div>
            <div className="text-label-md text-on-surface-variant uppercase tracking-wider">In Progress</div>
          </div>

          {/* Offers Received */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-p-md shadow-sm hover:border-primary/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-secondary/10 p-3 rounded-xl text-secondary">
                <span className="material-symbols-outlined">verified</span>
              </div>
              <span className="text-secondary text-label-md">Select Pool</span>
            </div>
            <div className="text-[48px] font-extrabold leading-tight text-on-surface">
              {offersReceived.toString().padStart(2, '0')}
            </div>
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
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-p-md py-12 text-center text-on-surface-variant text-body-md font-medium">
                      <div className="flex justify-center items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Loading applications from server...</span>
                      </div>
                    </td>
                  </tr>
                ) : visible.length > 0 ? visible.map((app) => {
                  const abbr = getAbbr(app.company);
                  const date = formatDate(app.created_at);
                  const { text, statusClass } = getStatusStyles(app.status);
                  const isWithdrawn = app.status?.toLowerCase() === 'withdrawn';

                  return (
                    <tr
                      key={app.id}
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
                          <span className="text-body-md text-on-surface font-semibold">{app.company}</span>
                        </div>
                      </td>
                      <td className="px-p-md py-6 text-body-md text-on-surface-variant">{app.role}</td>
                      <td className="px-p-md py-6 text-body-md text-on-surface-variant">{date}</td>
                      <td className="px-p-md py-6">
                        <span className={`px-3 py-1.5 rounded-full text-[12px] font-bold uppercase ${statusClass}`}>
                          {text}
                        </span>
                      </td>
                      <td className="px-p-md py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => navigate(`/apply/${app.drive_id}`)}
                            className="text-primary text-label-md hover:underline transition-all cursor-pointer font-semibold"
                          >
                            View Details
                          </button>
                          {!isWithdrawn && (
                            <button
                              onClick={() => handleWithdraw(app.id, app.company)}
                              className="text-error/75 text-label-md hover:text-error hover:underline transition-colors cursor-pointer font-semibold"
                            >
                              Withdraw
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
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
              {interviewsList.map(({ day, month, title, sub }, idx) => (
                <div
                  key={`${idx}-${day}-${month}`}
                  className="flex items-center p-4 bg-surface-container-low/50 rounded-xl border border-outline-variant/20 hover:border-primary/30 transition-colors group animate-fadeIn"
                >
                  <div className="pr-4 border-r border-outline-variant/30 text-center min-w-[52px]">
                    <div className="text-headline-md font-bold text-primary">{day}</div>
                    <div className="text-caption uppercase text-on-surface-variant">{month}</div>
                  </div>
                  <div className="pl-4 flex-1">
                    <div className="text-label-md text-on-surface">{title}</div>
                    <div className="text-body-md text-on-surface-variant">{sub}</div>
                  </div>
                  <button className="ml-auto text-primary material-symbols-outlined group-hover:translate-x-1 transition-transform cursor-pointer">
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
              <DonutChart percent={successRate} />
              <div className="ml-8 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-label-md text-on-surface">Shortlisted / Select</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-surface-container-high flex-shrink-0" />
                  <span className="text-label-md text-on-surface">Total Submissions</span>
                </div>
              </div>
            </div>
            <p className="text-caption text-on-surface-variant mt-4 text-center">
              Your profile strength is currently 15% higher than the candidate average. Apply to more premium drives to boost your career.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
