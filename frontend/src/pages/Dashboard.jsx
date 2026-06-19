import React from 'react';
import HeroBanner from '../components/HeroBanner';
import DrivesSection from '../components/DrivesSection';
import ApplicationTracker from '../components/ApplicationTracker';

export default function Dashboard() {
  return (
    <div className="p-8 max-w-[1280px] mx-auto space-y-12">
      <HeroBanner />
      <DrivesSection />
      <ApplicationTracker />
    </div>
  );
}
