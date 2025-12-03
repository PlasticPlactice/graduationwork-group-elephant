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
  const favButtonRef = useRef<HTMLButtonElement | null>(null);
  const voteButtonRef = useRef<HTMLButtonElement | null>(null);

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

  // Force inline styles with !important to override external button styles
  useEffect(() => {
    const favEl = favButtonRef.current;
    if (favEl) {
      // ensure box-sizing so border doesn't change layout
      favEl.style.setProperty("box-sizing", "border-box", "important");
      if (isFavorited) {
        favEl.style.setProperty("background-color", "#F6E05E", "important");
        favEl.style.setProperty("color", "#111827", "important");
        favEl.style.setProperty(
          "box-shadow",
          "0 6px 18px rgba(160,138,0,0.25)",
          "important"
        );
        // keep a transparent border so size doesn't shift
        favEl.style.setProperty("border", "1px solid transparent", "important");
      } else {
        favEl.style.setProperty("background-color", "#ffffff", "important");
        favEl.style.setProperty("color", "#374151", "important");
        favEl.style.setProperty("box-shadow", "none", "important");
        favEl.style.setProperty(
          "border",
          "1px solid rgba(148,163,184,0.2)",
          "important"
        );
      }
    }

    const voteEl = voteButtonRef.current;
    if (voteEl) {
      voteEl.style.setProperty("box-sizing", "border-box", "important");
      if (isVoted) {
        voteEl.style.setProperty("background-color", "#ef4444", "important");
        voteEl.style.setProperty("color", "#ffffff", "important");
        voteEl.style.setProperty(
          "box-shadow",
          "0 6px 18px rgba(220,38,38,0.25)",
          "important"
        );
        voteEl.style.setProperty(
          "border",
          "1px solid transparent",
          "important"
        );
      } else {
        voteEl.style.setProperty("background-color", "#ffffff", "important");
        voteEl.style.setProperty("color", "#374151", "important");
        voteEl.style.setProperty("box-shadow", "none", "important");
        voteEl.style.setProperty(
          "border",
          "1px solid rgba(148,163,184,0.2)",
          "important"
        );
      }
    }
  }, [isFavorited, isVoted]);

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
        ref={modalRef}
        className="relative flex w-full max-w-md flex-col rounded-3xl bg-transparent px-6 py-8 sm:max-w-lg"
        onClick={(event) => event.stopPropagation()}
        tabIndex={-1}
      >
        <button
          type="button"
          ref={closeButtonRef}
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
        <div className="relative z-10 mt-6 flex items-center justify-center gap-3">
          <button
            ref={favButtonRef}
            type="button"
            onClick={() => onToggleFavorite?.()}
            aria-pressed={isFavorited}
            style={{
              backgroundColor: isFavorited ? "#F6E05E" : "#FFFFFF",
              color: isFavorited ? "#111827" : "#374151",
            }}
            className={
              (isFavorited
                ? "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium bg-yellow-400 text-slate-900 shadow-md ring-2 ring-yellow-300"
                : "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:bg-yellow-50") +
              " transition-colors transform active:scale-95"
            }
          >
            お気に入り
          </button>
          <button
            ref={voteButtonRef}
            type="button"
            onClick={() => onToggleVote?.()}
            aria-pressed={isVoted}
            style={{
              backgroundColor: isVoted ? "#ef4444" : "#FFFFFF",
              color: isVoted ? "#FFFFFF" : "#374151",
            }}
            className={
              (isVoted
                ? "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium bg-red-600 text-white shadow-md ring-2 ring-red-300"
                : "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:bg-red-50") +
              " transition-colors transform active:scale-95"
            }
          >
            投票
          </button>
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
