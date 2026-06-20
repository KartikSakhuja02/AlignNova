import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function DriveCard({ id, logo, altText, type, company, role, salary, location, locationIcon }) {
  const cardRef = useRef(null);
  const navigate = useNavigate();

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 50;
    const rotateY = (centerX - x) / 50;
    card.style.transform = `perspective(1000px) scale(1.01) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) scale(1) rotateX(0) rotateY(0)';
    }
  };

  const isInternship = type === 'Internship';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group bg-surface-container-lowest border border-outline-variant rounded-2xl p-p-md shadow-sm hover:shadow-lg transition-all duration-300"
      style={{ willChange: 'transform' }}
    >
      {/* Header Row */}
      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 bg-white rounded-xl border border-outline-variant flex items-center justify-center shadow-sm overflow-hidden">
          <img alt={altText} className="w-10 h-10 object-contain" src={logo} />
        </div>
        <span
          className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
            isInternship
              ? 'bg-secondary-container text-on-secondary-container'
              : 'bg-primary-fixed text-on-primary-fixed-variant'
          }`}
        >
          {type}
        </span>
      </div>

      {/* Company Info */}
      <h4 className="text-headline-md font-bold text-on-surface group-hover:text-primary transition-colors">
        {company}
      </h4>
      <p className="text-on-surface-variant text-label-md mb-4">{role}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-caption rounded-lg flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>payments</span>
          {salary}
        </span>
        <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-caption rounded-lg flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{locationIcon}</span>
          {location}
        </span>
      </div>

      <button
        onClick={() => navigate(`/apply/${id}`)}
        className="w-full py-4 bg-primary text-white font-bold rounded-xl active:scale-95 transition-transform hover:bg-primary/90 cursor-pointer"
      >
        Apply Now
      </button>
    </div>
  );
}

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

const formatSalary = (pkg, company) => {
  if (pkg) {
    if (!isNaN(pkg)) return `₹${pkg} LPA`;
    return pkg;
  }
  const name = company?.toLowerCase() || '';
  if (name.includes('google')) return '$8,500/mo';
  if (name.includes('stripe')) return '$7,800/mo';
  if (name.includes('figma')) return '$9,200/mo';
  return 'TBD';
};

const getLocation = (company) => {
  const name = company?.toLowerCase() || '';
  if (name.includes('google')) return 'Mountain View, CA';
  if (name.includes('stripe')) return 'San Francisco, CA';
  if (name.includes('figma')) return 'Remote';
  return 'Bengaluru, India';
};

const getLocationIcon = (company) => {
  const name = company?.toLowerCase() || '';
  if (name.includes('figma')) return 'public';
  if (name.includes('stripe')) return 'home_work';
  return 'location_on';
};

export default function DrivesSection() {
  const navigate = useNavigate();
  const [drives, setDrives] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/drives')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load drives');
      })
      .then((data) => {
        setDrives(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h3 className="text-headline-lg font-bold text-on-surface">
            Upcoming Placement &amp; Internship Drives
          </h3>
          <p className="text-body-md text-on-surface-variant">
            Top-tier companies currently accepting applications
          </p>
        </div>
        <button
          onClick={() => navigate('/drives')}
          className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all duration-200 cursor-pointer"
        >
          View All Drives
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : drives.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest opacity-70">
          <p className="text-body-md text-on-surface-variant font-medium">No active placement drives currently open.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {drives.slice(0, 3).map((drive) => (
            <DriveCard
              key={drive.id}
              id={drive.id}
              logo={getCompanyLogo(drive.company)}
              altText={`${drive.company} Logo`}
              type={drive.type || 'Full-time'}
              company={drive.company}
              role={drive.role}
              salary={formatSalary(drive.package, drive.company)}
              location={getLocation(drive.company)}
              locationIcon={getLocationIcon(drive.company)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
