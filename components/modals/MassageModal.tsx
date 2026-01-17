"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MassageContent from "@/components/poster/MassageContent";

import Styles from "@/styles/app/poster.module.css";
import modalStyles from "@/styles/app/modal.module.css";

interface MassageModalProps {
    open: boolean;
    onClose: () => void;
    userName: string;
}

export const MassageModal: React.FC<MassageModalProps> = ({
  open,
  onClose,
  userName,
}) => {
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
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
            className={`bg-white rounded-xl my-auto shadow-lg w-full p-6 max-h-[85vh] flex flex-col ${modalStyles.modalContent}`}
            onClick={(e: React.MouseEvent<HTMLDivElement>) =>
              e.stopPropagation()
            }
          >
            {/* 中身をかく */}
            <p className={`font-bold text-left ${Styles.mainColor} ${Styles.text24px}`}>運営からのお知らせ</p>
            <div className={`border-b-2 ${Styles.mainColor}`}></div>
            <div className={`flex-1 overflow-y-auto mt-7`}>
                <MassageContent />
                <MassageContent />
                <MassageContent />
            </div>
            <button type="button" onClick={() => onClose()} className={`w-full mt-5 ${Styles.barcodeScan__backButton}`}>閉じる</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
