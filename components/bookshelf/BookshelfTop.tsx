"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { BookshelfLayout } from "@/components/bookshelf/BookshelfLayout";
import { BOOKS, type Book } from "@/components/bookshelf/bookData";
import { BookReviewModal } from "@/components/bookshelf/BookReviewModal";
import { ShelfBook } from "@/components/bookshelf/ShelfBook";
import {
  ScatterArea,
  type ScatterEntry,
} from "@/components/bookshelf/ScatterArea";

const MAX_BOOKS_PER_SHELF = 8;
const MAX_SHELVES = 3;
const SHELF_SPACER_CLASS = "h-32 w-6 opacity-0 sm:h-36 lg:h-40";

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
  onBookSelect?: (book: Book) => void,
  favorites?: string[],
  votedBookId?: string | null
) {
  if (books.length === 0) return null;

  return (
    <div
      key={rowKey}
      className="flex w-full max-w-5xl items-end justify-start gap-2"
    >
      <div className={`${SHELF_SPACER_CLASS} sm:w-8`} aria-hidden="true" />
      {books.map((book, idx) => {
        let bottomColor: string | undefined = undefined;
        if (votedBookId === book.id) {
          bottomColor = "#ef4444"; // red-500
        } else if (favorites && favorites.includes(book.id)) {
          bottomColor = "#f6e05e"; // yellow-ish
        }
        return (
          <ShelfBook
            key={`${book.id}-${idx}`}
            book={book}
            heightClass="h-32 sm:h-36 lg:h-40"
            widthClass="w-9 sm:w-10 lg:w-12"
            onClick={onBookSelect ? () => onBookSelect(book) : undefined}
            bottomColor={bottomColor}
          />
        );
      })}
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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [votedBookId, setVotedBookId] = useState<string | null>(null);

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

  const toggleFavorite = useCallback((bookId: string) => {
    setFavorites((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId]
    );
  }, []);

  const toggleVote = useCallback(
    (bookId: string) => {
      if (votedBookId !== null) {
        // already voted today
        window.alert("本日の投票は終了しました。(１日１票のみ)");
        return false;
      }
      setVotedBookId(bookId);
      return true;
    },
    [votedBookId]
  );

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
      // notify the user that there's no space instead of silently closing
      window.alert("本棚に空きがありません。");
      return;
    }
    moveScatterBookToShelf(modalState.book.id);
    setModalState(null);
  }, [booksState.shelves, modalState, moveScatterBookToShelf]);

  return (
    <>
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          第〇回文庫Xイベント
        </h1>
      </div>
      <div className="relative mx-auto w-full max-w-md sm:max-w-4xl">
        <div className="relative h-[70vh] w-full overflow-hidden">
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
              renderShelfRow(
                books,
                `shelf-${idx}`,
                handleShelfBookSelect,
                favorites,
                votedBookId
              )
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
      <BookReviewModal
        book={modalState?.book}
        open={Boolean(modalState)}
        onClose={handleCloseReview}
        onComplete={handleCompleteBook}
        actionLabel={modalState?.mode === "shelf" ? "閉じる" : undefined}
        isFavorited={
          modalState ? favorites.includes(modalState.book.id) : false
        }
        isVoted={modalState ? votedBookId === modalState.book.id : false}
        onToggleFavorite={() =>
          modalState && toggleFavorite(modalState.book.id)
        }
        onToggleVote={() => {
          if (!modalState) return;
          const voted = toggleVote(modalState.book.id);
          if (voted) {
            handleCompleteBook();
          }
        }}
      />
    </>
  );
}
