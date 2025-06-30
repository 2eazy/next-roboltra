export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h1 className="text-3xl font-bold text-center">Next.js is Working!</h1>
        <p className="text-center text-gray-600">
          The migration to Next.js was successful.
        </p>
        <div className="space-y-4">
          <a
            href="/auth/signin"
            className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Sign In
          </a>
          <a
            href="/dashboard"
            className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Try Dashboard (Protected)
          </a>
        </div>
      </div>
    </div>
  );
}