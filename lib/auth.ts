import type { NextAuthOptions } from "@/next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

interface CustomUser {
  id: string;
  email?: string | null;
  name?: string | null;
  role: "admin" | "user";
}

export const authOptions: NextAuthOptions = {
  providers: [
    // --- 管理者用プロバイダー ---
    CredentialsProvider({
      id: "admin", // 明示的にIDを指定
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("メールとパスワードの入力が必要です");
        }

        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email },
        });

        if (!admin) {
          throw new Error("管理者が見つかりません");
        }

        // 削除済み管理者のチェック
        if (admin.deleted_flag) {
          throw new Error("このアカウントは削除済みです。ログインできません。");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          admin.password,
        );

        if (!isPasswordValid) {
          throw new Error("パスワードが正しくありません");
        }

        return {
          id: admin.id.toString(),
          email: admin.email,
          name: "Admin User", // 任意
          role: "admin", // 役割識別用
        };
      },
    }),

    // --- 投稿者（User）用プロバイダー ---
    CredentialsProvider({
      id: "user", // 明示的にIDを指定
      name: "User",
      credentials: {
        account_id: { label: "Account ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.account_id || !credentials?.password) {
          throw new Error("アカウントIDとパスワードの入力が必要です");
        }

        const user = await prisma.user.findUnique({
          where: { account_id: credentials.account_id },
        });

        if (!user) {
          throw new Error("ユーザーが見つかりません");
        }

        // 退会済みユーザーのチェック
        if (user.deleted_flag) {
          throw new Error("このアカウントは退会済みです。ログインできません。");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error("パスワードが正しくありません");
        }

        return {
          id: user.id.toString(),
          name: user.nickname,
          email: null, // Userにはemailが無い場合がある
          role: "user", // 役割識別用
        };
      },
    }),
  ],
  callbacks: {
    // JWTトークン作成時
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = (user as CustomUser).role;
      }
      return token;
    },
    // セッション作成時（クライアント側で参照できる情報）
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        (session.user as CustomUser).id = token.id as string;
        (session.user as CustomUser).role = token.role as "admin" | "user";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
};
