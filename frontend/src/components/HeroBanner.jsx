import React from 'react';

const stats = [
  {
    label: 'Applications Submitted',
    value: '04',
    badge: (
      <span className="text-xs text-emerald-300 font-bold mb-1 flex items-center gap-1">
        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>arrow_upward</span>
        25%
      </span>
    ),
  },
  {
    label: 'Active Interviews',
    value: '02',
    badge: (
      <span className="text-xs text-white font-bold mb-1 px-2 py-0.5 bg-white/20 border border-white/30 rounded-full">
        Coming up
      </span>
    ),
  },
  {
    label: 'Offers Received',
    value: '01',
    badge: <span className="text-xs text-white/90 font-semibold mb-1">Stripe Inc.</span>,
  },
];

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-primary-container p-p-xl text-on-primary">
      {/* Decorative blob */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        <h2 className="text-display-lg font-extrabold mb-4 text-white leading-tight">
          Welcome back, Alex!
        </h2>
        <p className="text-body-lg text-on-primary-container mb-8 max-w-lg">
          You have 2 upcoming interviews this week. We've found 5 new internships matching your
          profile in Product Design and Engineering.
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
