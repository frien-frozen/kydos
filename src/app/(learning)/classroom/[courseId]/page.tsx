import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { markModuleComplete } from "@/app/actions/progress";
import QuizTaker from "./QuizTaker";

interface PageProps {
  params: Promise<{ courseId: string }> | { courseId: string };
  searchParams: Promise<{ module?: string }> | { module?: string };
}

export default async function ClassroomPage(props: PageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const params = await props.params;
  const searchParams = await (props.searchParams || {});
  const activeModuleId = searchParams.module;
  
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      modules: { 
        orderBy: { position: "asc" },
        include: {
          progress: {
            where: { userId: session.user.id }
          },
          quiz: {
             include: { questions: { orderBy: { id: "asc" } } }
          }
        }
      },
      enrollments: { where: { userId: session.user.id } },
    }
  });

  if (!course) redirect("/courses");
  if (course.enrollments.length === 0 && session.user.role !== "ADMIN") {
    redirect("/courses");
  }

  const activeModule = activeModuleId 
    ? course.modules.find((m: any) => m.id === activeModuleId) 
    : course.modules[0];

  const isActiveModuleCompleted = activeModule?.progress?.[0]?.isCompleted;
  const completedCount = course.modules.filter((m: any) => m.progress?.[0]?.isCompleted).length;
  const progressPercentage = course.modules.length > 0 ? (completedCount / course.modules.length) * 100 : 0;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-gray-900 overflow-hidden border-t border-gray-200 dark:border-gray-800">
      <div className="w-1/4 min-w-[300px] border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
          <Link href="/dashboard" className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 uppercase tracking-widest mb-3 inline-block transition-colors">&larr; Dashboard</Link>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">{course.title}</h2>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{completedCount} of {course.modules.length} Completed</p>
            <div className="w-1/2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
               <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {course.modules.map((mod: any, i: number) => {
            const isActive = activeModule?.id === mod.id;
            const isCompleted = mod.progress?.[0]?.isCompleted;
            return (
              <Link 
                key={mod.id} 
                href={`?module=${mod.id}`}
                className={`block p-4 rounded-xl border transition-all ${isActive ? 'bg-white shadow-sm border-blue-200 dark:bg-gray-800 dark:border-blue-900/50 ring-1 ring-blue-500/20' : 'bg-transparent border-transparent hover:bg-white dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-sm flex items-center justify-center text-xs font-bold ${isActive ? 'bg-blue-600 text-white shadow-sm' : isCompleted ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                    {isCompleted ? '✓' : i + 1}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold line-clamp-2 ${isActive ? 'text-gray-900 dark:text-gray-100' : isCompleted ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {mod.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${mod.videoUrl ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{mod.videoUrl ? 'Video Lesson' : 'Reading'}</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="w-3/4 flex-1 flex flex-col overflow-y-auto bg-white dark:bg-gray-900 relative">
        {!activeModule ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">
            <span className="text-5xl mb-4">📚</span>
            <p className="font-semibold">No modules available in this course hierarchy.</p>
          </div>
        ) : (
          <div className="max-w-5xl w-full mx-auto p-8 lg:p-12 pb-24">
            <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest border border-blue-100 dark:border-blue-800/50">
               Module
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 leading-tight">{activeModule.title}</h1>
            
            {activeModule.videoUrl && (
              <div className="mb-12 w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl relative flex flex-col items-center justify-center border border-gray-200 dark:border-gray-800 bg-black aspect-video group">
                 {(activeModule.videoUrl.includes('youtube.com') || activeModule.videoUrl.includes('youtu.be')) ? (
                    <iframe 
                      className="w-full h-full border-0 absolute inset-0" 
                      src={activeModule.videoUrl.replace('watch?v=', 'embed/').split('&')[0].replace('youtu.be/', 'youtube.com/embed/')} 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen 
                    />
                 ) : (
                   <div className="text-center p-8">
                     <span className="text-6xl block mb-6 drop-shadow-md">▶️</span>
                     <p className="font-bold text-white text-lg mb-2">Video Hosted Externally</p>
                     <a href={activeModule.videoUrl} target="_blank" rel="noreferrer" className="inline-block mt-2 px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-sm">
                        Open Video Link
                     </a>
                   </div>
                 )}
              </div>
            )}

            {activeModule.content && (
              <div className="prose prose-lg dark:prose-invert prose-blue max-w-none">
                <div className="bg-gray-50/50 dark:bg-gray-800/20 rounded-3xl p-8 lg:p-12 border border-gray-100 dark:border-gray-800/60 shadow-sm">
                  <p className="text-gray-800 dark:text-gray-200 leading-loose whitespace-pre-wrap font-medium">
                    {activeModule.content}
                  </p>
                </div>
              </div>
            )}

            {activeModule.quiz && (
              <QuizTaker quiz={activeModule.quiz} />
            )}

            <div className="mt-16 flex justify-end">
              {isActiveModuleCompleted ? (
                <button disabled className="px-8 py-3.5 bg-green-600 text-white font-bold rounded-xl shadow-sm transition-all opacity-90 cursor-not-allowed flex items-center gap-2">
                  <span>Completed 🎉</span>
                </button>
              ) : (
                <form action={async () => {
                  "use server";
                  await markModuleComplete(activeModule.id, course.id);
                }}>
                  <button type="submit" className="px-8 py-3.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-md transition-all active:scale-95">
                    Mark as Complete
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
