import "@/styles/admin/users.css";
import { Icon } from "@iconify/react";
import AdminButton from "@/components/ui/admin-button";
import { useEffect, useState } from "react";
import {
  USER_STATUS_CLASS,
  USER_STATUS_LABELS,
} from "@/lib/constants/userStatus";
import { DEMO_MODE } from "@/lib/constants/demoMode";

interface UserExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
  onWithdrawSuccess: () => void;
}

interface ExitUser {
  id: number;
  nickname: string;
  age: number | null;
  address: string | null;
  user_status: number;
}

export default function UserExitModal({
  isOpen,
  onClose,
  userId,
  onWithdrawSuccess,
}: UserExitModalProps) {
  const [user, setUser] = useState<ExitUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isOpen || !userId) {
      setUser(null);
      setReason("");
      setError("");
      return;
    }

    const fetchUser = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/users/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser({
          id: data.id,
          nickname: data.nickname,
          age: data.age,
          address: data.address,
          user_status: data.user_status,
        });
      } catch (err) {
        console.error(err);
        setError("ユーザー情報の取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [isOpen, userId]);

  const handleWithdraw = async () => {
    if (!userId) {
      setError("ユーザーが選択されていません。");
      return;
    }
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setError("アカウント停止理由を入力してください。");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: trimmedReason }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "アカウント停止処理に失敗しました。");
      }

      onWithdrawSuccess();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "アカウント停止処理に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const statusClass = user ? USER_STATUS_CLASS[user.user_status] : "";
  const statusLabel =
    user && USER_STATUS_LABELS[user.user_status]
      ? USER_STATUS_LABELS[user.user_status]
      : "";

  return (
    <div
      className="fixed inset-0 user-exit-modal bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="modal-content bg-white rounded-lg w-11/12 max-w-8xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">ユーザーアカウント停止</h2>
          <button
            onClick={onClose}
            className="close-btn text-black"
            aria-label="閉じる"
          >
            <Icon icon="mdi:close" width={24} className="text-black" />
          </button>
        </div>

        <div className="user-data-title grid grid-cols-5 px-6 text-center">
          <p>ユーザーID</p>
          <p>ニックネーム</p>
          <p>ステータス</p>
          <p>年代</p>
          <p>居住地</p>
        </div>
        <div className="text-2xl grid grid-cols-5 px-6 text-center font-bold min-h-[60px]">
          {isLoading ? (
            <p className="col-span-5 text-base font-normal">読み込み中...</p>
          ) : user ? (
            <>
              <p>{String(user.id).padStart(6, "0")}</p>
              <p>{user.nickname}</p>
              <p>
                <span className={`status-badge ${statusClass}`}>
                  {statusLabel}
                </span>
              </p>
              <p>{user.age ? `${user.age}代` : "-"}</p>
              <p>{user.address || "-"}</p>
            </>
          ) : (
            <p className="col-span-5 text-base font-normal">
              ユーザー情報を取得できませんでした
            </p>
          )}
        </div>

        <div className="mt-2 mx-10">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-bold">アカウント停止理由</h1>
            <span className="text-sm text-gray-500">※必須</span>
          </div>
          <textarea
            className="exit-area w-full"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="例）不正行為が確認されたため"
            rows={4}
          ></textarea>
          {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
        </div>

        <div className="flex gap-6 justify-center mx-10 mb-8">
          <button
            className="back-btn exit-modal-common"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            戻る
          </button>
          <AdminButton
            label={isSubmitting ? "処理中..." : "アカウント停止"}
            className="exit-decision-btn exit-modal-common"
            onClick={handleWithdraw}
            disabled={isSubmitting || !user || DEMO_MODE}
          />
        </div>
      </div>
    </div>
  );
}
