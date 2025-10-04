import RegisterResourceForm from '@/components/RegisterResourceForm';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function RegisterResourcePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft />
          Back
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Register Resource
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Share what you can offer to support community resilience
          </p>
        </div>
        <RegisterResourceForm />
      </div>
    </main>
  );
}