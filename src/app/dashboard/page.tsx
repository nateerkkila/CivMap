'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FaCheck, FaExclamationTriangle ,FaPlus, FaMap, FaList, FaSignOutAlt } from 'react-icons/fa';
import MyResourcesList from '@/components/MyResourcesList';
import ConfirmResourcesModal from '@/components/ConfirmResourcesModal';
import ScoreSystem from '@/components/ScoreSystem';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const ResourceMap = dynamic(() => import('@/components/ResourceMap'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center w-full h-full rounded-lg bg-gray-100"><p>Loading map...</p></div>,
});

type View = 'resources' | 'map';

export default function DashboardPage() {
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

  // --- THIS IS THE UPDATED FUNCTION REPLACING `getUserStats` ---
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  
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
      <header className="flex-shrink-0 bg-white shadow-sm z-10">
        <div className="flex items-center justify-between max-w-7xl px-4 py-3 mx-auto sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold leading-6 text-gray-900">CivMap Dashboard</h1>
          <div className="flex items-center gap-2">
            <Link 
              href="/report-threat"
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700"
            >
            <FaExclamationTriangle /> Report Threat
        </Link>
            <button 
              onClick={() => setShowConfirmModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700"
            >
              <FaCheck/> Confirm Resources
            </button>
            <Link href="/register-resource" className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
              <FaPlus /> Add Resource
            </Link>
            <button onClick={toggleView} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
              {activeView === 'resources' ? <><FaMap />Map View</> : <><FaList />Resource View</>}
            </button>
            <button onClick={handleLogout} title="Logout" className="inline-flex items-center justify-center w-8 h-8 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </header>
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