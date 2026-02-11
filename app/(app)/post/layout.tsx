import type { Metadata } from "next";
import "@/styles/globals.css";
import { AfterLoginHeader } from "@/components/layout/after-login-header";
import { Providers } from "@/app/providers";
import { PostLayoutClient } from "./post-layout-client";

export const metadata: Metadata = {
  title: "書評投稿ページ",
  description: "象と花プロジェクトの書評投稿ページです。",
};

export default function PostLayout({
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
        <main className="flex-1">
          <Providers>
            <PostLayoutClient>{children}</PostLayoutClient>
          </Providers>
        </main>
      </body>
    </html>
  );
}
