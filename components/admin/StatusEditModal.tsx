"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import AdminButton from "@/components/ui/admin-button";
import {
  REVIEW_STATUS,
  REVIEW_STATUS_LABELS,
} from "@/lib/constants/reviewStatus";

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
  const [newStatus, setNewStatus] = useState<number>(REVIEW_STATUS.BEFORE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // ステータスラベルの変換ヘルパー
  const getStatusLabel = (status: number) =>
    REVIEW_STATUS_LABELS[status] ?? "-";

  const currentStatusDisplay =
    selectedReviews.length > 0
      ? getStatusLabel(selectedReviews[0].status)
      : "-";

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ステータス更新APIの呼び出し
      const res = await fetch("/api/admin/reviews/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewIds: selectedReviews.map((r) => r.id),
          status: newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("ステータス更新に失敗しました");
      }

      alert("ステータスを変更しました。（対象ユーザーへ通知が送信されます）");
      if (onStatusUpdated) onStatusUpdated();
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("更新に失敗しました。もう一度お試しください。");
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

        <div className="border p-3 overflow-auto h-64">
          <table className="w-full status-table">
            <thead className="table-head">
              <tr>
                <th>ID</th>
                <th>書籍タイトル</th>
                <th>ニックネーム</th>
              </tr>
            </thead>
            <tbody className="border status-book-section">
              {selectedReviews.map((record) => (
                <tr key={record.id} className="status-record text-center">
                  <td>{record.id}</td>
                  <td>{record.title}</td>
                  <td>{record.nickname}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-3 items-center my-3 m-auto">
          <p className="now-status-head ">変更前ステータス</p>
          <p className="now-status-text font-bold py-1.5 px-7 rounded-2xl">
            {currentStatusDisplay}
          </p>
          <div>{/* レイアウト調整用 */}</div>
        </div>
        <Icon
          icon="ri:arrow-up-line"
          rotate={2}
          className="mx-auto status-arrow"
          width={30}
        ></Icon>
        <form onSubmit={handleUpdate} className="m-auto w-1/4">
          <select
            className="w-full"
            aria-label="変更後のステータス"
            value={newStatus}
            onChange={(e) => setNewStatus(Number(e.target.value))}
          >
            {Object.entries(REVIEW_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={Number(value)}>
                {label}
              </option>
            ))}
          </select>

          <AdminButton
            label={isSubmitting ? "変更中..." : "変更"}
            type="submit"
            className="w-full mt-5"
            disabled={isSubmitting}
          />
        </form>
      </div>
    </div>
  );
}
