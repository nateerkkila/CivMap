'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Resource, ResourceType, ResourceStatus } from '@/types';
import { saveResource, getCurrentUser } from '@/lib/storage'; // Add getCurrentUser
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-[300px] bg-gray-100 rounded-md"><p>Loading map...</p></div>,
});

const resourceTypes: ResourceType[] = ['Vehicle', 'Generator', 'Medical Skill', 'Shelter', 'Other'];

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
  </label>
);

export default function RegisterResourceForm() {
  const router = useRouter();
  
  // UI-specific state
  const [type, setType] = useState<ResourceType>('Vehicle');
  const [vehicleType, setVehicleType] = useState(''); // Corresponds to "Vehicle Type"
  const [capacity, setCapacity] = useState<number | ''>(''); // Corresponds to "Seats/Capacity"
  const [availability, setAvailability] = useState(100); // For the slider: 0-100
  const [townArea, setTownArea] = useState(''); // Corresponds to "Nearest town/area"
  const [sharePreciseLocation, setSharePreciseLocation] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [submitted, setSubmitted] = useState(false);

  const handleLocationChange = (lat: number, lng: number) => {
    setCoords({ lat, lng });
  };

 const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert("You must be logged in to register a resource.");
      router.push('/login');
      return;
    }

    const newResource: Resource = {
      id: crypto.randomUUID(),
      userId: currentUser.id, // <-- CRITICAL: Assign the user's ID
      type: type,
      name: vehicleType || `${type} - Capacity: ${capacity}`,
      capacity: Number(capacity),
      location: townArea,
      latitude: sharePreciseLocation ? coords?.lat : undefined,
      longitude: sharePreciseLocation ? coords?.lng : undefined,
      status: availability > 0 ? 'Available' : 'Not Available',
    };

    saveResource(newResource);
    setSubmitted(true);
    setTimeout(() => router.push('/dashboard'), 2000);
  };

  if (submitted) {
    return (
      <div className="p-8 text-center bg-green-50 rounded-lg">
        <h3 className="text-xl font-medium text-green-800">Resource Saved Successfully!</h3>
        <p className="mt-2 text-green-700">Redirecting you to the dashboard...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* --- Resource Details Card --- */}
      <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Resource Details</h2>
        <p className="mt-1 text-sm text-gray-600">Tell us what you can contribute to community resilience</p>
        <div className="mt-6 space-y-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Resource Type</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value as ResourceType)} className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              {resourceTypes.map((t) => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Seats/Capacity</label>
            <input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))} required min="0" className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">Vehicle Type</label>
            <input id="vehicleType" type="text" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} placeholder="e.g., Pickup truck, Minivan" className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="availability" className="block text-sm font-medium text-gray-700">Availability</label>
            <input id="availability" type="range" min="0" max="100" step="1" value={availability} onChange={(e) => setAvailability(Number(e.target.value))} className="w-full h-2 mt-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Not available</span>
              <span>{availability}%</span>
              <span>Fully available</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Location Card --- */}
      <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Location</h2>
        <p className="mt-1 text-sm text-gray-600">Your location data is secure and can be shared as an approximate area</p>
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <label htmlFor="share-precise" className="text-sm font-medium text-gray-700">Share precise location</label>
            <ToggleSwitch checked={sharePreciseLocation} onChange={setSharePreciseLocation} />
          </div>
          <div>
            <label htmlFor="townArea" className="block text-sm font-medium text-gray-700">Nearest town/area</label>
            <input id="townArea" type="text" value={townArea} onChange={(e) => setTownArea(e.target.value)} required placeholder="e.g., Keskusta, Helsinki" className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          {sharePreciseLocation && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Location on map</label>
              <div className="mt-2">
                <MapPicker onLocationChange={handleLocationChange} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Action Buttons --- */}
      <div className="flex justify-end gap-4 pt-4">
        <Link href="/dashboard">
          <button type="button" className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
        </Link>
        <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">Save Resource</button>
      </div>
    </form>
  );
}