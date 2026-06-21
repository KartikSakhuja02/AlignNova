import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Data ────────────────────────────────────────────────────────────────────

const getCompanyLogo = (company) => {
  const name = company?.toLowerCase() || '';
  if (name.includes('google')) return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfHpajwGKBn2unI1eH1FKj6S5qwldgxjH1X-ODaUtDasXctpPritjFepnpKL-FCXAEQ6GwfA3FE8AwsJbHgVs2sePuzPJwyhDCskQyVDaDUlJJzhs3SbtLYRPgccQu0FdF2QTRgouR4B7SsVHdozq6eh7CnPX3wiP-lJQSIEoeUXKwuN8DqM0ouH6yUNXlGjoyzNlp3QViLKPZjmBro6VLtBQgwklmU0zB-WTVaMFhv4c-3smHxQ3f07U0Vb-gMVh1H_bWm2GgwJE';
  if (name.includes('stripe')) return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZEFlssyk9kz6WpaSNAq-uJJlJHRWmIfnpvGQOrGyjsIvQ28DXduUK5WsC0HBS7ufThW9qk6wRJuNu2eD7jqvgaiy6OwEChbEtae46FNXV1akQm6xGRUaqS_8_tGwtj4qjVfDCGvBKP8jG-IjktrxefMnJOWR_-_7WbwAEdbLIoSJyhq8kB7lAhFp3weF42eoGdcRmTItgo5qJdMS9Qvszqp7Zr4qoXobXygvYK5-Ir2gByYD7YH-8nQAd1Lm3rExmkT5RjV9MDxU';
  if (name.includes('figma')) return 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8MI9NNI7cXZYzkIGsJtzxB-pTl3BgMcYt7GRe8n08njxpYIjUmjXijsTxdKf60NgstGUc0lPILTBXZtcRIEBEYrrCuXeeEimxwXglFEQx6Y6KlPj-iLvqzyV4w5iHqeo0Db3oO1PMh7QIRNtlvLTCI2yPwfI0VBT5A9OGg4dYh6oNfUtdY1pI8sMbg6B3KhecU0NSH7Fe5V-NRDnci7czCB99TR65FzoK2dlRNM35o9Jr3KJ4ULFXEuPkG0QR_9dltL70H4NYt0o';
  if (name.includes('meta') || name.includes('facebook')) return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJSf9m_RDTo7egDvDqWmvv5fhx-nyDafJFol41wleuii6QPbVoVmkUAyDiPLigrrVaRNy27CJndfoLfJOQ0xNC4cf0OEu7zyC8Yjahq1XcFOLsn76EUE-8YBlytb57TIIzkfr_YLdXLn0Eg72n4patbldvN6YBtRsQaGN8zcA83DpNN5HXBmFbb_8wb52Llcqb81nF3xxTGTnxPLBTzjYxO7oZntlcH7cr6txWbOCQjHDS5k93pEkByLM82UlzEwXmjW1gy9kF09o';
  if (name.includes('amazon')) return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAl5kFgTRHWBieneCyd40apKBqyGDdIKFokX33rqoRKi_8j43Mcx4m4HuvJO6NZqKnMT9nddiXqm5_bFGgtm9bk9pWlSf2572RlNRiTAWS_Py_HNOUhbcIxObYy6YBRT4fg3DaUsgbeEH4VboQ9UgWi0oxDRdljFlPt5j_i-udRoA-y2apWoa5eZ9eeNZumyr8f9atB0rO2jp7tnq1WdHf1DUu4wgNfHAlLryvZZ6LP7bZNPFB6KYWLCXxsrXoOZtCCAbogR7nfCTU';
  if (name.includes('microsoft')) return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlArAEVo7czm_pf0a3pKC18-FBBdLe9LZL-agFlxgL_0IGuMaNcnOmMtkBjKRykaPugQ-pFBOi9zZ_VFag_Hnt46lhBj7lvdGe1gBIGOSnH15twcmQ2PJ4Z9dJsq0AthOe1sxio_OqDeDnEAq95p-t1fBrf9q8_L9MGF5fhX0oNOklkE_wkQ4HOiyIi8wg0GiRtgsxaAeN-ADVE-NgRlTiOt5RBoe4U4Veqq0ea8bE1d-tMoB6pR56leKoYwhuaoX-yO3_8EJOflY';
  return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop';
};

