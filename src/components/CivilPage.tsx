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

type View = 'resources' | 'map';

interface CivilPageProps {
  onSecurityLevelRefresh?: () => void;
}

export default function CivilPage({ onSecurityLevelRefresh }: CivilPageProps) {
  const [activeView, setActiveView] = useState<View>('resources');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [stats, setStats] = useState({
    peopleAdded: 0,
    resourcesAdded: 0,
    updates: 0,
    totalScore: 0
  });
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Fetch user stats
  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      // Fetch resource count for the current user
      const { count: resourceCount, error: resourceError } = await supabase
        .from('item')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (resourceError) throw resourceError;

      // Fetch referral count made by the current user
      const { count: referralCount, error: referralError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referral_user_id', user.id);
      if (referralError) throw referralError;

      // Fetch total score directly from the user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('total_score')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;

      setStats({
        resourcesAdded: resourceCount ?? 0,
        peopleAdded: referralCount ?? 0,
        updates: 0, // This remains a placeholder
        totalScore: profileData?.total_score ?? 0,
      });

    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (user) {
      fetchStats();
    }
  }, [user, authLoading, router, fetchStats]);
  
  const handleConfirmResources = async () => {
    if (!user) return;
    // Note: To add points here, you would call a Supabase Edge Function
    // that securely updates the user's score. For now, we just update the timestamp.
    const { error } = await supabase
      .from('profiles')
      .update({ last_confirmed_at: new Date().toISOString() })
      .eq('id', user.id);
      
    if (error) {
      console.error("Error confirming resources:", error);
    } else {
      console.log('User confirmed their resources are up to date.');
    }
    setShowConfirmModal(false);
  };

  const toggleView = () => setActiveView(prev => prev === 'resources' ? 'map' : 'resources');

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50">Authenticating...</div>;
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopBar 
        activeView={activeView}
        onToggleView={toggleView}
        onShowConfirmModal={() => setShowConfirmModal(true)}
        onSecurityLevelRefresh={onSecurityLevelRefresh}
        showConfirmButton={true}
        showAddResourceButton={true}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6 h-full">
           <ScoreSystem stats={stats} />
          {activeView === 'resources' ? <MyResourcesList /> : <div className="w-full h-full rounded-lg overflow-hidden shadow-md"><ResourceMap /></div>}
        </div>
      </main>
      
      <ConfirmResourcesModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmResources}
      />
    </div>
  );
}
