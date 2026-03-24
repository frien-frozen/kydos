"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function enrollInCourse(courseId: string) {
  const session = await auth();
  if (!session) return { success: false };

  try {
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (!existing) {
      await prisma.enrollment.create({
        data: {
          userId: session.user.id,
          courseId,
        },
      });
    }

    revalidatePath("/courses");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function getEnrolledCourses() {
  const session = await auth();
  if (!session) return [];

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          modules: true,
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  return enrollments.map(e => e.course);
}
