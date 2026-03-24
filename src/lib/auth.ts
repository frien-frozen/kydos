import NextAuth from "next-auth";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user.email) return false;
      
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name || "Unknown",
            image: user.image || "",
            role: "PENDING",
            status: "PENDING",
          },
        });
        (user as any).role = "PENDING";
        (user as any).status = "PENDING";
        (user as any).validUntil = null;
      } else {
        (user as any).role = existingUser.role;
        (user as any).status = existingUser.status;
        (user as any).validUntil = existingUser.validUntil;
      }
      return true;
    },
  },
});
