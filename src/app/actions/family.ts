"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function linkFamilyByEmail(parentEmail: string, studentId: string) {
  try {
    const parent = await prisma.user.findUnique({
      where: { email: parentEmail }
    });

    if (!parent) return { success: false, error: "No user found with that email." };
    if (parent.role !== "PARENT") return { success: false, error: "The provided email does not belong to a PARENT account." };

    await prisma.user.update({
      where: { id: studentId },
      data: { parentId: parent.id }
    });

    revalidatePath("/accounting");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to link parent to student." };
  }
}

export async function getParentData() {
  const session = await auth();
  if (!session || session.user.role !== "PARENT") {
    return { children: [] };
  }

  const parent = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      children: {
        include: {
          enrollments: {
            include: { course: true }
          },
          quizAttempts: {
            include: { quiz: true },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      }
    }
  });

  return { children: parent?.children || [] };
}
