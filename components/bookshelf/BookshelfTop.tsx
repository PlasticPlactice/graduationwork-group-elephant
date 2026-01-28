"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo, // ★追加
  type RefObject,
} from "react";

import { BookshelfLayout } from "@/components/bookshelf/BookshelfLayout";
import { type Book } from "@/components/bookshelf/bookData";
import { BookReviewModal } from "@/components/bookshelf/BookReviewModal";
import { ShelfBook } from "@/components/bookshelf/ShelfBook";
import {
  ScatterArea,
  type ScatterEntry,
} from "@/components/bookshelf/ScatterArea";
import Modal from "@/app/(app)/Modal";

const MOBILE_MAX_BOOKS_PER_SHELF = 8;
const DESKTOP_MAX_BOOKS_PER_SHELF = 15;
const MAX_SHELVES = 3;
const TUTORIAL_STORAGE_KEY = "bookshelf_tutorial_done_v2";
const EVENT_INFO_STORAGE_KEY = "bookshelf_event_info_seen_v1";

// ★削除: ここにあった const BOOK_INDEX_BY_ID = ... は削除します。
// reviewsが来るまでIDが分からないため、コンポーネント内部で計算します。

const createEmptyShelves = () =>
  Array.from({ length: MAX_SHELVES }, () => [] as Book[]);

const createInitialScatterEntries = (reviews: Book[]): ScatterEntry[] =>
  reviews.map((book, idx) => ({ book, slotIndex: idx }));

type BooksState = {
  shelves: Book[][];
  scatter: ScatterEntry[];
};

type ModalState = {
  book: Book;
  mode: "scatter" | "shelf";
};

type Props = {
  reviews: Book[];
};

function renderShelfRow(
  books: Book[], // ★修正: typeof BOOKS から Book[] に変更
  rowKey: string,
  maxBooksPerShelf: number,
  onBookSelect?: (book: Book) => void,
  favorites?: string[],
  votedBookId?: string | null
) {
  if (books.length === 0) return null;
  return (
    <div
      key={rowKey}
      className="flex w-full max-w-6xl items-end justify-start gap-2 pl-10 pr-6 sm:gap-2 sm:pl-12 sm:pr-8 lg:gap-3 lg:pl-[6.5rem] lg:pr-10"
    >
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
    </div>
  );
}

// ... (TutorialOverlay コンポーネントは変更なしなので省略可。そのまま残してください) ...
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
    // ... (TutorialOverlayの中身は変更なし) ...
    // 元のコードのままでOKです
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
        viewportWidth - 12 - tooltipWidth / 2,
    );
    const rawTooltipTop = placeBelow
        ? highlightBottom + tooltipGap
        : highlightTop - tooltipGap;
    const tooltipTop = Math.min(Math.max(rawTooltipTop, 12), viewportHeight - 12);
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
// ... TutorialOverlayここまで ...

