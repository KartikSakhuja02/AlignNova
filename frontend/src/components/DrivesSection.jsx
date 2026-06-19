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

const drives = [
  {
    id: 1,
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfHpajwGKBn2unI1eH1FKj6S5qwldgxjH1X-ODaUtDasXctpPritjFepnpKL-FCXAEQ6GwfA3FE8AwsJbHgVs2sePuzPJwyhDCskQyVDaDUlJJzhs3SbtLYRPgccQu0FdF2QTRgouR4B7SsVHdozq6eh7CnPX3wiP-lJQSIEoeUXKwuN8DqM0ouH6yUNXlGjoyzNlp3QViLKPZjmBro6VLtBQgwklmU0zB-WTVaMFhv4c-3smHxQ3f07U0Vb-gMVh1H_bWm2GgwJE',
    altText: 'Google Logo',
    type: 'Internship',
    company: 'Google',
    role: 'Tech Internship (Summer 2024)',
    salary: '$8,500/mo',
    location: 'Mountain View',
    locationIcon: 'location_on',
  },
  {
    id: 2,
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZEFlssyk9kz6WpaSNAq-uJJlJHRWmIfnpvGQOrGyjsIvQ28DXduUK5WsC0HBS7ufThW9qk6wRJuNu2eD7jqvgaiy6OwEChbEtae46FNXV1akQm6xGRUaqS_8_tGwtj4qjVfDCGvBKP8jG-IjktrxefMnJOWR_-_7WbwAEdbLIoSJyhq8kB7lAhFp3weF42eoGdcRmTItgo5qJdMS9Qvszqp7Zr4qoXobXygvYK5-Ir2gByYD7YH-8nQAd1Lm3rExmkT5RjV9MDxU',
    altText: 'Stripe Logo',
    type: 'Full-Time',
    company: 'Stripe',
    role: 'Software Engineer I (Product)',
    salary: '$165k - $180k',
    location: 'Hybrid',
    locationIcon: 'home_work',
  },
  {
    id: 3,
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8MI9NNI7cXZYzkIGsJtzxB-pTl3BgMcYt7GRe8n08njxpYIjUmjXijsTxdKf60NgstGUc0lPILTBXZtcRIEBEYrrCuXeeEimxwXglFEQx6Y6KlPj-iLvqzyV4w5iHqeo0Db3oO1PMh7QIRNtlvLTCI2yPwfI0VBT5A9OGg4dYh6oNfUtdY1pI8sMbg6B3KhecU0NSH7Fe5V-NRDnci7czCB99TR65FzoK2dlRNM35o9Jr3KJ4ULFXEuPkG0QR_9dltL70H4NYt0o',
    altText: 'Figma Logo',
    type: 'Internship',
    company: 'Figma',
    role: 'Product Design Intern',
    salary: '$9,200/mo',
    location: 'Remote',
    locationIcon: 'public',
  },
];

export default function DrivesSection() {
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {drives.map((drive) => (
          <DriveCard key={drive.company} {...drive} />
        ))}
      </div>
    </section>
  );
}
