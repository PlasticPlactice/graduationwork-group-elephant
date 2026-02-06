"use client";

import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/features/EventCard";
import { Pagination } from "@/components/ui/pagination";
import { useSearchParams } from "next/navigation";

function EventPageInner() {
  const searchParams = useSearchParams();
  const currentPageRaw = Number(searchParams?.get("page") ?? "1");
  const currentPage =
    Number.isFinite(currentPageRaw) && currentPageRaw > 0
      ? Math.floor(currentPageRaw)
      : 1;

  // 仮のイベントデータ（例として3件）
  const activeEventList = [
    {
      title: "第4回 文庫Xイベント",
      daysLeft: 10,
      description: "投票期間中です！投票してみましょう。",
      buttonText: "投票する",
      href: "/event/vote/4",
      isFinished: false,
    },
  ];

  const endEventList = [
    {
      title: "第3回 文庫Xイベント",
      daysLeft: "終了",
      description: "入選作品が決定しました。確認してみましょう。",
      buttonText: "確認する",
      href: "/event/result/3",
      isFinished: true,
    },
    {
      title: "第2回 文庫Xイベント",
      daysLeft: "終了",
      description: "次回イベントもお楽しみに！",
      buttonText: "詳細を見る",
      href: "/event/result/2",
      isFinished: true,
    },
    {
      title: "第1回 文庫Xイベント",
      daysLeft: "終了",
      description: "次回イベントもお楽しみに！",
      buttonText: "詳細を見る",
      href: "/event/result/1",
      isFinished: true,
    },
  ];

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(endEventList.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const pagedEndEventList = endEventList.slice(
    startIndex,
    startIndex + itemsPerPage
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
                eventId=""
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
              eventId=""
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
