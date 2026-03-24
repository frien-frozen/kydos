"use client";

import { useState } from "react";
import { submitQuizAttempt } from "@/app/actions/quizzes";

export default function QuizTaker({ quiz }: { quiz: any }) {
  const [active, setActive] = useState(false);
  const [answers, setAnswers] = useState<number[]>(new Array(quiz.questions.length).fill(-1));
  const [result, setResult] = useState<{ score: number, passed: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  if (result) {
    return (
      <div className={`mt-12 p-8 rounded-3xl border-2 ${result.passed ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'} text-center shadow-sm`}>
        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 text-4xl shadow-inner bg-white dark:bg-gray-800">
          {result.passed ? '🎓' : '📖'}
        </div>
        <h3 className={`text-3xl font-black mb-3 ${result.passed ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
          {result.passed ? 'Assessment Passed! 🎉' : 'Assessment Failed'}
        </h3>
        <p className={`font-bold text-xl ${result.passed ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
          Final Score: {result.score.toFixed(0)}%
        </p>
        {!result.passed && (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 font-medium">Please review the module content and try again.</p>
        )}
      </div>
    );
  }

  if (!active) {
    return (
      <div className="mt-12 p-8 bg-purple-50 dark:bg-purple-900/10 rounded-3xl border border-purple-100 dark:border-purple-800/30 text-center">
        <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-3">{quiz.title}</h3>
        <p className="text-purple-600 dark:text-purple-300 font-medium mb-8">Test your knowledge on this module material.</p>
        <button onClick={() => setActive(true)} className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] w-full sm:w-auto">
          Take Module Quiz
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await submitQuizAttempt(quiz.id, answers);
    if (res.success) {
      setResult({ score: res.score!, passed: res.passed! });
    }
    setLoading(false);
  };

  return (
    <div className="mt-12 bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-8 lg:p-12 border border-gray-200 dark:border-gray-700 shadow-inner">
      <div className="flex items-center gap-4 mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
         <span className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xl shadow-inner">📝</span>
         <div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100">{quiz.title}</h3>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-1">{quiz.questions.length} Questions</p>
         </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {quiz.questions.map((q: any, i: number) => (
          <div key={q.id} className="bg-white dark:bg-gray-900 p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="font-bold text-xl text-gray-800 dark:text-gray-200 mb-6 leading-relaxed"><span className="text-blue-500 mr-2">{i + 1}.</span> {q.text}</p>
            <div className="space-y-3">
              {q.options.map((opt: string, optIndex: number) => (
                <label key={optIndex} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers[i] === optIndex ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                  <input type="radio" name={`question-${q.id}`} checked={answers[i] === optIndex} onChange={() => {
                    const newAns = [...answers];
                    newAns[i] = optIndex;
                    setAnswers(newAns);
                  }} className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500" required />
                  <span className={`text-base font-medium ${answers[i] === optIndex ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'}`}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <button type="submit" disabled={loading || answers.includes(-1)} className={`w-full py-5 text-white font-black rounded-xl shadow-md transition-all text-lg tracking-wide ${loading || answers.includes(-1) ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}`}>
          {loading ? "Grading Evaluation..." : answers.includes(-1) ? "Answer All Questions" : "Submit Assessment"}
        </button>
      </form>
    </div>
  );
}
