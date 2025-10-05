'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

// Dynamically import the map to ensure it's client-side only
const ResourceMap = dynamic(() => import('@/components/ResourceMap'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center w-full h-full"><p>Loading map...</p></div>,
});

export default function MapViewPage() {
  return (
    <main className="relative w-screen h-screen">
      <div className="absolute top-0 left-0 z-[1000] w-full p-4 bg-gradient-to-b from-black/50 to-transparent">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FaArrowLeft />
          Back to Dashboard
        </Link>
      </div>
      <ResourceMap />
    </main>
  );
}