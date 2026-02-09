"use client";

import { forwardRef, useState } from "react";
import { parseCookies, setCookie, destroyCookie } from "nookies";

const getVoteCookieKey = (eventId: string) => `voted_event_${eventId}`;

type Props = {
  reviewId: string;
  eventId: string;
  onVoteChange?: (isVoted: boolean, eventId: string) => void;
  disabled?: boolean;
};

const BookReviewVoteButton = forwardRef<HTMLButtonElement, Props>(
  ({ reviewId, eventId, onVoteChange, disabled = false }, ref) => {
    const cookieKey = getVoteCookieKey(eventId);

    // Cookieを見て「投票済み」かどうかの判定
    const cookies = parseCookies();
    const [isVoted, setIsVoted] = useState(cookies[cookieKey] === reviewId);

    const handleVote = async () => {
      if (disabled) {
        return;
      }

      const currentCookies = parseCookies();
      const storedReviewId = currentCookies[cookieKey];

      // パターン1: 浮気防止
      if (storedReviewId && storedReviewId !== reviewId) {
        alert("本日は既に他の書評に投票済みです...");
        return;
      }

      // パターン2: 取り消し (Decrement APIを呼ぶ)
      if (storedReviewId === reviewId) {
        setIsVoted(false); // ボタンの色だけ戻す
        if (onVoteChange) onVoteChange(false, eventId);

        destroyCookie(null, cookieKey, { path: "/" });

        try {
          await updateVoteCount(reviewId, "decrement");
        } catch (error) {
          setIsVoted(true); // エラーなら元に戻す
          if (onVoteChange) onVoteChange(true, eventId);
          alert("通信エラー: 取り消しに失敗しました");
        }

        return;
      }

      // パターン3: 新規投票 (Increment APIを呼ぶ)
      if (!storedReviewId) {
        setIsVoted(true); // ボタンの色を変える

        if (onVoteChange) onVoteChange(true, eventId);

        setCookie(null, cookieKey, reviewId, {
          maxAge: 24 * 60 * 60,
          path: "/",
        });

        try {
          await updateVoteCount(reviewId, "increment");
        } catch (error) {
          setIsVoted(false); // エラーなら元に戻す
          if (onVoteChange) onVoteChange(false, eventId);
          destroyCookie(null, cookieKey, { path: "/" });
          alert("通信エラー: 投票に失敗しました");
        }
      }

      // 処理が終わって isVoted が変わったら通知する
      const nextState = !isVoted;
      setIsVoted(nextState);

      if (onVoteChange) {
        onVoteChange(nextState, eventId); // ここで通知発火
      }
    };

    const updateVoteCount = async (
      id: string,
      type: "increment" | "decrement",
    ) => {
      console.log(id, type);
      const res = await fetch(`/api/viewer/vote/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) throw new Error("API Error");
    };

    // ボタンのスタイル定義
    const voteButtonClass = `flex ml-5 h-14 min-h-[3.5rem] flex-1 items-center justify-center gap-3 rounded-full border border-solid text-base font-bold tracking-wide transition-transform duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-200 appearance-none shadow-none ${
      disabled
        ? "!bg-gray-200 !text-gray-500 !border-gray-300 ![box-shadow:none] cursor-not-allowed opacity-60"
        : isVoted
          ? "!bg-red-500 !text-white !border-red-500 ![box-shadow:0_10px_24px_rgba(239,68,68,0.3)]"
          : "!bg-red-50 !text-red-600 !border-red-400 ![box-shadow:0_10px_20px_rgba(239,68,68,0.18)]"
    }`;

    return (
      <button
        type="button"
        onClick={handleVote}
        ref={ref}
        disabled={disabled}
        className={voteButtonClass}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          // アイコンのサイズ調整（少し大きく見える場合は w-5 h-5 にしてもOK）
          className="h-5 w-5"
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
    );
  },
);

BookReviewVoteButton.displayName = "BookReviewVoteButton";
export default BookReviewVoteButton;
