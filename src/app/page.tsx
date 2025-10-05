'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function App() {
 const { user, loading } = useAuth();
 const router = useRouter();

 useEffect(() => {
 // We only want to redirect if loading is complete
  if (!loading) {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }
 }, [user, loading, router]);

 // Display a loading indicator while we determine the auth status.
 return (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    Loading...
  </div>
 );
}