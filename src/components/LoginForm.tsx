'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginForm() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // For user feedback
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  
  const referralCode = searchParams.get('ref');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLoginView) {
        // Just sign in. The AuthProvider's "SIGNED_IN" listener will handle the redirect.
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // The form will now correctly "hang" on 'Processing...' until the page navigates away.
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username, referral_user_id: referralCode },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage('Sign up successful! Please check your email for a verification link.');
        setLoading(false); // Stop loading to show the message.
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
      setLoading(false); // Stop loading on any error.
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md" role="alert">{error}</div>}
        {message && <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md" role="alert">{message}</div>}
        <div className="relative rounded-md shadow-sm -space-y-px">
          {!isLoginView && (
            <input id="username" name="username" type="text" required className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          )}
          <input id="email" name="email" type="email" autoComplete="email" required className={`relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none ${isLoginView ? 'rounded-t-md' : ''} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`} placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input id="password" name="password" type="password" autoComplete="current-password" required className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed">
          {loading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Sign Up')}
        </button>
      </form>
      <div className="mt-4 text-sm text-center">
        <button onClick={() => { setIsLoginView(!isLoginView); setError(''); setMessage(''); }} className="font-medium text-indigo-600 hover:text-indigo-500">
          {isLoginView ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
        </button>
      </div>
    </>
  );
}