"use client";
import AdminButton from "@/components/ui/admin-button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "@/styles/admin/events.css";
import { Icon } from "@iconify/react";
import EventRegisterModal from "@/components/admin/EventRegisterModal";
import EventEditModal from "@/components/admin/EventEditModal";
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
  public_flag?: boolean;
};

export default function Page() {
  const router = useRouter();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [eventNowData, setEventNowData] = useState<EventItem[]>([]);
  const [eventEndData, setEventEndData] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [isUpdatingPublicFlag, setIsUpdatingPublicFlag] = useState(false);

  // fetchEvents: イベントデータを取得する関数
  const fetchEvents = async () => {
    try {
      const [resNow, resEnd] = await Promise.all([
        fetch("/api/events?status=0,1,2"),
        fetch("/api/events?status=3"),
      ]);

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
    let mounted = true;

    const initializeFetch = async () => {
      setLoadingEvents(true);
      try {
        await fetchEvents();
      } finally {
        if (mounted) setLoadingEvents(false);
      }
    };

    initializeFetch();
    return () => {
      mounted = false;
    };
  }, []);

  const getProgressValue = (status: string) => {
    const statusMap: { [key: string]: number } = {
      "0": 18,
      "1": 39,
      "2": 61,
      "3": 83,
    };
    return statusMap[status] || 0;
  };

  const getCircleClassName = (index: number, status: string) => {
    const statusNumber = parseInt(status);
    if (index <= statusNumber) {
      return "event-condition-circle-now";
    }
    return "event-condition-circle-future";
  };

  const getArrowIcon = (index: number, status: string) => {
    const statusNumber = parseInt(status);
    if (statusNumber === index) {
      return (
        <Icon icon="bxs:up-arrow" rotate={2} className="up-arrow m-auto"></Icon>
      );
    }
    return (
      <Icon icon="material-symbols:circle" className="m-auto text-white"></Icon>
    );
  };

  // handleToggleNowEvent: 開催中イベントのトグル
  const handleToggleNowEvent = (id: number) => {
    const current = eventNowData.find((e) => e.id === id);
    if (!current) return;
    const newFlag = !(current.public_flag === true);
    updatePublicFlag(id, newFlag);
  };

  // handleToggleEndEvent: 終了済イベントのトグル
  const handleToggleEndEvent = (id: number) => {
    const current = eventEndData.find((e) => e.id === id);
    if (!current) return;
    const newFlag = !(current.public_flag === true);
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

  const handledetail = () => {
    router.push("/admin/events-details");
  };

  // モーダル成功時に実行されるコールバック（データ再取得）
  const handleModalSuccess = async () => {
    await fetchEvents();
  };

  return (
    <main>
      <AdminButton
        label="イベント登録"
        type="button"
        className="self-end ml-5 my-3 register-btn"
        onClick={handleRegister}
      />
      <h1 className="events-headline text-center">開催中のイベント</h1>

      {eventNowData.map((now) => (
        <section
          key={now.id}
          className="w-11/12 now-event-section m-auto p-4 mb-4"
        >
          <div className="flex items-center justify-between pb-3 event-title-section">
            <div className="flex items-center">
              <p className="font-bold event-title">{now.title}</p>
              <p className="ml-3">
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
                  checked={now.public_flag === true}
                  onChange={() => handleToggleNowEvent(now.id)}
                  aria-label="イベントの公開トグル"
                />

                <span className="slider"></span>
              </label>
            </div>
          </div>

          <p className="now-event-condition my-5">現在のイベント状況</p>
          <div className="flex justify-between w-2/3 m-auto">
            <p className="w-10">{getArrowIcon(0, now.status)}</p>
            <p className="w-10">{getArrowIcon(1, now.status)}</p>
            <p className="w-10">{getArrowIcon(2, now.status)}</p>
            <p className="w-10">{getArrowIcon(3, now.status)}</p>
          </div>
          <div className="flex justify-between w-2/3 m-auto">
            <p className="w-10">
              <Icon
                icon="material-symbols:circle"
                className={getCircleClassName(0, now.status)}
              ></Icon>
            </p>
            <p className="w-10">
              <Icon
                icon="material-symbols:circle"
                className={getCircleClassName(1, now.status)}
              ></Icon>
            </p>
            <p className="w-10">
              <Icon
                icon="material-symbols:circle"
                className={getCircleClassName(2, now.status)}
              ></Icon>
            </p>
            <p className="w-10">
              <Icon
                icon="material-symbols:circle"
                className={getCircleClassName(3, now.status)}
              ></Icon>
            </p>
          </div>
          <div className="flex justify-center mt-2">
            <progress
              max={100}
              value={getProgressValue(now.status)}
              className="w-full h-0.5"
            ></progress>
          </div>
          <div className="flex justify-between w-2/3 m-auto">
            <span>開催前</span>
            <span>一次審査</span>
            <span>二次審査</span>
            <span>終了済</span>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="font-bold event-data-headline">イベント情報</h2>
            <AdminButton
              label="編集"
              type="button"
              className="edit_btn"
              onClick={() => handleEdit(now)}
            />
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
              onClick={handledetail}
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
                    checked={end.public_flag === true}
                    onChange={() => handleToggleEndEvent(end.id)}
                    aria-label="イベントの公開トグル"
                  />

                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <p className="now-event-condition my-5">現在のイベント状況</p>
            <div className="flex justify-between w-2/3 m-auto">
              <p className="w-10">{getArrowIcon(0, end.status)}</p>
              <p className="w-10">{getArrowIcon(1, end.status)}</p>
              <p className="w-10">{getArrowIcon(2, end.status)}</p>
              <p className="w-10">{getArrowIcon(3, end.status)}</p>
            </div>
            <div className="flex justify-between w-2/3 m-auto">
              <p className="w-10">
                <Icon
                  icon="material-symbols:circle"
                  className={getCircleClassName(0, end.status)}
                ></Icon>
              </p>
              <p className="w-10">
                <Icon
                  icon="material-symbols:circle"
                  className={getCircleClassName(1, end.status)}
                ></Icon>
              </p>
              <p className="w-10">
                <Icon
                  icon="material-symbols:circle"
                  className={getCircleClassName(2, end.status)}
                ></Icon>
              </p>
              <p className="w-10">
                <Icon
                  icon="material-symbols:circle"
                  className={getCircleClassName(3, end.status)}
                ></Icon>
              </p>
            </div>
            <div className="flex justify-center mt-2">
              <progress
                max={100}
                value={getProgressValue(end.status)}
                className="w-full h-0.5"
              ></progress>
            </div>
            <div className="flex justify-between w-2/3 m-auto">
              <span>開催前</span>
              <span>一次審査</span>
              <span>二次審査</span>
              <span>終了済</span>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="font-bold event-data-headline">イベント情報</h2>
              <AdminButton
                label="編集"
                type="button"
                className="edit_btn"
                onClick={() => handleEdit(end)}
              />
            </div>

            <div className="schedule-table">
              <div className="row ">
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
    </main>
  );
}
