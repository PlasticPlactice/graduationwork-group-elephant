"use client";

import React from "react";
import Link from "next/link";

type Props = {
  title?: string;
  message?: string;
  details?: string | undefined;
  onRetry?: (() => void) | undefined;
  linkHref?: string | undefined;
  linkLabel?: string | undefined;
};

export default function GenericError({
  title = "エラーが発生しました",
  message = "予期しないエラーが発生しました。管理者にお問い合わせしてください。",
  details,
  onRetry,
  linkHref,
  linkLabel,
}: Props) {
  const showDetails = process.env.NODE_ENV === "development" && !!details;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <div className="text-6xl font-bold text-red-500">500</div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>

        <p className="text-gray-600 mb-6 text-sm leading-relaxed">{message}</p>

        {showDetails && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
              エラー詳細（開発環境のみ）
            </summary>
            <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
              {details}
            </pre>
          </details>
        )}

        <div className="flex flex-col gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-main text-white py-2 px-4 rounded hover:opacity-80 transition-opacity font-medium"
              style={{ backgroundColor: "var(--color-main)" }}
            >
              再試行
            </button>
          )}

          {linkHref && linkLabel && (
            <Link
              href={linkHref}
              className="text-main underline hover:opacity-70 transition-opacity font-medium text-center"
              style={{ color: "var(--color-main)" }}
            >
              {linkLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
