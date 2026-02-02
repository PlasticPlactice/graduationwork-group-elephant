"use client";

import { useState } from "react";
import { useEffect, useRef, type CSSProperties, type Ref } from "react";
import type { Book, Reactions, BookReviewReactions } from "@/components/bookshelf/bookData";
import BookReviewVoteButton from "./BookReviewVoteButton";
import styles from "@/components/bookshelf/BookReviewModal.module.css";

const REACTION_TYPES = [
  { id: "1", label: "いいね" },
  { id: "2", label: "感動" },
  { id: "3", label: "学び" },
  { id: "4", label: "共感" },
]

type BookReviewModalProps = {
  book?: Book | null;
  reactions?: Reactions[];
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
  onVoteChange?: (isVoted: boolean) => void;
};

type afterCheckedData = {
  reaction_id: number;
  count: number;
  is_reacted: boolean;
}

export function BookReviewModal({
  book,
  reactions,
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
  onVoteChange
}: BookReviewModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const [bookReviewReactions, setBookReviewReactions] = useState<BookReviewReactions | null>(null);
  const [afterCheckedData, setAfterCheckedData] = useState<afterCheckedData[]>([]);

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

  const favoriteButtonClass = `flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-100 appearance-none !bg-transparent !shadow-none !p-0 !border-yellow-300 ${
    isFavorited ? "!text-yellow-400" : "!text-gray-400"
  }`;

  useEffect(() => {
    if (!book?.user_id || !book?.id) return;

    setBookReviewReactions({
      user_id: book.user_id,
      book_review_id: book.id,
      reaction_id: "",
    });
  }, [book]);

  // リアクションがすでにあるか確認する + 数をもらう
  const checkReactionStatus = async () => {
    const newReactionsData = {
      ...bookReviewReactions,
    };

    try {
      const res = await fetch("http://localhost:3000/api/viewer/reaction/status", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newReactionsData)
      });

      const apiResponse = await res.json();

      setAfterCheckedData(apiResponse)
    } catch(e) {
      console.error("通信に失敗しました。");
    }
  }

  // bookReviewReactionsにデータが入ったのを確認したらリアクションの数を取得してもらう
  useEffect(() => {
    if(!bookReviewReactions?.user_id || !bookReviewReactions?.book_review_id ) return;

    checkReactionStatus();
  }, [bookReviewReactions?.book_review_id, bookReviewReactions?.user_id]);


  // リアクション関数
  const createReaction = async (reaction_id: string) => {
    const newReactionsData = {
      ...bookReviewReactions,
      reaction_id: reaction_id
    };

    setBookReviewReactions(newReactionsData);

    try {
      const res = await fetch("http://localhost:3000/api/viewer/reaction", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newReactionsData),
      });

      if(!res.ok) {
        alert("登録に失敗しました。");
        return;
      }

    } catch(e) {
      alert("通信に失敗しました。")
    }

    // カウント＋データが入っているか確認する関数を実行し、情報を更新する
    try {
      const res = await fetch("http://localhost:3000/api/viewer/reaction/status", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newReactionsData)
      });

      const afterCheckedData = await res.json();
    } catch(e) {
      console.error("通信に失敗しました。");
    }

  };

  const handleReactionClick = async (clickedReactionId: string) => { // IDを受け取る
  
    // ★重要: ここでAPIを待たずに、見た目だけ先に更新しちゃう！(Optimistic Update)
    setAfterCheckedData((prevData) => {
      // データの中に、今回押したIDがあるか探す
      const exists = prevData.find(d => String(d.reaction_id) === String(clickedReactionId));

      if (exists) {
        // ■ パターンA: すでにデータがある場合 (カウントを増減させる)
        return prevData.map((d) => {
          if (String(d.reaction_id) === String(clickedReactionId)) {
            const nextIsReacted = !d.is_reacted; // trueならfalseへ、falseならtrueへ反転
            return {
              ...d,
              is_reacted: nextIsReacted,
              // 押したら +1, 取り消したら -1
              count: nextIsReacted ? d.count + 1 : d.count - 1, 
            };
          }
          return d; // 他のIDはそのまま
        });
      } else {
        // ■ パターンB: まだデータがない場合 (0件から1件になる時)
        return [
          ...prevData,
          {
            reaction_id: Number(clickedReactionId), // 文字か数字か型に合わせてね
            count: 1,
            is_reacted: true
          }
        ];
      }
    });

    // --- 見た目の更新はここまで ---

    // 裏側でAPIを叩く（DB更新）
    try {
      await createReaction(clickedReactionId); 
      // ※もしここでエラーが出たら、Stateを元に戻す処理を入れるとさらに完璧
    } catch (error) {
      console.error("保存に失敗しました");
      // エラーが出たらリロードさせるなどの対処
    }
  };

  // これより下でuseEffect使うの禁止
  if (!open || !book) {
    return null;
  }

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
        <div className="relative z-10 flex h-full flex-col">
          <div 
            dangerouslySetInnerHTML={{ __html: book.review ?? "書評が登録されていません"}}
            className="flex-1 overflow-y-auto rounded-2xl bg-white/90 px-4 py-6 text-base leading-relaxed text-slate-800 sm:px-6"
          >
          </div>
              <div className="mt-6 flex flex-col gap-4">
                <div className="flex justify-center gap-5">
                  {REACTION_TYPES.map((type) => {
                    
                    const targetData = afterCheckedData?.find((r) => String(r.reaction_id) === String(type.id));

                    const count = targetData ? targetData.count : 0;
                    const isReacted = targetData ? targetData.is_reacted : false;

                    return (
                      <button
                        key={type.id}
                        className={`${styles.reactionButton} ${isReacted ? styles.active : ""}`}
                        onClick={() => {
                          handleReactionClick(type.id)
                        }}
                      >
                        <span className={`${styles.icon}`}>{type.label}:</span>
                        <span className={`${styles.count}`}>{count}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="flex items-center gap-3">
                  <BookReviewVoteButton
                      reviewId={`${book.id}`}
                      eventId={`${book.event_id}`}
                      ref={voteButtonRef}
                      onVoteChange={onVoteChange}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onToggleFavorite?.();
                    }}
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
  );
}
