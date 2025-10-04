import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Civilian Resource Map
          </h1>
          <p className="mt-2 text-gray-600">
            {/* You can add a subtitle here if you like */}
            Sign in or create an account to continue
          </p>
        </div>
        {/* The LoginForm component is rendered inside this styled container */}
        <LoginForm />
      </div>
    </main>
  );
}