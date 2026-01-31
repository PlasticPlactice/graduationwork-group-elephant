// 使わない予定だが一応残しておく
"use client";
import "@/styles/admin/detail-term.css";

interface TermApplyConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermApplyConfirmModal({
  isOpen,
  onClose,
}: TermApplyConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 term-apply-confirm-modal bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="modal-content bg-white rounded-lg w-5/12 max-w-8xl max-h-[90vh] flex flex-col p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center font-bold text-xl mb-3">本当に適用しますか？</p>
        <div className="flex justify-center gap-20">
          <button className="backmodal-btn modal-btn-common" onClick={onClose}>
            戻る
          </button>
          <button
            className="modal-btn-common apply-conf-btn"
          >
            適用する
          </button>
        </div>
      </div>
    </div>
  );
}
