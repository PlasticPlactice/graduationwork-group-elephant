import Link from "next/link";
import Image from "next/image";
import fs from "fs";
import path from "path";

export function Footer() {
  // サーバーコンポーネントなのでビルド時に public/layout にある画像の有無を確認できます
  const layoutDir = path.join(process.cwd(), "public", "layout");
  const sawayaPath = path.join(layoutDir, "sawaya_logo.png");
  const hasSawaya = fs.existsSync(sawayaPath);

  return (
    <footer className="bg-white py-12">
      <div className="max-w-4xl mx-auto text-center pl-4">
        {/* メインロゴ */}
        <div className="mx-auto w-full max-w-[560px]">
          <Image
            src="/layout/logo.png"
            alt="プロジェクトロゴ"
            width={840}
            height={420}
            className="object-contain mx-auto"
            priority
          />
        </div>

        {/* パートナー行: 画像切替は行わず、さわやロゴ（画像があれば）・✕・盛岡書房の文字を表示 */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 mt-8 flex-wrap">
          <div className="flex-shrink-0 ml-4 sm:ml-6">
            {hasSawaya ? (
              <Image
                src="/layout/sawaya_logo.png"
                alt="さわや書店ロゴ"
                width={90}
                height={40}
                className="object-contain max-w-[120px] sm:max-w-[200px]"
                priority
              />
            ) : (
              <span className="text-blue-800 font-semibold">さわや書店</span>
            )}
          </div>

          <div className="text-xl text-slate-600">✕</div>

          <div className="flex-shrink-0">
            <span className="text-slate-900 font-serif">株式会社盛岡書房</span>
          </div>
        </div>

        {/* 公式サイトへのリンク */}
        <div className="mt-6">
          <Link
            href="https://zoutohana.com/"
            className="inline-block text-pink-500 underline text-lg font-medium"
            target="_blank"
          >
            公式サイトへ
          </Link>
        </div>
      </div>
    </footer>
  );
}
