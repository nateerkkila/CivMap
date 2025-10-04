'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import CivilPage from '@/components/CivilPage';
import AuthorityPage from '@/components/AuthorityPage';

export default function DashboardPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'civil' | 'authority' | null>(null);

  // Function to determine which view to show based on security level
  const determineView = (securityLevel: number) => {
    return securityLevel >= 10 ? 'authority' : 'civil';
  };

  // Function to refresh security level and re-route if needed
  const handleSecurityLevelRefresh = async () => {
    console.log('Refreshing profile and checking security level...');
    await refreshProfile();
    if (profile) {
      console.log(`Current security level: ${profile.security_level}`);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Update current view when profile changes
  useEffect(() => {
    if (profile) {
      const newView = determineView(profile.security_level);
      setCurrentView(newView);
    }
  }, [profile]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Route based on security_level: civil < 10, authority >= 10
  if (currentView === 'authority') {
    return <AuthorityPage onSecurityLevelRefresh={handleSecurityLevelRefresh} />;
  }

  return <CivilPage onSecurityLevelRefresh={handleSecurityLevelRefresh} />;
}