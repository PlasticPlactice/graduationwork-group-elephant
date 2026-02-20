"use client";

import { useState } from "react";
import Modal from "@/app/(app)/Modal";
import Styles from "@/styles/app/modal.module.css";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
  pdfPath: string | null;
  fileName?: string;
}

export default function TermsModal({
  open,
  onClose,
  pdfPath,
  fileName = "利用規約",
}: TermsModalProps) {
  const [iframeError, setIframeError] = useState(false);

  const handleIframeError = () => {
    setIframeError(true);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <p className="font-bold text-2xl text-center mb-4">利用規約</p>
      <div className="border-b border-gray-300 mb-4"></div>

      {!pdfPath ? (
        <div
          className={`${Styles.modalScrollArea} flex items-center justify-center`}
        >
          <p className="text-gray-600">
            利用規約が設定されていません。管理者にお問い合わせください。
          </p>
        </div>
      ) : iframeError ? (
        <div
          className={`${Styles.modalScrollArea} flex flex-col items-center justify-center gap-4`}
        >
          <p className="text-gray-600">
            PDFの表示に失敗しました。以下からダウンロードしてご確認ください。
          </p>
          <a
            href={pdfPath}
            download={fileName}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            利用規約をダウンロード
          </a>
        </div>
      ) : (
        <div className={`${Styles.modalScrollArea} my-5`}>
          <iframe
            src={pdfPath}
            className={`${Styles.pdfIframe} w-full h-full border border-gray-300 rounded`}
            title="利用規約"
            onError={handleIframeError}
          />
          <div className="mt-3 text-sm text-gray-600 text-center">
            PDFが表示されない場合は
            <a
              href={pdfPath}
              download={fileName}
              className="text-blue-600 hover:underline ml-1"
            >
              こちらからダウンロード
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        className="w-full mt-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
      >
        閉じる
      </button>
    </Modal>
  );
}
