import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { enrollInCourse, getEnrolledCourses } from "@/app/actions/enrollments";
import Link from "next/link";

export default async function CourseCatalog() {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.status !== "APPROVED" && session.user.role !== "ADMIN") {
    redirect("/pending");
  }

  const [courses, enrolledCourses] = await Promise.all([
    prisma.course.findMany({
      where: { isPublished: true },
      include: {
        _count: { select: { modules: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getEnrolledCourses(),
  ]);

  const enrolledCourseIds = new Set(enrolledCourses.map((c: any) => c.id));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="text-center space-y-4 py-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Explore the Catalog</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Discover premium learning courses engineered for your acceleration.</p>
        </header>

        {courses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-16 text-center shadow-sm border border-gray-200 dark:border-gray-700">
            <span className="text-5xl mb-6 block">🔮</span>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No courses available yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">Our instructors are busy crafting new content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course: any) => {
              const isEnrolled = enrolledCourseIds.has(course.id);
              return (
                <div key={course.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 flex flex-col group translate-y-0 hover:-translate-y-1">
                  <div className="h-56 bg-gray-100 dark:bg-black relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-800 opacity-90 z-0"></div>
                    {course.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover mix-blend-overlay opacity-60 group-hover:opacity-80 transition-opacity duration-500 relative z-10" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-30 text-white font-black text-8xl z-10 tracking-tighter">
                        {course.title.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute top-5 right-5 bg-white/95 dark:bg-gray-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-900 dark:text-gray-100 shadow-lg z-20 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> {course._count.modules} Modules
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1 relative">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 leading-snug">{course.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 flex-1 line-clamp-3 leading-relaxed">{course.description || "Comprehensive learning module covering advanced concepts."}</p>
                    
                    {isEnrolled ? (
                      <Link href={`/classroom/${course.id}`} className="mt-auto w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2">
                        <span>Go to Classroom</span>
                      </Link>
                    ) : (
                      <form action={async () => {
                        "use server";
                        await enrollInCourse(course.id);
                      }} className="mt-auto">
                        <button type="submit" className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 hover:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-lg">
                          <span>Enroll Now</span>
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
