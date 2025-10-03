import Link from 'next/link';
import { FaPlus, FaList, FaMap } from 'react-icons/fa';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl px-4 py-4 mx-auto sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">
            Dashboard
          </h1>
        </div>
      </header>

      <main className="max-w-4xl p-4 mx-auto mt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Register a Resource Card */}
          <Link href="/register-resource">
            <div className="p-6 text-center text-gray-700 transition-shadow duration-300 bg-white border rounded-lg shadow-md cursor-pointer hover:shadow-lg">
              <FaPlus className="w-12 h-12 mx-auto text-indigo-600" />
              <h3 className="mt-4 text-lg font-medium">Register a Resource</h3>
              <p className="mt-2 text-sm text-gray-500">
                Add a new vehicle, shelter, skill, or other resource.
              </p>
            </div>
          </Link>

          {/* My Resources Card */}
          <Link href="/my-resources">
            <div className="p-6 text-center text-gray-700 transition-shadow duration-300 bg-white border rounded-lg shadow-md cursor-pointer hover:shadow-lg">
              <FaList className="w-12 h-12 mx-auto text-indigo-600" />
              <h3 className="mt-4 text-lg font-medium">My Resources</h3>
              <p className="mt-2 text-sm text-gray-500">
                View, edit, or delete your registered resources.
              </p>
            </div>
          </Link>

          {/* Map View Card */}
          <Link href="/map-view"> {/* Placeholder link */}
            <div className="p-6 text-center text-gray-700 transition-shadow duration-300 bg-white border rounded-lg shadow-md cursor-pointer hover:shadow-lg">
              <FaMap className="w-12 h-12 mx-auto text-indigo-600" />
              <h3 className="mt-4 text-lg font-medium">Map View</h3>
              <p className="mt-2 text-sm text-gray-500">
                See all registered resources on an interactive map.
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}