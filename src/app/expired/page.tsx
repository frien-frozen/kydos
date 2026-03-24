import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ExpiredPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const validUntil = (session.user as any).validUntil;
  if (validUntil && new Date(validUntil) > new Date()) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 text-center overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
        
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>

        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-3 tracking-tight">Access Expired</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          Your active tuition period for Kydos has concluded. Please visit the reception desk to authorize an extension and restore your academic access.
        </p>

        <form action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}>
          <button type="submit" className="w-full py-3.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-md transition-all active:scale-[0.98]">
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
