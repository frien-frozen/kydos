"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function markModuleComplete(moduleId: string, courseId: string) {
  const session = await auth();
  if (!session) return { success: false };

  try {
    await prisma.moduleProgress.upsert({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId,
        },
      },
      update: {
        isCompleted: true,
      },
      create: {
        userId: session.user.id,
        moduleId,
        isCompleted: true,
      },
    });

    revalidatePath(`/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
