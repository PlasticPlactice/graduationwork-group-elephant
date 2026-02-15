"use client";

import { useState } from "react";
import AdminButton from "@/components/ui/admin-button";
import { useToast } from "@/contexts/ToastContext";
import { REVIEW_STATUS_LABELS } from "@/lib/constants/reviewStatus";

// 選択された書評データの型定義
export interface StatusTargetReview {
  id: number;
  title: string;
  nickname: string;
  status: number; // DBのステータス値 (0:評価前, 1:一次通過, etc.)
}

interface StatusEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReviews: StatusTargetReview[];
  onStatusUpdated?: () => void;
}

export default function StatusEditModal({
  isOpen,
  onClose,
  selectedReviews,
  onStatusUpdated,
}: StatusEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  if (!isOpen) return null;

  // ステータスラベルの変換ヘルパー
  const getStatusLabel = (status: number) =>
    REVIEW_STATUS_LABELS[status] ?? "-";

  const handleIncrement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ステータス更新APIの呼び出し
      const res = await fetch("/api/admin/reviews/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewIds: selectedReviews.map((r) => r.id),
          action: "increment",
        }),
      });

      if (!res.ok) {
        throw new Error("ステータス更新に失敗しました");
      }

      addToast({
        type: "success",
        message:
          "選択した書評を1段階上に更新しました。（対象ユーザーへ通知が送信されます）",
      });
      if (onStatusUpdated) onStatusUpdated();
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
      addToast({
        type: "error",
        message: "更新に失敗しました。もう一度お試しください。",
      });
    } finally {
      setIsSubmitting(false);
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
        <h2 className="modal-head text-center">ステータス変更</h2>
        <h3 className="modal-sub-head mt-3">ステータス変更する書評</h3>

        <div className="border p-3 overflow-auto h-64 mb-3">
          <table className="w-full status-table">
            <thead className="table-head">
              <tr>
                <th>ID</th>
                <th>書籍タイトル</th>
                <th>ニックネーム</th>
                <th>現在のステータス</th>
              </tr>
            </thead>
            <tbody className="border status-book-section">
              {selectedReviews.map((record) => (
                <tr key={record.id} className="status-record text-center">
                  <td>{record.id}</td>
                  <td>{record.title}</td>
                  <td>{record.nickname}</td>
                  <td>{getStatusLabel(record.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleIncrement} className="m-auto w-1/4">
          <AdminButton
            label={isSubmitting ? "変更中..." : "ステータスを更新する"}
            type="submit"
            className="w-full mt-5"
            disabled={isSubmitting || selectedReviews.length === 0}
          />
        </form>
      </div>
    </div>
  );
}
