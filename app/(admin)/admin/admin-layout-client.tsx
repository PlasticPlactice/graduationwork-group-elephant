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
  useRequireAuth({
    requiredRole: "admin",
    redirectUrlIfUnauthenticated: "/admin",
  });

  return (
    <>
      {!isAdminTop && <AdminHeader />}
      <main className="flex-1">{children}</main>
    </>
  );
}
