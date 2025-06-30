import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@roboltra/db";
import { eq } from "drizzle-orm";

import { sql } from "drizzle-orm";

// Import only what we need to avoid conflicts
const getUserByEmail = async (email: string) => {
  try {
    const query = sql`
      SELECT id, email, name, password_hash, platform_role 
      FROM users 
      WHERE email = ${email} 
      LIMIT 1
    `;
    
    const result = await db.execute(query);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await getUserByEmail(credentials.email as string);
        
        if (!user || !user.password_hash) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.platform_role || 'user',
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
});