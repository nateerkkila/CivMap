'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ManageResourcePage() {
  const params = useParams();
  const { id } = params;

  // In a real implementation, you would use this ID to fetch
  // the specific resource's data from localStorage or an API.

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-10 text-center bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800">
          Manage Resource
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          You are now managing the resource with the following ID:
        </p>
        <code className="block px-4 py-2 mt-2 text-base font-mono text-indigo-800 bg-indigo-100 rounded-md">
          {id}
        </code>
        <div className="mt-8">
          {/* We will implement edit and delete functionality here later */}
          <p className="text-sm text-gray-500">(Edit and Delete features coming soon)</p>
        </div>
        <div className="mt-8">
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}