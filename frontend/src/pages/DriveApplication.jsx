import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DRIVE_DETAILS = {
  1: {
    company: 'Google',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYzgDV2COw0g8kEqpitWhpX6DW_NXf7tugV1qwVhTkJrvlgS_gNzucdw3vmRp65DnmSo_titItbBekU6cAE1UFG9HZg1fBqBocu9cetphGlP4WL7KRu9OqKCcIl_8gmnVhaHUV22vONAy3dIy6Pibd3RWcohIuJ6bB1-B98KOquZO_9DqO3BEmuO82YwmztGs9MW3vOuOhWri9ePHFh3_ZKRcHfVQl_wpu07NxSLOCuGfU0qf2FJ-M',
    title: 'Software Engineering Intern',
    location: 'Mountain View, CA (Remote Eligible)',
    duration: '12 Weeks Summer 2024',
    salary: '$8,500 - $10,000 / mo',
    openings: '50+ Openings',
    about: 'Google’s mission is to organize the world’s information and make it universally accessible and useful. As a Software Engineering Intern, you’ll work on projects that handle data at a scale that very few companies in the world do. You’ll be part of a culture that values curiosity, technical excellence, and collaboration. Our interns don’t just "shadow" engineers; they write code that goes into production and impacts billions of users worldwide.',
    responsibilities: [
      'Develop and maintain large-scale software systems using C++, Java, or Python.',
      'Participate in design reviews and technical discussions to solve complex algorithmic challenges.',
      'Collaborate with cross-functional teams including Product Managers and UI/UX Designers.'
    ],
    requirements: [
      'Currently pursuing a BS, MS, or PhD in Computer Science or a related technical field.',
      'Experience with one or more general-purpose programming languages (Java, C/C++, Python, Go).',
      'Solid understanding of Data Structures, Algorithms, and Software Design principles.'
    ],
    techStack: ['C++', 'Java', 'Python', 'Go', 'Distributed Systems', 'Machine Learning'],
    stipend: '$9,250',
    perks: ['Relocation Housing Stipend', 'Complimentary On-site Meals', 'Return Offer Potential', 'Personal Mentorship'],
    timeline: [
      { step: 'Application Period', date: 'Aug 15 - Sep 15, 2023', desc: 'Submit your resume and details.' },
      { step: 'Online Assessment', date: 'Sep 20 - Sep 25, 2023', desc: '2-hour coding and logic challenge.' },
      { step: 'Technical Interviews', date: 'Oct 5 - Oct 20, 2023', desc: 'Two rounds of 45-min virtual coding sessions.' },
      { step: 'Final Offers', date: 'Nov 1, 2023', desc: 'Internship confirmation and paperwork.' }
    ]
  },
  2: {
    company: 'Stripe',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvvIDD6_zQQ6Kgn2tsYHLu3g8aojCKBP0EZn2QqABdSUAQcENkumn8iaJD9tLuiEml83QCnYeCpc5C8-7FJL_MrQfC3Mo6lptPb_tH899b7v2ttkw9k9rqgk8iHDZbKynbMUzBTFeRrBNC8hBikXmJ2yM2YphSQwSbevds6_lFNN4aCkXge6EKjzuzMsITnDq8Yiq8P3XAWah92c5cNavDt_QGSqUd7Tg-283mxK8Wfl-57zKXLdKZmkDfcQG3LHcJoDxTRZhWGI4',
    title: 'Product Design Intern',
    location: 'San Francisco, CA (Hybrid)',
    duration: '12 Weeks Summer 2024',
    salary: '$7,800 - $9,200 / mo',
    openings: '12 Openings',
    about: 'Stripe builds financial infrastructure for the internet. As a Product Design Intern, you will work closely with developers and product leads to design features that enable online merchants to scale globally. You will participate in research, user testing, high fidelity mockups, and layout design.',
    responsibilities: [
      'Create high-fidelity designs, prototypes, and user flows for merchant products.',
      'Gather merchant feedback and translate findings into interface solutions.',
      'Contribute components to the Stripe design system.'
    ],
    requirements: [
      'Currently enrolled in a design program (HCI, graphic design, interactive design).',
      'Strong portfolio demonstrating digital UI design and problem solving capabilities.',
      'Proficiency in Figma and interactive prototyping tools.'
    ],
    techStack: ['Figma', 'UI/UX Design', 'Interaction Design', 'CSS Grid', 'Typography', 'Framer'],
    stipend: '$8,500',
    perks: ['Wellness Stipend', 'Modern SF Office & Free Lunches', 'Design Mentorship', 'Equity Options Plan'],
    timeline: [
      { step: 'Application Period', date: 'Aug 10 - Sep 10, 2023', desc: 'Submit your resume and design portfolio.' },
      { step: 'Design Challenge', date: 'Sep 15 - Sep 20, 2023', desc: 'Practical UI assignment (takes ~4 hours).' },
      { step: 'Portfolio Review Round', date: 'Oct 1 - Oct 10, 2023', desc: 'Walk through your past projects with designers.' },
      { step: 'Offers Issued', date: 'Oct 25, 2023', desc: 'Design internship onboarding.' }
    ]
  },
  3: {
    company: 'Meta',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJSf9m_RDTo7egDvDqWmvv5fhx-nyDafJFol41wleuii6QPbVoVmkUAyDiPLigrrVaRNy27CJndfoLfJOQ0xNC4cf0OEu7zyC8Yjahq1XcFOLsn76EUE-8YBlytb57TIIzkfr_YLdXLn0Eg72n4patbldvN6YBtRsQaGN8zcA83DpNN5HXBmFbb_8wb52Llcqb81nF3xxTGTnxPLBTzjYxO7oZntlcH7cr6txWbOCQjHDS5k93pEkByLM82UlzEwXmjW1gy9kF09o',
    title: 'Data Scientist (New Grad)',
    location: 'London, UK (Relocation Offered)',
    duration: 'Full-time Permanent',
    salary: '£85,000 / Per Annum',
    openings: '30+ Openings',
    about: 'At Meta, we build technologies that help people connect, find communities and grow businesses. Our Data Scientists use statistical models, database metrics, and experiments to guide product direction and prioritize updates affecting billions of people.',
    responsibilities: [
      'Write SQL pipelines to extract and process complex logs from large clusters.',
      'Perform A/B testing and statistical analyses to measure product health.',
      'Communicate data-driven recommendations to cross-functional teams.'
    ],
    requirements: [
      'MS or PhD in a quantitative discipline (Math, Stats, Physics, CS).',
      'Strong expertise in SQL and data manipulation languages like Python or R.',
      'Deep understanding of probability, regression modeling, and hypothesis testing.'
    ],
    techStack: ['SQL', 'Python', 'R', 'A/B Testing', 'Presto', 'Hive', 'Data Viz'],
    stipend: '£7,083',
    perks: ['Full UK Relocation Paid', 'Free Gourmet Dinners', 'Gym Membership Subsidy', 'Comprehensive Health Plan'],
    timeline: [
      { step: 'Application Submissions', date: 'Sep 1 - Oct 1, 2023', desc: 'Submit application with transcripts.' },
      { step: 'SQL/Stats Assessment', date: 'Oct 5 - Oct 10, 2023', desc: 'Online statistical case questions.' },
      { step: 'Technical Round', date: 'Oct 15 - Oct 25, 2023', desc: 'Live SQL queries and product thinking.' },
      { step: 'Final Loop', date: 'Nov 5, 2023', desc: 'Three rounds of virtual interviews.' }
    ]
  },
  4: {
    company: 'Amazon Web Services',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAl5kFgTRHWBieneCyd40apKBqyGDdIKFokX33rqoRKi_8j43Mcx4m4HuvJO6NZqKnMT9nddiXqm5_bFGgtm9bk9pWlSf2572RlNRiTAWS_Py_HNOUhbcIxObYy6YBRT4fg3DaUsgbeEH4VboQ9UgWi0oxDRdljFlPt5j_i-udRoA-y2apWoa5eZ9eeNZumyr8f9atB0rO2jp7tnq1WdHf1DUu4wgNfHAlLryvZZ6LP7bZNPFB6KYWLCXxsrXoOZtCCAbogR7nfCTU',
    title: 'Cloud Support Engineer',
    location: 'Seattle, WA',
    duration: 'Full-time Permanent',
    salary: '$115,000 / Per Annum',
    openings: '40+ Openings',
    about: 'Amazon Web Services (AWS) provides trusted cloud infrastructure used by startups, enterprises, and governments. Cloud Support Engineers work directly with customers to troubleshoot application deployments, database scaling, and security architectures.',
    responsibilities: [
      'Resolve advanced infrastructure and operating system issues for AWS customers.',
      'Develop automated scripts to inspect service health and diagnose issues.',
      'Contribute to internal troubleshooting tooling and technical documentation.'
    ],
    requirements: [
      'BS in Computer Science, Networking, Information Technology, or equivalent experience.',
      'Strong grasp of operating systems (Linux/Windows) and networking (TCP/IP, DNS, SSL).',
      'Knowledge of cloud computing concepts and virtualization.'
    ],
    techStack: ['AWS Services', 'Linux Systems', 'TCP/IP Networking', 'Python Scripts', 'Bash', 'Docker'],
    stipend: '$9,580',
    perks: ['Seattle Sign-on Bonus', 'Stock Options Allocation', 'Health & Dental Plans', 'AWS Certifications Paid'],
    timeline: [
      { step: 'Submit Application', date: 'Aug 20 - Sep 15, 2023', desc: 'Upload resume and certifications.' },
      { step: 'Networking Assessment', date: 'Sep 22 - Sep 27, 2023', desc: 'Online routing, system triage tests.' },
      { step: 'Technical Round', date: 'Oct 8 - Oct 15, 2023', desc: 'Deep dive Linux and routing interviews.' },
      { step: 'Final Decision', date: 'Oct 30, 2023', desc: 'Offers finalized.' }
    ]
  },
  5: {
    company: 'Microsoft',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlArAEVo7czm_pf0a3pKC18-FBBdLe9LZL-agFlxgL_0IGuMaNcnOmMtkBjKRykaPugQ-pFBOi9zZ_VFag_Hnt46lhBj7lvdGe1gBIGOSnH15twcmQ2PJ4Z9dJsq0AthOe1sxio_OqDeDnEAq95p-t1fBrf9q8_L9MGF5fhX0oNOklkE_wkQ4HOiyIi8wg0GiRtgsxaAeN-ADVE-NgRlTiOt5RBoe4U4Veqq0ea8bE1d-tMoB6pR56leKoYwhuaoX-yO3_8EJOflY',
    title: 'Security Analyst Intern',
    location: 'Redmond, WA',
    duration: '12 Weeks Summer 2024',
    salary: '$7,000 - $8,500 / Month',
    openings: '15 Openings',
    about: 'Microsoft Security operates threat intelligence and endpoint protection used by billions. As a Security Analyst Intern, you will participate in incident response monitoring, security tool scripting, and vulnerability testing.',
    responsibilities: [
      'Monitor alert streams to identify potential malicious activities and threats.',
      'Build script integrations using Python or PowerShell to query threat feeds.',
      'Draft vulnerability summaries and patch advisories.'
    ],
    requirements: [
      'Currently pursuing a BS or MS with focus in Cyber Security or Computer Science.',
      'Basic understanding of common web vulnerabilities (OWASP Top 10) and cryptography.',
      'Experience with security analysis tools (Wireshark, Nmap).'
    ],
    techStack: ['Security Analysis', 'PowerShell', 'Python', 'OWASP Standards', 'Linux Syslog', 'SIEM Tools'],
    stipend: '$7,750',
    perks: ['Subsidized Intern Housing', 'Redmond Campus Bus Pass', 'Vocal Coaching Seminars', 'Technical Mentors'],
    timeline: [
      { step: 'Application Submissions', date: 'Sep 10 - Oct 10, 2023', desc: 'Submit application with cybersecurity coursework details.' },
      { step: 'Cyber Trivia Assessment', date: 'Oct 15 - Oct 20, 2023', desc: 'Scenario based triage questions.' },
      { step: 'Case Study Interview', date: 'Nov 1 - Nov 10, 2023', desc: 'Present anomaly diagnosis to analysts.' },
      { step: 'Intern Selection', date: 'Dec 1, 2023', desc: 'Summer security placements confirmed.' }
    ]
  }
};

