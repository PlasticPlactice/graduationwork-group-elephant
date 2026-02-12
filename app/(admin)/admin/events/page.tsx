"use client";
import AdminButton from "@/components/ui/admin-button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "@/styles/admin/events.css";
import { Icon } from "@iconify/react";
import EventRegisterModal from "@/components/admin/EventRegisterModal";
import EventEditModal from "@/components/admin/EventEditModal";
import EventDeleteModal from "@/components/admin/EventDeleteModal";
import { EventProgressBar } from "@/components/ui/EventProgressBar";
import { formatDateTime } from "@/lib/dateUtils";

type EventItem = {
  id: number;
  title: string;
  detail?: string;
  status: string;
  start_period?: string;
  end_period?: string;
  first_voting_start_period?: string;
  first_voting_end_period?: string;
  second_voting_start_period?: string;
  second_voting_end_period?: string;
  public_flag?: boolean | string;
};

export default function Page() {
  const router = useRouter();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [eventNowData, setEventNowData] = useState<EventItem[]>([]);
  const [eventEndData, setEventEndData] = useState<EventItem[]>([]);
  const [isUpdatingPublicFlag, setIsUpdatingPublicFlag] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [canDelete, setCanDelete] = useState(true);

  // fetchEvents: イベントデータを取得する関数
  const fetchEvents = async () => {
    try {
      const [resNow, resEnd] = await Promise.all([
        fetch("/api/events?status=0,1,2,3,4&include_private=true"),
        fetch("/api/events?status=5&include_private=true"),
      ]);

      if (!resNow.ok) {
        console.error("events fetch failed (now)", await resNow.text());
      }
      if (!resEnd.ok) {
        console.error("events fetch failed (end)", await resEnd.text());
      }

      const [nowData, endData] = await Promise.all([
        resNow.ok ? resNow.json() : [],
        resEnd.ok ? resEnd.json() : [],
      ]);

      setEventNowData(nowData);
      setEventEndData(endData);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  // 初期ロード
  useEffect(() => {
    const initializeFetch = async () => {
      try {
        await fetchEvents();
      } finally {
        // cleanup
      }
    };

    initializeFetch();
  }, []);

  // handleToggleNowEvent: 開催中イベントのトグル
  const handleToggleNowEvent = (id: number) => {
    const current = eventNowData.find((e) => e.id === id);
    if (!current) return;
    const newFlag = !(
      current.public_flag === true || current.public_flag === "true"
    );
    updatePublicFlag(id, newFlag);
  };

  // handleToggleEndEvent: 終了済イベントのトグル
  const handleToggleEndEvent = (id: number) => {
    const current = eventEndData.find((e) => e.id === id);
    if (!current) return;
    const newFlag = !(
      current.public_flag === true || current.public_flag === "true"
    );
    updatePublicFlag(id, newFlag);
  };

  const updatePublicFlag = async (id: number, newFlag: boolean) => {
    // 既に更新中の場合はスキップ（二重送信防止）
    if (isUpdatingPublicFlag) return;

    setIsUpdatingPublicFlag(true);
    try {
      const res = await fetch("/api/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, public_flag: newFlag }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }

      const updated = await res.json();
      // API成功後のみ、サーバー応答でローカルステートを更新
      setEventNowData((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, public_flag: updated.public_flag } : e,
        ),
      );
      setEventEndData((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, public_flag: updated.public_flag } : e,
        ),
      );
    } catch (err) {
      console.error("Failed to update public_flag:", err);
      alert("公開設定の更新に失敗しました。");
      // 失敗時はページをリロードしてサーバーと同期
      router.refresh();
    } finally {
      setIsUpdatingPublicFlag(false);
    }
  };

  // モーダルが開いている時に背景のスクロールを防ぐ
  useEffect(() => {
    if (isRegisterModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // クリーンアップ関数
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isRegisterModalOpen]);

  const handleRegister = () => {
    setIsRegisterModalOpen(true);
  };

  const handleEdit = (event: EventItem) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
    setIsRegisterModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedEvent(null);
  };

  const handledetail = (eventId: number) => {
    router.push(`/admin/events-details?eventId=${eventId}`);
  };

  // モーダル成功時に実行されるコールバック（データ再取得）
  const handleModalSuccess = async () => {
    await fetchEvents();
  };

  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
    setCanDelete(true);
    setDeleteErrorMessage("");
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteTargetId(null);
    setCanDelete(true);
    setDeleteErrorMessage("");
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/events/${deleteTargetId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        // APIが開催中のチェックでエラーを返した場合
        if (data.canDelete === false) {
          setCanDelete(false);
          setDeleteErrorMessage(data.message || "イベントが開催中です。");
          setIsDeleting(false);
          return;
        }
        alert(data.message || "削除に失敗しました");
        setIsDeleting(false);
        closeDeleteModal();
        return;
      }

      alert("イベントを削除しました");
      // イベント一覧を再取得
      await fetchEvents();
      closeDeleteModal();
    } catch (err) {
      console.error("Delete error:", err);
      alert("削除に失敗しました");
      closeDeleteModal();
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <main>
      <div className="events-header">
        <div className="events-header-spacer" />
        <h1 className="events-headline text-center">開催中のイベント</h1>
        <AdminButton
          label="イベント登録"
          type="button"
          className="register-btn"
          onClick={handleRegister}
        />
      </div>

      {eventNowData.map((now) => (
        <section
          key={now.id}
          className="w-11/12 now-event-section m-auto p-4 mb-4"
        >
          <div className="flex items-center justify-between pb-3 event-title-section">
            <div className="flex items-center">
              <p className="font-bold event-title">{now.title}</p>
              <p>
                {formatDateTime(now.start_period)} ~{" "}
                {formatDateTime(now.end_period)}
              </p>
            </div>
            <div className="flex items-center mr-10">
              <p>イベントの公開</p>
              {/* todo:トグルのオンオフによる公開非公開の変更処理 */}
              <label className="toggle-switch ml-7">
                <input
                  type="checkbox"
                  id={`myToggle-${now.id}`}
                  checked={
                    now.public_flag === true || now.public_flag === "true"
                  }
                  onChange={() => handleToggleNowEvent(now.id)}
                  aria-label="イベントの公開トグル"
                />

                <span className="slider"></span>
              </label>
              <p className="ml-3">{now.public_flag ? "　公開" : "非公開"}</p>
            </div>
          </div>

          <p className="now-event-condition my-5">現在のイベント状況</p>
          <EventProgressBar
            status={now.status}
            variant="full"
            width="w-2/3"
            progressClassName="w-full h-0.5"
          />

          <div className="flex items-center justify-between">
            <h2 className="font-bold event-data-headline">イベント情報</h2>
            <div className="flex gap-2">
              <AdminButton
                label="編集"
                type="button"
                className="edit_btn"
                onClick={() => handleEdit(now)}
              />
              <AdminButton
                label="削除"
                type="button"
                className="delete-conf-btn"
                onClick={() => handleDelete(now.id)}
              />
            </div>
          </div>

          <div className="schedule-table">
            <div className="row ">
              <div className="label text-center">テーマタイトル</div>
              <div className="content">{now.title}</div>
            </div>

            <div className="row">
              <div className="label text-center">開始日</div>
              <div className="content">{formatDateTime(now.start_period)}</div>
            </div>

            <div className="row">
              <div className="label text-center">書評投稿期間</div>
              <div className="content">
                {formatDateTime(now.first_voting_start_period)} -{" "}
                {formatDateTime(now.first_voting_end_period)}
              </div>
            </div>

            <div className="row">
              <div className="label text-center">1次審査期間</div>
              <div className="content">
                {formatDateTime(now.first_voting_end_period)} -{" "}
                {formatDateTime(now.second_voting_start_period)}
              </div>
            </div>

            <div className="row">
              <div className="label text-center">2次審査期間</div>
              <div className="content">
                {formatDateTime(now.second_voting_start_period)} -{" "}
                {formatDateTime(now.second_voting_end_period)}
              </div>
            </div>

            <div className="row">
              <div className="label large text-center">備考</div>
              <div className="content large">{now.detail}</div>
            </div>
          </div>
          <div className="flex justify-center mt-3">
            <AdminButton
              label="書評を見る"
              className="detail-btn"
              onClick={() => handledetail(now.id)}
            />
          </div>
        </section>
      ))}

      <h1 className="events-headline text-center">終了済のイベント</h1>

      {eventEndData.map((end) => (
        <details
          key={end.id}
          className="w-11/12 m-auto p-4 end-event-accordion"
        >
          <summary className="flex items-center justify-between">
            <div className="summary_title">
              <h2 className="font-bold">{end.title}</h2>
              <p>
                {formatDateTime(end.start_period)} ~{" "}
                {formatDateTime(end.end_period)}
              </p>
            </div>
            <Icon
              icon="ep:arrow-up"
              rotate={2}
              width={40}
              className="icon"
            ></Icon>
          </summary>
          <section className="w-11/12 end-event-section m-auto p-4">
            <div className="flex items-center justify-between pb-3 event-title-section">
              <div className="flex items-center mr-10">
                <p>イベントの公開</p>
                <label className="toggle-switch ml-7">
                  <input
                    type="checkbox"
                    id={`myToggle-${end.id}`}
                    checked={
                      end.public_flag === true || end.public_flag === "true"
                    }
                    onChange={() => handleToggleEndEvent(end.id)}
                    aria-label="イベントの公開トグル"
                  />

                  <span className="slider"></span>
                </label>
                <p className="ml-3">{end.public_flag ? "　公開" : "非公開"}</p>
              </div>
            </div>

            <p className="now-event-condition my-5">現在のイベント状況</p>
            <EventProgressBar
              status={end.status}
              variant="full"
              width="w-2/3"
              progressClassName="w-full h-0.5"
            />

            <div className="flex items-center justify-between">
              <h2 className="font-bold event-data-headline">イベント情報</h2>
              <div className="flex gap-2">
                <AdminButton
                  label="編集"
                  type="button"
                  className="edit_btn"
                  onClick={() => handleEdit(end)}
                />
                <AdminButton
                  label="削除"
                  type="button"
                  className="delete-conf-btn"
                  onClick={() => handleDelete(end.id)}
                />
              </div>
            </div>

            <div className="schedule-table">
              <div className="row">
                <div className="label text-center">テーマタイトル</div>
                <div className="content">{end.title}</div>
              </div>

              <div className="row">
                <div className="label text-center">開始日</div>
                <div className="content">
                  {formatDateTime(end.start_period)}
                </div>
              </div>

              <div className="row">
                <div className="label text-center">書評投稿期間</div>
                <div className="content">
                  {formatDateTime(end.first_voting_start_period)} -{" "}
                  {formatDateTime(end.first_voting_end_period)}
                </div>
              </div>

              <div className="row">
                <div className="label text-center">1次審査期間</div>
                <div className="content">
                  {formatDateTime(end.first_voting_end_period)} -{" "}
                  {formatDateTime(end.second_voting_start_period)}
                </div>
              </div>

              <div className="row">
                <div className="label text-center">2次審査期間</div>
                <div className="content">
                  {formatDateTime(end.second_voting_start_period)} -{" "}
                  {formatDateTime(end.second_voting_end_period)}
                </div>
              </div>

              <div className="row">
                <div className="label large text-center">備考</div>
                <div className="content large">{end.detail}</div>
              </div>
            </div>
          </section>
        </details>
      ))}

      {/* モーダル */}
      <EventRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={closeModal}
        onSuccess={handleModalSuccess}
      />
      <EventEditModal
        isOpen={isEditModalOpen}
        onClose={closeModal}
        event={selectedEvent}
        onSuccess={handleModalSuccess}
      />
      <EventDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        canDelete={canDelete}
        errorMessage={deleteErrorMessage}
      />
    </main>
  );
}
