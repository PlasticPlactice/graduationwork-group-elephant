"use client";

import type { Book } from "@/components/bookshelf/bookData";

type BooksTextProps = {
  book?: Book | null;
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  actionLabel?: string;
};

export function BooksText({
  book,
  open,
  onClose,
  onComplete,
  actionLabel = "本棚にしまう",
}: BooksTextProps) {
  if (!open || !book) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label={`${book.id} の書評`}
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-md flex-col rounded-3xl bg-transparent px-6 py-8 sm:max-w-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 -top-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl text-slate-500 shadow-md transition hover:bg-slate-50"
          aria-label="閉じる"
        >
          ×
        </button>
        <div className="relative z-10">
          <div className="h-[600px] overflow-y-auto bg-white px-6 py-6 text-base leading-relaxed text-slate-800 sm:h-[680px]">
            {book.review ?? "書評がまだ登録されていません。"}
          </div>
        </div>
        <div className="relative z-10 mt-6 flex justify-center">
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex w-full max-w-xs items-center justify-center rounded-full bg-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-200 transition hover:bg-pink-600"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
