'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FaCrosshairs, FaPlus, FaMap, FaList, FaSignOutAlt } from 'react-icons/fa';
import MyResourcesList from '@/components/MyResourcesList';
import { getCurrentUser, logout } from '@/lib/storage';

const ResourceMap = dynamic(() => import('@/components/ResourceMap'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center w-full h-full rounded-lg bg-gray-100"><p>Loading map...</p></div>,
});

type View = 'resources' | 'map';

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<View>('resources');
  const router = useRouter();

  // --- Route Protection ---
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  const toggleView = () => setActiveView(prev => prev === 'resources' ? 'map' : 'resources');

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="flex-shrink-0 bg-white shadow-sm z-10">
        <div className="flex items-center justify-between max-w-7xl px-4 py-3 mx-auto sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold leading-6 text-gray-900">CivMap Dashboard</h1>
          <div className="flex items-center gap-2">
            <Link href="/register-resource" className="inline-flex items-center gap-2 px-4 py-3 text-s font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
              <FaPlus /> Add Resource
            </Link>
            <button onClick={toggleView} className="inline-flex items-center gap-2 px-4 py-3 text-s font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
              {activeView === 'resources' ? <><FaMap />Map View</> : <><FaList />Resource View</>}
            </button>
            {/* --- Logout Button --- */}
            <button onClick={handleLogout} title="Logout" className="inline-flex items-center justify-center w-12 h-12 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6 h-full">
          {activeView === 'resources' ? <MyResourcesList /> : <div className="w-full h-full rounded-lg overflow-hidden shadow-md"><ResourceMap /></div>}
        </div>
      </main>
    </div>
  );
}