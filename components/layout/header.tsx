import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <Image
            src="/layout/logo.png"
            alt="象と花プロジェクト ロゴ"
            width={120}
            height={40}
            className="h-auto w-auto"
            priority
          />
        </Link>

        <Link
          href="/poster/login"
          className="btn text-base font-bold text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#36A8B1" }}
        >
          ログイン
        </Link>
      </div>
    </header>
  );
}