import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTeacherCourses, toggleCoursePublish, createCourse } from "@/app/actions/courses";
import Link from "next/link";

export default async function TeacherCoursesDashboard() {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const courses = await getTeacherCourses();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Courses</h1>
          
          <form action={async (formData) => {
            "use server";
            const title = formData.get("title") as string;
            const description = formData.get("description") as string;
            if (title) await createCourse(title, description);
          }} className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <input 
              type="text" 
              name="title" 
              placeholder="New Course Title" 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required 
            />
            <input 
              type="text" 
              name="description" 
              placeholder="Short Description" 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm">
              Create Course
            </button>
          </form>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">Catalog ({courses.length})</h2>
          </div>

          {courses.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">You haven't created any courses yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 uppercase font-medium border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Modules</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {courses.map((course: any) => (
                    <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/admin/courses/${course.id}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">{course.title}</Link>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 truncate max-w-xs">{course.description}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
                        {course.modules.length}
                      </td>
                      <td className="px-6 py-4">
                        {course.isPublished ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium border border-green-200 dark:border-green-800/50">PUBLISHED</span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-medium border border-yellow-200 dark:border-yellow-800/50">DRAFT</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        {course.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <form action={async () => {
                          "use server";
                          await toggleCoursePublish(course.id, !course.isPublished);
                        }}>
                          <button type="submit" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg text-sm transition-colors border border-gray-200 dark:border-gray-600 shadow-sm">
                            {course.isPublished ? "Unpublish" : "Publish"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
