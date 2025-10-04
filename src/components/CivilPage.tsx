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

      // Fetch total score, updates, and confirmation status from the user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('total_score, updates, last_confirmed_at')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }
      
      console.log("Profile data:", profileData); // Debug log

      // Check if user can confirm today
      let canConfirmToday = true;
      if (profileData.last_confirmed_at) {
        const lastConfirmed = new Date(profileData.last_confirmed_at);
        const today = new Date();
        canConfirmToday = lastConfirmed.toDateString() !== today.toDateString();
      }

      setCanConfirm(canConfirmToday);
      setLastConfirmedDate(profileData.last_confirmed_at);
      setStats({
        resourcesAdded: resourceCount ?? 0,
        peopleAdded: referralCount ?? 0,
        updates: profileData?.updates ?? 0, // Will be 0 if field doesn't exist
        totalScore: profileData?.total_score ?? 0,
      });
      
      console.log("Final stats:", {
        resourcesAdded: resourceCount ?? 0,
        peopleAdded: referralCount ?? 0,
        updates: profileData?.updates ?? 0,
        totalScore: profileData?.total_score ?? 0,
      }); // Debug log

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

  // Refresh stats when user returns to the page (e.g., after adding a resource)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchStats();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, fetchStats]);

  // Refresh stats when component mounts (e.g., when navigating back from register resource)
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, fetchStats]);
  
  const handleConfirmResources = async () => {
    if (!user) return;
    
    try {
      // Check if user can confirm (not already confirmed today)
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('last_confirmed_at, total_score, updates')
        .eq('id', user.id)
        .single();
      
      if (fetchError) {
        console.error("Error fetching profile:", fetchError);
        return;
      }
      
      // Check if already confirmed today
      if (profileData.last_confirmed_at) {
        const lastConfirmed = new Date(profileData.last_confirmed_at);
        const today = new Date();
        const isSameDay = lastConfirmed.toDateString() === today.toDateString();
        
        if (isSameDay) {
          console.log('User already confirmed today');
          setShowConfirmModal(false);
          return;
        }
      }
      
      // Update profile with new confirmation, increment updates and score
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          last_confirmed_at: new Date().toISOString(),
          total_score: (profileData.total_score || 0) + 3, // 3 points for daily confirmation
          updates: (profileData.updates || 0) + 1
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error("Error confirming resources:", updateError);
      } else {
        console.log('User confirmed their resources are up to date.');
        // Refresh stats to show updated values
        fetchStats();
      }
    } catch (error) {
      console.error("Error in handleConfirmResources:", error);
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
        canConfirm={canConfirm}
        lastConfirmedDate={lastConfirmedDate || undefined}
      />
    </div>
  );
}
