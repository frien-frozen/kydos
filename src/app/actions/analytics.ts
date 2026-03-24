"use server";

import { prisma } from "@/lib/prisma";

export async function getSchoolStats() {
  const [
    totalStudents,
    totalTeachers,
    totalActiveCourses,
    totalActiveTuitions
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.user.count({
      where: {
        role: "STUDENT",
        validUntil: { gt: new Date() }
      }
    })
  ]);

  return {
    totalStudents,
    totalTeachers,
    totalActiveCourses,
    totalActiveTuitions
  };
}
