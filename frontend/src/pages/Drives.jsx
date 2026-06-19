import React, { useState, useRef } from 'react';

// ─── Data ────────────────────────────────────────────────────────────────────

const drives = [
  {
    id: 1,
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClOcfRkWYRRdnezHy2s5r2cYS6eXJBcY_lET5a7G6LehKSZsbqy11rFgPAGY2_RG8apHttXWn4Xquy50K5kATqs3y9ptBcHqEFFf5tP8YAHpthRNkLnAB4b1P4fbvig9KjpEGhmwmHnEP9Dlt7AV7_nmkxC_XhWLNxJalz2249SzrTxC4Vjh_Speofp9iyW87o3vRkN7tKuG-rKo9_geuSUgXvGfPhuGcgdZv06xxp9KJcejAYmk9Mxi1Lk-lRaQxID93WyaQmcZk',
    logoAlt: 'Google Logo',
    logoBg: 'bg-surface-container-low',
    logoBorder: 'border-outline-variant',
    badge: 'Applications Open',
    badgeClass: 'bg-secondary-container text-on-secondary-container',
    title: 'Software Engineer Intern',
    company: 'Google',
    location: 'Mountain View, CA (Remote Friendly)',
    salary: '$8,500 - $10,500 / Month',
    deadline: 'Oct 15, 2023',
    type: 'Internship',
  },
  {
    id: 2,
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvvIDD6_zQQ6Kgn2tsYHLu3g8aojCKBP0EZn2QqABdSUAQcENkumn8iaJD9tLuiEml83QCnYeCpc5C8-7FJL_MrQfC3Mo6lptPb_tH899b7v2ttkw9k9rqgk8iHDZbKynbMUzBTFeRrBNC8hBikXmJ2yM2YphSQwSbevds6_lFNN4aCkXge6EKjzuzMsITnDq8Yiq8P3XAWah92c5cNavDt_QGSqUd7Tg-283mxK8Wfl-57zKXLdKZmkDfcQG3LHcJoDxTRZhWGI4',
    logoAlt: 'Stripe Logo',
    logoBg: 'bg-[#635BFF]/10',
    logoBorder: 'border-[#635BFF]/20',
    badge: 'High Demand',
    badgeClass: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    title: 'Product Design Intern',
    company: 'Stripe',
    location: 'San Francisco, CA',
    salary: '$7,800 - $9,200 / Month',
    deadline: 'Sep 30, 2023',
    type: 'Internship',
  },
  {
    id: 3,
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJSf9m_RDTo7egDvDqWmvv5fhx-nyDafJFol41wleuii6QPbVoVmkUAyDiPLigrrVaRNy27CJndfoLfJOQ0xNC4cf0OEu7zyC8Yjahq1XcFOLsn76EUE-8YBlytb57TIIzkfr_YLdXLn0Eg72n4patbldvN6YBtRsQaGN8zcA83DpNN5HXBmFbb_8wb52Llcqb81nF3xxTGTnxPLBTzjYxO7oZntlcH7cr6txWbOCQjHDS5k93pEkByLM82UlzEwXmjW1gy9kF09o',
    logoAlt: 'Meta Logo',
    logoBg: 'bg-[#0668E1]/10',
    logoBorder: 'border-[#0668E1]/20',
    badge: 'University Grad',
    badgeClass: 'bg-surface-container-highest text-primary',
    title: 'Data Scientist (New Grad)',
    company: 'Meta',
    location: 'London, UK (Relocation Offered)',
    salary: '£85,000 / Per Annum',
    deadline: 'Nov 05, 2023',
    type: 'Full-time',
  },
  {
    id: 4,
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAl5kFgTRHWBieneCyd40apKBqyGDdIKFokX33rqoRKi_8j43Mcx4m4HuvJO6NZqKnMT9nddiXqm5_bFGgtm9bk9pWlSf2572RlNRiTAWS_Py_HNOUhbcIxObYy6YBRT4fg3DaUsgbeEH4VboQ9UgWi0oxDRdljFlPt5j_i-udRoA-y2apWoa5eZ9eeNZumyr8f9atB0rO2jp7tnq1WdHf1DUu4wgNfHAlLryvZZ6LP7bZNPFB6KYWLCXxsrXoOZtCCAbogR7nfCTU',
    logoAlt: 'Amazon Logo',
    logoBg: 'bg-[#FF9900]/10',
    logoBorder: 'border-[#FF9900]/20',
    badge: 'Closing Soon',
    badgeClass: 'bg-error-container text-on-error-container',
    title: 'Cloud Support Engineer',
    company: 'Amazon Web Services',
    location: 'Seattle, WA',
    salary: '$115,000 / Per Annum',
    deadline: 'Oct 02, 2023',
    type: 'Full-time',
  },
  {
    id: 5,
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlArAEVo7czm_pf0a3pKC18-FBBdLe9LZL-agFlxgL_0IGuMaNcnOmMtkBjKRykaPugQ-pFBOi9zZ_VFag_Hnt46lhBj7lvdGe1gBIGOSnH15twcmQ2PJ4Z9dJsq0AthOe1sxio_OqDeDnEAq95p-t1fBrf9q8_L9MGF5fhX0oNOklkE_wkQ4HOiyIi8wg0GiRtgsxaAeN-ADVE-NgRlTiOt5RBoe4U4Veqq0ea8bE1d-tMoB6pR56leKoYwhuaoX-yO3_8EJOflY',
    logoAlt: 'Microsoft Logo',
    logoBg: 'bg-surface-container-low',
    logoBorder: 'border-outline-variant',
    badge: 'Applications Open',
    badgeClass: 'bg-secondary-container text-on-secondary-container',
    title: 'Security Analyst Intern',
    company: 'Microsoft',
    location: 'Redmond, WA',
    salary: '$7,000 - $8,500 / Month',
    deadline: 'Nov 20, 2023',
    type: 'Internship',
  },
];

