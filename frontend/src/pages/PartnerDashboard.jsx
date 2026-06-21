import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PartnerDashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch('/api/partner/students', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch student pool');
      })
      .then((data) => {
        setStudents(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      (s.full_name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.course || '').toLowerCase().includes(q)
    );
  });

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="text-on-surface bg-[#F8FAFC] min-h-screen flex">
      {/* Sidebar Navigation */}
      <aside className="bg-white h-screen w-64 fixed left-0 top-0 border-r border-outline-variant shadow-sm flex flex-col py-6 z-50">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[24px]">auto_awesome</span>
          </div>
          <div>
            <h1 className="font-headline-md text-[18px] font-bold text-primary leading-tight">AlignNova</h1>
            <p className="text-[10px] text-on-surface-variant uppercase font-semibold tracking-wider">Partner Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-primary font-bold bg-primary/5 border-r-4 border-primary" href="#" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-body-md">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:text-primary hover:bg-slate-50 transition-colors" href="#" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined">event_available</span>
            <span className="text-body-md">Active Drives</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:text-primary hover:bg-slate-50 transition-colors" href="#" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined">groups</span>
            <span className="text-body-md">Talent Pool</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:text-primary hover:bg-slate-50 transition-colors" href="#" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-body-md">Analytics</span>
          </a>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error-container/10 transition-colors text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-body-md">Sign Out</span>
          </button>
        </nav>

        <div className="px-4 mt-auto">
          <button className="w-full py-3.5 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95">
            <span className="material-symbols-outlined">add_circle</span>
            Post New Drive
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 min-h-screen flex flex-col">
        {/* Top App Bar */}
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-white/80 backdrop-blur-md border-b border-outline-variant flex justify-between items-center h-16 px-8">
          <div className="flex items-center bg-slate-50 rounded-full px-4 py-1.5 w-96 border border-outline-variant/30">
            <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[20px]">search</span>
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant/50 focus:outline-none" 
              placeholder="Search applicants, drives, or reports..." 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-error rounded-full border-2 border-white"></span>
            </button>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">apps</span>
            </button>
            <div className="h-6 w-[1px] bg-outline-variant"></div>
            <div className="flex items-center gap-3 group">
              <div className="text-right hidden sm:block">
                <p className="font-bold text-label-md text-on-surface group-hover:text-primary transition-colors">{user?.full_name || 'Alex Thorne'}</p>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{user?.enrollment_id || 'Corporate Partner'}</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                {user?.full_name ? getInitials(user.full_name) : 'AT'}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="pt-24 pb-12 px-8 max-w-[1400px] w-full mx-auto space-y-8 flex-1">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-headline-lg font-bold text-on-surface tracking-tight">Recruitment Overview</h2>
              <p className="text-on-surface-variant text-body-md mt-1">Institutional metrics and real-time student placement tracking.</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-outline-variant rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                Last 30 Days
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-label-md text-label-md shadow-md hover:shadow-lg transition-all hover:scale-[1.01]">
                <span className="material-symbols-outlined text-[20px]">download</span>
                Export Report
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stat Card 1 */}
            <div className="bg-white rounded-2xl p-6 border border-outline-variant shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-primary/5 text-primary">
                  <span className="material-symbols-outlined">campaign</span>
                </div>
                <span className="text-secondary font-bold text-caption flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  +4
                </span>
              </div>
              <h3 className="text-on-surface-variant text-caption font-bold uppercase tracking-wider">Active Drives</h3>
              <p className="text-[36px] font-extrabold text-on-surface leading-none mt-2">12</p>
              <p className="text-caption text-on-surface-variant mt-2 italic">2 closing this week</p>
            </div>
            {/* Stat Card 2 */}
            <div className="bg-white rounded-2xl p-6 border border-outline-variant shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-slate-100 text-on-surface">
                  <span className="material-symbols-outlined">person_search</span>
                </div>
                <span className="text-secondary font-bold text-caption flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  +12%
                </span>
              </div>
              <h3 className="text-on-surface-variant text-caption font-bold uppercase tracking-wider">Total Applicants</h3>
              <p className="text-[36px] font-extrabold text-on-surface leading-none mt-2">1,284</p>
              <p className="text-caption text-on-surface-variant mt-2 italic">From 45 universities</p>
            </div>
            {/* Stat Card 3 */}
            <div className="bg-white rounded-2xl p-6 border border-outline-variant shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-slate-100 text-on-surface">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <span className="text-secondary font-bold text-caption flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  +8%
                </span>
              </div>
              <h3 className="text-on-surface-variant text-caption font-bold uppercase tracking-wider">Shortlisted</h3>
              <p className="text-[36px] font-extrabold text-on-surface leading-none mt-2">342</p>
              <p className="text-caption text-on-surface-variant mt-2 italic">26.6% qualification rate</p>
            </div>
            {/* Stat Card 4 */}
            <div className="bg-white rounded-2xl p-6 border border-outline-variant shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-emerald-50 text-secondary">
                  <span className="material-symbols-outlined">handshake</span>
                </div>
                <span className="text-error font-bold text-caption flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">trending_down</span>
                  -2%
                </span>
              </div>
              <h3 className="text-on-surface-variant text-caption font-bold uppercase tracking-wider">Offers Extended</h3>
              <p className="text-[36px] font-extrabold text-on-surface leading-none mt-2">89</p>
              <p className="text-caption text-on-surface-variant mt-2 italic">Target: 105 by Oct 15</p>
            </div>
          </div>

          {/* Main Dashboard Layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column: Pipeline & Drive Creation */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Launch Drive Hero Card */}
              <div className="relative overflow-hidden rounded-2xl bg-[#263143] text-white p-8 flex flex-col md:flex-row items-center gap-8 shadow-md">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                  <div className="w-full h-full bg-gradient-to-l from-primary to-transparent"></div>
                </div>
                <div className="relative z-10 flex-1">
                  <h2 className="text-headline-md font-bold mb-2">Expansion Season is Here</h2>
                  <p className="text-slate-300 text-body-md max-w-md mb-6">Launch your Q4 internship or management trainee drives now to capture top-tier talent before the academic break.</p>
                  <button className="px-6 py-3 bg-white text-primary rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors active:scale-95">
                    <span className="material-symbols-outlined">rocket_launch</span>
                    Initiate Recruitment Drive
                  </button>
                </div>
                <div className="relative z-10 w-48 h-48 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="Corporate Lobby" 
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=300&auto=format&fit=crop" 
                  />
                </div>
              </div>

              {/* Talent Pool / Active Pipeline Feed */}
              <div className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-white/50">
                  <div>
                    <h3 className="text-headline-md font-bold text-on-surface">Dynamic Talent Pool</h3>
                    <p className="text-caption text-on-surface-variant mt-0.5">Real-time candidate profile catalog synced from AlignNova database.</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-on-surface-variant hover:bg-slate-50 rounded-lg transition-colors">
                      <span className="material-symbols-outlined">filter_list</span>
                    </button>
                    <button className="p-2 text-on-surface-variant hover:bg-slate-50 rounded-lg transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-on-surface-variant">
                      <tr>
                        <th className="px-6 py-4 font-bold text-caption uppercase tracking-wider">Candidate</th>
                        <th className="px-6 py-4 font-bold text-caption uppercase tracking-wider">Course / Stream</th>
                        <th className="px-6 py-4 font-bold text-caption uppercase tracking-wider">Academic CGPA</th>
                        <th className="px-6 py-4 font-bold text-caption uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {loading ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center">
                            <svg className="animate-spin h-6 w-6 text-primary mx-auto" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          </td>
                        </tr>
                      ) : filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center text-outline text-body-md">
                            {searchQuery ? `No candidates match "${searchQuery}"` : 'No registered students in database.'}
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student) => {
                          const performance = student.uni_performance ? JSON.parse(student.uni_performance) : {};
                          const cgpa = performance.cgpa || '—';
                          return (
                            <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                    {getInitials(student.full_name)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{student.full_name || student.username}</p>
                                    <p className="text-caption text-on-surface-variant">{student.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-semibold text-body-md text-on-surface">{student.course || '—'}</p>
                                <p className="text-caption text-on-surface-variant">College Student</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-bold ${
                                  cgpa !== '—' && parseFloat(cgpa) >= 8.0 
                                    ? 'bg-emerald-50 text-secondary' 
                                    : cgpa !== '—' && parseFloat(cgpa) >= 7.0 
                                    ? 'bg-blue-50 text-primary' 
                                    : 'bg-slate-100 text-on-surface-variant'
                                }`}>
                                  {cgpa} CGPA
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button className="text-primary hover:underline font-bold text-caption">Review Portfolio</button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-slate-50 text-center">
                  <button className="text-primary font-bold text-caption hover:underline flex items-center justify-center gap-1.5 mx-auto">
                    View Entire Pipeline
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Talent Analytics & Upcoming Milestones */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Talent Analytics Card */}
              <div className="bg-white rounded-2xl border border-outline-variant shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-body-lg text-on-surface">Talent Analytics</h3>
                  <span className="material-symbols-outlined text-on-surface-variant cursor-help" title="Distribution of current applicants by domain.">info</span>
                </div>
                <div className="space-y-6">
                  {/* Styled HSL Visual Bar Graph */}
                  <div className="relative h-48 w-full flex items-end justify-between gap-3 px-2 pb-2 border-b border-outline-variant/60">
                    <div className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-lg h-[80%] relative group transition-colors">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#263143] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">42%</div>
                    </div>
                    <div className="w-full bg-primary hover:bg-primary/90 rounded-t-lg h-[95%] relative group transition-colors">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#263143] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">56%</div>
                    </div>
                    <div className="w-full bg-[#006c49] hover:bg-[#005236] rounded-t-lg h-[40%] relative group transition-colors">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#263143] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">22%</div>
                    </div>
                    <div className="w-full bg-[#ffb95f] hover:bg-[#ffb95f]/80 rounded-t-lg h-[65%] relative group transition-colors">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#263143] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">38%</div>
                    </div>
                    <div className="w-full bg-slate-200 hover:bg-slate-300 rounded-t-lg h-[25%] relative group transition-colors">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#263143] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">12%</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="text-caption text-on-surface-variant font-medium">Engineering (56%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#006c49]"></div>
                      <span className="text-caption text-on-surface-variant font-medium">Design (22%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ffb95f]"></div>
                      <span className="text-caption text-on-surface-variant font-medium">Business (38%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                      <span className="text-caption text-on-surface-variant font-medium">Others (12%)</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-caption text-on-surface-variant leading-relaxed font-semibold">
                      <span className="font-extrabold text-primary">Key Insight:</span> Engineering applicants have increased by 18% since the start of the current placement cycle.
                    </p>
                  </div>
                </div>
              </div>

              {/* Upcoming Milestones */}
              <div className="bg-white rounded-2xl border border-outline-variant shadow-sm p-6">
                <h3 className="font-bold text-body-lg text-on-surface mb-6">Upcoming Milestones</h3>
                <div className="space-y-4">
                  <div className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-outline-variant/40">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-on-surface">
                      <span className="text-[10px] font-extrabold uppercase text-on-surface-variant">Oct</span>
                      <span className="text-lg font-extrabold leading-none text-on-surface">12</span>
                    </div>
                    <div>
                      <p className="font-bold text-body-md text-on-surface group-hover:text-primary transition-colors">Technical Jam - Web Dev</p>
                      <p className="text-caption text-on-surface-variant mt-0.5">Campus A - Round 2</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-outline-variant/40">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-on-surface">
                      <span className="text-[10px] font-extrabold uppercase text-on-surface-variant">Oct</span>
                      <span className="text-lg font-extrabold leading-none text-on-surface">15</span>
                    </div>
                    <div>
                      <p className="font-bold text-body-md text-on-surface group-hover:text-primary transition-colors">Drive Closure: Design</p>
                      <p className="text-caption text-on-surface-variant mt-0.5">Application Deadline</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
