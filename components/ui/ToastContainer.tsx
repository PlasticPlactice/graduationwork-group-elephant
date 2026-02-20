"use client";

import React from "react";
import { useToastState } from "@/contexts/ToastContext";

/**
 * トースト通知を表示するコンテナコンポーネント
 * app/providers.tsx に組み込んで使用する
 */
export function ToastContainerComponent() {
  const { toasts, removeToast } = useToastState();

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md pointer-events-none pb-0"
      role="region"
      aria-live="polite"
      aria-label="通知"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 mb-0 rounded-lg text-white pointer-events-auto animate-in fade-in slide-in-from-right-2 duration-300`}
          role={toast.type === "error" ? "alert" : undefined}
          style={{
            backgroundColor: getBackgroundHex(toast.type),
            boxShadow: "none",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-white hover:opacity-80 transition-opacity flex-shrink-0"
              style={{
                background: "transparent",
                padding: 0,
                border: "none",
                boxShadow: "none",
                WebkitBoxShadow: "none",
                filter: "none",
                WebkitFilter: "none",
                outline: "none",
              }}
              aria-label="閉じる"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function getBackgroundHex(type: string): string {
  switch (type) {
    case "success":
      return "#10B981"; // green-500
    case "error":
      return "#EF4444"; // red-500
    case "warning":
      return "#F59E0B"; // yellow-500
    case "info":
      return "#3B82F6"; // blue-500
    default:
      return "#6B7280"; // gray-500
  }
}
