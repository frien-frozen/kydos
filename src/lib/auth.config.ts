import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // The user object is only defined on the initial sign in after the adapter creates it
      if (user) {
        // NextAuth PrismaAdapter returns the mapped database User record
        // Fallback to PENDING tightly couples to the NextAuth lifecycle
        token.id = user.id as string;
        token.role = (user as any).role || "PENDING";
        token.status = (user as any).status || "PENDING";
        token.validUntil = (user as any).validUntil || null;
      }
      return token;
    },
    async session({ session, token }) {
      // Propagate the token payload tightly to the active session object
      if (session?.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.status = token.status as any;
        (session.user as any).validUntil = token.validUntil;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
