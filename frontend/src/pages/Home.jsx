import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const audiences = [
  { number: '01', title: 'Students', text: 'Keep your academic records, resume, and applications together. Find the drives you qualify for and follow what happens next.', link: 'Find your next step' },
  { number: '02', title: 'Placement teams', text: 'Publish a drive, set the criteria, and review applications. Spend less time checking spreadsheets and more time supporting students.', link: 'Manage your campus' },
  { number: '03', title: 'Recruiters', text: 'Browse student profiles and academic records in one place. Get to know the people behind the applications.', link: 'Meet your next hire' },
];

function Arrow({ diagonal = false }) {
  return <span aria-hidden="true">{diagonal ? '↗' : '→'}</span>;
}

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const handleAction = () => {
    navigate(isAuthenticated ? (role === 'admin' ? '/admin' : role === 'hr' ? '/partner' : '/dashboard') : '/signin');
  };

  return (
    <div className="landing">
      <a className="landing-skip" href="#main-content">Skip to content</a>
      <header className="landing-header landing-wrap">
        <a className="landing-brand" href="/" aria-label="AlignNova home"><span className="landing-monogram" aria-hidden="true">a<span>.</span></span>AlignNova</a>
        <nav className="landing-nav" aria-label="Main navigation"><a href="#how-it-works">How it works</a><a href="#for-your-campus">For your campus</a></nav>
        <button className="landing-login" onClick={handleAction}>{isAuthenticated ? 'Your dashboard' : 'Sign in'} <Arrow /></button>
      </header>
      <main id="main-content">
        <section className="landing-hero landing-wrap" aria-labelledby="hero-title">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow"><span /> THE CAMPUS PLACEMENT WORKSPACE</p>
            <h1 id="hero-title">Good careers<br />start with a<br /><em>clear next step.</em></h1>
            <p className="landing-intro">From your first application to the final shortlist. One place for students, placement teams, and recruiters to move things forward.</p>
            <div className="landing-hero-actions"><button className="landing-button" onClick={handleAction}>{isAuthenticated ? 'Open your dashboard' : 'Enter your workspace'} <Arrow /></button><a className="landing-text-link" href="#how-it-works">Take a look around <span aria-hidden="true">↓</span></a></div>
            <p className="landing-access-note">Already invited by your campus? Sign in to get started.</p>
          </div>
          <div className="landing-preview" aria-label="Illustrative placement workflow, not live data">
            <div className="landing-preview-heading"><span>THE PLACEMENT DESK</span><span>WORKFLOW PREVIEW</span></div>
            <div className="landing-desk">
              <div className="landing-desk-top"><span className="landing-desk-brand">a<span>.</span></span><span>Your next chapter, organized.</span><span className="landing-desk-dots" aria-hidden="true">•••</span></div>
              <div className="landing-desk-body">
                <p className="landing-desk-label">OPPORTUNITIES / CAMPUS RECRUITMENT</p>
                <div className="landing-opportunity-title"><h2>A role worth<br />looking into.</h2><span className="landing-opportunity-icon" aria-hidden="true">↗</span></div>
                <div className="landing-role-line"><strong>Software Engineering Intern</strong><span>INTERNSHIP</span></div>
                <dl className="landing-criteria"><div><dt>Academic criteria</dt><dd>7.0+ CGPA</dd></div><div><dt>Active backlogs</dt><dd>None</dd></div><div><dt>Course</dt><dd>Computer Science</dd></div></dl>
                <div className="landing-eligibility"><span aria-hidden="true">✓</span><div><strong>A fit for your profile</strong><p>Eligibility checked against your academic records.</p></div></div>
                <div className="landing-progress"><span className="landing-desk-label">FOLLOW YOUR APPLICATION</span><ol><li className="is-complete"><span aria-hidden="true">✓</span>Submitted</li><li className="is-current"><span aria-hidden="true" />In review</li><li><span aria-hidden="true" />Shortlisted</li></ol></div>
              </div>
            </div>
            <div className="landing-preview-caption"><span>Less chasing updates.</span><span>More knowing where you stand.</span></div>
          </div>
        </section>
        <div className="landing-principles landing-wrap"><p>Built around the actual<br /><strong>work of placements.</strong></p><span>Academic eligibility</span><span>Campus opportunities</span><span>Application tracking</span></div>
        <section className="landing-audiences landing-wrap" id="for-your-campus" aria-labelledby="audience-title">
          <div className="landing-section-heading"><p className="landing-eyebrow">THREE PERSPECTIVES. ONE WORKSPACE.</p><h2 id="audience-title">A place for everyone<br />in the process.</h2></div>
          <div className="landing-audience-grid">{audiences.map(({ number, title, text, link }) => (<article className="landing-audience" key={number}><span className="landing-number">{number} /</span><h3>{title}</h3><p>{text}</p><button onClick={handleAction}>{link}<Arrow diagonal /></button></article>))}</div>
        </section>
        <section className="landing-process" id="how-it-works" aria-labelledby="process-title">
          <div className="landing-wrap landing-process-inner"><div><p className="landing-eyebrow">FROM PROFILE TO POSSIBILITY</p><h2 id="process-title">Keep the next step<br />in sight.</h2><p className="landing-process-intro">A placement season has enough moving parts.<br />Your workspace should help you keep track.</p></div><ol className="landing-steps"><li><span>01</span><div><h3>Make your profile yours.</h3><p>Add your academic records, experience, and resume.</p></div></li><li><span>02</span><div><h3>Find the right drives.</h3><p>See opportunities that match your course and academic criteria.</p></div></li><li><span>03</span><div><h3>Apply. Then stay in the loop.</h3><p>Follow your application as the placement team reviews it.</p></div></li></ol></div>
        </section>
        <section className="landing-closing landing-wrap"><div><p className="landing-eyebrow">YOUR NEXT CHAPTER</p><h2>Let’s get things moving.</h2></div><button className="landing-button" onClick={handleAction}>{isAuthenticated ? 'Open your dashboard' : 'Sign in to AlignNova'}<Arrow /></button></section>
      </main>
      <footer className="landing-footer landing-wrap"><a className="landing-brand" href="/">AlignNova<span className="landing-brand-period">.</span></a><p>Made for the people behind campus placements.</p><span>© {new Date().getFullYear()} AlignNova</span></footer>
    </div>
  );
}
