import type { Metadata } from "next";
import { EventHeader } from "@/components/layout/event-header";
import { Footer } from "@/components/layout/footer";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "イベント情報 | 文庫X",
  description: "現在開催中のイベント情報です。",
};

export default function EventRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen flex flex-col bg-white">
        <EventHeader />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
