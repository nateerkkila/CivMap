'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '@/types'; // Assuming your Profile type is defined in /types

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  session: null, 
  user: null, 
  profile: null, 
  loading: true, 
  refreshProfile: async () => {} 
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      return data as Profile | null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchUserProfile(user.id);
      setProfile(profileData);
    }
  }, [user, fetchUserProfile]);

  useEffect(() => {
    // --- FIX #1: This fixes the "hanging on authenticating" on page refresh ---
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const profileData = await fetchUserProfile(session.user.id);
        setProfile(profileData);
      }
      setLoading(false); // This guarantees loading is set to false.
    };
    getInitialSession();

    // Set up the listener for real-time auth changes (login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const profileData = await fetchUserProfile(session.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      
      // --- FIX #2: This fixes the redirect after a successful login/logout ---
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.push("/dashboard");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, fetchUserProfile]);

  const value = { session, user, profile, loading, refreshProfile };

  // This prevents the "black screen" by always rendering the provider frame
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}