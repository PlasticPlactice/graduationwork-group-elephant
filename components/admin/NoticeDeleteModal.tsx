"use client";
import "@/styles/admin/detail-term.css";

interface NoticeDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function NoticeDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: NoticeDeleteModalProps) {
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
        <p className="text-center font-bold text-xl mb-3">
          本当に削除しますか？
        </p>
        <p className="text-center text-sm text-gray-600 mb-6">
          この操作により、お知らせが削除されます。
        </p>
        <div className="flex justify-center gap-20">
          <button
            className="backmodal-btn modal-btn-common"
            onClick={onClose}
            disabled={isDeleting}
          >
            戻る
          </button>
          <button
            className="modal-btn-common delete-conf-btn"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "削除中..." : "削除する"}
          </button>
        </div>
      </div>
    </div>
  );
}
