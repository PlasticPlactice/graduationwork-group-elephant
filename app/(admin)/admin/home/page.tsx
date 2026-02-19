"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import { Icon } from "@iconify/react";
import { EventProgressBar } from "@/components/ui/EventProgressBar";
import { formatDateTime } from "@/lib/dateUtils";
import "@/styles/admin/home.css";
import Link from "next/link";

type EventItem = {
  id: number;
  title: string;
  status: number;
  first_voting_end_period?: string;
};

export default function Page() {
  const router = useRouter();
  const [eventData, setEventData] = useState<EventItem[]>([]);
  const { addToast } = useToast();

  const handleDetail = () => {
    router.push("/admin/events");
  };

  // 初期読み込み
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events?status=0,1,2,3,4");
        if (!res.ok) {
          console.error("events fetch failed", await res.text());
          return;
        }
        const data = await res.json();

        // 一次審査終了日で近い順にソート
        const sortedData = data.sort((a: EventItem, b: EventItem) => {
          if (!a.first_voting_end_period) return 1;
          if (!b.first_voting_end_period) return -1;
          return (
            new Date(a.first_voting_end_period).getTime() -
            new Date(b.first_voting_end_period).getTime()
          );
        });

        setEventData(sortedData);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        addToast({ type: "error", message: "イベント一覧の取得に失敗しました" });
      }
    };

    void fetchEvents();
  }, [addToast]);

  return (
    <main className="home-main">
      <div className="home-sections">
        <div className="home-events">
          <h1 className="text-center event-title">開催中のイベント</h1>
          <div className="event-scroll-content py-2 px-5 shadow">
            {eventData.map((event) => (
              <div
                key={event.id}
                className=" py-4 px-4 m-auto text-center event-container mb-4"
              >
                <div className="mx-auto flex items-center justify-between w-4/5">
                  <p className="font-bold event-name">{event.title}</p>
                  <p className="event-date event-date-now">
                    一次審査終了日:{" "}
                    {formatDateTime(event.first_voting_end_period)}
                  </p>
                </div>

                <div className="mt-4">
                  <EventProgressBar
                    status={event.status}
                    variant="compact"
                    width="w-3/4"
                    progressClassName="w-full h-0.5"
                  />
                </div>
                <button
                  className="event-detail-btn mb-3 mt-7 p-0"
                  onClick={handleDetail}
                >
                  イベント詳細
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="home-actions grid gap-x-14 gap-y-5 mt-10 mb-3">
          <h1 className="text-center event-title">管理者ボタン</h1>
          {/* お知らせ管理 */}
          <Link href="/admin/notice" className="flex p-2 shadow-md admin-card">
            <div className="flex items-center justify-center w-auto mx-1">
              <Icon
                icon="mdi:megaphone"
                width="50"
                height="50"
                className="rounded-full admin-icon"
              />
            </div>
            <div>
              <h2 className="mb-1 ml-6 text-left card-title">お知らせ管理</h2>
              <p className="mb-1 ml-6 card-description">
                お知らせの作成・編集・公開
              </p>
            </div>
          </Link>

          {/* イベント管理 */}
          <Link
            href="/admin/events"
            className="flex py-2 pl-2 shadow-md admin-card"
          >
            <div className="flex items-center justify-center w-auto mx-1">
              <Icon
                icon="mdi:calendar"
                width="50"
                height="50"
                className="p-1 rounded-full admin-icon"
              />
            </div>
            <div>
              <h2 className="mb-1 ml-6 text-left card-title">イベント管理</h2>
              <p className="mb-1 ml-6 card-description">
                イベントの作成・編集・公開
              </p>
            </div>
          </Link>

          {/* ユーザー管理 */}
          <Link
            href="/admin/users"
            className="flex py-2 pl-2 pr-5 shadow-md admin-card"
          >
            <div className="flex items-center justify-center w-auto mx-1">
              <Icon
                icon="mdi:people"
                width="50"
                height="50"
                className="p-1 rounded-full admin-icon"
              />
            </div>
            <div>
              <h2 className="mb-1 ml-6 text-left card-title">ユーザー管理</h2>
              <p className="mb-1 ml-6 card-description">
                ユーザー情報の閲覧・管理
              </p>
            </div>
          </Link>

          {/* パスワード変更 */}
          <Link
            href="/admin/password"
            className="flex py-2 pl-2 pr-5 shadow-md admin-card"
          >
            <div className="flex items-center justify-center w-auto mx-1">
              <Icon
                icon="material-symbols:key"
                width="50"
                height="50"
                className="p-1 rounded-full admin-icon"
              />
            </div>
            <div>
              <h2 className="mb-1 ml-6 text-left card-title">パスワード変更</h2>
              <p className="mb-1 ml-6 card-description">
                管理者パスワードを変更
              </p>
            </div>
          </Link>

          {/* 利用規約管理 */}
          <Link
            href="/admin/detail-term"
            className="flex py-2 pl-2 pr-5 shadow-md admin-card"
          >
            <div className="flex items-center justify-center w-auto mx-1">
              <Icon
                icon="mingcute:paper-fill"
                width="50"
                height="50"
                className="p-1 rounded-full admin-icon"
              />
            </div>
            <div>
              <h2 className="mb-1 ml-6 text-left card-title">利用規約管理</h2>
              <p className="mb-1 ml-6 card-description">利用規約の編集</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
