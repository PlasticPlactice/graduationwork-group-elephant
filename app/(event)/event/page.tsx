"use client";

import React, { Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/features/EventCard";
import { Pagination } from "@/components/ui/pagination";
import { useSearchParams } from "next/navigation";

interface EventData {
  id: number;
  title: string;
  detail: string;
  status: number;
  second_voting_end_period: string;
}

function EventPageInner() {
  const searchParams = useSearchParams();
  const currentPageRaw = Number(searchParams?.get("page") ?? "1");
  const currentPage =
    Number.isFinite(currentPageRaw) && currentPageRaw > 0
      ? Math.floor(currentPageRaw)
      : 1;

  const [activeEventList, setActiveEventList] = useState<
    Array<{
      id: number;
      title: string;
      daysLeft: number;
      description: string;
      buttonText: string;
      href: string;
      isFinished: boolean;
    }>
  >([]);

  const [endEventList, setEndEventList] = useState<
    Array<{
      id: number;
      title: string;
      daysLeft: string;
      description: string;
      buttonText: string;
      href: string;
      isFinished: boolean;
    }>
  >([]);

  // 投票締切までの日数を計算
  const daysUntilDate = (dateString: string): number => {
    const now = new Date();
    const target = new Date(dateString);

    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const targetStart = new Date(
      target.getFullYear(),
      target.getMonth(),
      target.getDate(),
    );

    const diffMs = targetStart.getTime() - todayStart.getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  };

  // DBからイベントデータを取得
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // 投票期間（ステータス3）のイベントを取得
        const votingRes = await fetch("/api/events?status=3");
        const votingData: EventData[] = votingRes.ok
          ? await votingRes.json()
          : [];

        // 閲覧期間・終了（ステータス4,5）のイベントを取得
        const viewingRes = await fetch("/api/events?status=4,5");
        const viewingData: EventData[] = viewingRes.ok
          ? await viewingRes.json()
          : [];

        // 投票期間イベントを整形
        const activeEvents = votingData.map((event) => ({
          id: event.id,
          title: event.title,
          daysLeft: daysUntilDate(event.second_voting_end_period),
          description: event.detail || "投票期間中です！投票してみましょう。",
          buttonText: "投票する",
          href: `/posts/bookshelf`,
          isFinished: false,
        }));

        // 閲覧期間イベントを整形
        const endedEvents = viewingData.map((event) => ({
          id: event.id,
          title: event.title,
          daysLeft: "終了",
          description:
            event.detail || "投票が終了しました。結果を確認してみましょう。",
          buttonText: "結果を確認する",
          href: `/posts/bookshelf`,
          isFinished: true,
        }));

        setActiveEventList(activeEvents);
        setEndEventList(endedEvents);
      } catch (error) {
        console.error("イベントデータの取得に失敗しました:", error);
      }
    };

    void fetchEvents();
  }, []);

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(endEventList.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const pagedEndEventList = endEventList.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="min-h-screen bg-white pt-6 pb-16">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* ファンサイトへ戻るボタンを追加 */}
        <div className="mb-12 flex justify-center lg:justify-start">
          <Button
            href="/"
            className="w-full lg:w-auto bg-white border font-bold h-auto rounded-lg shadow hover:bg-slate-50 transition-colors py-3 px-6"
          >
            象と花ファンサイトへ
          </Button>
        </div>

        <h2 className="text-center lg:text-left text-2xl font-bold mb-10 text-slate-900">
          現在開催中のイベント
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
          {activeEventList.map((event, idx) => (
            <div key={idx} className="w-full max-w-xl">
              <EventCard
                eventId={String(event.id)}
                title={event.title}
                daysLeft={event.daysLeft}
                detail={event.description}
                buttonText={event.buttonText}
                href={event.href}
                isFinished={event.isFinished}
              />
            </div>
          ))}
        </div>

        <h2 className="text-center lg:text-left text-2xl font-bold my-10 text-slate-900">
          過去のイベント
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* イベントカードをループで表示 */}
          {pagedEndEventList.map((event, idx) => (
            <EventCard
              key={idx}
              eventId={String(event.id)}
              title={event.title}
              daysLeft={event.daysLeft}
              detail={event.description}
              buttonText={event.buttonText}
              href={event.href}
              isFinished={event.isFinished}
            />
          ))}
        </div>

        {/* ページネーション */}
        <Pagination totalPages={totalPages} currentPage={safeCurrentPage} />
      </div>
    </div>
  );
}

export default function EventPage() {
  return (
    <Suspense fallback={null}>
      <EventPageInner />
    </Suspense>
  );
}
