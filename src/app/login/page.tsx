import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Civilian Resource Map
          </h1>
          <p className="mt-2 text-gray-600">
            Please sign in to continue
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}