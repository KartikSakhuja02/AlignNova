import { useEffect, useId, useRef, useState } from 'react';
import templates from '../data/email-previews.json';

const types = {
  welcome: 'Student invitation',
  opportunity: 'Opportunity alert',
  update: 'Updated requirements',
  partner: 'Recruiter invitation',
  reset: 'Password reset',
  test: 'Delivery test',
};

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function PreviewContent({ kind, onClose }) {
  const [type, setType] = useState(kind);
  const [mobile, setMobile] = useState(false);
  const [recipient, setRecipient] = useState('Alex');
  const [company, setCompany] = useState('Campus Partner');
  const [role, setRole] = useState('Software Engineering Intern');
  const dialog = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const node = dialog.current;
    const previousFocus = document.activeElement;
    node.showModal();
    return () => {
      node.close();
      previousFocus?.focus();
    };
  }, []);

  const html = templates[type].replace(/PREVIEW_RECIPIENT_NAME|PREVIEW_COMPANY_NAME|PREVIEW_ROLE_TITLE/g,
    marker => escapeHtml(({ PREVIEW_RECIPIENT_NAME: recipient, PREVIEW_COMPANY_NAME: company, PREVIEW_ROLE_TITLE: role })[marker]));

  return (
    <dialog ref={dialog} onCancel={onClose} aria-labelledby={titleId}
      className="m-auto w-[calc(100%-2rem)] max-w-[1000px] max-h-[94vh] p-0 rounded-lg border border-outline-variant bg-surface text-on-surface backdrop:bg-inverse-surface/60 shadow-2xl">
      <div className="flex flex-col max-h-[94vh]">
        <header className="flex justify-between items-start gap-4 p-5 border-b border-outline-variant shrink-0">
          <div><p className="text-[10px] tracking-widest uppercase text-secondary font-bold mb-1">The placement desk / email</p>
            <h2 id={titleId} className="text-headline-md">A look inside your emails.</h2>
            <p className="text-xs text-on-surface-variant mt-1">Rendered from the delivery templates with sample data. No email is sent.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-surface-container rounded" aria-label="Close email preview"><span className="material-symbols-outlined" aria-hidden="true">close</span></button>
        </header>
        <div className="p-4 border-b border-outline-variant flex flex-wrap gap-4 items-end shrink-0">
          <label className="text-xs flex flex-col gap-2">Email type<select value={type} onChange={event => setType(event.target.value)} className="bg-surface-container-lowest border-outline-variant rounded text-sm">{Object.entries(types).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          {type !== 'test' && <label className="text-xs flex flex-col gap-2">Recipient<input value={recipient} onChange={event => setRecipient(event.target.value)} className="w-36 bg-surface-container-lowest border-outline-variant rounded text-sm" /></label>}
          {['opportunity', 'update', 'partner'].includes(type) && <label className="text-xs flex flex-col gap-2">Company<input value={company} onChange={event => setCompany(event.target.value)} className="w-40 bg-surface-container-lowest border-outline-variant rounded text-sm" /></label>}
          {['opportunity', 'update'].includes(type) && <label className="text-xs flex flex-col gap-2">Role<input value={role} onChange={event => setRole(event.target.value)} className="w-52 bg-surface-container-lowest border-outline-variant rounded text-sm" /></label>}
          <button type="button" aria-pressed={mobile} onClick={() => setMobile(value => !value)} className="px-3 py-2.5 border border-outline-variant rounded text-xs hover:bg-surface-container">{mobile ? 'Show desktop width' : 'Show mobile width'}</button>
        </div>
        <div className="overflow-auto bg-surface-container p-3 sm:p-5 min-h-0">
          <iframe title={`${types[type]} email preview`} sandbox="" srcDoc={html}
            className="block mx-auto border border-outline-variant rounded bg-background max-w-full" style={{ width: mobile ? 375 : '100%', height: 'min(65vh, 760px)', colorScheme: 'light' }} />
        </div>
        <footer className="border-t border-outline-variant px-5 py-3 text-xs text-on-surface-variant shrink-0">Emails use the light brand palette. Inbox apps may adjust colors in dark mode.</footer>
      </div>
    </dialog>
  );
}

export default function EmailPreview({ visible, onClose, kind = 'welcome' }) {
  return visible ? <PreviewContent kind={kind} onClose={onClose} /> : null;
}
