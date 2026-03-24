"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPendingUsers() {
  return await prisma.user.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
}

export async function approveUser(email: string) {
  try {
    await prisma.user.update({
      where: { email },
      data: {
        role: "STUDENT",
        status: "APPROVED",
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
