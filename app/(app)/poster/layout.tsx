import type { Metadata } from "next";
import "@/styles/globals.css";
import { AfterLoginHeader } from "@/components/layout/after-login-header";

export const metadata: Metadata = {
  title: "象と花プロジェクト",
  description: "象と花プロジェクトのログインサイトです。",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen flex flex-col"
      >
        <AfterLoginHeader />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
