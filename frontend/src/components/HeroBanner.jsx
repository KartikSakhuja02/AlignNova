import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function HeroBanner() {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.full_name ? user.full_name.trim().split(' ')[0] : (user?.username || 'Student');

  useEffect(() => {
    if (!token) return;
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

  const totalApplied = applications.length;
  const interviewsCount = applications.filter((a) =>
    ['interviewing', 'interview'].includes(a.status?.toLowerCase())
  ).length;
  const offersCount = applications.filter((a) =>
    ['selected', 'approved', 'offer', 'hired'].includes(a.status?.toLowerCase())
  ).length;

  const welcomeText = interviewsCount > 0
    ? `You have ${interviewsCount} upcoming interview${interviewsCount !== 1 ? 's' : ''} scheduled. Keep up the great work!`
    : 'Explore the newest placement and internship drives published by your placement coordinator and track all your applications in real-time.';

  const stats = [
    {
      label: 'Applications Submitted',
      value: totalApplied.toString().padStart(2, '0'),
      badge: (
        <span className="text-xs text-emerald-300 font-bold mb-1 flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>arrow_upward</span>
          Live Sync
        </span>
      ),
    },
    {
      label: 'Active Interviews',
      value: interviewsCount.toString().padStart(2, '0'),
      badge: interviewsCount > 0 ? (
        <span className="text-xs text-white font-bold mb-1 px-2 py-0.5 bg-white/20 border border-white/30 rounded-full animate-pulse">
          Scheduled
        </span>
      ) : (
        <span className="text-xs text-white/70 font-semibold mb-1">
          None scheduled
        </span>
      ),
    },
    {
      label: 'Offers Received',
      value: offersCount.toString().padStart(2, '0'),
      badge: offersCount > 0 ? (
        <span className="text-xs text-emerald-300 font-bold mb-1 flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>emoji_events</span>
          Congrats!
        </span>
      ) : (
        <span className="text-xs text-white/70 font-semibold mb-1">
          Keep applying!
        </span>
      ),
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-primary-container p-p-xl text-on-primary shadow-sm">
      {/* Decorative blob */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        <h2 className="text-display-lg font-extrabold mb-4 text-white leading-tight">
          Welcome, {firstName}!
        </h2>
        <p className="text-body-lg text-on-primary-container mb-8 max-w-lg">
          {welcomeText}
        </p>

        {/* Stat Cards */}
        <div className="flex flex-wrap gap-6">
          {stats.map(({ label, value, badge }) => (
            <div
              key={label}
              className="bg-white/20 backdrop-blur-md border border-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_24px_rgba(0,0,0,0.15)] p-6 rounded-2xl flex-1 min-w-[200px] transition-all duration-300 hover:bg-white/30"
            >
              <p className="text-white/80 text-label-md font-semibold mb-2">{label}</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-extrabold text-white drop-shadow">{value}</span>
                {badge}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
