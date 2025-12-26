"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AccountDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const AccountDeleteModal: React.FC<AccountDeleteModalProps> = ({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // ESCキーで閉じる
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // フォーカス管理: モーダル表示時にキャンセルボタンへ
  useEffect(() => {
    if (open && confirmBtnRef.current) {
      confirmBtnRef.current.focus();
    }
    // 背景スクロール禁止
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // 背景クリックで閉じる
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={handleOverlayClick}
          ref={modalRef}
          tabIndex={-1}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white rounded-xl shadow-lg max-w-xs w-full p-6 relative"
            onClick={(e: React.MouseEvent<HTMLDivElement>) =>
              e.stopPropagation()
            }
          >
            <h2
              id="modal-title"
              className="text-center font-bold text-lg mb-4 text-slate-900"
            >
              本当に退会しますか？
            </h2>
            <p className="text-center text-slate-700 text-sm leading-relaxed mb-6">
              退会すると、あなたの書評はすべて削除され、度ごとにできなくなります。
            </p>

            <div className="flex flex-col gap-3">
              <button
                className="w-full text-white font-bold py-3 rounded-md text-center border-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                style={{ backgroundColor: "red" }}
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? "処理中..." : "退会する"}
              </button>
              <button
                className="w-full bg-white text-slate-900 font-bold py-3 rounded-md text-center border-2 border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 hover:bg-slate-50 transition-colors"
                onClick={onClose}
                ref={confirmBtnRef}
              >
                キャンセル
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
