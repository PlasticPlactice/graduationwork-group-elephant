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
  matcher: ["/admin/((?!.*\\..*$).+)"],
};
