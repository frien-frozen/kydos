import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-8">
          <nav className="flex gap-8">
            <Link href="/admin" className="py-4 text-sm font-bold border-b-2 border-transparent hover:border-blue-500 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all">
              User Management
            </Link>
            <Link href="/admin/tuition" className="py-4 text-sm font-bold border-b-2 border-transparent hover:border-blue-500 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all">
              Tuition CRM
            </Link>
            <Link href="/admin/courses" className="py-4 text-sm font-bold border-b-2 border-transparent hover:border-blue-500 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all">
              Global Course Catalog
            </Link>
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
