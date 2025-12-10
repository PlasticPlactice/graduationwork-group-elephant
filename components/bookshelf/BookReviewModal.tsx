"use client";

import { useEffect, useRef } from "react";
import type { Book } from "@/components/bookshelf/bookData";

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
}: BookReviewModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    // save previously focused element to restore later
    previousActiveElementRef.current =
      document.activeElement as HTMLElement | null;

    // lock body scroll
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // focus the close button (or modal container) when opened
    const focusTarget = closeButtonRef.current ?? modalRef.current;
    focusTarget?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        // focus trap: keep focus inside modal
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
          // Tab
          const nextIndex =
            currentIndex === -1 || currentIndex === lastIndex
              ? 0
              : currentIndex + 1;
          nodes[nextIndex].focus();
          e.preventDefault();
        } else {
          // Shift + Tab
          const prevIndex = currentIndex <= 0 ? lastIndex : currentIndex - 1;
          nodes[prevIndex].focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      // restore body scroll and focus
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElementRef.current?.focus();
    };
  }, [open, onClose]);

  const voteButtonClass = `flex h-14 min-h-[3.5rem] flex-1 items-center justify-center gap-3 rounded-full border border-solid text-base font-bold tracking-wide transition-transform duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-200 appearance-none shadow-none ${
    isVoted
      ? "!bg-red-500 !text-white !border-red-500 ![box-shadow:0_10px_24px_rgba(239,68,68,0.3)]"
      : "!bg-white !text-red-500 !border-[rgba(239,68,68,0.3)] !shadow-none"
  }`;

  const favoriteButtonClass = `flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-100 appearance-none !bg-transparent !shadow-none !p-0 !border-yellow-300 ${
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
        className="relative flex w-full max-w-md flex-col rounded-3xl bg-transparent px-6 py-8 sm:max-w-lg"
        onClick={(event) => event.stopPropagation()}
        tabIndex={-1}
      >
        <div className="relative z-10">
          <div className="h-[600px] overflow-y-auto bg-white px-6 py-6 text-base leading-relaxed text-slate-800 sm:h-[680px]">
            {book.review ?? "書評がまだ登録されていません。"}
          </div>
        </div>

        <div className="relative z-10 mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleVoteClick}
                aria-pressed={isVoted}
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
                    d="M9 14l2 2 4-4m6 2a9 9 0 11-18 0 9 0 0118 0z"
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
                  isFavorited ? "ブックマーク済み" : "ブックマークに追加"
                }
                style={{ borderColor: "#f6e05e" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onComplete}
                className="flex-[0.7] rounded-full bg-gray-900 px-4 py-3 text-center text-sm font-semibold text-white shadow transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-gray-400/40"
              >
                {actionLabel}
              </button>

              <button
                type="button"
                ref={closeButtonRef}
                onClick={onClose}
                className="flex-[0.3] rounded-full border !border-gray-300 !bg-gray-100 px-4 py-3 text-sm font-semibold !text-gray-700 transition hover:!bg-gray-200 focus:outline-none focus-visible:ring-4 !focus-visible:ring-gray-200"
                style={{ boxShadow: "none" }}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
