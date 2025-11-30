import React from "react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/features/EventCard";

export default function EventPage() {
  return (
    <div className="min-h-screen bg-white pt-6">
      <div className="container mx-auto px-2 max-w-2xl">
        {/* ファンサイトへ戻るボタンを追加 */}
        <div className="mb-12">
          <Button
            href="/"
            className="w-full bg-white border border-[#3ea8e5] font-bold h-auto rounded-lg shadow hover:bg-slate-50 transition-colors"
            style={{ color: "#3ea8e5", padding: "12px 0" }}
          >
            象と花ファンサイトへ
          </Button>
        </div>

        <h2 className="text-center text-2xl font-bold mb-10 text-slate-900">
          現在開催中のイベント
        </h2>

        <div className="flex flex-col gap-6">
          {/* 開催中のイベント */}
          <EventCard
            title="第1回 文庫Xイベント"
            daysLeft={10}
            description="投票期間中です！投票してみましょう！"
            buttonText="投票する"
            href="/event/vote/1"
          />

          {/* 終了したイベント */}
          <EventCard
            title="第1回 文庫Xイベント"
            daysLeft="終了"
            description="入選作品が決定しました！確認してみましょう！"
            buttonText="確認する"
            href="/event/result/1"
            isFinished={true}
          />

          {/* 終了したイベント（例2） */}
          <EventCard
            title="第1回 文庫Xイベント"
            daysLeft="終了"
            description="入選作品が決定しました！確認してみましょう！"
            buttonText="確認する"
            href="/event/result/1"
            isFinished={true}
          />

          {/* 終了したイベント（例3） */}
          <EventCard
            title="第1回 文庫Xイベント"
            daysLeft="終了"
            description="入選作品が決定しました！確認してみましょう！"
            buttonText="確認する"
            href="/event/result/1"
            isFinished={true}
          />
        </div>
      </div>
    </div>
  );
}
