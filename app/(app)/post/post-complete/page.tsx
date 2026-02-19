"use client";

import Styles from "@/styles/app/poster.module.css";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type EventItem = {
  id: number;
  title: string;
  status: number;

  created_at?: string;
  end_period?: string;

  first_voting_start_period: string;
  first_voting_end_period?: string;
  second_voting_start_period: string;
  second_voting_end_period?: string;
};
type EventItemView = {
  id: number;
  title: string;
  status: number;
  first_voting_start_period: string;
  second_voting_start_period: string;
  end_period: string;
};

export default function PostCompletePage() {
  const [eventId, setEventId] = useState<string | null>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("eventId") : null,
  );
  const [eventData, setEventData] = useState<EventItem[]>([]);

  const toView = (item: EventItem): EventItemView => ({
    id: item.id,
    title: item.title,
    status: item.status,
    first_voting_start_period: item.first_voting_start_period
      ? formatDate(new Date(item.first_voting_start_period))
      : "",
    second_voting_start_period: item.second_voting_start_period
      ? formatDate(new Date(item.second_voting_start_period))
      : "",
    end_period: item.end_period ? formatDate(new Date(item.end_period)) : "",
  });

  const fetchEventById = async (eventId: number) => {
    try {
      const res = await fetch(`/api/events?id=${eventId}`);
      if (!res.ok) {
        console.error("events fetch failed", await res.text());
        return;
      }
      const data: EventItem[] = await res.json();

      const viewData = data.map(toView);

      setEventData(viewData);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}年${m}月${d}日`;
  };

  useEffect(() => {
    if (!eventId) return;
    let mounted = true;

    (async () => {
      try {
        const res = await fetch(`/api/events?id=${Number(eventId)}`);
        if (!res.ok) {
          console.error("events fetch failed", await res.text());
          return;
        }
        const data: EventItem[] = await res.json();
        const viewData = data.map(toView);
        if (mounted) setEventData(viewData);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [eventId]);

  return (
    <div className={`${Styles.posterContainer}`}>
      <Image
        src="/app/checkbox-multiple-marked-circle-outline.png"
        alt="checkMark"
        width={80}
        height={80}
        className="mx-auto"
      />
      <p className={`font-bold text-center ${Styles.text24px}`}>
        投稿が完了しました！
      </p>
      <p className={`${Styles.warningColor}`}>
        ※１次審査が開始されるまでマイページより書評の編集が可能です。
      </p>

      <div className={`border rounded-sm p-4 mt-4 mb-8`}>
        <p className={`text-center border-b pb-4`}>{eventData[0]?.title}</p>
        <div className="max-w-10/12 mx-auto">
          <div className="mt-4">
            <div className="flex gap-7 justify-between">
              <p className={`${Styles.text16px}`}>１次審査開始</p>
              <p className={`font-bold text-blue-500`}>
                {eventData[0]?.first_voting_start_period}
              </p>
            </div>
            <p className={`${Styles.text12px} ${Styles.subColor}`}>
              運営が１次審査を行います。
            </p>
          </div>
          <div className="mt-4">
            <div className="flex gap-7 justify-between">
              <p className={`${Styles.text16px}`}>２次審査開始</p>
              <p className={`font-bold`}>
                {eventData[0]?.second_voting_start_period}
              </p>
            </div>
            <p className={`${Styles.text12px} ${Styles.subColor}`}>
              ユーザーの皆さんが２次審査を行います。
            </p>
          </div>
          <div className="mt-4">
            <div className="flex gap-7 justify-between">
              <p className={`${Styles.text16px}`}>結果発表</p>
              <p className={`font-bold`}>{eventData[0]?.end_period}</p>
            </div>
            <p className={`${Styles.text12px} ${Styles.subColor}`}>
              上位作品は入賞しサイトに掲載されます。
              <br />
              また、実際に文庫Xとして販売される書評もあります。
            </p>
          </div>
        </div>
      </div>

      <p
        className={`font-bold text-center ${Styles.subColor} ${Styles.text12px}`}
      >
        過去の受賞作品、現在開催中のイベントはこちら ↓
      </p>
      <button
        type="button"
        onClick={() => (window.location.href = "/")}
        className={`w-full mb-5 ${Styles.barcodeScan__backButton}`}
      >
        像と花ファンサイトへ
      </button>
      <Link href={`barcode-scan/${eventId}`} className="w-full block mb-5">
        <button
          type="button"
          className={`w-full ${Styles.barcodeScan__backButton}`}
        >
          もう１冊登録する
        </button>
      </Link>
      <Link href="/poster/mypage" className="w-full block">
        <button type="button" className={`w-full`}>
          書評を確認する（マイページ）
        </button>
      </Link>
    </div>
  );
}