export default function DriveApplication() {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    sop: '',
  });
  const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.full_name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    fetch(`/api/drives/${driveId}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Drive not found');
      })
      .then((data) => {
        setDrive(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [driveId]);

  const handleInputChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('You must be signed in to apply.');
      setSubmitStatus('error');
      return;
    }
    setSubmitStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          drive_id: driveId,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit application. Please try again.');
      }

      setSubmitStatus('success');
    } catch (err) {
      setErrorMsg(err.message);
      setSubmitStatus('error');
    }
  };

  const getCompanyLogo = (company) => {
    const name = company?.toLowerCase() || '';
    if (name.includes('google')) return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYzgDV2COw0g8kEqpitWhpX6DW_NXf7tugV1qwVhTkJrvlgS_gNzucdw3vmRp65DnmSo_titItbBekU6cAE1UFG9HZg1fBqBocu9cetphGlP4WL7KRu9OqKCcIl_8gmnVhaHUV22vONAy3dIy6Pibd3RWcohIuJ6bB1-B98KOquZO_9DqO3BEmuO82YwmztGs9MW3vOuOhWri9ePHFh3_ZKRcHfVQl_wpu07NxSLOCuGfU0qf2FJ-M';
    if (name.includes('stripe')) return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvvIDD6_zQQ6Kgn2tsYHLu3g8aojCKBP0EZn2QqABdSUAQcENkumn8iaJD9tLuiEml83QCnYeCpc5C8-7FJL_MrQfC3Mo6lptPb_tH899b7v2ttkw9k9rqgk8iHDZbKynbMUzBTFeRrBNC8hBikXmJ2yM2YphSQwSbevds6_lFNN4aCkXge6EKjzuzMsITnDq8Yiq8P3XAWah92c5cNavDt_QGSqUd7Tg-283mxK8Wfl-57zKXLdKZmkDfcQG3LHcJoDxTRZhWGI4';
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
    if (name.includes('google')) return '$8,500 - $10,000 / mo';
    if (name.includes('stripe')) return '$7,800 - $9,200 / mo';
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

  const getStipend = (pkg, company) => {
    if (pkg) {
      if (!isNaN(pkg)) return `₹${pkg} LPA`;
      return pkg;
    }
    const name = company?.toLowerCase() || '';
    if (name.includes('google')) return '$9,250';
    if (name.includes('stripe')) return '$8,500';
    if (name.includes('figma')) return '$9,200';
    return 'TBD';
  };

  const getMockDetails = (company) => {
    const name = company?.toLowerCase() || '';
    if (name.includes('google')) return DRIVE_DETAILS[1];
    if (name.includes('stripe')) return DRIVE_DETAILS[2];
    if (name.includes('figma')) return DRIVE_DETAILS[3];
    if (name.includes('meta')) return DRIVE_DETAILS[3];
    if (name.includes('amazon')) return DRIVE_DETAILS[4];
    if (name.includes('microsoft')) return DRIVE_DETAILS[5];
    return null;
  };

  const mock = drive ? getMockDetails(drive.company) : null;
  const details = drive ? {
    company: drive.company,
    logo: getCompanyLogo(drive.company),
    title: drive.role,
    location: getLocation(drive.company),
    duration: drive.type || 'Full-time Permanent',
    salary: formatSalary(drive.package, drive.company),
    openings: mock ? mock.openings : 'Multiple Openings',
    stipend: mock ? mock.stipend : (drive.package ? `₹${drive.package} LPA` : 'TBD'),
    about: mock ? mock.about : `${drive.company} is seeking an exceptional talent for the position of ${drive.role}. This is an elite opportunity to build, scale, and optimize next-generation platforms alongside industry leaders.`,
    responsibilities: mock ? mock.responsibilities : [
      `Design and develop reliable, secure, and scalable solutions for ${drive.company}'s core business systems.`,
      'Collaborate with product design and engineering teams to identify requirements and refine user flows.',
      'Participate in peer reviews, system triage, and unit testing to ensure high technical standards.'
    ],
    requirements: mock ? mock.requirements : [
      drive.eligibility ? `Minimum academic CGPA requirement of ${drive.eligibility} / 10.` : 'Strong academic background in engineering, design, or business streams.',
      'Core technical understanding of data structures, algorithms, and application architectures.',
      'Excellent verbal and written communication skills to articulate system engineering challenges.'
    ],
    techStack: mock ? mock.techStack : ['React', 'Python', 'SQL', 'FastAPI', 'System Architecture', 'Git'],
    perks: mock ? mock.perks : ['Competitive Compensation', 'Premium Health Coverage', 'Flexible Working Hours', 'Professional Mentorship'],
    timeline: mock ? mock.timeline : [
      { step: 'Application Phase', date: 'Active Now', desc: 'Submit your resume and statement of purpose.' },
      { step: 'Technical Screening', date: 'TBD', desc: 'Skill assessments and system design assignments.' },
      { step: 'Final Interviews', date: 'TBD', desc: 'Panel discussions with the hiring managers.' }
    ]
  } : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <span className="material-symbols-outlined text-[48px] text-error mb-4">error</span>
        <h2 className="text-headline-md font-bold text-on-surface mb-2">Drive Not Found</h2>
        <p className="text-body-md text-on-surface-variant mb-6 text-center max-w-sm">
          The placement drive details could not be found or has expired.
        </p>
        <button onClick={() => navigate('/drives')} className="px-6 py-3 bg-primary text-white font-semibold rounded-xl">
          Back to Drives
        </button>
      </div>
    );
  }

  return (
    <div
      className="p-p-lg min-h-screen bg-slate-50/50"
      style={{
        background:
          'radial-gradient(at 0% 0%, rgba(79,70,229,0.04) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(0,108,73,0.03) 0px, transparent 50%)',
      }}
    >
      <div className="max-w-[1200px] mx-auto pb-24 space-y-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-caption text-on-surface-variant select-none">
          <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">
            Dashboard
          </button>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <button onClick={() => navigate('/drives')} className="hover:text-primary transition-colors">
            Drives
          </button>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-bold">{details.company} - {details.title}</span>
        </nav>

        {/* Hero Card */}
        <section className="relative bg-white rounded-3xl p-8 border border-slate-100 overflow-hidden shadow-sm group">
          <div className="absolute top-0 right-0 p-12 pointer-events-none opacity-[0.03] group-hover:opacity-5 transition-opacity">
            <span className="material-symbols-outlined text-[240px]">terminal</span>
          </div>
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
            {/* Logo */}
            <div className="w-24 h-24 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-center shrink-0 overflow-hidden">
              <img className="w-full h-auto object-contain" alt={`${details.company} Logo`} src={details.logo} />
            </div>
            {/* Details */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-caption uppercase tracking-wider">
                  Active Drive
                </span>
                <span className="px-3 py-1 rounded-full bg-secondary-container/20 text-on-secondary-container font-semibold text-caption uppercase tracking-wider">
                  Tier 1 Company
                </span>
              </div>
              <h2 className="text-headline-lg font-black text-on-surface mb-2 tracking-tight">
                {details.title}
              </h2>
              <p className="text-headline-md font-semibold text-on-surface-variant mb-6">
                {details.company} • {details.location}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-8 text-outline">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  <span className="text-body-md text-on-surface-variant font-medium">{details.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">payments</span>
                  <span className="text-body-md text-on-surface-variant font-medium">{details.salary}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">group</span>
                  <span className="text-body-md text-on-surface-variant font-medium">{details.openings}</span>
                </div>
              </div>

              <button
                onClick={() => document.getElementById('apply-form-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:scale-[1.02] hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Apply Now</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* Info Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left Column: Details & Form */}
          <div className="lg:col-span-8 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h3 className="text-headline-md font-bold text-on-surface mb-6 flex items-center gap-3 border-b border-slate-50 pb-4">
                <span className="material-symbols-outlined text-primary">info</span>
                About {details.company}
              </h3>
              <p className="text-body-lg text-on-surface-variant leading-relaxed font-medium">
                {details.about}
              </p>
            </div>

            {/* Role Details */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h3 className="text-headline-md font-bold text-on-surface mb-8 flex items-center gap-3 border-b border-slate-50 pb-4">
                <span className="material-symbols-outlined text-primary">assignment</span>
                Role Details
              </h3>
              <div className="space-y-8">
                {/* Responsibilities */}
                <div>
                  <h4 className="text-[12px] font-bold text-primary uppercase tracking-widest mb-4">
                    Responsibilities
                  </h4>
                  <ul className="space-y-4">
                    {details.responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
                        <p className="text-body-md text-on-surface-variant font-medium">{resp}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Requirements */}
                <div>
                  <h4 className="text-[12px] font-bold text-primary uppercase tracking-widest mb-4">
                    Core Requirements
                  </h4>
                  <ul className="space-y-4">
                    {details.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
                        <p className="text-body-md text-on-surface-variant font-medium">{req}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack */}
                <div>
                  <h4 className="text-[12px] font-bold text-primary uppercase tracking-widest mb-4">
                    Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {details.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-4 py-2 rounded-xl bg-surface-container-low border border-slate-100 text-on-surface text-label-md hover:bg-primary hover:text-white transition-colors cursor-default"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Application Submission Form */}
            <div id="apply-form-section" className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm scroll-mt-24">
              <h3 className="text-headline-md font-bold text-on-surface mb-2 flex items-center gap-3 border-b border-slate-50 pb-4">
                <span className="material-symbols-outlined text-primary">send</span>
                Submit Application
              </h3>
              <p className="text-body-md text-on-surface-variant mb-8 font-medium">
                Personalize your application details to stand out to recruiters.
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-label-md text-on-surface-variant uppercase tracking-wider block">
                      Full Name
                    </label>
                    <input
                      required
                      name="fullName"
                      value={form.fullName}
                      onChange={handleInputChange}
                      disabled={submitStatus !== 'idle'}
                      placeholder="Alex Rivera"
                      type="text"
                      className="w-full rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all px-4 py-3 bg-white outline-none disabled:bg-slate-50 disabled:text-on-surface-variant"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label-md text-on-surface-variant uppercase tracking-wider block">
                      University Email
                    </label>
                    <input
                      required
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      disabled={submitStatus !== 'idle'}
                      placeholder="alex.rivera@university.edu"
                      type="email"
                      className="w-full rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all px-4 py-3 bg-white outline-none disabled:bg-slate-50 disabled:text-on-surface-variant"
                    />
                  </div>
                </div>

                {/* Resume Upload Drag Drop Block */}
                <div className="space-y-2">
                  <label className="text-label-md text-on-surface-variant uppercase tracking-wider block">
                    Resume (PDF)
                  </label>
                  <div className="border-2 border-dashed border-outline-variant rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer bg-slate-50/50 group select-none">
                    <span className="material-symbols-outlined text-4xl text-outline group-hover:text-primary mb-2">
                      upload_file
                    </span>
                    <p className="font-semibold text-body-md text-on-surface-variant group-hover:text-primary transition-colors">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-caption text-outline mt-1">Max file size: 5MB (PDF only)</p>
                  </div>
                </div>

                {/* SOP Essay Block */}
                <div className="space-y-2">
                  <label className="text-label-md text-on-surface-variant uppercase tracking-wider block">
                    Statement of Purpose
                  </label>
                  <textarea
                    required
                    name="sop"
                    value={form.sop}
                    onChange={handleInputChange}
                    disabled={submitStatus !== 'idle'}
                    placeholder="Tell us what excites you about this role and how you align with our mission..."
                    rows="5"
                    className="w-full rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all px-4 py-3 bg-white outline-none disabled:bg-slate-50 disabled:text-on-surface-variant font-body-md"
                  />
                </div>

                {/* Confirm and Submit Actions */}
                {submitStatus === 'submitting' ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-primary/80 text-white rounded-2xl font-bold text-label-md transition-all cursor-wait relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                    <div className="spinner"></div>
                    <span>Processing Application...</span>
                  </button>
                ) : submitStatus === 'success' ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-secondary text-white rounded-2xl font-bold text-label-md transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    <span>Application Submitted Successfully!</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:scale-[1.01] active:scale-95 transition-all shadow-md hover:shadow-lg shadow-primary/10 cursor-pointer"
                  >
                    Confirm & Submit Application
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Right Column: Perks and Timelines */}
          <div className="lg:col-span-4 space-y-8">
            {/* Offer Package Card */}
            <div className="bg-primary text-white rounded-3xl p-8 custom-shadow relative overflow-hidden shadow-sm">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <h3 className="text-headline-md font-bold mb-6 relative z-10 border-b border-white/10 pb-4">
                Offer Package
              </h3>
              <div className="space-y-6 relative z-10">
                <div>
                  <p className="text-caption text-primary-fixed uppercase tracking-widest mb-1 font-bold">
                    Target Stipend
                  </p>
                  <p className="text-headline-lg font-black">{details.stipend}</p>
                </div>
                <div className="h-[1px] bg-white/10"></div>
                <div className="space-y-4">
                  {details.perks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary-fixed">check_circle</span>
                      <span className="text-body-md font-semibold">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline Progress Tracker */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h3 className="text-headline-md font-bold mb-8 border-b border-slate-50 pb-4">
                Drive Timeline
              </h3>
              <div className="space-y-0 relative timeline-line pl-1">
                {details.timeline.map((step, idx) => {
                  const isFirst = idx === 0;
                  return (
                    <div key={idx} className={`relative pl-8 ${idx === details.timeline.length - 1 ? '' : 'pb-8'} group`}>
                      <div
                        className={`absolute left-[-1.5px] top-1.5 w-4.5 h-4.5 rounded-full flex items-center justify-center z-10 border-4 border-white shadow-sm transition-transform group-hover:scale-125
                          ${isFirst ? 'bg-primary' : 'bg-surface-container-low'}`}
                      >
                        <span className={`w-1 h-1 rounded-full ${isFirst ? 'bg-white' : 'bg-outline'}`}></span>
                      </div>
                      <h4 className="font-bold text-label-md text-on-surface">{step.step}</h4>
                      <p className="text-caption text-on-surface-variant font-semibold">{step.date}</p>
                      <p className="text-body-md text-on-surface-variant mt-2 font-medium">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preparation Resources */}
            <div className="bg-white rounded-3xl p-8 border border-outline-variant border-dashed">
              <h4 className="font-bold text-label-md text-on-surface mb-4">Preparation Resources</h4>
              <div className="space-y-3">
                <a className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group" href="#">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">menu_book</span>
                    <span className="text-body-md font-semibold text-on-surface-variant">Coding Interview Guide</span>
                  </div>
                  <span className="material-symbols-outlined text-outline opacity-0 group-hover:opacity-100 transition-opacity">
                    open_in_new
                  </span>
                </a>
                <a className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group" href="#">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">video_library</span>
                    <span className="text-body-md font-semibold text-on-surface-variant">Tech Blogs & Life</span>
                  </div>
                  <span className="material-symbols-outlined text-outline opacity-0 group-hover:opacity-100 transition-opacity">
                    open_in_new
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
