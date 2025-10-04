import ReportThreatForm from '@/components/ReportThreatForm';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function ReportThreatPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft />
          Back to Dashboard
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Report a Threat
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Provide details about a potential threat to community safety. Your current location is used by default.
          </p>
        </div>
        <ReportThreatForm />
      </div>
    </main>
  );
}