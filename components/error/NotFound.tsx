"use client";

import React from "react";
import Link from "next/link";

type Props = {
  title?: string;
  message?: string;
  linkHref?: string;
  linkLabel?: string;
};

export default function NotFound({
  title = "ページが見つかりません",
  message = "お探しのページは削除されたか、URLが変更された可能性があります。",
  linkHref = "/",
  linkLabel = "ホームへ戻る",
}: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <div className="text-6xl font-bold text-gray-700">404</div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>

        <p className="text-gray-600 mb-6 text-sm leading-relaxed">{message}</p>

        <Link
          href={linkHref}
          className="inline-block bg-main text-white py-2 px-4 rounded hover:opacity-90 transition-opacity font-medium"
          style={{ backgroundColor: "var(--color-main)" }}
        >
          {linkLabel}
        </Link>
      </div>
    </div>
  );
}
