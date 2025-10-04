'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { findUserByUsername, saveUser, setCurrentUser } from '@/lib/storage';

export default function LoginForm() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // Still mock, but required
  const [referralUsername, setReferralUsername] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (isLoginView) {
      // --- Handle Sign In ---
      const user = findUserByUsername(username);
      // Mock password check
      if (user && password.length > 0) {
        setCurrentUser(user);
        router.push('/dashboard');
      } else {
        setError('Invalid username or password.');
      }
    } else {
      // --- Handle Sign Up ---
      if (username.length < 3) {
        setError('Username must be at least 3 characters long.');
        return;
      }
      
      // Find referral user if provided
      let referralUserId: string | undefined;
      if (referralUsername.trim()) {
        const referralUser = findUserByUsername(referralUsername.trim());
        if (!referralUser) {
          setError('Referral username not found.');
          return;
        }
        if (referralUser.username.toLowerCase() === username.toLowerCase()) {
          setError('You cannot refer yourself.');
          return;
        }
        referralUserId = referralUser.id;
      }
      
      const newUser: User = { 
        id: crypto.randomUUID(), 
        username,
        referralUserId 
      };
      const success = saveUser(newUser);
      if (success) {
        setCurrentUser(newUser);
        router.push('/dashboard');
      } else {
        setError('This username is already taken.');
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md" role="alert">{error}</div>}
        <div className="rounded-md shadow-sm -space-y-px">
          <input id="username" name="username" type="text" required className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input id="password" name="password" type="password" required className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Password (any password will work)" value={password} onChange={(e) => setPassword(e.target.value)} />
          {!isLoginView && (
            <input id="referralUsername" name="referralUsername" type="text" className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Referral username (optional)" value={referralUsername} onChange={(e) => setReferralUsername(e.target.value)} />
          )}
        </div>
        <button type="submit" className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          {isLoginView ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
      <div className="mt-4 text-sm text-center">
        <button onClick={() => setIsLoginView(!isLoginView)} className="font-medium text-indigo-600 hover:text-indigo-500">
          {isLoginView ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
        </button>
      </div>
    </>
  );
}