"use client";

import { AdminHeader } from "@/components/layout/admin-header";
import { usePathname } from "next/navigation";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminTop = pathname === "/admin";

  // 管理者ロールの認証確認（セッション切れなら /admin へリダイレクト）
  // パスワードリセット関連ページは未認証でもアクセス可能にする
  const skipAuth = pathname.startsWith("/admin/password");

  useRequireAuth({
    requiredRole: "admin",
    redirectUrlIfUnauthenticated: "/admin",
    skipAuth,
  });

  return (
    <>
      {!isAdminTop && <AdminHeader />}
      <main className="flex-1">{children}</main>
    </>
  );
}
