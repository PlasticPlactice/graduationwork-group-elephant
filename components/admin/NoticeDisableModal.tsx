/* eslint-disable */
"use client";

interface NoticeDisableModalProps {
  isOpen: boolean;
  onClose?: any;
  onConfirm?: any;
  isPublic?: boolean;
}

// eslint-disable-next-line @next/next/no-serialize-in-client-component
export default function NoticeDisableModal({
  isOpen,
  onClose,
  onConfirm,
  isPublic = false,
}: NoticeDisableModalProps) {
  if (!isOpen) return null;

  const confirmText = isPublic ? "非公開にする" : "公開する";
  const questionText = isPublic
    ? "本当に非公開にしますか？"
    : "本当に公開しますか？";

  return (
    <div
      className="fixed inset-0 notice-disable-modal bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="modal-content bg-white rounded-lg w-5/12 max-w-8xl max-h-[90vh] flex flex-col p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center font-bold text-xl mb-3">{questionText}</p>
        <div className="flex justify-center gap-20">
          <button className="back-btn modal-btn-common" onClick={onClose}>
            戻る
          </button>
          <button
            className={
              "modal-btn-common " + (isPublic ? "disable-btn" : "publish-btn")
            }
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
