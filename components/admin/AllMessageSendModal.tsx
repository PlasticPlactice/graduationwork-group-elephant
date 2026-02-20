"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import AdminButton from "@/components/ui/admin-button";
import { useToast } from "@/contexts/ToastContext";

// 選択された書評データの型定義（エクスポートして他でも再利用可能に）
export interface MessageTargetReview {
  id: number;
  title: string;
  nickname: string;
}

interface AllMessageSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReviews: MessageTargetReview[]; // 親から選択されたデータを受け取る
}

export default function AllMessageSendModal({
  isOpen,
  onClose,
  selectedReviews,
}: AllMessageSendModalProps) {
  const [messageBody, setMessageBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageBody.trim()) {
      addToast({
        type: "warning",
        message: "メッセージを入力してください。",
      });
      return;
    }

    setIsSending(true);
    try {
      // APIへの送信処理
      const res = await fetch("/api/admin/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewIds: selectedReviews.map((r) => r.id),
          message: messageBody,
        }),
      });

      if (!res.ok) {
        throw new Error("送信に失敗しました");
      }

      addToast({
        type: "success",
        message: "メッセージを送信しました。",
      });
      setMessageBody("");
      onClose();
    } catch (error) {
      console.error("Failed to send message:", error);
      addToast({
        type: "error",
        message: "エラーが発生しました。もう一度お試しください。",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 status-edit-modal bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="modal-content bg-white rounded-lg w-9/12 max-w-8xl max-h-[90vh] flex flex-col p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-3">
          <h2 className="modal-head text-2xl font-bold">一括メッセージ送信</h2>
          <button onClick={onClose} className="close-btn text-black">
            <Icon icon="mdi:close" width={24} className="text-black" />
          </button>
        </div>
        <h3 className="modal-sub-head mt-3">メッセージを送信する書評</h3>

        <div className="border p-3 overflow-auto h-64 mb-5">
          <table className="w-full status-table">
            <thead className="table-head">
              <tr>
                <th>ID</th>
                <th>書籍タイトル</th>
                <th>ニックネーム</th>
              </tr>
            </thead>
            <tbody className="border status-book-section">
              {selectedReviews.map((review) => (
                <tr key={review.id} className="status-record text-center">
                  <td>{review.id}</td>
                  <td>{review.title}</td>
                  <td>{review.nickname}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form
          onSubmit={handleSendMessage}
          className="flex flex-col gap-4 items-center"
        >
          <textarea
            className="all-message-area w-4/5"
            placeholder="送信するメッセージを入力"
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
          />
          <div className="m-auto w-1/4">
            <AdminButton
              label={isSending ? "送信中..." : "送信"}
              type="submit"
              disabled={isSending}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
