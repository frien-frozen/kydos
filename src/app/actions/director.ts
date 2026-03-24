"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDirectorData() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { teacher: true }
  });

  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    orderBy: { name: "asc" }
  });

  return { courses, teachers };
}

export async function assignTeacherToCourse(courseId: string, teacherId: string) {
  try {
    await prisma.course.update({
      where: { id: courseId },
      data: { teacherId: teacherId || null }
    });
    revalidatePath("/director");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
