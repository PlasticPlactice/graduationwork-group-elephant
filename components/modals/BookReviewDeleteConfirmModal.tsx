"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Styles from "@/styles/app/poster.module.css";
import modalStyles from "@/styles/app/modal.module.css";
import { useRouter } from "next/navigation";

interface BookReviewDeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  bookReviewId?: string | number;
}

export const BookReviewDeleteConfirmModal: React.FC<
  BookReviewDeleteConfirmModalProps
> = ({ open, onClose, bookReviewId }) => {
  const router = useRouter();
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

  // フォーカス管理: モーダル表示時に確認ボタンへ
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

  // DELETE処理関数
  const deleteBookReview = async () => {
    try {
      const res = await fetch(`/api/book-reviews/mypage`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: bookReviewId,
        }),
      });

      if (!res.ok) {
        alert("書評の削除に失敗しました。時間をおいて再度お試しください。");
        return;
      }

      router.push("/poster/mypage");
    } catch (error) {
      console.error("Error deleting book review:", error);
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
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/10 backdrop-blur-sm"
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
            className={`bg-white rounded-xl my-auto shadow-lg w-full p-6 max-h-[85vh] overflow-y-auto ${modalStyles.modalContent}`}
            onClick={(e: React.MouseEvent<HTMLDivElement>) =>
              e.stopPropagation()
            }
          >
            {/* 中身をかく */}
            <p
              className={`text-center text-red-400 font-bold ${Styles.text24px}`}
            >
              本当に削除しますか？
            </p>
            <p className="text-center my-4">
              削除された書評データを復元することはできません。
            </p>

            <button
              onClick={() => deleteBookReview()}
              className={`w-full mb-3 font-bold`}
            >
              削除する
            </button>
            <button
              onClick={() => onClose()}
              className={`w-full ${Styles.barcodeScan__backButton}`}
            >
              キャンセル
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
