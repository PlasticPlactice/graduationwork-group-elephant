import React from "react";
import Link from "next/link";

export function EventHeader() {
  return (
    <header className="bg-[#6A8CA4] text-white h-[60px] flex items-center justify-between px-4 shadow-md">
      {/* ロゴ部分 */}
      <Link
        href="/event"
        className="flex items-center text-2xl font-serif tracking-widest"
      >
        <span className="text-white">文庫</span>
        <span className="text-red-500 ml-1">X</span>
      </Link>

      {/* ハンバーガーメニュー */}
      <Link
        href="/poster/login"
        className="text-base font-bold transition-colors text-white"
        style={{
          color: "var(--color-white)",
          padding: "16px 12px",
         }}
      >
        ログイン
      </Link>

      {/* ハンバーガーメニュー（一時的にコメントアウト）
      {/*
      <button
        type="button"
        className="p-1 border-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ring-0 shadow-none drop-shadow-none"
        aria-label="メニューを開く"
        style={{
          backgroundColor: "var(--color-event-button-bg)",
          color: "var(--color-white)",
          boxShadow: "none",
          WebkitBoxShadow: "none",
          filter: "none",
          outline: "none",
          border: "none",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>
      */}
    </header>
  );
}
