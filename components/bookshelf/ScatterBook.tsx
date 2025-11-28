import type { CSSProperties } from "react";
import type { Book } from "./bookData";
import { BookPattern } from "./BookPattern";

type ScatterBookProps = {
  book: Book;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  size?: {
    width: number;
    height: number;
  };
};

const DEFAULT_SIZE = { width: 80, height: 120 };

export function ScatterBook({
  book,
  className = "",
  style,
  onClick,
  size,
}: ScatterBookProps) {
  const isInteractive = Boolean(onClick);
  const { width, height } = size ?? DEFAULT_SIZE;
  const buttonStyle: CSSProperties = {
    ...style,
    backgroundColor: "transparent",
  };
  const bookStyle: CSSProperties = {
    width,
    height,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isInteractive}
      className={`group ${className} rounded-md border-none p-0 text-left ${
        isInteractive
          ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
          : "cursor-default"
      } disabled:pointer-events-none`}
      style={buttonStyle}
      aria-label={isInteractive ? `${book.id} を本棚に置く` : undefined}
    >
      <div
        className="pointer-events-none relative flex overflow-hidden rounded-md border border-slate-900/15 bg-white/60 shadow-[0_8px_18px_rgba(15,23,42,0.18)] backdrop-blur"
        style={bookStyle}
      >
        <BookPattern
          pattern={book.pattern}
          baseColor={book.baseColor}
          patternColor={book.patternColor}
        />
        <span className="absolute inset-y-3 left-1 w-1 rounded-full bg-white/70 shadow-[inset_1px_0_2px_rgba(148,163,184,0.45)]" />
      </div>
    </button>
  );
}
