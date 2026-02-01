"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import Styles from "@/styles/app/poster.module.css";
import modalStyles from "@/styles/app/modal.module.css";

interface WithdrawConfirmModalProps {
    open: boolean;
    onClose: () => void;
    userName: string;
}

export const WithdrawConfirmModal: React.FC<WithdrawConfirmModalProps> = ({
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
            className={`bg-white rounded-xl my-auto shadow-lg w-full p-6 max-h-[85vh] overflow-y-auto ${modalStyles.modalContent}`}
            onClick={(e: React.MouseEvent<HTMLDivElement>) =>
              e.stopPropagation()
            }
          >
            {/* 中身をかく */}
            <Image src="/app/withdraw-alert.png" alt="退会確認モーダルの警告画像" width={82} height={82} className="mx-auto" />
            <p className={`${Styles.subColor} font-bold text-center`}>退会手続きの前に以下の内容をご確認ください</p>
            <div className="px-3 my-10">
              <p className="font-bold">ニックネーム</p>
              <div className={`border rounded-sm py-2`}>
                <p className={`font-bold text-center`}>{userName}</p>
              </div>
            </div>
            <div>
              <p className={`font-bold mb-5 ${Styles.mainColor}`}>登録情報・設定・審査中のデータが削除され、確認することができなくなります。</p>
              <p className={`font-bold mb-5 ${Styles.mainColor}`}>削除されたデータは、いかなる理由があっても復元できません。</p>
              <p className={`font-bold mb-5 ${Styles.mainColor}`}>審査を通過し、公開済の書評について、取り下げることはできません。</p>
            </div>

            <div className="flex items-center my-10 justify-center">
              <input type="checkbox" checked={isTermsAccepted} onChange={(e) => setIsTermsAccepted(e.target.checked)} id="terms" name="terms" className={`${Styles.acceptCheckbox}`} />
              <label htmlFor="terms" className="ml-2 text-black">注意事項を理解しました</label>
            </div>

            {/* 送信ボタン */}
            <div className="">
              <Link href="/post/create-complete">
                <button disabled={!isTermsAccepted} type="button" className={`w-full ${isTermsAccepted ? "font-bold" : `${Styles.disabledButton}`}`}>退会する</button>
              </Link>
            </div>
            <button type="button" onClick={() => onClose()} className={`w-full mt-4 ${Styles.barcodeScan__backButton}`}>キャンセル</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
