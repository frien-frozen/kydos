"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addModule(courseId: string, title: string, videoUrl: string, content: string) {
  try {
    const existingCount = await prisma.module.count({
      where: { courseId },
    });

    await prisma.module.create({
      data: {
        title,
        videoUrl,
        content,
        position: existingCount + 1,
        courseId,
        isPublished: true,
      },
    });

    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteModule(moduleId: string, courseId: string) {
  try {
    await prisma.module.delete({
      where: { id: moduleId },
    });

    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
