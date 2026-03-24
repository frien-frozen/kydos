import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getParentData } from "@/app/actions/family";
import { hasAccess } from "@/lib/permissions";

export default async function ParentPortal() {
  const session = await auth();

  if (!session) redirect("/login");

  const role = session.user.role as string;
  if (!hasAccess(role, "/parent") && role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { children } = await getParentData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Parent Observation Portal</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">Monitor the academic progress and assessment performance of your dependents.</p>
        </header>

        {children.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <span className="text-5xl block mb-6">🔗</span>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No Students Linked</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">No students are currently linked to your account. Please provide your email address to the school reception desk or finance office to verify your relation.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {children.map((child: any) => {
              const isExpired = !child.validUntil || new Date(child.validUntil) < new Date();
              
              return (
                <div key={child.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 border-b border-gray-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50">
                     <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-black text-3xl flex items-center justify-center shadow-inner border border-indigo-200 dark:border-indigo-800">
                          {child.name?.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-3xl font-black text-gray-900 dark:text-white">{child.name}</h2>
                          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">{child.email}</p>
                        </div>
                     </div>
                     <div className="text-right flex flex-col items-center md:items-end justify-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tuition Status</span>
                        {isExpired ? (
                          <span className="px-4 py-1.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm font-bold border border-red-200 dark:border-red-800/50 flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-red-500"></span> EXPIRED
                          </span>
                        ) : (
                          <span className="px-4 py-1.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-bold border border-green-200 dark:border-green-800/50 flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-green-500"></span> ACTIVE
                          </span>
                        )}
                        <p className="text-xs text-gray-500 mt-2 font-medium">Valid until: {child.validUntil ? new Date(child.validUntil).toLocaleDateString() : 'N/A'}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="p-8 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-700">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2"><span>📚</span> Enrolled Curriculum</h3>
                      {child.enrollments.length === 0 ? (
                        <p className="text-sm text-gray-500 font-medium italic">No active enrollments.</p>
                      ) : (
                        <ul className="space-y-3">
                          {child.enrollments.map((en: any) => (
                            <li key={en.courseId} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center group hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                               <span className="font-semibold text-gray-800 dark:text-gray-200">{en.course.title}</span>
                               <span className="text-xs font-bold text-gray-400">Enrolled: {new Date(en.enrolledAt).toLocaleDateString()}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="p-8">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2"><span>🎯</span> Recent Assessments</h3>
                      {child.quizAttempts.length === 0 ? (
                        <p className="text-sm text-gray-500 font-medium italic">No assessments submitted yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {child.quizAttempts.map((attempt: any) => (
                            <div key={attempt.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                               <div>
                                  <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{attempt.quiz?.title || 'Unknown Assessment'}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(attempt.createdAt).toLocaleString()}</p>
                               </div>
                               <div className="text-right">
                                  <div className={`text-xl font-black ${attempt.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {attempt.score.toFixed(0)}%
                                  </div>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider ${attempt.passed ? 'text-green-500' : 'text-red-500'}`}>
                                    {attempt.passed ? 'Passed' : 'Failed'}
                                  </span>
                               </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
