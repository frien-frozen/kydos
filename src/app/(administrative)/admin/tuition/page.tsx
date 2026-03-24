import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStudentsForTuition, extendAccess, revokeAccess } from "@/app/actions/tuition";

export default async function TuitionDashboard() {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "FINANCE") {
    redirect("/dashboard");
  }

  const students = await getStudentsForTuition();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tuition & Access Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage student expiration ledgers.</p>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">Active Directory ({students.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 uppercase font-medium border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Valid Until</th>
                  <th className="px-6 py-4 text-right">Tuition Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {students.map((student: any) => {
                  const isExpired = !student.validUntil || new Date(student.validUntil) < new Date();
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 dark:text-gray-100">{student.name}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{student.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        {isExpired ? (
                          <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-bold border border-red-200 dark:border-red-800/50">EXPIRED</span>
                        ) : (
                          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold border border-green-200 dark:border-green-800/50">ACTIVE</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {student.validUntil ? student.validUntil.toLocaleDateString() : "Never"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <form action={async () => { "use server"; await extendAccess(student.id, 1); }}>
                            <button className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold rounded-md border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-xs">+1 Month</button>
                          </form>
                          <form action={async () => { "use server"; await extendAccess(student.id, 6); }}>
                            <button className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold rounded-md border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-xs">+6 Months</button>
                          </form>
                          <form action={async () => { "use server"; await extendAccess(student.id, 12); }}>
                            <button className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-semibold rounded-md border border-purple-200 dark:border-purple-800/50 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors text-xs">+1 Year</button>
                          </form>
                          {!isExpired && (
                            <form action={async () => { "use server"; await revokeAccess(student.id); }}>
                              <button className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold rounded-md border border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-xs">Revoke</button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No students found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
