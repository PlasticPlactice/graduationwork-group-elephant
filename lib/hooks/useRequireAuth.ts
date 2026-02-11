"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface UseRequireAuthOptions {
  requiredRole?: "admin" | "user";
  redirectUrlIfUnauthenticated?: string;
  skipAuth?: boolean; // 認証チェックをスキップするフラグ
}

/**
 * セッション認証を確保するカスタムホック
 * @param requiredRole - 必要なロール("admin" or "user")
 * @param redirectUrlIfUnauthenticated - 未認証時のリダイレクト先（オプション）
 * @param skipAuth - 認証チェックをスキップするかどうか（例：ログインページなど）
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { requiredRole, redirectUrlIfUnauthenticated, skipAuth } = options;

  useEffect(() => {
    // skipAuth が true の場合は認証チェックをスキップ
    if (skipAuth) {
      return;
    }

    // セッション認証がされていない場合
    if (status === "unauthenticated") {
      const redirectUrl =
        redirectUrlIfUnauthenticated ||
        (requiredRole === "admin" ? "/admin" : "/poster/login");
      router.push(redirectUrl);
      return;
    }

    // セッションが存在するが、ロール不一致の場合
    if (
      status === "authenticated" &&
      requiredRole &&
      session?.user?.role !== requiredRole
    ) {
      // ロール不一致者は公開ページへリダイレクト
      router.push("/");
    }
  }, [
    status,
    session,
    requiredRole,
    redirectUrlIfUnauthenticated,
    skipAuth,
    router,
  ]);

  return { session, status, isAuthenticated: status === "authenticated" };
}
