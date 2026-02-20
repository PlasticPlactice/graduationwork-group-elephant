// components/admin/EventRegisterModal.tsx
"use client";
import { Icon } from "@iconify/react";
import Textbox from "@/components/ui/admin-textbox";
import "@/styles/admin/events.css";
import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import { validateEventDates } from "@/lib/validateEventDates";
import { toISOStringFromLocal } from "@/lib/dateUtils";

interface EventRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => Promise<void>;
}

export default function EventRegisterModal({
  isOpen,
  onClose,
  onSuccess,
}: EventRegisterModalProps) {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [startPeriod, setStartPeriod] = useState("");
  const [endPeriod, setEndPeriod] = useState("");
  const [firstVotingStart, setFirstVotingStart] = useState("");
  const [firstVotingEnd, setFirstVotingEnd] = useState("");
  const [secondVotingStart, setSecondVotingStart] = useState("");
  const [secondVotingEnd, setSecondVotingEnd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const err = validateEventDates({
      start_period: startPeriod,
      end_period: endPeriod,
      first_voting_start_period: firstVotingStart,
      first_voting_end_period: firstVotingEnd,
      second_voting_start_period: secondVotingStart,
      second_voting_end_period: secondVotingEnd,
    });
    if (err) {
      const message = Array.isArray(err) ? err.join("。\n") : String(err);
      addToast({ type: "error", message });
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        title,
        detail,
        start_period: toISOStringFromLocal(startPeriod),
        end_period: toISOStringFromLocal(endPeriod),
        first_voting_start_period: toISOStringFromLocal(firstVotingStart),
        first_voting_end_period: toISOStringFromLocal(firstVotingEnd),
        second_voting_start_period: toISOStringFromLocal(secondVotingStart),
        second_voting_end_period: toISOStringFromLocal(secondVotingEnd),
        status: 0,
        public_flag: true,
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("イベント登録エラー", err);
        addToast({ type: "error", message: "イベント登録に失敗しました。" });
        setSubmitting(false);
        return;
      }

      // 成功: onSuccess コールバックを実行（データ再取得）
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        message:
          "イベントの登録処理中に通信エラーが発生しました。時間をかけてもう一度お試しください。解決しない場合は管理者にお問い合わせください。",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 reg-modal bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="modal-content bg-white rounded-lg w-11/12 max-w-8xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">イベント登録</h2>
          <button onClick={onClose} className="close-btn text-black">
            <Icon icon="mdi:close" width={24} className="text-black" />
          </button>
        </div>

        <div className="modal-scroll-area overflow-y-auto p-3">
          {/* エラーメッセージはトーストで表示します */}

          <form onSubmit={handleSubmit} className="p-3">
            <div className="my-4">
              <label
                htmlFor="register-event-title"
                className="title-label text-xl block"
              >
                タイトル<span className="required">*</span>
              </label>
              <Textbox
                id="register-event-title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full event-custom-input"
                style={{ backgroundColor: "#F9FAFB" }}
                placeholder="イベントのタイトルを入力"
              />
            </div>

            <div className="my-4">
              <label htmlFor="event-start-datetime" className="text-xl block">
                イベント開催期間<span className="required">*</span>
              </label>
              <p className="event-detail-text text-sm">
                イベントの開催期間を決定します
              </p>
              <div className="flex gap-15 items-center">
                <Textbox
                  id="register-event-start-datetime"
                  name="event-start-datetime"
                  className="datetime-input-start"
                  type="datetime-local"
                  value={startPeriod}
                  onChange={(e) => setStartPeriod(e.target.value)}
                  style={{ backgroundColor: "#F9FAFB" }}
                />
                <p>～</p>
                <Textbox
                  id="register-event-end-datetime"
                  name="event-end-datetime"
                  className="datetime-input-end"
                  type="datetime-local"
                  value={endPeriod}
                  onChange={(e) => setEndPeriod(e.target.value)}
                  style={{ backgroundColor: "#F9FAFB" }}
                />
              </div>
            </div>

            <div className="my-4">
              <label htmlFor="book-post-datetime" className="text-xl block">
                書評投稿期間<span className="required">*</span>
              </label>
              <p className="event-detail-text text-sm">
                ユーザーが書評を投稿できる期間を決定します
              </p>
              <div className="flex gap-15 items-center">
                <Textbox
                  id="register-book-post-start-datetime"
                  name="book-post-start-datetime"
                  className="datetime-input-post"
                  type="datetime-local"
                  value={firstVotingStart}
                  onChange={(e) => setFirstVotingStart(e.target.value)}
                  style={{ backgroundColor: "#F9FAFB" }}
                />
                <p>～</p>
                <Textbox
                  id="register-book-post-end-datetime"
                  name="book-post-end-datetime"
                  className="datetime-input-post"
                  type="datetime-local"
                  value={firstVotingEnd}
                  onChange={(e) => setFirstVotingEnd(e.target.value)}
                  style={{ backgroundColor: "#F9FAFB" }}
                />
              </div>
            </div>

            <div className="my-4">
              <label htmlFor="book-vote-datetime" className="text-xl block">
                書評投票期間<span className="required">*</span>
              </label>
              <p className="event-detail-text text-sm">
                ユーザーが書評に対して投票できる期間を決定します
              </p>
              <div className="flex gap-15 items-center">
                <Textbox
                  id="register-book-vote-start-datetime"
                  name="book-vote-start-datetime"
                  className="datetime-input-vote"
                  type="datetime-local"
                  value={secondVotingStart}
                  onChange={(e) => setSecondVotingStart(e.target.value)}
                  style={{ backgroundColor: "#F9FAFB" }}
                />
                <p>～</p>
                <Textbox
                  id="register-book-vote-end-datetime"
                  name="book-vote-end-datetime"
                  className="datetime-input-vote"
                  type="datetime-local"
                  value={secondVotingEnd}
                  onChange={(e) => setSecondVotingEnd(e.target.value)}
                  style={{ backgroundColor: "#F9FAFB" }}
                />
              </div>
            </div>

            <div className="my-4">
              <label htmlFor="register-event-remarks" className="text-xl block">
                備考欄
              </label>
              <p className="event-detail-text text-sm">
                イベントについての詳細を記入してください。
                ※ユーザーには公開されません
              </p>
              <textarea
                name="remarks"
                className="w-full"
                id="register-event-remarks"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
              ></textarea>
            </div>

            <div className="flex justify-end gap-4">
              <button type="button" className="cancel-btn" onClick={onClose}>
                キャンセル
              </button>
              <input
                type="submit"
                value="登録"
                className="reg-form-btn"
                disabled={submitting}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
