import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { getActiveCommunity } from "@/lib/actions/communities";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const currentCommunity = await getActiveCommunity();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={session.user} currentCommunity={currentCommunity} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}