'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Resource, ResourceType, ResourceStatus } from '@/types';
import { saveResource } from '@/lib/storage';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import the MapPicker component to avoid SSR issues
const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

const resourceTypes: ResourceType[] = ['Vehicle', 'Generator', 'Medical Skill', 'Shelter', 'Other'];
const statusOptions: ResourceStatus[] = ['Available', 'Not Available'];

export default function RegisterResourceForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<ResourceType>('Vehicle');
  const [capacity, setCapacity] = useState(1);
  const [location, setLocation] = useState(''); // This is now a manual description
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<ResourceStatus>('Available');
  const [submitted, setSubmitted] = useState(false);

  const handleLocationChange = (lat: number, lng: number) => {
    setCoords({ lat, lng });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!location && !coords) {
      alert("Please provide a location description or select a point on the map.");
      return;
    }

    const newResource: Resource = {
      id: crypto.randomUUID(),
      name,
      type,
      capacity,
      location,
      latitude: coords?.lat,
      longitude: coords?.lng,
      status,
    };

    saveResource(newResource);
    setSubmitted(true);

    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  if (submitted) {
    // ... (no changes to the submitted view)
    return (
        <div className="p-6 text-center bg-green-50 rounded-md">
            <h3 className="text-lg font-medium text-green-800">Resource Saved!</h3>
            <p className="mt-2 text-sm text-green-700">
            Your resource has been successfully registered locally.
            </p>
            <div className="mt-4">
            <Link href="/dashboard" className="font-medium text-indigo-600 hover:text-indigo-500">
                Return to Dashboard
            </Link>
            </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name, Type, Capacity, and Status fields remain the same */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name / Description
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., Ford F-150 Pickup Truck"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Resource Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as ResourceType)}
          className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          {resourceTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
          Capacity / Seats / People Supported
        </label>
        <input
          id="capacity"
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
          min="0"
          required
          className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      
      {/* --- NEW/MODIFIED LOCATION FIELDS --- */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location Description (Optional)
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., Main Street Park, behind the library"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Pin Location on Map
          {coords && (
              <span className="ml-2 text-xs font-normal text-green-700">
                  Location Selected!
              </span>
          )}
        </label>
        <div className="mt-1">
          <MapPicker onLocationChange={handleLocationChange} />
        </div>
      </div>
      {/* --- END OF LOCATION FIELDS --- */}

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ResourceStatus)}
          className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-end space-x-4">
        <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200">
          Cancel
        </Link>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Resource
        </button>
      </div>
    </form>
  );
}