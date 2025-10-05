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
import { Item } from '@/types';

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
  const [userResources, setUserResources] = useState<Item[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  // Fetch user resources
  const fetchUserResources = useCallback(async () => {
    if (!user) return;
    
    try {
      setResourcesLoading(true);
      const { data, error } = await supabase
        .from('item')
        .select(`*, item_category ( name )`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user resources:', error);
      } else {
        setUserResources(data as Item[]);
      }
    } catch (error) {
      console.error('Error fetching user resources:', error);
    } finally {
      setResourcesLoading(false);
    }
  }, [user]);

  // Fetch user statistics
  const fetchStats = useCallback(async () => {
    if (!user) return;
    
    try {
      // Get user's profile for total score
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('total_score')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      // Count user's resources
      const { count: resourcesCount, error: resourcesError } = await supabase
        .from('item')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (resourcesError) {
        console.error('Error counting resources:', resourcesError);
        return;
      }

      // For now, set peopleAdded and updates to 0 since we don't have those features yet
      setStats({
        peopleAdded: 0,
        resourcesAdded: resourcesCount || 0,
        updates: 0,
        totalScore: profile?.total_score || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [user]);

  // Fetch data when user changes
  useEffect(() => {
    if (user && !authLoading) {
      fetchStats();
      fetchUserResources();
    }
  }, [user, authLoading, fetchStats, fetchUserResources]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleConfirmResources = async () => {
    if (!user) return;
    
    try {
      // Update last confirmed date
      const { error } = await supabase
        .from('profiles')
        .update({ 
          last_confirmed_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating confirmation:', error);
        return;
      }

      // Update local state
      setLastConfirmedDate(new Date().toISOString());
      setCanConfirm(false);
      setShowConfirmModal(false);
      
      // Refresh stats and resources to show updated data
      await fetchStats();
      await fetchUserResources();
    } catch (error) {
      console.error('Error confirming resources:', error);
    }
  };

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
        profile={profile}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6 h-full">
           <ScoreSystem stats={stats} />
          {activeView === 'resources' ? (
            <MyResourcesList 
              resources={userResources} 
              loading={resourcesLoading}
              onRefresh={() => {}}
            />
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