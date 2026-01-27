import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface TimelineStep {
  label: string;
  date: string;
  status: "done" | "pending";
}

interface ReviewPassedModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  message?: string;
  bookTitle?: string;
  passedDate?: string;
  timeline?: TimelineStep[];
}

export const ReviewPassedModal: React.FC<ReviewPassedModalProps> = ({
  open,
  onClose,
  onConfirm,
  message,
  bookTitle = "色彩を持たない多崎つくると、彼の巡礼の年",
  passedDate = "2025年12月8日",
  timeline = [
    {
      label: "1次審査",
      date: "2025/12/08",
      status: "done" as const,
    },
    {
      label: "2次審査",
      date: "予定:2025/12/10",
      status: "done" as const,
    },
    {
      label: "入選",
      date: "予定:2026/01/15",
      status: "pending" as const,
    },
  ],
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // コンフェッティエフェクト
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
      });
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [open]);

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

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
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
              className="text-center font-bold text-lg mb-2 text-slate-900"
            >
              おめでとうございます！
            </h2>
            <p className="text-center text-slate-700 mb-4">
              {message || "1次審査を通過しました。"}
            </p>
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <div className="text-xs text-slate-500 mb-1">タイトル</div>
              <div className="font-bold text-sm mb-2 text-slate-900">
                {bookTitle}
              </div>
              <div className="text-xs text-slate-500 mb-1">通過日</div>
              <div className="font-bold text-sm mb-2 text-slate-900">
                {passedDate}
              </div>
              <div className="text-xs text-slate-500 mb-2">今後の予定</div>
              <div className="relative pl-8">
                {timeline.map((step, idx) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.3 }}
                    className="flex items-start mb-4 last:mb-0 relative"
                  >
                    {/* タイムライン縦線 - 次のステップが完了なら色を変える */}
                    {idx < timeline.length - 1 && (
                      <motion.span
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: idx * 0.1 + 0.2, duration: 0.3 }}
                        className={`absolute left-[9px] top-4 w-[2px] h-7 origin-top z-0 ${
                          timeline[idx + 1].status === "done"
                            ? "bg-rose-400"
                            : "bg-gray-300"
                        }`}
                      />
                    )}
                    {/* アイコン */}
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: idx * 0.1 + 0.1,
                        duration: 0.3,
                        type: "spring",
                      }}
                      className={`w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full z-10 mr-3 ${
                        step.status === "done" ? "bg-rose-400" : "bg-gray-300"
                      }`}
                    >
                      {step.status === "done" ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <circle cx="8" cy="8" r="8" fill="#F43F5E" />
                          <path
                            d="M5 8l2 2 4-4"
                            stroke="#fff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <span />
                      )}
                    </motion.span>
                    <span
                      className={`font-bold text-base mr-2 ${
                        step.status === "done"
                          ? "text-rose-500"
                          : "text-slate-500"
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-slate-500 text-sm">{step.date}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <button
              className="w-full bg-rose-400 text-white font-bold py-2 rounded-md text-center border-none focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
              onClick={handleConfirm}
              ref={confirmBtnRef}
            >
              確認
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
