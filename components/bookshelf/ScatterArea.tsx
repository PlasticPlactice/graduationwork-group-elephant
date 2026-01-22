import type { CSSProperties, Ref } from "react";
import type { Book } from "@/components/bookshelf/bookData";
import { BOOKS } from "@/components/bookshelf/bookData";
import { ScatterBook } from "@/components/bookshelf/ScatterBook";

const SCATTER_AREA_HEIGHT = "90vh";
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
  isDesktop?: boolean;
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

const GOLDEN_ANGLE_DEG = 137.5;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// Adjust right-side clamping so books don't overflow past the edge on small screens.
const clampRight = (value: number, min: number, max: number) => {
  if (value <= 50) return Math.min(Math.max(value, min), max);
  return Math.min(Math.max(value, min), max - 6);
};

const SPECIAL_SLOTS_BY_BOOK_ID: Record<string, ScatterSlot> = {
  b22: { top: "8%", left: "14%", rotation: 12 },
};

const SPECIAL_SLOTS_BY_PATTERN: Record<string, ScatterSlot> = {
  "#0ea5e9": { top: "48%", left: "48%", rotation: -4 },
};

const SPECIAL_Z_INDEX_BY_BOOK_ID: Record<string, number> = {
  b1: 40,
};

// Golden-angle spiral layout with tuned radius/scale per breakpoint.
const getScatterSlot = (
  index: number,
  total: number,
  preset: "desktop" | "mobile"
): ScatterSlot => {
  const normalized = Math.sqrt((index + 0.5) / Math.max(total, 1));
  const radius =
    preset === "desktop"
      ? 3 + normalized * 36
      : 6 + normalized * 44;
  const angle = index * GOLDEN_ANGLE_DEG;
  const radians = (angle * Math.PI) / 180;
  const left =
    preset === "desktop"
      ? clamp(46 + Math.cos(radians) * radius, 8, 86)
      : clampRight(44 + Math.cos(radians) * radius, 6, 84);
  const top =
    preset === "desktop"
      ? clamp(40 + Math.sin(radians) * (radius * 0.85), 6, 80)
      : clamp(38 + Math.sin(radians) * (radius * 1.1), 6, 84);
  const rotation = ((angle % 30) - 15) * 1.2;

  return {
    top: `${top}%`,
    left: `${left}%`,
    rotation,
  };
};

export function ScatterArea({
  books = BOOKS,
  bookSlots,
  className = "",
  onBookSelect,
  onBackToShelf,
  isDesktop = false,
  containerRef,
}: ScatterAreaProps) {
  const scatterEntries =
    bookSlots ?? books.map((book, idx) => ({ book, slotIndex: idx }));
  const totalSlots = bookSlots ? BOOKS.length : books.length;
  const preset = isDesktop ? "desktop" : "mobile";

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto mt-12 w-full max-w-6xl px-4 ${className}`}
    >
      <div className="mb-4 flex flex-col items-center text-pink-500 lg:hidden">
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
          const slot =
            SPECIAL_SLOTS_BY_BOOK_ID[book.id] ??
            SPECIAL_SLOTS_BY_PATTERN[book.patternColor] ??
            getScatterSlot(slotIndex, totalSlots, preset);
          const transforms = [`rotate(${slot.rotation ?? 0}deg)`].join(" ");
          const style: CSSProperties = {
            top: slot.top,
            left: slot.left,
            bottom: slot.bottom,
            right: slot.right,
            transform: transforms,
            zIndex:
              SPECIAL_Z_INDEX_BY_BOOK_ID[book.id] ??
              slot.zIndex ??
              entryIdx + 1,
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
