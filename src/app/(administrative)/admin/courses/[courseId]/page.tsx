import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { addModule, deleteModule } from "@/app/actions/modules";
import Link from "next/link";

interface PageProps {
  params: Promise<{ courseId: string }> | { courseId: string };
}

export default async function AdminCourseEditor(props: PageProps) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const params = await props.params;

  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      modules: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!course) redirect("/admin/courses");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/admin/courses" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-3 inline-block transition-colors">&larr; Back to Catalog</Link>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">{course.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg max-w-2xl">{course.description}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 sticky top-24">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <span>➕</span> Build Module
              </h2>
              <form action={async (formData) => {
                "use server";
                const title = formData.get("title") as string;
                const videoUrl = formData.get("videoUrl") as string;
                const content = formData.get("content") as string;
                if (title) await addModule(course.id, title, videoUrl, content);
              }} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
                  <input type="text" name="title" required className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600/80 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 dark:text-gray-100 outline-none transition-shadow" placeholder="e.g. Introduction to Next.js" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Video URL</label>
                  <input type="url" name="videoUrl" className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600/80 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 dark:text-gray-100 outline-none transition-shadow" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Content Body</label>
                  <textarea name="content" rows={5} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600/80 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 dark:text-gray-100 resize-none outline-none transition-shadow leading-relaxed" placeholder="Detailed assignment or reading logic..." />
                </div>
                <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.98] mt-4 flex items-center justify-center gap-2">
                  Compile Module
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {course.modules.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-16 text-center h-full flex flex-col items-center justify-center">
                <span className="text-4xl mb-4">📭</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Empty Syllabus</h3>
                <p className="text-gray-500 dark:text-gray-400">Use the builder to add your first learning module.</p>
              </div>
            ) : (
              course.modules.map((module: any, index: number) => (
                <div key={module.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow group relative">
                  <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <form action={async () => {
                          "use server";
                          await deleteModule(module.id, course.id);
                        }}>
                          <button type="submit" className="text-red-500 hover:text-red-700 bg-white dark:bg-gray-800 rounded-full p-2 shadow hover:shadow-md transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                      </form>
                  </div>
                  
                  <div className="md:w-64 bg-slate-50 dark:bg-gray-800/80 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700/80 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-50"></div>
                    {module.videoUrl ? (
                         <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center shadow-inner relative z-10">
                            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
                         </div>
                    ) : (
                        <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center shadow-inner relative z-10">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                    )}
                    <span className="mt-4 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider uppercase relative z-10">
                        {module.videoUrl ? "Video Lesson" : "Reading Material"}
                    </span>
                  </div>
                  <div className="p-8 md:flex-1 flex flex-col justify-center">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-black flex items-center justify-center text-sm">
                            {index + 1}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 pr-8">{module.title}</h3>
                            {module.content && (
                                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                    {module.content}
                                </p>
                            )}
                        </div>
                      </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