export function BookshelfTop({ reviews }: Props) {
  const shelfTopRef = useRef<HTMLDivElement | null>(null);
  const scatterTopRef = useRef<HTMLDivElement | null>(null);
  const shelfAreaRef = useRef<HTMLDivElement | null>(null);
  const scatterAreaRef = useRef<HTMLDivElement | null>(null);
  const actionButtonRef = useRef<HTMLButtonElement | null>(null);
  const voteButtonRef = useRef<HTMLButtonElement | null>(null);
  const scatterBookRef = useRef<HTMLElement | null>(null);

  const [maxBooksPerShelf, setMaxBooksPerShelf] = useState(
    MOBILE_MAX_BOOKS_PER_SHELF
  );

  // ★追加: reviewsからIDマップを動的に生成
  const bookIndexById = useMemo(() => {
    return new Map(reviews.map((book, index) => [book.id, index]));
  }, [reviews]);

  const [booksState, setBooksState] = useState<BooksState>(() => ({
    shelves: createEmptyShelves(),
    scatter: createInitialScatterEntries(reviews),
  }));
  const { shelves, scatter } = booksState;
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [votedBookId, setVotedBookId] = useState<string | null>(null);
  const [tutorialStep, setTutorialStep] = useState<0 | 1 | 2 | 3 | 4 | null>(
    null
  );
  const [tutorialBookId, setTutorialBookId] = useState<string | null>(null);
  const [isEventInfoOpen, setIsEventInfoOpen] = useState(false);
  const [isScatterView, setIsScatterView] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const seenEventInfo = window.localStorage.getItem(EVENT_INFO_STORAGE_KEY);
    if (!seenEventInfo) {
      window.localStorage.setItem(EVENT_INFO_STORAGE_KEY, "1");
      setIsEventInfoOpen(true);
      return;
    }
    const done = window.localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!done) {
      setTutorialStep(0);
    }
  }, []);

  useEffect(() => {
    const updateButtonState = () => {
      const target = scatterTopRef.current;
      if (!target) return;
      const threshold =
        target.getBoundingClientRect().top + window.scrollY - 120;
      setIsScatterView(window.scrollY >= threshold);
    };
    updateButtonState();
    window.addEventListener("scroll", updateButtonState, { passive: true });
    window.addEventListener("resize", updateButtonState);
    return () => {
      window.removeEventListener("scroll", updateButtonState);
      window.removeEventListener("resize", updateButtonState);
    };
  }, []);

  useEffect(() => {
    const updateMax = () => {
      const nextIsDesktop = window.innerWidth >= 1024;
      setIsDesktop(nextIsDesktop);
      setMaxBooksPerShelf(
        nextIsDesktop
          ? DESKTOP_MAX_BOOKS_PER_SHELF
          : MOBILE_MAX_BOOKS_PER_SHELF
      );
    };
    updateMax();
    window.addEventListener("resize", updateMax);
    return () => window.removeEventListener("resize", updateMax);
  }, []);

  // ★修正: shelvesとscatterの割り振りを計算するEffect
  useEffect(() => {
    setBooksState((prevState) => {
      const shelfBooks = prevState.shelves.flat();
      const scatterById = new Map(
        prevState.scatter.map((entry) => [entry.book.id, entry])
      );
      const nextShelves = createEmptyShelves();
      let shelfCursor = 0;
      let positionInShelf = 0;
      for (const book of shelfBooks) {
        if (shelfCursor >= MAX_SHELVES) break;
        if (positionInShelf >= maxBooksPerShelf) {
          shelfCursor += 1;
          positionInShelf = 0;
        }
        if (shelfCursor >= MAX_SHELVES) break;
        nextShelves[shelfCursor].push(book);
        positionInShelf += 1;
      }

      const shelfBookIds = new Set(
        nextShelves.flat().map((book) => book.id)
      );
      const nextScatter: ScatterEntry[] = [];
      for (const entry of prevState.scatter) {
        if (!shelfBookIds.has(entry.book.id)) {
          nextScatter.push(entry);
        }
      }

      for (const book of shelfBooks) {
        if (shelfBookIds.has(book.id)) continue;
        
        // ★修正: グローバルの BOOK_INDEX_BY_ID ではなく、ローカルの bookIndexById を使用
        const slotIndex = bookIndexById.get(book.id);
        
        if (slotIndex === undefined) continue;
        if (!scatterById.has(book.id)) {
          nextScatter.push({ book, slotIndex });
        }
      }

      return {
        shelves: nextShelves,
        scatter: nextScatter,
      };
    });
  }, [maxBooksPerShelf, bookIndexById]); // ★依存配列に bookIndexById を追加

  useEffect(() => {
    if (tutorialStep !== 4) return;
    if (modalState || !tutorialBookId) return;
    
    // ★修正: BOOKS.find ではなく reviews.find を使用
    const targetBook = reviews.find((book) => book.id === tutorialBookId);
    
    if (targetBook) {
      setModalState({ book: targetBook, mode: "shelf" });
    }
  }, [modalState, tutorialBookId, tutorialStep, reviews]); // ★依存配列に reviews を追加

  // ... (以下変更なし) ...

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

  const moveScatterBookToShelf = useCallback(
    (bookId: string) => {
      setBooksState((prevState) => {
        const entryIndex = prevState.scatter.findIndex(
          (entry) => entry.book.id === bookId
        );
        if (entryIndex === -1) {
          return prevState;
        }

        const targetShelfIndex = prevState.shelves.findIndex(
          (shelf) => shelf.length < maxBooksPerShelf
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
    },
    [maxBooksPerShelf]
  );

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

  const handleCloseEventInfo = useCallback(() => {
    setIsEventInfoOpen(false);
    const done = window.localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!done && tutorialStep === null) {
      setTutorialStep(0);
    }
  }, [tutorialStep]);

  const handleCompleteBook = useCallback(() => {
    if (!modalState) return;
    const completedBookId = modalState.book.id;
    if (modalState.mode === "shelf") {
      setModalState(null);
      return;
    }
    const hasSpace = booksState.shelves.some(
      (shelf) => shelf.length < maxBooksPerShelf
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
  }, [
    booksState.shelves,
    maxBooksPerShelf,
    modalState,
    moveScatterBookToShelf,
    tutorialStep,
  ]);

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
    setBooksState({
      shelves: createEmptyShelves(),
      scatter: createInitialScatterEntries(reviews), // ★ここは既にreviewsになっているのでOK
    });
    scrollToScatter();
  }, [scrollToScatter, reviews]); // ★依存配列にreviews追加

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
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">
            第〇回文庫Xイベント
          </h1>
          <button
            type="button"
            onClick={() => setIsEventInfoOpen(true)}
            aria-label="文庫Xイベントの説明を表示"
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-pink-400 bg-white text-sm font-black text-pink-500 shadow-sm transition hover:-translate-y-0.5 hover:bg-pink-50 hover:text-pink-600"
          >
            ?
          </button>
        </div>
      </div>
      <div
        ref={shelfAreaRef}
        className="relative mx-auto w-full max-w-md sm:max-w-4xl lg:max-w-6xl"
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
                maxBooksPerShelf,
                handleShelfBookSelect,
                favorites,
                votedBookId
              )
            )}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center gap-2 text-pink-500 lg:hidden">
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
      <div className="fixed bottom-6 right-6 z-40 hidden lg:flex flex-col items-center gap-2 text-pink-500">
        {isScatterView ? (
          <button
            type="button"
            onClick={scrollToShelf}
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
          <button
            type="button"
            onClick={scrollToScatter}
            aria-label="下の本へ移動"
            className="leading-none"
          >
            <span
              aria-hidden="true"
              className="text-4xl font-black leading-none"
            >
              ▼
            </span>
          </button>
        )}
      </div>
      <div ref={scatterTopRef} />
       <ScatterArea
        className="mt-0"
        books={scatter.map((entry) => entry.book)} // scatter状態にある本だけを渡す
        onBookSelect={handleScatterBookSelect}
        onBackToShelf={scrollToShelf}
        isDesktop={isDesktop}
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
      
      {/* チュートリアルやModal部分は変更なしのため省略 */}
      {!isEventInfoOpen && tutorialStep === 0 ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="チュートリアル開始"
        >
            {/* ... 中略 ... */}
            <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center text-slate-900 shadow-xl">
            <p className="text-base font-bold text-pink-500">
              チュートリアルを開始します
            </p>
            <p className="mt-2 text-sm text-slate-600">
              画面のガイドに沿って操作してください。
            </p>
            <button
              type="button"
              onClick={() => setTutorialStep(1)}
              className="mt-5 rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-pink-600"
            >
              はじめる
            </button>
            <button
              type="button"
              onClick={() => {
                window.localStorage.setItem(TUTORIAL_STORAGE_KEY, "1");
                setTutorialStep(null);
              }}
              className="absolute bottom-3 right-4 text-xs font-semibold text-slate-400 transition hover:text-pink-500"
            >
              スキップ
            </button>
          </div>
        </div>
      ) : null}
      
      {/* ... 以降のTutorialOverlayやModalはそのまま ... */}
      {!isEventInfoOpen && tutorialStep === 1 ? (
        <TutorialOverlay
          targetRef={scatterBookRef as RefObject<HTMLElement>}
          message="下の本をタップしてください。"
          preferPlacement="bottom"
        />
      ) : null}
      {!isEventInfoOpen && tutorialStep === 2 ? (
        <TutorialOverlay
          targetRef={actionButtonRef as RefObject<HTMLElement>}
          message="本棚にしまうボタンを押してください。"
        />
      ) : null}
      {!isEventInfoOpen && tutorialStep === 3 ? (
        <TutorialOverlay
          targetRef={shelfAreaRef as RefObject<HTMLElement>}
          message="本棚にしまわれました。次は投票の説明です。"
          showNext
          onNext={() => setTutorialStep(4)}
        />
      ) : null}
      {!isEventInfoOpen && tutorialStep === 4 ? (
        <TutorialOverlay
          targetRef={voteButtonRef as RefObject<HTMLElement>}
          message="ここから投票できます。"
          showNext
          nextLabel="完了"
          onNext={completeTutorial}
        />
      ) : null}
      <Modal open={isEventInfoOpen} onClose={handleCloseEventInfo}>
        {/* ... イベント説明の中身 ... */}
         <div className="relative overflow-hidden rounded-2xl border-2 border-pink-200 bg-gradient-to-br from-amber-50 via-pink-50 to-sky-50 p-6 text-left text-slate-900 shadow-xl">
          <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-amber-200/60" />
          <div className="absolute -bottom-12 -left-12 h-28 w-28 rounded-full bg-sky-200/60" />
          <div className="relative">
            <h2 className="text-lg font-black text-pink-500">
              文庫Xイベントについて
            </h2>
            <p className="mt-3 text-sm font-semibold text-slate-700">
              本を買って、書いて、投票でつながる読書イベント！
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li className="flex gap-2">
                <span className="font-bold text-pink-500">1.</span>
                <span>本を買って書評を投稿する。</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-pink-500">2.</span>
                <span>ユーザーが投票してくれる。</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-pink-500">3.</span>
                <span>
                  票が多かった書評が、実際に本のカバーとして文庫Xで販売されます。
                </span>
              </li>
            </ul>
            <div className="mt-4 rounded-xl bg-white/80 px-4 py-3 text-xs font-semibold text-pink-600 shadow-sm">
              あなたの言葉が本の顔になるかも！
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleCloseEventInfo();
              }}
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-500 transition hover:border-pink-300 hover:text-pink-500"
            >
              閉じる
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
