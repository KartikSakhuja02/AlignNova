import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import HeroBanner from '../components/HeroBanner';
import DrivesSection from '../components/DrivesSection';
import ApplicationTracker from '../components/ApplicationTracker';

export default function Dashboard() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    fetch('/api/applications', {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(response => {
        if (!response.ok) throw new Error('Could not load applications');
        return response.json();
      })
      .then(setApplications)
      .catch(error => {
        if (error.name !== 'AbortError') console.error(error);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token]);

  return (
    <div className="p-8 max-w-[1280px] mx-auto space-y-12">
      <HeroBanner applications={applications} />
      <DrivesSection />
      <ApplicationTracker applications={applications} loading={loading} />
    </div>
  );
}
