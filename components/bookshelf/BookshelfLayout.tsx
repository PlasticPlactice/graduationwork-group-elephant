import type { ReactNode } from "react";
import Image from "next/image";

type BookshelfLayoutProps = {
  className?: string;
  /** 各段に表示する本の ReactNode 配列（省略可） */
  shelfContents?: ReactNode[];
};

const SHELF_COUNT = 3; // 30冊→10冊×3段

export function BookshelfLayout({
  className = "absolute inset-0",
  shelfContents = [],
}: BookshelfLayoutProps) {
  return (
    <div
      className={`${className} flex h-full flex-col justify-between px-0 py-8`}
    >
      {Array.from({ length: SHELF_COUNT }).map((_, index) => {
        const isTopShelf = index === 0;
        const isBottomShelf = index === SHELF_COUNT - 1;
        return (
          <div key={`shelf-${index}`} className="flex flex-col items-center">
            <div
              className={`relative flex w-full items-end justify-center ${
                isTopShelf ? "h-32" : "h-28"
              } ${isBottomShelf ? "-mb-6" : "-mb-6"}`}
            >
              {shelfContents[index] ?? null}
            </div>
            <div className="relative h-16 w-full overflow-visible">
              <div className="absolute left-1/2 top-0 h-full w-[150%] -translate-x-1/2">
                <Image
                  src="/bookshelf/Hondana-ita.png"
                  alt={`棚板 ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={index === SHELF_COUNT - 1}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
