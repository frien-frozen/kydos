import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDirectorData, assignTeacherToCourse } from "@/app/actions/director";
import { hasAccess } from "@/lib/permissions";

export default async function DirectorHub() {
  const session = await auth();

  if (!session) redirect("/login");
  
  const role = session.user.role as string;
  if (!hasAccess(role, "/director") && role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { courses, teachers } = await getDirectorData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Curriculum Strategy Hub</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage faculty assignments and active curriculum allocations.</p>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">Global Course Roster ({courses.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 uppercase font-medium border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4">Syllabus</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Current Faculty</th>
                  <th className="px-6 py-4 text-right">Faculty Reassignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {courses.map((course: any) => (
                  <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{course.title}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 truncate max-w-[200px]">{course.description || "No description"}</p>
                    </td>
                    <td className="px-6 py-4">
                      {course.isPublished ? (
                        <span className="px-2.5 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md text-xs font-bold border border-green-200 dark:border-green-800/50">LIVE</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-md text-xs font-bold border border-yellow-200 dark:border-yellow-800/50">DRAFT</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {course.teacher ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-bold">
                            {course.teacher.name?.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800 dark:text-gray-200">{course.teacher.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 italic text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form action={async (formData) => {
                        "use server";
                        const teacherId = formData.get("teacherId") as string;
                        await assignTeacherToCourse(course.id, teacherId);
                      }} className="flex items-center justify-end gap-2">
                        <select 
                          name="teacherId" 
                          defaultValue={course.teacherId || ""}
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[150px]"
                        >
                          <option value="">Unassigned</option>
                          {teachers.map((t: any) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        <button type="submit" className="px-4 py-2 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-lg transition-transform active:scale-[0.98] text-xs shadow-sm">
                          Assign
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No courses found in the catalog.</td>
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
