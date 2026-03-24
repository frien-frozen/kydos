"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function extendAccess(userId: string, monthsToAdd: number) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }});
    if (!user) return { success: false };

    const currentExpiry = user.validUntil && user.validUntil > new Date() ? user.validUntil : new Date();
    const newExpiry = new Date(currentExpiry);
    newExpiry.setMonth(newExpiry.getMonth() + monthsToAdd);

    await prisma.user.update({
      where: { id: userId },
      data: { validUntil: newExpiry },
    });

    revalidatePath("/admin/tuition");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function revokeAccess(userId: string) {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    await prisma.user.update({
      where: { id: userId },
      data: { validUntil: yesterday },
    });

    revalidatePath("/admin/tuition");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getStudentsForTuition() {
  return await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
  });
}
