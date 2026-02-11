import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIES = [
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
];

export function middleware(request: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) =>
    Boolean(request.cookies.get(name)?.value),
  );

  if (!hasSession) {
    const pathname = request.nextUrl.pathname;

    // admin ページへのアクセス → /admin へリダイレクト
    if (pathname.startsWith("/admin")) {
      const signInUrl = new URL("/admin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // post, poster ページへのアクセス（/poster/login, /poster/create 除外） → /poster/login へリダイレクト
    if (
      (pathname.startsWith("/post") && !pathname.startsWith("/poster")) ||
      (pathname.startsWith("/poster") &&
        pathname !== "/poster/login" &&
        pathname !== "/poster/create")
    ) {
      const signInUrl = new URL("/poster/login", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // 保護対象：
  // - /admin/** (ファイル除外)
  // - /post/** (ファイル除外)
  // - /poster/** (ファイル除外)
  // 除外は middleware の条件分岐で処理
  // 公開対象：/(public)/**, /event/**
  matcher: [
    "/admin/((?!.*\\..*$).+)",
    "/post/((?!.*\\..*$).+)",
    "/poster/((?!.*\\..*$).+)",
  ],
};
