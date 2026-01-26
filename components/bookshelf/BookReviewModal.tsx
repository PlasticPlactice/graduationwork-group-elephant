"use client";

import { useEffect, useRef, type CSSProperties, type Ref } from "react";
import type { Book } from "@/components/bookshelf/bookData";
import styles from "@/components/bookshelf/BookReviewModal.module.css";

type BookReviewModalProps = {
  book?: Book | null;
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  actionLabel?: string;
  isFavorited?: boolean;
  isVoted?: boolean;
  onToggleFavorite?: () => void;
  onToggleVote?: () => void;
  actionButtonRef?: Ref<HTMLButtonElement>;
  voteButtonRef?: Ref<HTMLButtonElement>;
};

export function BookReviewModal({
  book,
  open,
  onClose,
  onComplete,
  actionLabel = "本棚にしまう",
  isFavorited = false,
  isVoted = false,
  onToggleFavorite,
  onToggleVote,
  actionButtonRef,
  voteButtonRef,
}: BookReviewModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previousActiveElementRef.current =
      document.activeElement as HTMLElement | null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTarget = closeButtonRef.current ?? modalRef.current;
    focusTarget?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        const container = modalRef.current;
        if (!container) return;

        const selectors =
          'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"]), [contenteditable]';
        const nodes = Array.from(
          container.querySelectorAll<HTMLElement>(selectors)
        ).filter(
          (el) => el.offsetParent !== null || el === closeButtonRef.current
        );
        if (nodes.length === 0) return;

        const currentIndex = nodes.indexOf(
          document.activeElement as HTMLElement
        );
        const lastIndex = nodes.length - 1;

        if (!e.shiftKey) {
          const nextIndex =
            currentIndex === -1 || currentIndex === lastIndex
              ? 0
              : currentIndex + 1;
          nodes[nextIndex].focus();
          e.preventDefault();
        } else {
          const prevIndex = currentIndex <= 0 ? lastIndex : currentIndex - 1;
          nodes[prevIndex].focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElementRef.current?.focus();
    };
  }, [open, onClose]);

  const voteButtonClass = `flex h-14 min-h-[3.5rem] flex-1 items-center justify-center gap-3 rounded-full border border-solid text-base font-bold tracking-wide transition-transform duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-200 appearance-none shadow-none ${
    isVoted
      ? "!bg-red-500 !text-white !border-red-500 ![box-shadow:0_10px_24px_rgba(239,68,68,0.3)]"
      : "!bg-red-50 !text-red-600 !border-red-400 ![box-shadow:0_10px_20px_rgba(239,68,68,0.18)]"
  }`;

  const favoriteButtonClass = `flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-100 appearance-none !bg-transparent !shadow-none !p-0 !border-yellow-300 ${
    isFavorited ? "!text-yellow-400" : "!text-gray-400"
  }`;

  if (!open || !book) {
    return null;
  }

  const handleVoteClick = () => {
    if (!onToggleVote) return;
    const confirmed = window.confirm("1日1票ですが投票しますか？");
    if (confirmed) {
      onToggleVote();
    }
  };

  const coverStyle = {
    "--book-cover-color": book.baseColor,
    "--book-cover-accent": book.patternColor ?? book.baseColor,
  } as CSSProperties;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label={`${book.id} の書評`}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative flex h-[90vh] w-full max-w-md flex-col sm:max-w-lg"
        onClick={(event) => event.stopPropagation()}
        tabIndex={-1}
      >
        <div className={styles.bookOpen} style={coverStyle}>
          <div className={styles.bookOpenCover} aria-hidden="true" />
          <div className={styles.bookOpenEdge} aria-hidden="true" />
          <div className={styles.bookOpenContent}>
            <div className="relative z-10 flex h-full flex-col px-4 py-8 sm:px-6">
              <div className="flex-1 overflow-y-auto rounded-2xl bg-white/90 px-4 py-6 text-base leading-relaxed text-slate-800 sm:px-6">
                {book.review ?? "書評がまだ登録されていません。"}
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleVoteClick}
                    aria-pressed={isVoted}
                    ref={voteButtonRef}
                    className={voteButtonClass}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 14l2 2 4-4m6 2a9 9 0 1 1 -18 0 9 9 0 0 1 18 0z"
                      />
                    </svg>
                    <span>{isVoted ? "投票済み" : "投票する"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleFavorite?.()}
                    className={favoriteButtonClass}
                    aria-pressed={isFavorited}
                    aria-label={
                      isFavorited
                        ? "ブックマーク済み"
                        : "ブックマークに追加"
                    }
                    style={{ borderColor: "#f6e05e" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 sm:h-9 sm:w-9"
                      fill={isFavorited ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 5v16l7-5 7 5V5a2 2 0 00-2-2H7a2 2 0 00-2 2z"
                      />
                    </svg>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onComplete}
                  ref={actionButtonRef}
                  className="w-full rounded-full bg-gray-900 px-4 py-3 text-center text-sm font-semibold text-white shadow transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-gray-400/40"
                >
                  {actionLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
