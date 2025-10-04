'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { ThreatInsert } from '@/types';

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-[300px] bg-gray-100 rounded-md"><p>Loading map...</p></div>,
});

const threatTypes = ['Suspicious Activity', 'Drone', 'Roadblock', 'Hazard', 'Other'];

export default function ReportThreatForm() {
  const router = useRouter();
  const { user } = useAuth();

  // Form State
  const [threatType, setThreatType] = useState(threatTypes[0]);
  const [description, setDescription] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // UI State
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false); // <-- NEW STATE for success message

  // Auto-fetch location on component mount
  useEffect(() => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLocationLoading(false);
      },
      (geoError) => {
        setError(`Could not get location: ${geoError.message}. Please select a location on the map.`);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const handleLocationChange = (lat: number, lng: number) => {
    setCoords({ lat, lng });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) { setError("You must be logged in."); return; }
    if (!coords) { setError("Location is required. Please select a point on the map."); return; }
    
    setSubmitting(true);
    setError('');

    const newThreat: ThreatInsert = {
      user_id: user.id,
      threat_type: threatType,
      description,
      lat: coords.lat,
      lon: coords.lng,
    };

    try {
      const { error: insertError } = await supabase.from('threats').insert([newThreat]);
      if (insertError) throw insertError;
      
      // --- THIS IS THE NEW LOGIC ---
      // 1. Set submitted state to true to show the success message
      setSubmitted(true);
      // 2. Redirect back to the dashboard after a 2-second delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to report the threat.");
      setSubmitting(false); // Only set submitting to false on error
    }
    // On success, submitting remains true until redirect
  };

  // --- NEW: Conditionally render the success message ---
  if (submitted) {
    return (
      <div className="p-8 text-center bg-green-50 rounded-lg shadow-sm">
        <h3 className="text-xl font-medium text-green-800">Threat Reported Successfully!</h3>
        <p className="mt-2 text-green-700">Thank you for contributing to community safety. Redirecting you to the dashboard...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md" role="alert">{error}</div>}

      <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Threat Details</h2>
        <div className="mt-6 space-y-6">
          <div>
            <label htmlFor="threatType" className="block text-sm font-medium text-gray-700">Type of Threat</label>
            <select 
              id="threatType" 
              value={threatType} 
              onChange={(e) => setThreatType(e.target.value)} 
              className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700"
            >
              {threatTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3} 
              placeholder="Provide any relevant details: what you saw, number of people, etc." 
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-500 text-gray-700" 
            />
          </div>
        </div>
      </div>
      
      <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Location</h2>
        <p className="mt-1 text-sm text-gray-600">
          {locationLoading ? "Attempting to get your current location..." : "Your location has been set. You can adjust it on the map below if needed."}
        </p>
        <div className="mt-4">
          <MapPicker onLocationChange={handleLocationChange} />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Link href="/dashboard">
          <button type="button" className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
        </Link>
        <button type="submit" disabled={submitting || locationLoading} className="px-6 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed">
          {submitting ? 'Submitting...' : 'Submit Threat Report'}
        </button>
      </div>
    </form>
  );
}