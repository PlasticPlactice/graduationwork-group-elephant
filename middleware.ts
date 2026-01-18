import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token || token.role !== "admin") {
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
