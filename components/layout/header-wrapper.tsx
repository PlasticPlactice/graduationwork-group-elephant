"use client";
import { usePathname } from "next/navigation";
import { Header } from "./header";

export default function HeaderWrapper() {
  const pathname = usePathname() ?? "";
  // /admin 以下ではヘッダーを表示しない
  if (pathname.startsWith("/admin")) return null;
  return <Header />;
}
