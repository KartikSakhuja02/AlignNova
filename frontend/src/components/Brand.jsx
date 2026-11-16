/** Shared wordmark used by public pages, account screens, and portal navigation. */
export default function Brand({ compact = false, className = '' }) {
  return (
    <span className={`brand ${className}`} role="img" aria-label="AlignNova">
      <span className="brand-mark" aria-hidden="true">a<span>.</span></span>
      {!compact && <span className="brand-name" aria-hidden="true">AlignNova</span>}
    </span>
  );
}
