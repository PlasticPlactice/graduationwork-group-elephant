"use client";

import { AdminHeader } from "@/components/layout/admin-header";
import { usePathname } from "next/navigation";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminTop = pathname === "/admin";

  return (
    <>
      {!isAdminTop && <AdminHeader />}
      <main className="flex-1">{children}</main>
    </>
  );
}
