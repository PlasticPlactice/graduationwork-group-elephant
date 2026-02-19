"use client";

import React, { createContext, useContext, useCallback, useState } from "react";
import { Toast } from "@/lib/errorTypes";

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Date.now().toString();
      const duration = toast.duration ?? 3000;

      setToasts((prev) => [...prev, { ...toast, id }]);

      // 自動削除
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * トースト通知を使用する Hook
 * 使用例:
 * const { addToast } = useToast();
 * addToast({ type: 'success', message: '保存しました' });
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return {
    addToast: context.addToast,
    removeToast: context.removeToast,
  };
}

/**
 * トースト状態を取得する Hook（内部用）
 */
export function useToastState() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastState must be used within a ToastProvider");
  }
  return context;
}
