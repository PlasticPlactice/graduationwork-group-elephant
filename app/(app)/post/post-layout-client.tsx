"use client";

import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { ReactNode } from "react";

export function PostLayoutClient({ children }: { children: ReactNode }) {
  // 投稿者ロールの認証確認（セッション切れなら /poster/login へリダイレクト）
  useRequireAuth({
    requiredRole: "user",
    redirectUrlIfUnauthenticated: "/poster/login",
  });

  return children;
}
