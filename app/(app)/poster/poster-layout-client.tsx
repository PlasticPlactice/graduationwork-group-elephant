"use client";

import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export function PosterLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // /poster/login と /poster/create ページはセッション確認をスキップ（未認証でアクセス可能）
  const isLoginPage = pathname === "/poster/login";
  const isCreatePage = pathname === "/poster/create";
  const skipAuthCheck = isLoginPage || isCreatePage;

  // 投稿者ロールの認証確認（skipAuth で条件制御）
  useRequireAuth({
    requiredRole: "user",
    redirectUrlIfUnauthenticated: "/poster/login",
    skipAuth: skipAuthCheck, // ログイン・作成ページではスキップ
  });

  return children;
}
