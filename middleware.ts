import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/admin",
  },
  callbacks: {
    authorized: ({ token }) => {
      // 管理画面へのアクセスは admin ロールのユーザーのみに制限する
      return token?.role === "admin";
    },
  },
});

export const config = {
  // /admin 直下（ログインページ）と、静的ファイル（拡張子あり）を除外し、
  // /admin/home などのページのみを保護する
  // 正規表現 /admin/((?!.*\\..*$).+) は拡張子を含むパス（静的ファイル）を弾き、管理画面の画面遷移だけを対象にする
  matcher: ["/admin/((?!.*\\..*$).+)"],
};
