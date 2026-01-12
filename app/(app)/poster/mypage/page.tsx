"use client";

import React, { useState, useRef } from "react";
import { EventCard } from "@/components/features/EventCard";
import Link from "next/link";

import { ReviewPassedModal } from "@/components/modals/ReviewPassedModal";
import { ProfileEditModal } from "@/components/modals/ProfileEditModal";
import { WithdrawConfirmModal } from "@/components/modals/WithdrawConfirmModal";
import { MassageModal } from "@/components/modals/MassageModal";

import Styles from "@/styles/app/poster.module.css";

type ReviewFilterTab = "all" | "draft" | "reviewing" | "finished";

export default function MyPage() {
  // 初期表示時にモーダルを表示
  const [showModal, setShowModal] = useState(true);
  // プロフィール編集、退会確認、DM（運営からのお知らせ）モーダルの表示
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showDMModal, setShowDMModal] = useState(false);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  // ユーザーネーム
  const userName = "タナカタロウ";
  const sampleEvents = [
    {
      title: "第1回 文庫Xイベント",
      daysLeft: 10,
      description: "投稿可能期間中です！投稿してみましょう！",
      buttonText: "投稿へ",
      href: "/poster/barcode-scan",
    },
    {
      title: "第2回 文庫Xイベント",
      daysLeft: 15,
      description: "投稿可能期間中です！投稿してみましょう！",
      buttonText: "投稿へ",
      href: "/poster/barcode-scan",
    },
  ];

  const sampleReviews = [
    {
      title: "色彩を持たない多崎つくると、彼の巡礼の年",
      status: "1次審査前",
      badgeType: "red",
      excerpt:
        "静かに心へ染み込むような物語です。派手な展開や劇的な出来事よりも、登場人物の心の...",
      buttonText: "投稿済み・編集する",
      buttonDisabled: false,
      href: "/poster/edit",
    },
    {
      title: "色彩を持たない多崎つくると、彼の巡礼の年",
      status: "1次審査中",
      badgeType: "blue",
      excerpt:
        "静かに心へ染み込むような物語です。派手な展開や劇的な出来事よりも、登場人物の心の...",
      buttonText: "投稿済み・編集不可",
      buttonDisabled: true,
      href: undefined,
    },
    {
      title: "色彩を持たない多崎つくると、彼の巡礼の年",
      status: "下書き",
      badgeType: "gray",
      excerpt:
        "静かに心へ染み込むような物語です。派手な展開や劇的な出来事よりも、登場人物の心の...",
      buttonText: "下書きの編集＆投稿",
      buttonDisabled: false,
      href: "/poster/edit",
    },
  ];

  const REVIEW_FILTER_TABS = [
    { key: "all" as const, label: "全て" },
    { key: "draft" as const, label: "下書き" },
    { key: "reviewing" as const, label: "審査中" },
    { key: "finished" as const, label: "終了済み" },
  ];

  const [activeFilterTab, setActiveFilterTab] =
    useState<ReviewFilterTab>("all");

  const filteredReviews = sampleReviews.filter((review) => {
    if (activeFilterTab === "all") return true;
    if (activeFilterTab === "draft") return review.status === "下書き";
    if (activeFilterTab === "reviewing") return review.status.includes("審査");
    if (activeFilterTab === "finished")
      return review.status === "終了" || review.status === "終了済み";
    return true;
  });

  return (
    <>
      {/* 1次審査通過モーダル */}
      <ReviewPassedModal open={showModal} onClose={() => setShowModal(false)} />
      <div className="min-h-screen bg-white px-4 py-4 box-border">
        <div className="text-center mt-3 relative">
          <h1 className="text-lg font-bold text-slate-900">マイページ</h1>
          <div className="flex items-center justify-center gap-3 mt-1">
            <div className="text-rose-500 font-bold">○○○さん</div>
          </div>
          <div
            className="absolute right-3 top-2 flex items-center"
            aria-hidden="true"
          >
            {/* SVG 封筒アイコン（大きめ） */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              onClick={() => setShowDMModal(true)}
            >
              <path
                d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-11z"
                stroke="#374151"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 6.5l-9 7-9-7"
                stroke="#374151"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <MassageModal open={showDMModal} userName="タナカタロウ" onClose={() => setShowDMModal(false)} />
          </div>
        </div>

        <div className="mb-1">
          <Link
            href="/"
            className="inline-block mt-6 ml-1 font-bold text-sky-500"
            aria-label="ファンサイトのトップページへ移動"
          >
            <span className="mr-1" aria-hidden="true">
              &lt;
            </span>{" "}
            ファンサイトはこちら
          </Link>
        </div>

        <div className="max-w-2xl mx-auto my-4">
          <div className="flex items-center justify-center gap-4 my-6">
            <div className="w-24 h-px bg-black" />
            <h2 className="font-bold text-slate-900">投稿のイベント</h2>
            <div className="w-24 h-px bg-black" />
          </div>

          <div className="flex flex-col gap-4">
            {sampleEvents.map((event, eventIndex) => (
              <div key={eventIndex} className="max-w-2xl">
                <EventCard
                  title={event.title}
                  daysLeft={event.daysLeft}
                  description={event.description}
                  buttonText={event.buttonText}
                  href={event.href}
                />
              </div>
            ))}
          </div>

          {/* あなたの書評セクション (イベントカードの次に表示) */}
          <div className="max-w-2xl mx-auto my-3">
            <div className="text-center my-6">
              <div className="flex items-center justify-center gap-4 mt-20">
                <div className="w-24 h-px bg-black" />
                <h2 className="font-bold text-slate-900">あなたの書評</h2>
                <div className="w-24 h-px bg-black" />
              </div>
              <div className="text-rose-500 text-sm mt-1 font-bold">
                ※１次審査前のみ編集できます。
              </div>
            </div>

            {/* tabs: use ul/li/a structure (参考) */}
            <ul
              className="flex flex-wrap justify-center text-sm font-medium text-center border-b border-gray-500 my-3"
              role="tablist"
            >
              {REVIEW_FILTER_TABS.map((tab, tabIndex) => (
                <li className="mr-2" key={tab.key}>
                  <a
                    href="#"
                    ref={(el) => {
                      tabRefs.current[tabIndex] = el;
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveFilterTab(tab.key);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight") {
                        e.preventDefault();
                        const nextIndex =
                          tabIndex + 1 < REVIEW_FILTER_TABS.length
                            ? tabIndex + 1
                            : 0;
                        const nextTab = REVIEW_FILTER_TABS[nextIndex];
                        setActiveFilterTab(nextTab.key);
                        tabRefs.current[nextIndex]?.focus();
                      }
                      if (e.key === "ArrowLeft") {
                        e.preventDefault();
                        const prevIndex =
                          tabIndex - 1 >= 0
                            ? tabIndex - 1
                            : REVIEW_FILTER_TABS.length - 1;
                        const prevTab = REVIEW_FILTER_TABS[prevIndex];
                        setActiveFilterTab(prevTab.key);
                        tabRefs.current[prevIndex]?.focus();
                      }
                    }}
                    role="tab"
                    aria-selected={activeFilterTab === tab.key}
                    tabIndex={activeFilterTab === tab.key ? 0 : -1}
                    className={`inline-block p-3 rounded-t-md font-medium ${
                      activeFilterTab === tab.key
                        ? "-mb-px bg-white border border-b-0 border-gray-400 rounded-t-md"
                        : "hover:bg-slate-100"
                    }`}
                    style={{ color: "var(--color-text)" }}
                    data-key={tab.key}
                  >
                    {tab.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3">
              {filteredReviews.map((review, reviewIndex) => (
                <div
                  key={reviewIndex}
                  className="border rounded-lg p-4 bg-white border-gray-500"
                >
                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-bold text-base mb-0 pr-2">
                        {review.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full font-bold text-sm flex-shrink-0 ${
                          review.badgeType === "red"
                            ? "bg-rose-50 text-rose-600 border border-rose-100"
                            : review.badgeType === "blue"
                            ? "bg-sky-50 text-sky-600 border border-sky-100"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {review.status}
                      </span>
                    </div>

                    <div className="text-slate-500 text-sm leading-relaxed mt-2">
                      {review.excerpt}
                    </div>

                    {/* 編集ボタンは要約の下に配置（カード下寄せ） */}
                    <div className="mt-4">
                      {review.href ? (
                        <Link href={review.href}>
                          <button className="w-full bg-rose-400 text-white px-3 py-2 rounded-md font-bold">
                            {review.buttonText}
                          </button>
                        </Link>
                      ) : (
                        <button
                          className="w-full text-white px-3 py-2 rounded-md font-bold cursor-not-allowed"
                          style={{ backgroundColor: "var(--color-sub)" }}
                          disabled
                        >
                          {review.buttonText}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* マイページ下部のメニュー（添付画像のコンテンツ） */}
            <div className="max-w-2xl mx-auto my-10">
              <ul
                className="divide-y-2 bg-white overflow-hidden border-t-2 border-b-2"
                style={{
                  borderColor: "var(--color-sub)",
                  borderTopColor: "var(--color-sub)",
                  borderBottomColor: "var(--color-sub)",
                }}
              >
                <li style={{ borderColor: "var(--color-sub)" }}>
                  <button onClick={() => setShowEditProfileModal(true)} className={`${Styles.mypage__linkButton}`}>プロフィールの編集</button>
                </li>
                <ProfileEditModal open={showEditProfileModal} onClose={() => setShowEditProfileModal(false)} />
                <li style={{ borderColor: "var(--color-sub)" }}>
                  <a
                    href="/mypage/password"
                    className="block text-center font-bold py-4 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    style={{ color: "var(--color-text)" }}
                    aria-label="パスワードの変更へ"
                  >
                    パスワードの変更
                  </a>
                </li>
                <li style={{ borderColor: "var(--color-sub)" }}>
                  <button onClick={() => setShowDeleteAccountModal(true)} className={`${Styles.mypage__linkButton}`}>退会手続き</button>
                </li>
                <WithdrawConfirmModal userName={userName} open={showDeleteAccountModal} onClose={() => setShowDeleteAccountModal(false)} />
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
