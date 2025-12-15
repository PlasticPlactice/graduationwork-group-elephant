"use client"
import { AdminHeader } from "@/components/layout/admin-header";
import "@/styles/globals.css";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminTop = pathname === "/admin";
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen flex flex-col">
        {!isAdminTop && <AdminHeader />}
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
