import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PendingPage() {
  const session = await auth();
  
  if (!session) redirect("/login");
  if (session.user.status === "APPROVED") redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border overflow-hidden">
        {session.user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={session.user.image} 
            alt="Profile Image" 
            className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-gray-50 object-cover shadow-sm"
          />
        )}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {session.user.name}</h1>
        <div className="w-16 h-1 bg-yellow-400 mx-auto my-6 rounded-full"></div>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Pending</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Your account is pending administrator approval. Please check back later or contact an administrator.
        </p>
        
        <form action={async () => {
          "use server"
          await signOut({ redirectTo: "/login" })
        }}>
          <button type="submit" className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors w-full">
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
