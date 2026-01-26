import { type KeyboardEvent } from "react";
import type { Book } from "@/components/bookshelf/bookData";
import { BookPattern } from "@/components/bookshelf/BookPattern";

type ShelfBookProps = {
  book: Book;
  heightClass?: string;
  widthClass?: string;
  className?: string;
  /** 背表紙のテキスト（省略時は何も表示しない） */
  label?: string;
  onClick?: () => void;
  /** 下部ハイライトの色（例: '#FFD54F' または 'red'）。指定なしで非表示 */
  bottomColor?: string;
};

const DEFAULT_HEIGHT = "h-40";
const DEFAULT_WIDTH = "w-10";

export function ShelfBook({
  book,
  heightClass = DEFAULT_HEIGHT,
  widthClass = DEFAULT_WIDTH,
  className = "",
  label,
  onClick,
  bottomColor,
}: ShelfBookProps) {
  const containerClass = [
    "relative",
    "flex",
    "overflow-hidden",
    "rounded-md",
    "border",
    "border-slate-900/10",
    "shadow-[0_6px_12px_rgba(15,23,42,0.18)]",
    heightClass,
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const interactiveClasses = onClick
    ? "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400"
    : "";

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={[containerClass, interactiveClasses].filter(Boolean).join(" ")}
      style={
        bottomColor
          ? {
              boxShadow: `0 6px 12px rgba(15, 23, 42, 0.18), 0 0 0 3px ${bottomColor}`,
            }
          : undefined
      }
      aria-label={label ?? book.id}
    >
      {bottomColor ? (
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 bottom-0"
          style={{ height: "25%", backgroundColor: bottomColor }}
        />
      ) : null}
      <BookPattern
        pattern={book.pattern}
        baseColor={book.baseColor}
        patternColor={book.patternColor}
      />
      <div className="pointer-events-none absolute inset-y-2 left-1 w-1 rounded-full bg-white/40 opacity-70" />
      {label ? (
        <span className="pointer-events-none absolute bottom-2 left-1/2 w-[80%] -translate-x-1/2 rotate-90 truncate text-center text-xs font-semibold text-slate-700/80">
          {label}
        </span>
      ) : null}
    </div>
  );
}
