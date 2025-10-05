'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import MyResourcesList from '@/components/MyResourcesList';
import ConfirmResourcesModal from '@/components/ConfirmResourcesModal';
import ScoreSystem from '@/components/ScoreSystem';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const ResourceMap = dynamic(() => import('@/components/ResourceMap'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center w-full h-full rounded-lg bg-gray-100"><p>Loading map...</p></div>,
});

// Define the views available to a Civilian user
type CivilView = 'resources' | 'map';

interface CivilPageProps {
  onSecurityLevelRefresh?: () => void;
}

export default function CivilPage({ onSecurityLevelRefresh }: CivilPageProps) {
  const [activeView, setActiveView] = useState<CivilView>('resources');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [canConfirm, setCanConfirm] = useState(true);
  const [lastConfirmedDate, setLastConfirmedDate] = useState<string | null>(null);
  const [stats, setStats] = useState({
    peopleAdded: 0,
    resourcesAdded: 0,
    updates: 0,
    totalScore: 0
  });
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // --- (All data fetching logic like fetchStats and handleConfirmResources remains unchanged) ---
  const fetchStats = useCallback(async () => { /* ... no changes here ... */ }, [user]);
  useEffect(() => { /* ... no changes here ... */ }, [user, authLoading, router, fetchStats]);
  useEffect(() => { /* ... no changes here ... */ }, [user, fetchStats]);
  useEffect(() => { /* ... no changes here ... */ }, [user, fetchStats]);
  const handleConfirmResources = async () => { /* ... no changes here ... */ };

  // --- FIX #1: Create a handler compatible with the new TopBar ---
  // This handler receives a view from the TopBar, and if it's a valid view
  // for a civilian, it updates the state.
  const handleSetView = (view: 'resources' | 'map' | 'threats') => {
    if (view === 'resources' || view === 'map') {
      setActiveView(view);
    }
    // Clicks on 'threats' from the TopBar will be ignored for civilian users.
  };

  // --- FIX #2: Define default filters for the civilian's map view ---
  const defaultMapFilters = {
    category: '',
    distance: '',
    maxDistance: 9999, // A large number to effectively show all resources
  };

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50">Authenticating...</div>;
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopBar 
        activeView={activeView}
        onSetView={handleSetView} // <-- Use the new handler and prop name
        onShowConfirmModal={() => setShowConfirmModal(true)}
        onSecurityLevelRefresh={onSecurityLevelRefresh}
        showConfirmButton={true}
        showAddResourceButton={true}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6 h-full">
           <ScoreSystem stats={stats} />
          {activeView === 'resources' ? (
            <MyResourcesList />
          ) : (
            <div className="w-full h-full rounded-lg overflow-hidden shadow-md">
              {/* --- FIX #3: Pass the default props to ResourceMap --- */}
              <ResourceMap 
                filters={defaultMapFilters} 
                currentLocation={null} 
              />
            </div>
          )}
        </div>
      </main>
      
      <ConfirmResourcesModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmResources}
        canConfirm={canConfirm}
        lastConfirmedDate={lastConfirmedDate || undefined}
      />
    </div>
  );
}