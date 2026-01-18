"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

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
const TUTORIAL_STORAGE_KEY = "bookshelf_tutorial_done_v2";

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
          bottomColor = "#ef4444";
        } else if (favorites && favorites.includes(book.id)) {
          bottomColor = "#f6e05e";
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

type TutorialOverlayProps = {
  targetRef: RefObject<HTMLElement>;
  message: string;
  showNext?: boolean;
  nextLabel?: string;
  preferPlacement?: "top" | "bottom";
  onNext?: () => void;
};

function TutorialOverlay({
  targetRef,
  message,
  showNext = false,
  nextLabel = "次へ",
  preferPlacement,
  onNext,
}: TutorialOverlayProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const updateRect = useCallback(() => {
    const target = targetRef.current;
    if (!target) {
      setRect(null);
      return;
    }
    setRect(target.getBoundingClientRect());
  }, [targetRef]);

  useEffect(() => {
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [updateRect]);

  useEffect(() => {
    if (rect) return;
    let frameId: number;
    const tick = () => {
      updateRect();
      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [rect, updateRect]);

  if (!rect) return null;

  const padding = 10;
  const highlightTop = Math.max(rect.top - padding, 0);
  const highlightLeft = Math.max(rect.left - padding, 0);
  const highlightWidth = rect.width + padding * 2;
  const highlightHeight = rect.height + padding * 2;
  const highlightRight = highlightLeft + highlightWidth;
  const highlightBottom = highlightTop + highlightHeight;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const tooltipWidth = 280;
  const tooltipGap = 12;
  const canPlaceBelow = highlightBottom + 140 < viewportHeight;
  const placeBelow =
    preferPlacement === "bottom"
      ? true
      : preferPlacement === "top"
        ? false
        : canPlaceBelow;
  const tooltipLeft = Math.min(
    Math.max(rect.left + rect.width / 2, 12 + tooltipWidth / 2),
    viewportWidth - 12 - tooltipWidth / 2
  );
  const rawTooltipTop = placeBelow
    ? highlightBottom + tooltipGap
    : highlightTop - tooltipGap;
  const tooltipTop = Math.min(
    Math.max(rawTooltipTop, 12),
    viewportHeight - 12
  );
  const tooltipTransform = placeBelow
    ? "translateX(-50%)"
    : "translate(-50%, -100%)";

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none">
      <div
        className="fixed bg-black/60 pointer-events-auto"
        style={{ top: 0, left: 0, right: 0, height: highlightTop }}
      />
      <div
        className="fixed bg-black/60 pointer-events-auto"
        style={{
          top: highlightTop,
          left: 0,
          width: highlightLeft,
          height: highlightHeight,
        }}
      />
      <div
        className="fixed bg-black/60 pointer-events-auto"
        style={{
          top: highlightTop,
          left: highlightRight,
          right: 0,
          height: highlightHeight,
        }}
      />
      <div
        className="fixed bg-black/60 pointer-events-auto"
        style={{ top: highlightBottom, left: 0, right: 0, bottom: 0 }}
      />

      <div
        className="fixed pointer-events-none rounded-3xl border-2 border-white/90 shadow-[0_0_0_1px_rgba(255,255,255,0.2)]"
        style={{
          top: highlightTop,
          left: highlightLeft,
          width: highlightWidth,
          height: highlightHeight,
        }}
      />

      <div
        className="fixed pointer-events-auto w-[280px] rounded-2xl bg-white px-4 py-3 text-base text-slate-800 shadow-lg"
        style={{
          top: tooltipTop,
          left: tooltipLeft,
          transform: tooltipTransform,
        }}
      >
        <p className="leading-relaxed">{message}</p>
        {showNext ? (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={onNext}
              className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white"
            >
              {nextLabel}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function BookshelfTop() {
  const shelfTopRef = useRef<HTMLDivElement | null>(null);
  const scatterTopRef = useRef<HTMLDivElement | null>(null);
  const shelfAreaRef = useRef<HTMLDivElement | null>(null);
  const scatterAreaRef = useRef<HTMLDivElement | null>(null);
  const actionButtonRef = useRef<HTMLButtonElement | null>(null);
  const voteButtonRef = useRef<HTMLButtonElement | null>(null);
  const scatterBookRef = useRef<HTMLElement | null>(null);

  const [booksState, setBooksState] = useState<BooksState>(() => ({
    shelves: createEmptyShelves(),
    scatter: createInitialScatterEntries(),
  }));
  const { shelves, scatter } = booksState;
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [votedBookId, setVotedBookId] = useState<string | null>(null);
  const [tutorialStep, setTutorialStep] = useState<1 | 2 | 3 | 4 | null>(null);
  const [tutorialBookId, setTutorialBookId] = useState<string | null>(null);

  useEffect(() => {
    const done = window.localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!done) {
      setTutorialStep(1);
    }
  }, []);

  useEffect(() => {
    if (tutorialStep !== 4) return;
    if (modalState || !tutorialBookId) return;
    const targetBook = BOOKS.find((book) => book.id === tutorialBookId);
    if (targetBook) {
      setModalState({ book: targetBook, mode: "shelf" });
    }
  }, [modalState, tutorialBookId, tutorialStep]);

  useEffect(() => {
    if (tutorialStep !== 1) return;
    let active = true;
    const findTarget = () => {
      if (!active) return;
      const container = scatterAreaRef.current;
      const target =
        container?.querySelector<HTMLElement>("[data-book-id]") ?? null;
      if (target) {
        scatterBookRef.current = target;
        return;
      }
      window.requestAnimationFrame(findTarget);
    };
    findTarget();
    return () => {
      active = false;
    };
  }, [tutorialStep]);

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

  const handleScatterBookSelect = useCallback(
    (entry: ScatterEntry) => {
      if (tutorialStep === 1) {
        setTutorialBookId(entry.book.id);
        setTutorialStep(2);
      }
      setModalState({ book: entry.book, mode: "scatter" });
    },
    [tutorialStep]
  );

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
        window.alert("本日の投票は終了しました。明日また投票してください。");
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
    const completedBookId = modalState.book.id;
    if (modalState.mode === "shelf") {
      setModalState(null);
      return;
    }
    const hasSpace = booksState.shelves.some(
      (shelf) => shelf.length < MAX_BOOKS_PER_SHELF
    );
    if (!hasSpace) {
      window.alert("本棚に空きがありません。");
      return;
    }
    moveScatterBookToShelf(modalState.book.id);
    setModalState(null);
    if (tutorialStep === 2) {
      setTutorialBookId(completedBookId);
      setTutorialStep(3);
    }
  }, [booksState.shelves, modalState, moveScatterBookToShelf, tutorialStep]);

  const scrollToScatter = useCallback(() => {
    const target = scatterTopRef.current;
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY + 30;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const scrollToShelf = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const completeTutorial = useCallback(() => {
    window.localStorage.setItem(TUTORIAL_STORAGE_KEY, "1");
    setTutorialStep(null);
    setModalState(null);
    scrollToScatter();
  }, [scrollToScatter]);

  useEffect(() => {
    if (tutorialStep === 1) {
      scrollToScatter();
    }
    if (tutorialStep === 3) {
      scrollToShelf();
    }
  }, [scrollToScatter, scrollToShelf, tutorialStep]);

  const actionLabel = modalState?.mode === "shelf" ? "閉じる" : "本棚にしまう";

  return (
    <>

      <div className="mb-6 flex flex-col items-center gap-3 text-center px-4">
        <div className="w-full max-w-sm">
          <Link href="/event">
            <button
              type="button"
              className="w-full bg-white border font-bold h-auto rounded-lg shadow hover:bg-slate-50 transition-colors"
              style={{ padding: "12px 0" }}
            >
              すべてのイベント
            </button>
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          第〇回文庫Xイベント
        </h1>

      </div>
      <div
        ref={shelfAreaRef}
        className="relative mx-auto w-full max-w-md sm:max-w-4xl"
      >
        <div className="relative h-[73vh] w-full overflow-hidden">
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
        <button
          type="button"
          onClick={scrollToScatter}
          aria-label="下の本へ移動"
          className="leading-none"
        >
          <span aria-hidden="true" className="text-4xl font-black leading-none">
            ▼
          </span>
        </button>
      </div>
      <div ref={scatterTopRef} />
      <ScatterArea
        className="mt-0"
        bookSlots={scatter}
        onBookSelect={handleScatterBookSelect}
        onBackToShelf={scrollToShelf}
        containerRef={scatterAreaRef}
      />
      <BookReviewModal
        book={modalState?.book}
        open={Boolean(modalState)}
        onClose={handleCloseReview}
        onComplete={handleCompleteBook}
        actionLabel={actionLabel}
        isFavorited={
          modalState ? favorites.includes(modalState.book.id) : false
        }
        isVoted={modalState ? votedBookId === modalState.book.id : false}
        actionButtonRef={actionButtonRef}
        voteButtonRef={voteButtonRef}
        onToggleFavorite={() =>
          modalState && toggleFavorite(modalState.book.id)
        }
        onToggleVote={() => {
          if (!modalState) return;
          const voted = toggleVote(modalState.book.id);
          if (voted && tutorialStep !== 4) {
            handleCompleteBook();
          }
        }}
      />
      {tutorialStep === 1 ? (
        <TutorialOverlay
          targetRef={scatterBookRef as RefObject<HTMLElement>}
          message="下の本をタップしてください。"
          preferPlacement="bottom"
        />
      ) : null}
      {tutorialStep === 2 ? (
        <TutorialOverlay
          targetRef={actionButtonRef as RefObject<HTMLElement>}
          message="本棚にしまうボタンを押してください。"
        />
      ) : null}
      {tutorialStep === 3 ? (
        <TutorialOverlay
          targetRef={shelfAreaRef as RefObject<HTMLElement>}
          message="本棚にしまわれました。次は投票の説明です。"
          showNext
          onNext={() => setTutorialStep(4)}
        />
      ) : null}
      {tutorialStep === 4 ? (
        <TutorialOverlay
          targetRef={voteButtonRef as RefObject<HTMLElement>}
          message="ここから投票できます。"
          showNext
          nextLabel="完了"
          onNext={completeTutorial}
        />
      ) : null}
    </>
  );
}
