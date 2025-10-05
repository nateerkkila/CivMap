import LoginForm from '@/components/LoginForm';
import { Suspense } from 'react';

// A simple component to show while the main form is loading
function LoginFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-10 w-full rounded-md bg-gray-200 animate-pulse"></div>
        <div className="h-10 w-full rounded-md bg-gray-200 animate-pulse"></div>
      </div>
      <div className="h-10 w-full rounded-md bg-gray-300 animate-pulse"></div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Civilian Resource Map
          </h1>
          <p className="mt-2 text-gray-600">
            Sign in or create an account to continue
          </p>
        </div>
        
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>

      </div>
    </main>
  );
}