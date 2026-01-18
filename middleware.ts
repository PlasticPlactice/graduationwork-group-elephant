import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIES = [
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
];

export function middleware(request: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) =>
    Boolean(request.cookies.get(name)?.value)
  );

  if (!hasSession) {
    const signInUrl = new URL("/admin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  // /admin 直下（ログインページと、拡張子ありファイル）を除外し、
  // /admin/home などのページのみを保護する
  // 正規表現 /admin/((?!.*\..*$).+) は拡張子を含むパスを弾き、管理画面の画面遷移だけを対象にする
  matcher: ["/admin/((?!.*\\..*$).+)"],
};
