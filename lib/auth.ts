import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "../app/generated/prisma/client";
import bcrypt from "bcrypt";
import { db } from "./db";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        });
        if (!user) {
          return null;
        }
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isPasswordValid) {
          return null;
        }
        return {
          id: `${user.id}`,
          email: `${user.email}`,
          role: `${user.role}`,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if(user) {
        return {
          ...token,
          id:user.id,
          email:user.email,
          role:user.role
        }
      }
      return token;
    },
    async session({ session, token, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          email: token.email,
          role: token.role,
        },
      };
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
