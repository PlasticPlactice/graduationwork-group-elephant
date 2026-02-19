import "@/styles/globals.css";
import { Metadata } from "next";
import AdminLayoutClient from "@/app/(admin)/admin/admin-layout-client";

export const metadata: Metadata = {
  title: "管理者",
  description: "管理者ページ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen flex flex-col">
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </body>
    </html>
  );
}
