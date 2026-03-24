"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function createQuizWithQuestions(moduleId: string, title: string, questionsData: any[]) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
      return { success: false, error: "Unauthorized" };
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        moduleId,
        questions: {
          create: questionsData.map(q => ({
            text: q.text,
            options: q.options,
            correctOptionIndex: parseInt(q.correctOptionIndex, 10)
          }))
        }
      }
    });

    const moduleItem = await prisma.module.findUnique({ where: { id: moduleId }, select: { courseId: true } });
    if (moduleItem) {
      revalidatePath(`/teacher/courses/${moduleItem.courseId}`);
    }
    
    return { success: true, quiz };
  } catch (error) {
    return { success: false, error: "Failed to build quiz." };
  }
}

export async function submitQuizAttempt(quizId: string, answersArray: number[]) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { orderBy: { id: 'asc' } } } 
    });

    if (!quiz) return { success: false, error: "Quiz not found" };

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((question, index) => {
      if (answersArray[index] === question.correctOptionIndex) {
        correctCount++;
      }
    });

    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const passed = score >= 70;

    await prisma.quizAttempt.create({
      data: {
        score,
        passed,
        quizId,
        userId: session.user.id
      }
    });

    const moduleItem = await prisma.module.findUnique({ where: { id: quiz.moduleId }, select: { courseId: true } });
    if (moduleItem) {
      revalidatePath(`/classroom/${moduleItem.courseId}`);
    }

    return { success: true, score, passed };
  } catch (error) {
    return { success: false, error: "Submission failed." };
  }
}
