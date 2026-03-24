"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function getCourses() {
  return await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      modules: true,
      teacher: true,
    },
  });
}

export async function getTeacherCourses() {
  const session = await auth();
  if (!session) return [];

  return await prisma.course.findMany({
    where: { teacherId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      modules: true,
    },
  });
}

export async function createCourse(title: string, description: string) {
  const session = await auth();
  if (!session) return { success: false };

  try {
    await prisma.course.create({
      data: {
        title,
        description,
        isPublished: false,
        teacherId: session.user.id,
      },
    });

    revalidatePath("/teacher/courses");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function toggleCoursePublish(courseId: string, isPublished: boolean) {
  try {
    await prisma.course.update({
      where: { id: courseId },
      data: { isPublished },
    });

    revalidatePath("/teacher/courses");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
