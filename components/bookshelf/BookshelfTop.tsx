"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { BookshelfLayout } from "@/components/bookshelf/BookshelfLayout";
import { BOOKS, type Book } from "@/components/bookshelf/bookData";
import { BooksText } from "@/components/bookshelf/BooksText";
import { ShelfBook } from "@/components/bookshelf/ShelfBook";
import {
  ScatterArea,
  type ScatterEntry,
} from "@/components/bookshelf/ScatterArea";

const MAX_BOOKS_PER_SHELF = 8;
const MAX_SHELVES = 3;
const SHELF_SPACER_CLASS = "h-36 w-6 opacity-0";

const createEmptyShelves = () =>
  Array.from({ length: MAX_SHELVES }, () => [] as Book[]);

const createInitialScatterEntries = (): ScatterEntry[] =>
  BOOKS.map((book, idx) => ({ book, slotIndex: idx }));

type BooksState = {
  shelves: Book[][];
  scatter: ScatterEntry[];
};

type ModalState = {
  book: Book;
  mode: "scatter" | "shelf";
};

function renderShelfRow(
  books: typeof BOOKS,
  rowKey: string,
  onBookSelect?: (book: Book) => void
) {
  if (books.length === 0) return null;

  return (
    <div
      key={rowKey}
      className="flex w-full max-w-5xl items-end justify-start gap-2"
    >
      <div className={`${SHELF_SPACER_CLASS} sm:w-8`} aria-hidden="true" />
      {books.map((book, idx) => (
        <ShelfBook
          key={`${book.id}-${idx}`}
          book={book}
          heightClass="h-36"
          widthClass="w-10"
          onClick={onBookSelect ? () => onBookSelect(book) : undefined}
        />
      ))}
      <div className={`${SHELF_SPACER_CLASS} sm:w-8`} aria-hidden="true" />
    </div>
  );
}

export function BookshelfTop() {
  const [booksState, setBooksState] = useState<BooksState>(() => ({
    shelves: createEmptyShelves(),
    scatter: createInitialScatterEntries(),
  }));
  const { shelves, scatter } = booksState;
  const [modalState, setModalState] = useState<ModalState | null>(null);

  const moveScatterBookToShelf = useCallback((bookId: string) => {
    setBooksState((prevState) => {
      const entryIndex = prevState.scatter.findIndex(
        (entry) => entry.book.id === bookId
      );
      if (entryIndex === -1) {
        return prevState;
      }

      const targetShelfIndex = prevState.shelves.findIndex(
        (shelf) => shelf.length < MAX_BOOKS_PER_SHELF
      );
      if (targetShelfIndex === -1) {
        return prevState;
      }

      const entry = prevState.scatter[entryIndex];
      const updatedShelves = prevState.shelves.map((shelf, idx) =>
        idx === targetShelfIndex ? [...shelf, entry.book] : shelf
      );
      const updatedScatter = prevState.scatter.filter(
        (_, idx) => idx !== entryIndex
      );

      return {
        shelves: updatedShelves,
        scatter: updatedScatter,
      };
    });
  }, []);

  const handleScatterBookSelect = useCallback((entry: ScatterEntry) => {
    setModalState({ book: entry.book, mode: "scatter" });
  }, []);

  const handleShelfBookSelect = useCallback((book: Book) => {
    setModalState({ book, mode: "shelf" });
  }, []);

  const handleCloseReview = useCallback(() => {
    setModalState(null);
  }, []);

  const handleCompleteBook = useCallback(() => {
    if (!modalState) return;
    if (modalState.mode === "shelf") {
      setModalState(null);
      return;
    }
    const hasSpace = booksState.shelves.some(
      (shelf) => shelf.length < MAX_BOOKS_PER_SHELF
    );
    if (!hasSpace) {
      setModalState(null);
      return;
    }
    moveScatterBookToShelf(modalState.book.id);
    setModalState(null);
  }, [booksState.shelves, modalState, moveScatterBookToShelf]);

  return (
    <>
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <button
          type="button"
          className="inline-flex w-full max-w-xs items-center justify-center rounded-full border border-pink-500 bg-white px-8 py-3 text-sm font-semibold text-pink-500 shadow-md shadow-pink-100"
        >
          すべてのイベント
        </button>
        <h1 className="text-2xl font-bold text-slate-900">
          第〇回文庫Xイベント
        </h1>
      </div>
      <div className="relative mx-auto w-full max-w-md sm:max-w-4xl">
        <div className="relative h-[70vh] min-h-[620px] w-full overflow-hidden sm:h-[80vh] sm:min-h-[820px]">
          <Image
            src="/bookshelf/Hondana-haikei.png"
            alt="本棚背景"
            fill
            priority
            className="object-cover shadow-lg sm:shadow-2xl"
            sizes="100vw"
          />
          <BookshelfLayout
            className="absolute inset-0"
            shelfContents={shelves.map((books, idx) =>
              renderShelfRow(books, `shelf-${idx}`, handleShelfBookSelect)
            )}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center gap-2 text-pink-500">
        <span aria-hidden="true" className="text-4xl font-black leading-none">
          ▼
        </span>
      </div>
      <ScatterArea bookSlots={scatter} onBookSelect={handleScatterBookSelect} />
      <BooksText
        book={modalState?.book}
        open={Boolean(modalState)}
        onClose={handleCloseReview}
        onComplete={handleCompleteBook}
        actionLabel={modalState?.mode === "shelf" ? "閉じる" : undefined}
      />
    </>
  );
}
