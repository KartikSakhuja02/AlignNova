import React from 'react';

const applications = [
  {
    abbr: 'AMZ',
    company: 'Amazon',
    role: 'SDE Intern',
    date: 'Oct 12, 2023',
    status: 'Shortlisted',
    statusClass: 'bg-secondary/10 text-secondary',
    dotClass: 'bg-secondary',
  },
  {
    abbr: 'META',
    company: 'Meta',
    role: 'UX Designer',
    date: 'Oct 08, 2023',
    status: 'Pending',
    statusClass: 'bg-tertiary-container/20 text-tertiary',
    dotClass: 'bg-tertiary',
  },
  {
    abbr: 'ADBE',
    company: 'Adobe',
    role: 'New Grad SWE',
    date: 'Sep 28, 2023',
    status: 'Applied',
    statusClass: 'bg-primary/10 text-primary',
    dotClass: 'bg-primary',
  },
];

export default function ApplicationTracker() {
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
            {applications.map(({ abbr, company, role, date, status, statusClass, dotClass }) => (
              <tr
                key={company}
                className="hover:bg-surface-bright transition-colors group"
              >
                <td className="px-10 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center font-bold text-primary text-xs">
                      {abbr}
                    </div>
                    <span className="font-bold text-on-surface">{company}</span>
                  </div>
                </td>
                <td className="px-6 py-6 text-on-surface-variant text-label-md">{role}</td>
                <td className="px-6 py-6 text-on-surface-variant text-label-md">{date}</td>
                <td className="px-6 py-6">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] ${statusClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                    {status}
                  </span>
                </td>
                <td className="px-10 py-6 text-right">
                  <button className="text-primary font-bold text-label-md opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-10 py-6 bg-surface-container-low/30 border-t border-outline-variant flex justify-center">
        <button className="text-on-surface-variant font-bold text-label-md hover:text-primary transition-colors">
          See complete history
        </button>
      </div>
    </section>
  );
}
