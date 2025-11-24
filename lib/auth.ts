import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import type { UserRole } from "@prisma/client";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Phone",
      credentials: {
        phone: { label: "شماره موبایل", type: "text" },
        otp: { label: "کد تایید", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) {
          return null;
        }

        const phone = credentials.phone as string;
        const otp = credentials.otp as string;

        // فعلاً OTP ساختگی: 123456
        if (otp !== "123456") {
          return null;
        }

        // جستجو یا ایجاد کاربر
        let user = await db.user.findUnique({
          where: { phone },
        });

        if (!user) {
          user = await db.user.create({
            data: {
              phone,
              role: "USER",
            },
          });
        }

        return {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.phone = token.phone as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
