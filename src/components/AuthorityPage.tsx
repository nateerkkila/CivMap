'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import AllResourcesList from '@/components/AllResourcesList';
import AllThreatsList from '@/components/AllThreatsList'; // Import the new component
import ResourceFilter from '@/components/ResourceFilter';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const ResourceMap = dynamic(() => import('@/components/ResourceMap'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center w-full h-full rounded-lg bg-gray-100"><p>Loading map...</p></div>,
});

// The view can now be one of three strings
type View = 'resources' | 'map' | 'threats';

interface FilterState {
  category: string;
  distance: string;
  maxDistance: number;
}

interface AuthorityPageProps {
  onSecurityLevelRefresh?: () => void;
}

export default function AuthorityPage({ onSecurityLevelRefresh }: AuthorityPageProps) {
  const [activeView, setActiveView] = useState<View>('resources');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [filters, setFilters] = useState<FilterState>({ category: '', distance: '', maxDistance: 50 });
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  
   const { user, profile, loading: authLoading } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('item_category').select('id, name').order('name');
      if (error) console.error('Error fetching categories:', error);
      else setCategories(data || []);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopBar 
        activeView={activeView}
        onSetView={setActiveView} // Pass the setter function directly
        onShowConfirmModal={() => {}}
        onSecurityLevelRefresh={onSecurityLevelRefresh}
        showConfirmButton={false}
        showAddResourceButton={false}
        profile={profile}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6 h-full">
          {/* Conditional rendering for all three views */}
          {activeView === 'resources' && <AllResourcesList />}

          {activeView === 'threats' && <AllThreatsList />}

          {activeView === 'map' && (
            <div className="h-full flex flex-col">
              <div className="mb-4">
                <ResourceFilter
                  categories={categories}
                  filters={filters}
                  onFiltersChange={setFilters}
                  onLocationChange={setCurrentLocation}
                  onLocationError={setLocationError}
                  currentLocation={currentLocation}
                  locationError={locationError}
                />
              </div>
              <div className="flex-1 rounded-lg overflow-hidden shadow-md">
                <ResourceMap filters={filters} currentLocation={currentLocation} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}