// ─── DriveCard ────────────────────────────────────────────────────────────────

function DriveCard({ drive }) {
  const cardRef = useRef(null);
  const [bookmarked, setBookmarked] = useState(false);

  const handleMouseEnter = () => {
    if (cardRef.current) cardRef.current.style.transform = 'translateY(-4px)';
  };
  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = 'translateY(0)';
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-p-md shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
      style={{ willChange: 'transform' }}
    >
      {/* Logo + Badge */}
      <div className="flex justify-between items-start mb-6">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center border p-2 ${drive.logoBg} ${drive.logoBorder}`}
        >
          <img alt={drive.logoAlt} className="w-full h-full object-contain" src={drive.logo} />
        </div>
        <span className={`px-3 py-1 rounded-full text-caption font-medium ${drive.badgeClass}`}>
          {drive.badge}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-headline-md font-bold text-on-surface">{drive.title}</h3>
      <p className="text-body-md text-primary font-semibold mt-1">{drive.company}</p>

      {/* Details */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-outline" style={{ fontSize: '20px' }}>location_on</span>
          <span className="text-body-md">{drive.location}</span>
        </div>
        <div className="flex items-center gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-outline" style={{ fontSize: '20px' }}>payments</span>
          <span className="text-body-md">{drive.salary}</span>
        </div>
        <div className="flex items-center gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-outline" style={{ fontSize: '20px' }}>calendar_today</span>
          <span className="text-body-md">Deadline: {drive.deadline}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto pt-8 flex gap-3">
        <button className="flex-1 bg-primary text-on-primary py-3 rounded-xl text-label-md font-semibold hover:shadow-md hover:bg-primary/90 transition-all active:scale-95">
          Apply Now
        </button>
        <button
          onClick={() => setBookmarked((b) => !b)}
          className={`px-4 py-3 border rounded-xl transition-all ${
            bookmarked
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
          }`}
          aria-label="Bookmark"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: bookmarked ? "'FILL' 1" : "'FILL' 0" }}
          >
            bookmark
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── EmptyCard ────────────────────────────────────────────────────────────────

function EmptyCard() {
  return (
    <div className="bg-surface-container-low border border-dashed border-outline-variant rounded-2xl p-p-md flex flex-col items-center justify-center text-center opacity-60">
      <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>more_horiz</span>
      </div>
      <h4 className="text-headline-md font-bold text-on-surface">More Drives Incoming</h4>
      <p className="text-body-md text-on-surface-variant mt-2">
        Nvidia, Apple, and Netflix drives are being finalized. Stay tuned.
      </p>
      <button className="mt-6 text-primary text-label-md font-semibold hover:underline">
        Get Notified
      </button>
    </div>
  );
}

// ─── FeaturedSection ─────────────────────────────────────────────────────────

function FeaturedSection() {
  return (
    <section className="mt-16 bg-primary-fixed text-on-primary-fixed-variant rounded-3xl p-p-xl flex flex-col md:flex-row items-center gap-10 overflow-hidden relative">
      {/* Text side */}
      <div className="flex-1 z-10">
        <h3 className="text-headline-lg font-bold mb-4">Master Your Interviews</h3>
        <p className="text-body-lg mb-8 max-w-xl opacity-90">
          Get exclusive access to past interview questions from Google and Stripe. Our data shows
          that students who prepare with Alignova resources are 3× more likely to clear the first
          round.
        </p>
        <div className="flex gap-4 flex-wrap">
          <button className="bg-primary text-on-primary px-8 py-3 rounded-xl text-label-md font-semibold hover:shadow-lg transition-all active:scale-95">
            Explore Resources
          </button>
          <button className="border border-on-primary-fixed-variant px-8 py-3 rounded-xl text-label-md font-semibold hover:bg-on-primary-fixed-variant/5 transition-all">
            View Statistics
          </button>
        </div>
      </div>

      {/* Analytics card */}
      <div className="w-full md:w-1/3 aspect-video md:aspect-square bg-surface-container-lowest/30 rounded-2xl backdrop-blur-sm border border-white/20 p-6 z-10 flex flex-col justify-center">
        <div className="space-y-4">
          <div className="h-3 w-3/4 bg-on-primary-fixed-variant/20 rounded-full" />
          <div className="h-3 w-1/2 bg-on-primary-fixed-variant/20 rounded-full" />
          <div className="h-3 w-5/6 bg-on-primary-fixed-variant/20 rounded-full" />
          <div className="h-24 w-full bg-on-primary-fixed-variant/10 rounded-xl mt-4 flex items-center justify-center">
            <span className="material-symbols-outlined opacity-50" style={{ fontSize: '40px' }}>analytics</span>
          </div>
        </div>
      </div>

      {/* Decorative glow */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
    </section>
  );
}

// ─── Drives Page ─────────────────────────────────────────────────────────────

const FILTERS = ['All', 'Internship', 'Full-time'];

export default function Drives() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered =
    activeFilter === 'All' ? drives : drives.filter((d) => d.type === activeFilter);

  return (
    <div className="px-p-lg pt-8 pb-p-xl max-w-[1280px] mx-auto">
      {/* Page Header */}
      <section className="mb-12">
        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <h2 className="text-headline-lg font-bold text-on-surface">Placement Drives</h2>
            <p className="text-body-lg text-on-surface-variant mt-2">
              Discover elite career opportunities from top-tier organizations.
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-label-md font-semibold transition-colors ${
                  activeFilter === f
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {f === 'All' && (
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>apps</span>
                )}
                {f === 'Internship' && (
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>school</span>
                )}
                {f === 'Full-time' && (
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>work</span>
                )}
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Drive Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.map((drive) => (
          <DriveCard key={drive.id} drive={drive} />
        ))}
        {/* Empty / upcoming slot — always shown */}
        <EmptyCard />
      </div>

      {/* Featured Section */}
      <FeaturedSection />
    </div>
  );
}
