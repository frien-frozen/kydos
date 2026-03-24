"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function updateUserStatus(userId: string, newStatus: string, newRole: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: newStatus as any,
        role: newRole as any,
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
