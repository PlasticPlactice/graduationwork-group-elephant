"use client";

import React from "react";

type Props = {
  title?: string;
  message?: string;
  onRetry?: (() => void) | undefined;
};

export default function GenericError({
  title = "エラーが発生しました",
  message = "予期しないエラーが発生しました。管理者にお問い合わせしてください。",
  onRetry,
}: Props) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        className="max-w-md text-center"
        style={{ maxWidth: 640, textAlign: "center" }}
      >
        <div className="mb-6" style={{ marginBottom: "1.5rem" }}>
          <div
            className="text-6xl font-bold text-red-500"
            style={{ fontSize: "3.5rem", fontWeight: 700, color: "#ef4444" }}
          >
            500
          </div>
        </div>

        <h1
          className="text-2xl font-bold text-gray-900 mb-4"
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "1rem",
            color: "#111827",
          }}
        >
          {title}
        </h1>

        <p
          className="text-gray-600 mb-6 text-sm leading-relaxed"
          style={{
            color: "#6b7280",
            marginBottom: "1.5rem",
            fontSize: "0.9rem",
            lineHeight: 1.4,
          }}
        >
          {message}
        </p>

        {onRetry && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={onRetry}
              className="bg-main text-white py-2 px-4 rounded hover:opacity-80 transition-opacity font-medium"
              style={{
                backgroundColor: "var(--color-main)",
                color: "#fff",
                padding: "0.5rem 1rem",
                borderRadius: 6,
              }}
            >
              再試行
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
