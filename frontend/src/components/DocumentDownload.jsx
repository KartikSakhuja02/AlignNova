import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function DocumentDownload({ url, filename, children, ...props }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function download() {
    setLoading(true);
    setError(false);
    try {
      const target = new URL(url, window.location.origin);
      if (target.origin !== window.location.origin || !target.pathname.startsWith('/api/uploads/')) {
        throw new Error('Invalid document URL');
      }
      const response = await fetch(target.pathname, {
        headers: { Authorization: `Bearer ${token}` },
        redirect: 'error',
      });
      if (!response.ok) throw new Error('Document unavailable');
      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename || target.pathname.split('/').pop();
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button {...props} type="button" disabled={loading} onClick={download}>
      {loading ? 'Downloading…' : error ? 'Unavailable · Retry' : children}
    </button>
  );
}
