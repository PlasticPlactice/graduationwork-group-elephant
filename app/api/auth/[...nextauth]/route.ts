import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Admin",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "jsmith@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // バリデーション：email と password が存在するか確認
        if (!credentials?.email && !credentials?.password) {
          throw new Error("メールとパスワードの入力が必要です");
        } else if (!credentials?.email) {
          throw new Error("メールの入力が必要です");
        } else if (!credentials?.password) {
          throw new Error("パスワードの入力が必要です");
        }

        try {
          // Prisma で Admin テーブルから email で検索
          const admin = await prisma.admin.findUnique({
            where: { email: credentials.email },
          });

          // Admin が見つからない場合
          if (!admin) {
            throw new Error("管理者が見つかりません");
          }

          // パスワード照合
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            admin.password
          );

          if (!isPasswordValid) {
            throw new Error("パスワードが正しくありません");
          }

          // 成功時：ユーザーオブジェクトを返す
          return {
            id: admin.id.toString(),
            email: admin.email,
            name: admin.email,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };
