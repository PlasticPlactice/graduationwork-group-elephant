"use client";

import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export function PosterLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // /poster/login, /poster/create, /poster/create-complete はセッション確認をスキップ（未認証でアクセス可能）
  const isLoginPage = pathname === "/poster/login";
  const isCreatePage = pathname === "/poster/create";
  const isCreateComplete = pathname === "/poster/create-complete";
  const skipAuthCheck = isLoginPage || isCreatePage || isCreateComplete;

  // 投稿者ロールの認証確認（skipAuth で条件制御）
  useRequireAuth({
    requiredRole: "user",
    redirectUrlIfUnauthenticated: "/poster/login",
    skipAuth: skipAuthCheck, // ログイン・作成ページではスキップ
  });

  return children;
}
