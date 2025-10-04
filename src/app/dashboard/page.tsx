'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// For simplicity, we are assuming you have these two components defined.
// If you merged them, you can replace this with your single dashboard component.
import CivilPage from '@/components/CivilPage';
import AuthorityPage from '@/components/AuthorityPage';

export default function DashboardPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();

  // Middleware is the primary security, this is a client-side fallback.
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSecurityLevelRefresh = async () => {
    console.log('Refreshing profile and checking security level...');
    await refreshProfile();
  };

  // 1. Primary loading gate: Wait for the AuthProvider to finish its initial check.
  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50">Authenticating...</div>;
  }

  // 2. Secondary gate: If the user is logged out after the check, render nothing while we redirect.
  if (!user) {
    return null;
  }

  // 3. Final gate: Wait for the user's profile to be fetched. This prevents rendering the wrong role-based UI.
  if (!profile) {
    return <div className="flex items-center justify-center h-screen bg-gray-50">Loading Profile...</div>;
  }

  // At this point, we are guaranteed to have a user and a profile.
  // We can now safely render the correct UI based on the profile's security level.
  if (profile.security_level >= 10) {
    return <AuthorityPage onSecurityLevelRefresh={handleSecurityLevelRefresh} />;
  }

  return <CivilPage onSecurityLevelRefresh={handleSecurityLevelRefresh} />;
}