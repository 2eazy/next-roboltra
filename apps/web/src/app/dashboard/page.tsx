import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          
          <div className="bg-blue-50 p-4 rounded">
            <h2 className="font-semibold">Welcome, {session.user?.name || session.user?.email}!</h2>
            <p className="text-sm text-gray-600 mt-1">
              You are successfully authenticated.
            </p>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Session Info:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
          
          <div className="mt-6">
            <a 
              href="/api/auth/signout" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Sign Out
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}