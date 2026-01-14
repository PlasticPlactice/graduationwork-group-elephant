import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/admin",
  },
  callbacks: {
    authorized: ({ token }) => {
      // トークンが存在すればログイン状態とみなす
      // 必要に応じて role のチェックなどもここで行う
      return !!token;
    },
  },
});

export const config = {
  // /admin 直下（ログインページ）と、静的ファイル（拡張子あり）を除外し、
  // /admin/home などのページのみを保護する
  matcher: ["/admin/((?!.*\\..*$).+)"],
};
