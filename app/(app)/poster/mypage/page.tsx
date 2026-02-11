"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { DEMO_MODE } from "@/lib/constants/demoMode";
import { EventCard } from "@/components/features/EventCard";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";

import { ReviewPassedModal } from "@/components/modals/ReviewPassedModal";
import { ProfileEditModal } from "@/components/modals/ProfileEditModal";
import { MassageModal } from "@/components/modals/MassageModal";
import { AccountDeleteModal } from "@/components/modals/AccountDeleteModal";

import Styles from "@/styles/app/poster.module.css";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";

interface ProfileData {
  userId: number;
  nickName: string;
  address: string;
  addressDetail: string;
  age: number;
  gender: number;
  introduction: string;
}

interface EventData {
  id: number;
  title: string;
  detail: string;
  status: number;
  first_voting_start_period: Timestamp;
  first_voting_end_period: Timestamp;
}

type ReviewFilterTab = "all" | 0 | 4 | "passed";
type ReviewStatusCode = 0 | 1 | 2 | 3;

interface BookReviewData {
  id: number;
  book_title: string;
  evaluations_status: number;
  public_flag: boolean;
  draft_flag: boolean;
  review: string;
}

export default function MyPage() {
  const router = useRouter();

  // 蛻晄悄陦ｨ遉ｺ譎ゅ↓繝｢繝ｼ繝繝ｫ繧定｡ｨ遉ｺ
  const [showModal, setShowModal] = useState(false);
  // 繝励Ο繝輔ぅ繝ｼ繝ｫ邱ｨ髮・・莨夂｢ｺ隱阪．M・磯°蝟ｶ縺九ｉ縺ｮ縺顔衍繧峨○・峨Δ繝ｼ繝繝ｫ縺ｮ陦ｨ遉ｺ
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showDMModal, setShowDMModal] = useState(false);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // 繝ｦ繝ｼ繧ｶ繝ｼ繝・・繧ｿ
  const [userData, setUserData] = useState<ProfileData | null>(null);
  // 繝ｦ繝ｼ繧ｶ縺ｮ譖ｸ隧輔ョ繝ｼ繧ｿ
  const [bookReviewData, setBookReviewData] = useState<BookReviewData[]>([]);

  // イベントデータ
  const [eventData, setEventData] = useState<EventData[]>([]);
  // 未読メッセージデータ
  interface UnreadMessage {
    id: number;
    message: {
      message: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }
  const [unreadMessage, setUnreadMessage] = useState<UnreadMessage | null>(
    null,
  );

  // 繧､繝吶Φ繝亥叙蠕鈴未謨ｰ
  // 繧ｹ繝・・繧ｿ繧ｹ・代・繧､繝吶Φ繝医・縺ｿ
  // ・代′謚慕ｨｿ蜿ｯ閭ｽ縺ｪ繧､繝吶Φ繝医・諠ｳ螳壹・
  const fetchEventList = useCallback(async () => {
    try {
      const res = await fetch("/api/events?status=1", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        console.log("data" + JSON.stringify(data, null, 2));
        setEventData(data);
      }
    } catch (error) {
      console.error("Failed to fetch event data", error);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
      }
    } catch (error) {
      console.error("Failed to fetch user data", error);
    }
  }, []);

  const fetchBookReviewData = useCallback(async () => {
    try {
      const res = await fetch("/api/book-reviews/mypage", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        console.log("data:" + JSON.stringify(data, null, 2));
        setBookReviewData(data);
      }
    } catch (error) {
      console.error("Failed to Fetch book review data", error);
    }
  }, []);

  // 譛ｪ隱ｭ繝｡繝・そ繝ｼ繧ｸ蜿門ｾ・
  const fetchUnreadMessage = useCallback(async () => {
    try {
      const res = await fetch("/api/user/messages/unread");
      if (res.ok) {
        const data = await res.json();
        if (data.unreadMessage) {
          setUnreadMessage(data.unreadMessage);
          setShowModal(true); // 譛ｪ隱ｭ縺後≠繧句ｴ蜷医・縺ｿ繝｢繝ｼ繝繝ｫ繧帝幕縺・
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  // 繝｡繝・そ繝ｼ繧ｸ譌｢隱ｭ蛹門・逅・
  const handleConfirmRead = async () => {
    if (!unreadMessage) {
      setShowModal(false);
      return;
    }
    try {
      await fetch(`/api/user/messages/${unreadMessage.id}/read`, {
        method: "PATCH",
      });
      setShowModal(false);
      setUnreadMessage(null);
    } catch (error) {
      console.error("Failed to mark as read:", error);
      // 繧ｨ繝ｩ繝ｼ縺ｧ繧ゅ→繧翫≠縺医★髢峨§繧具ｼ・X蜆ｪ蜈茨ｼ・
      setShowModal(false);
    }
  };

  // 蛻晏屓繝ｬ繝ｳ繝繝ｪ繝ｳ繧ｰ譎ゅ↓繝・・繧ｿ繧貞叙蠕・
  useEffect(() => {
    fetchUserData();
    fetchBookReviewData();
    fetchUnreadMessage();
    fetchEventList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const REVIEW_FILTER_TABS: {
    key: ReviewFilterTab;
    label: string;
  }[] = [
    { key: "all" as const, label: "全て" },
    { key: 4, label: "下書き" },
    { key: 0, label: "審査前" },
    { key: "passed", label: "審査通過" },
  ];

  const REVIEW_STATUS_MAP = {
    0
    : {
      label: "審査前",
      badgeType: "gray",
      canEdit: true,
    },
    1: {
      label: "１次通過",
      badgeType: "gray",
      canEdit: true,
    },
    2: {
      label: "２次通過",
      badgeType: "blue",
      canEdit: false,
    },
    3: {
      label: "３次通過",
      badgeType: "red",
      canEdit: false,
    },
    4: {
      label: "下書き",
      badgeType: "gray",
      canEdit: true,
    }
  } as const;

  // HTMLタグを削除してプレーンテキストに変換
  const stripHtmlTags = (html: string): string => {
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
  };

  // DB/APIの文字列・数値をUI用コード(0..3)へ正規化
  const normalizeStatus = (val: number): ReviewStatusCode => {
    return val === 0 || val === 1 || val === 2 || val === 3
      ? (val as ReviewStatusCode)
      : 0;
  };

  // 陦ｨ遉ｺ逕ｨ縺ｫ繝・・繧ｿ繧呈紛蠖｢
  const uiReviews = bookReviewData.map((review) => {
    if (review.draft_flag) {
      return {
        bookReviewId: review.id,
        title: review.book_title,
        status: REVIEW_STATUS_MAP[4].label,
        evaluations_status: 4,
        badgeType: REVIEW_STATUS_MAP[4].badgeType,
        excerpt: stripHtmlTags(review.review),
        buttonText: "編集する",
        href: "/poster/edit",
      };
    }

    const code = normalizeStatus(review.evaluations_status);
    const status = REVIEW_STATUS_MAP[code];

    return {
      bookReviewId: review.id,
      title: review.book_title,
      status: status?.label ?? "未設定",
      evaluations_status: code,
      badgeType: status?.badgeType ?? "gray",
      excerpt: stripHtmlTags(review.review),
      buttonText: status?.canEdit ? "編集する" : "編集不可",
      href: status?.canEdit ? "/poster/edit" : undefined,
    };
  });

  const [activeFilterTab, setActiveFilterTab] =
    useState<ReviewFilterTab>("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredReviews = uiReviews.filter((review) => {
    if (activeFilterTab === "all") return true;
    if (activeFilterTab === "passed") return [1, 2, 3].includes(review.evaluations_status);
    return review.evaluations_status === activeFilterTab;
  });

  const handleDeleteAccount = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: "ユーザー退会" }),
      });

      if (res.ok) {
        await signOut({ callbackUrl: "/" });
      } else {
        const data = await res.json();
        alert(
          data.message ||
            "退会処理に失敗しました。時間をおいて再度お試しください。",
        );
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Withdraw error:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEditButton = (bookReview_id: number) => {
    sessionStorage.setItem(
      "bookReviewIdDraft",
      JSON.stringify({
        bookReviewId: bookReview_id,
      }),
    );

    router.push("/post/edit");
  };

  // 謚慕ｨｿ邱繧∝・繧翫∪縺ｧ縺ｮ譌･謨ｰ繧定ｨ育ｮ励☆繧矩未謨ｰ
  function daysFromToday(dateString: string): number {
    const today = new Date();
    const target = new Date(dateString);

    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const targetStart = new Date(
      target.getFullYear(),
      target.getMonth(),
      target.getDate(),
    );

    const diffMs = targetStart.getTime() - todayStart.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  return (
    <>
      {/* 1谺｡蟇ｩ譟ｻ騾夐℃繝｢繝ｼ繝繝ｫ */}
      <ReviewPassedModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmRead}
        message={unreadMessage?.message?.message}
      />
      {/* 騾莨夂｢ｺ隱阪Δ繝ｼ繝繝ｫ */}
      <AccountDeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
      />
      <div
        className="min-h-screen bg-white px-4 py-4 box-border"
        style={{ "--color-main": "#36A8B1" } as CSSProperties}
      >
        <div className="mt-3 max-w-6xl mx-auto px-4 flex flex-col gap-3 md:flex-row md:items-start">
          <Link href="/" className="hidden md:block">
            <div
              className="flex items-center px-2 rounded shadow-md h-10 w-64"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-main)",
              }}
            >
              <Image
                src="/layout/new_logo.png"
                alt="logo"
                width={32}
                height={32}
                className="ml-2"
              />
              <span
                className="font-bold ml-2 whitespace-nowrap"
                style={{ color: "var(--color-main)" }}
              >
                象と花ファンサイトへ
                <span className="ml-2" aria-hidden="true">
                  &gt;
                </span>
              </span>
            </div>
          </Link>

          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-slate-900">マイページ</h1>
            <div className="flex items-center justify-center gap-3 mt-1">
              <div className={`font-bold ${Styles.mainColor}`}>
                {userData?.nickName || "ゲストさん"}
              </div>
            </div>
            <div className="mt-3 flex justify-center md:hidden">
              <Link href="/">
                <div
                  className="flex items-center px-2 rounded shadow-md h-10 w-full max-w-md md:w-64"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    border: "1px solid var(--color-main)",
                  }}
                >
                  <Image
                    src="/layout/new_logo.png"
                    alt="logo"
                    width={32}
                    height={32}
                    className="ml-2"
                  />
                  <span
                    className="font-bold ml-2 whitespace-nowrap"
                    style={{ color: "var(--color-main)" }}
                  >
                    象と花ファンサイトへ
                    <span className="ml-2" aria-hidden="true">
                      &gt;
                    </span>
                  </span>
                </div>
              </Link>
            </div>
          </div>

          <div
            className="hidden md:flex items-center w-64 justify-end"
            aria-hidden="true"
          >
            {/* SVG 蟆∫ｭ偵い繧､繧ｳ繝ｳ・亥､ｧ縺阪ａ・・*/}
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
            <MassageModal
              open={showDMModal}
              onClose={() => setShowDMModal(false)}
              userName={userData?.nickName || "ゲストさん"}
            />
          </div>
        </div>

        <div className="mb-1">
          {/* <Link
            href="/"
            className="inline-block mt-6 ml-1 font-bold text-sky-500"
            aria-label="ファンサイトのトップページへ移動"
          >
            <span className="mr-1" aria-hidden="true">
              &lt;
            </span>{" "}
            ファンサイトはこちら
          </Link> */}
          <Link href="/">
            <div
              className="flex items-center px-2 rounded shadow-md my-10"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-main)",
              }}
            >
              <Image
                src="/layout/new_logo.png"
                alt="logo"
                width={50}
                height={50}
                className="ml-3"
              />
              <span
                className="font-bold ml-auto"
                style={{ color: "var(--color-main)" }}
              >
                象と花ファンサイトへ
                <span className="ml-4" aria-hidden="true">
                  &gt;
                </span>
              </span>
            </div>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto my-4 lg:grid lg:grid-cols-2 lg:gap-10">
          <div className="max-w-2xl mx-auto lg:mx-0">
            <div className="flex items-center justify-center gap-4 my-6">
              <div className="w-24 h-px bg-black" />
              <h2 className="font-bold text-slate-900">現在開催中のイベント</h2>
              <div className="w-24 h-px bg-black" />
            </div>
            <div className="flex flex-col gap-4">
              {eventData.map((event, eventIndex) => (
                <div key={eventIndex} className="max-w-2xl">
                  <EventCard
                    eventId={String(event.id)}
                    title={event.title}
                    href="/post/barcode-scan"
                    daysLeft={daysFromToday(
                      String(event.first_voting_end_period),
                    )}
                    detail={event.detail}
                    buttonText="このイベントに投稿する"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* あなたの書評セクション */}
          <div className="max-w-2xl mx-auto my-3 lg:mx-0 lg:mt-0">
            <div className="text-center my-6">
              <div className="flex items-center justify-center gap-4 mt-20 lg:mt-6">
                <div className="w-24 h-px bg-black" />
                <h2 className="font-bold text-slate-900">あなたの書評</h2>
                <div className="w-24 h-px bg-black" />
              </div>
              <div className={`text-sm mt-1 font-bold ${Styles.mainColor}`}>
                ※一次審査中のみ編集できます
              </div>
            </div>

            {/* tabs: use ul/li/a structure */}
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
                            ? "border"
                            : review.badgeType === "blue"
                              ? "bg-sky-50 text-sky-600 border border-sky-100"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                        style={
                          review.badgeType === "red"
                            ? {
                                backgroundColor: "var(--color-warning-bg)",
                                color: "var(--color-main)",
                                borderColor: "var(--color-main)",
                              }
                            : undefined
                        }
                      >
                        {review.status}
                      </span>
                    </div>

                    <div className="text-slate-500 text-sm leading-relaxed mt-2">
                      {review.excerpt}
                    </div>

                    {/* 邱ｨ髮・・繧ｿ繝ｳ縺ｯ隕∫ｴ・・荳九↓驟咲ｽｮ・医き繝ｼ繝我ｸ句ｯ・○・・*/}
                    <div className="mt-4">
                      {review.href ? (
                        <button
                          type="button"
                          className="w-full text-white px-3 py-2 rounded-md font-bold"
                          style={{ backgroundColor: "var(--color-main)" }}
                          onClick={() => handleEditButton(review.bookReviewId)}
                        >
                          {review.buttonText}
                        </button>
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
            {/* 繝槭う繝壹・繧ｸ荳矩Κ縺ｮ繝｡繝九Η繝ｼ・域ｷｻ莉倡判蜒上・繧ｳ繝ｳ繝・Φ繝・ｼ・*/}
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
                  <button
                    onClick={() => setShowEditProfileModal(true)}
                    className={`${Styles.mypage__linkButton}`}
                  >
                    プロフィール編集
                  </button>
                </li>
                {userData && (
                  <ProfileEditModal
                    open={showEditProfileModal}
                    onClose={() => setShowEditProfileModal(false)}
                    profileData={userData}
                    onUpdate={fetchUserData}
                  />
                )}
                <li style={{ borderColor: "var(--color-sub)" }}>
                  <a
                    href="/poster/mypage/password"
                    className="block text-center font-bold py-4 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    style={{ color: "var(--color-text)" }}
                    aria-label="パスワード変更"
                  >
                    パスワード変更
                  </a>
                </li>
                <li style={{ borderColor: "var(--color-sub)" }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      signOut({ callbackUrl: "/poster/login" });
                    }}
                    className="block text-center font-bold py-4 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    aria-label="ログアウト"
                    style={{ color: "var(--color-main)" }}
                  >
                    ログアウト
                  </a>
                </li>
                <li style={{ borderColor: "var(--color-sub)" }}>
                  {DEMO_MODE ? (
                    <button
                      type="button"
                      disabled
                      className="block text-center font-bold py-4 focus:outline-none focus:ring-2 focus:ring-slate-200 text-slate-400 cursor-not-allowed"
                      aria-label="退会"
                      aria-disabled={true}
                      style={{ color: "var(--color-main)" }}
                    >
                      退会
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="block text-center font-bold py-4 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      aria-label="退会"
                      style={{ color: "var(--color-main)" }}
                    >
                      退会
                    </button>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
