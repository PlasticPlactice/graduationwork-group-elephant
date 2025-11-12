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
          {/* ToDo:画面サイズに応じた画像サイズの確認と変更 */}
          <Image
            src="/layout/logo.png"
            alt="象と花 #ゾウトハナ"
            width={120}
            height={40}
            className="h-auto w-auto"
            priority
          />
        </Link>

        <button
          type="button"
          className="text-base font-bold text-[#FF5555] hover:text-[#ff3333] transition-colors"
        >
          ログイン
        </button>
      </div>
    </header>
  );
}
