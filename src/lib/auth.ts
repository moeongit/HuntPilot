import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { prisma } from "@/lib/prisma";

const githubClientId = process.env.GITHUB_ID;
const githubClientSecret = process.env.GITHUB_SECRET;

if (!githubClientId || !githubClientSecret) {
  // This is the most common local setup issue; without these, /api/auth/signin/github will bounce back with an error.
  console.warn(
    "[auth] Missing GitHub OAuth env vars. Set GITHUB_ID and GITHUB_SECRET in .env and restart the dev server.",
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers:
    githubClientId && githubClientSecret
      ? [
          GitHubProvider({
            clientId: githubClientId,
            clientSecret: githubClientSecret,
            allowDangerousEmailAccountLinking: false,
          }),
        ]
      : [],
  // Important: middleware.ts uses `getToken()` (JWT). If we use database sessions,
  // `getToken()` will always be null and /app will keep redirecting after sign-in.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  callbacks: {
    jwt({ token, user }) {
      // Persist the user id onto the token so we can read it in middleware + session callback.
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? "";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

