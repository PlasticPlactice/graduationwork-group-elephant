import Link from "next/link";
import Image from "next/image";

export function AfterLoginHeader() {
  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="mx-auto flex h-21.5 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          {/* ToDo:画面サイズに応じた画像サイズの確認と変更 */}
          <Image
            src="/layout/new_logo.png"
            alt="象と花 #ゾウトハナ"
            width={35}
            height={35}
            className="h-auto w-auto"
            priority
          />
        </Link>

        <Link
          href="/poster/mypage"
          className="font-bold mr-3 headerMypageLink transition-colors"
        >
          マイページ
        </Link>
      </div>
    </header>
  );
}
