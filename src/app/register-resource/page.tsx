import RegisterResourceForm from '@/components/RegisterResourceForm';

export default function RegisterResourcePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <div className="text-left">
            <h1 className="text-2xl font-bold text-gray-900">
              Register a New Resource
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Fill in the details below to add a resource to the network.
            </p>
          </div>
          <div className="mt-8">
            <RegisterResourceForm />
          </div>
        </div>
      </div>
    </main>
  );
}