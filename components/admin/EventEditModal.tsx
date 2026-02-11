// components/admin/EventRegisterModal.tsx
"use client";
import { Icon } from "@iconify/react";
import Textbox from "@/components/ui/admin-textbox";
import { EventProgressBar } from "@/components/ui/EventProgressBar";
import "@/styles/admin/events.css";
import { useEffect, useState, startTransition } from "react";
import { validateEventDates } from "@/lib/validateEventDates";
import { toDateTimeLocalValue, toISOStringFromLocal } from "@/lib/dateUtils";

type EventItem = {
  id: number;
  title: string;
  detail?: string;
  status?: string | number;
  start_period?: string;
  end_period?: string;
  first_voting_start_period?: string;
  first_voting_end_period?: string;
  second_voting_start_period?: string;
  second_voting_end_period?: string;
  public_flag?: boolean | string;
};

interface EventRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: EventItem | null;
  onSuccess?: () => Promise<void>;
}

export default function EventEditModal({
  isOpen,
  onClose,
  event,
  onSuccess,
}: EventRegisterModalProps) {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [firstStart, setFirstStart] = useState("");
  const [firstEnd, setFirstEnd] = useState("");
  const [secondStart, setSecondStart] = useState("");
  const [secondEnd, setSecondEnd] = useState("");
  const [publicFlag, setPublicFlag] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<number | null>(null);
  const [nextStatus, setNextStatus] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen && event) {
      startTransition(() => {
        setTitle(event.title ?? "");
        setDetail(event.detail ?? "");
        setStart(toDateTimeLocalValue(event.start_period));
        setEnd(toDateTimeLocalValue(event.end_period));
        setFirstStart(toDateTimeLocalValue(event.first_voting_start_period));
        setFirstEnd(toDateTimeLocalValue(event.first_voting_end_period));
        setSecondStart(toDateTimeLocalValue(event.second_voting_start_period));
        setSecondEnd(toDateTimeLocalValue(event.second_voting_end_period));
        setPublicFlag(event.public_flag === true);
        const initStatus = Number(event.status ?? 0);
        setCurrentStatus(initStatus);
        setNextStatus(initStatus);
        setErrorMessage("");
      });
    }
  }, [isOpen, event]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return onClose();

    const err = validateEventDates({
      start_period: start,
      end_period: end,
      first_voting_start_period: firstStart,
      first_voting_end_period: firstEnd,
      second_voting_start_period: secondStart,
      second_voting_end_period: secondEnd,
    });
    if (err) {
      const message = Array.isArray(err) ? err.join("。\n") : String(err);
      setErrorMessage(message);
      return;
    }

    try {
      const payload = {
        id: event.id,
        title,
        detail,
        start_period: toISOStringFromLocal(start),
        end_period: toISOStringFromLocal(end),
        first_voting_start_period: toISOStringFromLocal(firstStart),
        first_voting_end_period: toISOStringFromLocal(firstEnd),
        second_voting_start_period: toISOStringFromLocal(secondStart),
        second_voting_end_period: toISOStringFromLocal(secondEnd),
        public_flag: publicFlag,
        status: nextStatus,
      };

      const res = await fetch("/api/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("update failed", errorText);
        setErrorMessage("更新に失敗しました: " + (errorText || res.statusText));
        return;
      }

      // 成功: onSuccess コールバックを実行（データ再取得）
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMessage(
        "イベントの更新処理中に通信エラーが発生しました。時間をかけてもう一度お試しください。解決しない場合は管理者にお問い合わせください。",
      );
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
          <h2 className="text-2xl font-bold">イベント編集</h2>
          <button onClick={onClose} className="close-btn text-black">
            <Icon icon="mdi:close" width={24} className="text-black" />
          </button>
        </div>

        <div className="modal-scroll-area overflow-y-auto p-3">
          {errorMessage && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <strong className="font-bold">エラー:</strong>
              <span className="block sm:inline ml-2">{errorMessage}</span>
              <button
                type="button"
                className="absolute top-0 right-0 px-4 py-3 hover:bg-red-200 rounded transition-colors"
                onClick={() => setErrorMessage("")}
                aria-label="閉じる"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-3">
            <div className="my-4">
              <label
                htmlFor="edit-event-title"
                className="title-label text-xl block"
              >
                タイトル<span className="required">*</span>
              </label>
              <Textbox
                id="edit-event-title"
                name="title"
                className="w-full custom-input"
                style={{ backgroundColor: "#F9FAFB" }}
                placeholder="イベントのタイトルを入力"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="my-4">
              <label htmlFor="event-start-datetime" className="text-xl block">
                イベント開催期間<span className="required">*</span>
              </label>
              <p className="event-detail-text text-sm">
                イベントの開催期間を決定します
              </p>
              <div className="flex justify-between items-center">
                <Textbox
                  id="edit-event-start-datetime"
                  name="event-start-datetime"
                  className="datetime-input-start"
                  type="datetime-local"
                  style={{ backgroundColor: "#F9FAFB" }}
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
                <p>～</p>
                <Textbox
                  id="edit-event-end-datetime"
                  name="event-end-datetime"
                  className="datetime-input-end"
                  type="datetime-local"
                  style={{ backgroundColor: "#F9FAFB" }}
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
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
                  id="edit-book-post-start-datetime"
                  name="book-post-start-datetime"
                  className="datetime-input-post"
                  type="datetime-local"
                  style={{ backgroundColor: "#F9FAFB" }}
                  value={firstStart}
                  onChange={(e) => setFirstStart(e.target.value)}
                />
                <p>～</p>
                <Textbox
                  id="edit-book-post-end-datetime"
                  name="book-post-end-datetime"
                  className="datetime-input-post"
                  type="datetime-local"
                  style={{ backgroundColor: "#F9FAFB" }}
                  value={firstEnd}
                  onChange={(e) => setFirstEnd(e.target.value)}
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
                  id="edit-book-vote-start-datetime"
                  name="book-vote-start-datetime"
                  className="datetime-input-vote"
                  type="datetime-local"
                  style={{ backgroundColor: "#F9FAFB" }}
                  value={secondStart}
                  onChange={(e) => setSecondStart(e.target.value)}
                />
                <p>～</p>
                <Textbox
                  id="edit-book-vote-end-datetime"
                  name="book-vote-end-datetime-vote"
                  className="datetime-input-vote"
                  type="datetime-local"
                  style={{ backgroundColor: "#F9FAFB" }}
                  value={secondEnd}
                  onChange={(e) => setSecondEnd(e.target.value)}
                />
              </div>
            </div>

            <div className="my-4">
              <label htmlFor="event-status" className="text-xl block">
                ステータス
              </label>
              <EventProgressBar
                status={currentStatus ?? 0}
                variant="full"
                width="w-4/5"
                progressClassName="w-full h-0.5"
              />
            </div>

            <div className="my-4">
              <label htmlFor="remarks" className="text-lg block">
                現在のステータス
              </label>
              <div className="flex items-center gap-3">
                {/* todo:statusが0なら開催前、1なら投稿期間、2なら審査期間、3なら投票期間、4なら閲覧期間、5なら終了にする */}
                <span className="now-status py-1 px-6 rounded-4xl font-bold">
                  {(() => {
                    switch (currentStatus) {
                      case 0:
                        return "開催前";
                      case 1:
                        return "投稿期間";
                      case 2:
                        return "審査期間";
                      case 3:
                        return "投票期間";
                      case 4:
                        return "閲覧期間";
                      case 5:
                        return "終了";
                      default:
                        return "未設定";
                    }
                  })()}
                </span>
                <Icon icon="mdi:arrow-up-bold" rotate={1} width={30}></Icon>
                <select
                  className="next-status"
                  value={String(nextStatus)}
                  onChange={(e) => setNextStatus(Number(e.target.value))}
                >
                  <option value="0">開催前</option>
                  <option value="1">投稿期間</option>
                  <option value="2">審査期間</option>
                  <option value="3">投票期間</option>
                  <option value="4">閲覧期間</option>
                  <option value="5">終了</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button type="button" className="cancel-btn" onClick={onClose}>
                キャンセル
              </button>
              <input type="submit" value="登録" className="reg-form-btn" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
