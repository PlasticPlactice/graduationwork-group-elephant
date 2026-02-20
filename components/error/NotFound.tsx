"use client";

import React from "react";
import { useRouter } from "next/navigation";

type Props = {
  title?: string;
  message?: string;
  linkLabel?: string;
};

export default function NotFound({
  title = "ページが見つかりません",
  message = "お探しのページは削除されたか、URLが変更された可能性があります。",
  linkLabel = "前のページに戻る",
}: Props) {
  const router = useRouter();

  function handleBack() {
    try {
      router.back();
    } catch {
      router.push("/");
    }
  }

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
            className="text-6xl font-bold text-gray-700"
            style={{ fontSize: "3.5rem", fontWeight: 700, color: "#374151" }}
          >
            404
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

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={handleBack}
            className="inline-block bg-main text-white py-2 px-4 rounded hover:opacity-90 transition-opacity font-medium"
            style={{
              backgroundColor: "var(--color-main)",
              color: "#fff",
              padding: "0.5rem 1rem",
              borderRadius: 6,
              textDecoration: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {linkLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
