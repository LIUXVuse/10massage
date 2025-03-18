import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { createHash } from "crypto";
import { User } from "next-auth";

// 簡單的密碼雜湊函數
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// 密碼驗證函數
function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
  const hashedPlainPassword = hashPassword(plainPassword);
  return hashedPlainPassword === hashedPassword;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "密碼", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // 查找用戶
          const user = await db.user.findUnique({
            where: { email: credentials.email.toLowerCase() }
          });

          if (!user || !user.password) {
            return null;
          }

          // 驗證密碼
          const isPasswordValid = verifyPassword(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email || "",
            name: user.name || "",
            role: user.role,
          } as User;
        } catch (error) {
          console.error("認證過程中出錯:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    session: ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}; 