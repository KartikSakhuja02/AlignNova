import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
    return {
      text: 'Selected',
      statusClass: 'bg-secondary/10 text-secondary',
      dotClass: 'bg-secondary',
    };
  }
  if (s === 'rejected' || s === 'withdrawn') {
    return {
      text: s === 'rejected' ? 'Rejected' : 'Withdrawn',
      statusClass: 'bg-error/10 text-error',
      dotClass: 'bg-error',
    };
  }
  if (s === 'shortlisted') {
    return {
      text: 'Shortlisted',
      statusClass: 'bg-tertiary/10 text-tertiary',
      dotClass: 'bg-tertiary',
    };
  }
  if (s === 'interviewing' || s === 'interview') {
    return {
      text: 'Interviewing',
      statusClass: 'bg-primary/10 text-primary',
      dotClass: 'bg-primary',
    };
  }
  return {
    text: s.charAt(0).toUpperCase() + s.slice(1),
    statusClass: 'bg-outline-variant/30 text-on-surface-variant',
    dotClass: 'bg-outline',
  };
};

export default function ApplicationTracker() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

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
        throw new Error('Failed to fetch applications');
      })
      .then((data) => {
        // Slice first 3 applications for the dashboard summary
        setApplications(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-[2rem] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-10 py-8 border-b border-outline-variant flex justify-between items-center">
        <div>
          <h3 className="text-headline-md font-bold text-on-surface">Application Tracker</h3>
          <p className="text-body-md text-on-surface-variant">
            Current progress of your active applications
          </p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
          <button className="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined">download</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] font-extrabold tracking-widest">
              <th className="px-10 py-5">Company</th>
              <th className="px-6 py-5">Role</th>
              <th className="px-6 py-5">Applied Date</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-10 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-10 py-12 text-center text-on-surface-variant font-medium">
                  <div className="flex justify-center items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Loading applications...</span>
                  </div>
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-10 py-12 text-center text-on-surface-variant font-medium">
                  No active applications. Start by applying to a drive!
                </td>
              </tr>
            ) : (
              applications.slice(0, 3).map((app) => {
                const abbr = getAbbr(app.company);
                const date = formatDate(app.created_at);
                const { text, statusClass, dotClass } = getStatusStyles(app.status);

                return (
                  <tr
                    key={app.id}
                    className="hover:bg-surface-bright transition-colors group animate-fadeIn"
                  >
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center font-bold text-primary text-xs">
                          {abbr}
                        </div>
                        <span className="font-bold text-on-surface">{app.company}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-on-surface-variant text-label-md">{app.role}</td>
                    <td className="px-6 py-6 text-on-surface-variant text-label-md">{date}</td>
                    <td className="px-6 py-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] ${statusClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                        {text}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button
                        onClick={() => navigate(`/apply/${app.drive_id}`)}
                        className="text-primary font-bold text-label-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-10 py-6 bg-surface-container-low/30 border-t border-outline-variant flex justify-center">
        <button
          onClick={() => navigate('/applications')}
          className="text-on-surface-variant font-bold text-label-md hover:text-primary transition-colors cursor-pointer"
        >
          See complete history
        </button>
      </div>
    </section>
  );
}
