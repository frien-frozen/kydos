import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getEnrolledCourses } from "@/app/actions/enrollments";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) redirect("/login");

  const enrolledCourses = await getEnrolledCourses();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Welcome back, {session.user.name?.split(" ")[0] || "Student"}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Here's an overview of your learning journey.
            </p>
          </div>
          <Link href="/courses" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm whitespace-nowrap">
             Browse Catalog
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Enrolled Courses</h3>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">{enrolledCourses.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 opacity-60">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completed</h3>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">0</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 opacity-60">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Certificates</h3>
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mt-2">0</p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">My Courses</h2>
          {enrolledCourses.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-6">You have not enrolled in any courses yet.</p>
              <Link href="/courses" className="px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-lg text-sm transition-colors shadow-sm">
                Explore Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.map((course: any) => (
                <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-6">
                    <div className="pr-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{course.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">{course.modules.length} Modules Available</p>
                    </div>
                    {course.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover bg-gray-100 shadow-sm flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0 border border-blue-100 dark:border-blue-800/50">
                        {course.title.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <Link href={`/courses/${course.id}`} className="mt-auto w-full py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg text-sm transition-colors flex items-center justify-center border border-gray-200 dark:border-gray-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-700 dark:group-hover:text-blue-300 group-hover:border-blue-200 dark:group-hover:border-blue-800">
                    Resume Course
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
