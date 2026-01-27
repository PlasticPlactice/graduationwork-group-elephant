"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function AfterLoginHeader() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/poster/login";
  const isMyPage = pathname === "/poster/mypage";

  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="mx-auto flex h-21.5 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          {/* ToDo:画面サイズに応じた画像サイズの確認と変更 */}
          <Image
            src="/layout/logo.png"
            alt="象と花 #ゾウトハナ"
            width={90}
            height={10}
            className="h-auto w-auto"
            priority
          />
        </Link>

        {!isLoginPage && (
          <div className="flex items-center gap-6">
            {!isMyPage && (
              <Link
                href="/poster/mypage"
                className="btn text-base font-bold text-[#FF5555] hover:text-[#ff3333] transition-colors"
              >
                マイページ
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