const formatDriveSalary = (type, packageVal, stipendVal) => {
  const t = type?.toLowerCase() || '';
  if (t === 'placement') {
    return packageVal ? `₹${packageVal} LPA` : 'TBD';
  } else if (t === 'internship') {
    return stipendVal ? `₹${stipendVal} / month` : 'TBD';
  } else if (t.includes('ppo')) {
    const stipendStr = stipendVal ? `₹${stipendVal} / month` : 'TBD';
    const packageStr = packageVal ? `₹${packageVal} LPA PPO` : 'TBD';
    return `${stipendStr} + ${packageStr}`;
  }
  if (packageVal) return `₹${packageVal} LPA`;
  if (stipendVal) return `₹${stipendVal} / month`;
  return 'TBD';
};

const getBadgeText = (type) => {
  return type?.toLowerCase().includes('internship') ? 'Internship Open' : 'Applications Open';
};

const getBadgeClass = (type) => {
  return type?.toLowerCase().includes('internship')
    ? 'bg-secondary-container text-on-secondary-container'
    : 'bg-primary-container text-on-primary-container';
};

const getLogoBg = (company) => {
  const name = company?.toLowerCase() || '';
  if (name.includes('stripe')) return 'bg-[#635BFF]/10';
  if (name.includes('meta')) return 'bg-[#0668E1]/10';
  if (name.includes('amazon')) return 'bg-[#FF9900]/10';
  return 'bg-surface-container-low';
};

const getLogoBorder = (company) => {
  const name = company?.toLowerCase() || '';
  if (name.includes('stripe')) return 'border-[#635BFF]/20';
  if (name.includes('meta')) return 'border-[#0668E1]/20';
  if (name.includes('amazon')) return 'border-[#FF9900]/20';
  return 'border-outline-variant';
};

// ─── DriveCard ────────────────────────────────────────────────────────────────

function DriveCard({ drive }) {
  const cardRef = useRef(null);
  const navigate = useNavigate();
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
        <button
          onClick={() => navigate(`/apply/${drive.id}`)}
          className="flex-1 bg-primary text-on-primary py-3 rounded-xl text-label-md font-semibold hover:shadow-md hover:bg-primary/90 transition-all active:scale-95 cursor-pointer"
        >
          Apply Now
        </button>
        <button
          onClick={() => setBookmarked((b) => !b)}
          className={`px-4 py-3 border rounded-xl transition-all ${bookmarked
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
        Stay tuned for the newest internship drives.
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
  const [dbDrives, setDbDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetch('/api/drives')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch drives');
      })
      .then((data) => {
        setDbDrives(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const mappedDrives = dbDrives.map((d) => ({
    id: d.id,
    logo: getCompanyLogo(d.company),
    logoAlt: `${d.company} Logo`,
    logoBg: getLogoBg(d.company),
    logoBorder: getLogoBorder(d.company),
    badge: getBadgeText(d.type),
    badgeClass: getBadgeClass(d.type),
    title: d.role,
    company: d.company,
    location: d.location || 'TBD',
    salary: formatDriveSalary(d.type, d.package, d.stipend),
    deadline: d.drive_date
      ? new Date(d.drive_date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      : 'TBD',
    type: d.type || 'Full-time',
  }));

  const filtered = mappedDrives.filter((d) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Internship') {
      return d.type.toLowerCase().includes('intern') || d.type.toLowerCase().includes('co-op');
    }
    if (activeFilter === 'Full-time') {
      return !d.type.toLowerCase().includes('intern') && !d.type.toLowerCase().includes('co-op');
    }
    return true;
  });

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
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-label-md font-semibold transition-colors ${activeFilter === f
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
      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map((drive) => (
            <DriveCard key={drive.id} drive={drive} />
          ))}
          {/* Empty / upcoming slot — always shown */}
          <EmptyCard />
        </div>
      )}

      {/* Featured Section */}
      <FeaturedSection />
    </div>
  );
}
