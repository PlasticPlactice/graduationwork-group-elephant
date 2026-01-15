import type { CSSProperties, Ref } from "react";
import type { Book } from "@/components/bookshelf/bookData";
import { BOOKS } from "@/components/bookshelf/bookData";
import { ScatterBook } from "@/components/bookshelf/ScatterBook";

const SCATTER_AREA_HEIGHT = "90vh";
const SCATTER_ROW_OFFSET = 60;

export type ScatterEntry = {
  book: Book;
  slotIndex: number;
};

type ScatterAreaProps = {
  books?: Book[];
  bookSlots?: ScatterEntry[];
  className?: string;
  onBookSelect?: (entry: ScatterEntry) => void;
  onBackToShelf?: () => void;
  containerRef?: Ref<HTMLDivElement>;
};

type ScatterSlot = {
  top?: string;
  left?: string;
  bottom?: string;
  right?: string;
  rotation?: number;
  zIndex?: number;
};

const SCATTER_LAYOUT: ScatterSlot[] = [
  { top: "8%", left: "5%", rotation: -18 },
  { top: "4%", right: "12%", rotation: 12 },
  { top: "28%", left: "18%", rotation: -6 },
  { top: "30%", right: "24%", rotation: 16 },
  { bottom: "24%", left: "8%", rotation: -32 },
  { bottom: "18%", right: "18%", rotation: 20 },
  { bottom: "5%", left: "28%", rotation: -8 },
  { bottom: "8%", right: "6%", rotation: 6 },
  { top: "48%", left: "10%", rotation: -14 },
  { top: "52%", right: "16%", rotation: 18 },
  { bottom: "38%", left: "32%", rotation: -10 },
  { bottom: "32%", right: "28%", rotation: 8 },
];

export function ScatterArea({
  books = BOOKS,
  bookSlots,
  className = "",
  onBookSelect,
  onBackToShelf,
  containerRef,
}: ScatterAreaProps) {
  const scatterEntries =
    bookSlots ?? books.map((book, idx) => ({ book, slotIndex: idx }));

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto mt-12 w-full max-w-5xl px-4 ${className}`}
    >
      <div className="mb-4 flex flex-col items-center text-pink-500">
        {onBackToShelf ? (
          <button
            type="button"
            onClick={onBackToShelf}
            aria-label="本棚へ戻る"
            className="leading-none"
          >
            <span
              aria-hidden="true"
              className="text-4xl font-black leading-none"
            >
              ▲
            </span>
          </button>
        ) : (
          <span aria-hidden="true" className="text-4xl font-black leading-none">
            ▲
          </span>
        )}
      </div>
      <div className="relative w-full" style={{ height: SCATTER_AREA_HEIGHT }}>
        <div className="absolute inset-0 rounded-4xl border border-white/40 bg-white/50 shadow-[0_20px_45px_rgba(15,23,42,0.12)] backdrop-blur" />
        {scatterEntries.map(({ book, slotIndex }, entryIdx) => {
          const slot = SCATTER_LAYOUT[slotIndex % SCATTER_LAYOUT.length];
          const depth = Math.floor(slotIndex / SCATTER_LAYOUT.length);
          const transforms = [
            depth ? `translateY(${depth * SCATTER_ROW_OFFSET}px)` : null,
            `rotate(${slot.rotation ?? 0}deg)`,
          ]
            .filter(Boolean)
            .join(" ");
          const style: CSSProperties = {
            top: slot.top,
            left: slot.left,
            bottom: slot.bottom,
            right: slot.right,
            transform: transforms,
            zIndex: slot.zIndex ?? entryIdx + 1,
          };

          return (
            <ScatterBook
              key={`${book.id}-scatter-${slotIndex}`}
              book={book}
              className="absolute"
              style={style}
              onClick={
                onBookSelect
                  ? () => onBookSelect({ book, slotIndex })
                  : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
