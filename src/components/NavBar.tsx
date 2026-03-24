import { auth, signOut } from "@/lib/auth";
import Link from "next/link";
import { ROLE_PERMISSIONS } from "@/lib/permissions";

export default async function NavBar() {
  const session = await auth();

  if (!session) return null;

  const role = session.user.role as string;
  const links = ROLE_PERMISSIONS[role] || [];

  return (
    <nav className="bg-gray-950 border-b border-gray-800 px-6 py-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-gray-200 transition-colors">
            Kydos
          </Link>
          
          <div className="flex items-center gap-6">
             {links.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  {link.label}
                </Link>
             ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-300 hidden sm:block">
              {session.user.name}
            </span>
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-gray-700 shadow-inner" />
            ) : (
              <div className="w-8 h-8 bg-gray-800 text-gray-200 border border-gray-700 rounded-full flex items-center justify-center font-bold text-xs shadow-inner">
                {session.user.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
          
          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}>
            <button type="submit" className="text-sm font-medium px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors border border-gray-700 hover:border-gray-600 shadow-sm active:scale-[0.98]">
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
