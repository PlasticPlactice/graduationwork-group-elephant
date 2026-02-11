import type { NextAuthOptions } from "@/types/next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { JWT } from "next-auth/jwt";
import { User } from "next-auth";
import { Session } from "next-auth";
import { USER_STATUS } from "@/lib/constants/userStatus";

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
          return null;
        }

        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email },
        });

        // ユーザーが見つからない、またはパスワードが一致しない場合はnullを返す
        // これにより、ユーザーが存在するかどうかの情報を漏らさない（ユーザー列挙対策）
        if (
          !admin ||
          !(await bcrypt.compare(credentials.password, admin.password))
        ) {
          return null;
        }

        // 認証成功後、アカウントの状態をチェック
        if (admin.deleted_flag) {
          // フロントエンドで処理するためのカスタムエラーコードを投げる
          throw new Error("DeletedAdmin");
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
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { account_id: credentials.account_id },
        });

        // ユーザーが見つからない、またはパスワードが一致しない場合はnullを返す
        // これにより、"IDが違う"のか"パスワードが違う"のかを区別させず、セキュリティを向上させる
        if (
          !user ||
          !(await bcrypt.compare(credentials.password, user.password))
        ) {
          return null; // next-authはこれを"CredentialsSignin"エラーとしてフロントに返す
        }

        // --- ここから下は、IDとパスワードが正しいことが確認された後の処理 ---

        // 物理削除済みユーザー(deleted_flag)のチェック
        // この場合、アカウントが存在しないものとして扱う
        if (user.deleted_flag) {
          throw new Error("DeletedUser");
        }

        // 1: 退会済みユーザー
        if (user.user_status === USER_STATUS.WITHDRAWN) {
          throw new Error("WithdrawnUser");
        }

        // 2: 利用停止(BAN)ユーザー
        if (user.user_status === USER_STATUS.BAN) {
          throw new Error("BannedUser");
        }

        // 全てのチェックを通過した場合、ユーザーオブジェクトを返す
        return {
          id: user.id.toString(),
          name: user.nickname,
          role: "user", // 役割識別用
        };
      },
    }),
  ],
  callbacks: {
    // JWTトークン作成時
    async jwt({ token, user }: { token: JWT; user: User }) {
      if (user) {
        token.id = user.id;
        token.role = (user as CustomUser).role;
      }
      return token;
    },
    // セッション作成時（クライアント側で参照できる情報）
    async session({ session, token }: { session: Session; token: JWT }) {
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
};
