'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import AllResourcesList from '@/components/AllResourcesList';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/context/AuthContext';

const ResourceMap = dynamic(() => import('@/components/ResourceMap'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center w-full h-full rounded-lg bg-gray-100"><p>Loading map...</p></div>,
});

type View = 'resources' | 'map';

interface AuthorityPageProps {
  onSecurityLevelRefresh?: () => void;
}

export default function AuthorityPage({ onSecurityLevelRefresh }: AuthorityPageProps) {
  const [activeView, setActiveView] = useState<View>('resources');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const toggleView = () => setActiveView(prev => prev === 'resources' ? 'map' : 'resources');

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50">Authenticating...</div>;
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopBar 
        activeView={activeView}
        onToggleView={toggleView}
        onShowConfirmModal={() => {}} // No-op for authority users
        onSecurityLevelRefresh={onSecurityLevelRefresh}
        showConfirmButton={false}
        showAddResourceButton={false}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6 h-full">
          {activeView === 'resources' ? <AllResourcesList /> : <div className="w-full h-full rounded-lg overflow-hidden shadow-md"><ResourceMap /></div>}
        </div>
      </main>
    </div>
  );
}
