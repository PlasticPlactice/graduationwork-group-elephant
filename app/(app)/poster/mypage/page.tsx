"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EventCard } from "@/components/features/EventCard";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";

import { ReviewPassedModal } from "@/components/modals/ReviewPassedModal";
import { ProfileEditModal } from "@/components/modals/ProfileEditModal";
import { MassageModal } from "@/components/modals/MassageModal";
import { AccountDeleteModal } from "@/components/modals/AccountDeleteModal";

import Styles from "@/styles/app/poster.module.css";

interface ProfileData {
  userId: number;
  nickName: string;
  address: string;
  addressDetail: string;
  age: number;
  gender: number;
  introduction: string;
}

type ReviewFilterTab = "all" | 1 | 2 | 3 | 4;
type ReviewStatusCode = 1 | 2 | 3 | 4;

interface BookReviewData {
  id: number;
  book_title: string;
  evaluations_status: number;
  review: string;
}

export default function MyPage() {
  const router = useRouter();

  // 初期表示時にモーダルを表示
  const [showModal, setShowModal] = useState(false);
  // プロフィール編集、退会確認、DM（運営からのお知らせ）モーダルの表示
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showDMModal, setShowDMModal] = useState(false);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // ユーザーデータ
  const [userData, setUserData] = useState<ProfileData | null>(null);
  // ユーザの書評データ
  const [bookReviewData, setBookReviewData] = useState<BookReviewData[]>([]);
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
        setBookReviewData(data);
      }
    } catch (error) {
      console.error("Failed to Fetch book review data", error);
    }
  }, []);

  // 未読メッセージ取得
  const fetchUnreadMessage = useCallback(async () => {
    try {
      const res = await fetch("/api/user/messages/unread");
      if (res.ok) {
        const data = await res.json();
        if (data.unreadMessage) {
          setUnreadMessage(data.unreadMessage);
          setShowModal(true); // 未読がある場合のみモーダルを開く
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  // メッセージ既読化処理
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
      // エラーでもとりあえず閉じる（UX優先）
      setShowModal(false);
    }
  };

  // 初回レンダリング時にデータを取得
  useEffect(() => {
    fetchUserData();
    fetchBookReviewData();
    fetchUnreadMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sampleEvents = [
    {
      title: "第1回 文庫Xイベント",
      daysLeft: 10,
      description: "投稿可能期間中です！投稿してみましょう！",
      buttonText: "投稿へ",
      href: "/post/barcode-scan",
    },
    {
      title: "第2回 文庫Xイベント",
      daysLeft: 15,
      description: "投稿可能期間中です！投稿してみましょう！",
      buttonText: "投稿へ",
      href: "/post/barcode-scan",
    },
  ];

  const REVIEW_FILTER_TABS: {
    key: ReviewFilterTab;
    label: string;
  }[] = [
    { key: "all" as const, label: "全て" },
    { key: 1, label: "下書き" },
    { key: 2, label: "１次審査前" },
    { key: 3, label: "審査中" },
    { key: 4, label: "終了済み" },
  ];

  const REVIEW_STATUS_MAP = {
    1: {
      label: "下書き",
      badgeType: "gray",
      canEdit: true,
    },
    2: {
      label: "１次審査前",
      badgeType: "red",
      canEdit: true,
    },
    3: {
      label: "審査中",
      badgeType: "blue",
      canEdit: false,
    },
    4: {
      label: "終了",
      badgeType: "gray",
      canEdit: false,
    },
  } as const;

  // DB/APIの文字列・数値をUI用コード(1..4)へ正規化
  const normalizeStatus = (val: number): ReviewStatusCode => {
    return val === 1 || val === 2 || val === 3 || val === 4
      ? (val as ReviewStatusCode)
      : 2;
  };

  // 表示用にデータを整形
  const uiReviews = bookReviewData.map((review) => {
    const code = normalizeStatus(review.evaluations_status);
    const status = REVIEW_STATUS_MAP[code];

    return {
      bookReviewId: review.id,
      title: review.book_title,
      status: status?.label ?? "未分類",
      evaluations_status: code,
      badgeType: status?.badgeType ?? "gray",
      excerpt: review.review,
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
        body: JSON.stringify({ reason: "ユーザーからの退会申請" }),
      });

      if (res.ok) {
        // 退会成功
        alert("退会処理が完了しました。ご利用ありがとうございました。");
        // ログアウトしてトップページへ
        await signOut({ callbackUrl: "/" });
      } else {
        const data = await res.json();
        alert(
          data.message || "退会処理に失敗しました。もう一度お試しください。",
        );
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Withdraw error:", error);
      alert("退会処理中にエラーが発生しました。もう一度お試しください。");
      setIsDeleting(false);
    } finally {
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

  return (
    <>
      {/* 1次審査通過モーダル */}
      <ReviewPassedModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmRead}
        message={unreadMessage?.message?.message}
      />
      {/* 退会確認モーダル */}
      <AccountDeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
      />
      <div className="min-h-screen bg-white px-4 py-4 box-border">
        <div className="text-center mt-3 relative">
          <h1 className="text-lg font-bold text-slate-900">マイページ</h1>
          <div className="flex items-center justify-center gap-3 mt-1">
            <div className="text-rose-500 font-bold">
              {userData?.nickName || "ゲスト"}さん
            </div>
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
            <MassageModal
              open={showDMModal}
              onClose={() => setShowDMModal(false)}
              userName={userData?.nickName || "ゲスト"}
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
          <Link href="/"
          >
            <div
              className="flex items-center px-2 rounded shadow-md my-10"
              style={{backgroundColor:"var(--color-main)"}}>
              <Image src="/layout/logo_another.png" alt="logo" width={100} height={40} className="ml-3"/>
              <span
                className="font-bold ml-auto"
                style={{ color: "var(--color-bg)" }}>象と花ファンサイトへ<span className="ml-4" aria-hidden="true">&gt;</span></span>
            </div>
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
                        <button
                          type="button"
                          className="w-full bg-rose-400 text-white px-3 py-2 rounded-md font-bold"
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
                  <button
                    onClick={() => setShowEditProfileModal(true)}
                    className={`${Styles.mypage__linkButton}`}
                  >
                    プロフィールの編集
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
                    aria-label="パスワードの変更へ"
                  >
                    パスワードの変更
                  </a>
                </li>
                <li style={{ borderColor: "var(--color-sub)" }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      signOut({ callbackUrl: "/poster/login" });
                    }}
                    className="block text-center font-bold py-4 text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
                    aria-label="ログアウト"
                    style={{ color: "red" }}
                  >
                    ログアウト
                  </a>
                </li>
                <li style={{ borderColor: "var(--color-sub)" }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowDeleteModal(true);
                    }}
                    className="block text-center font-bold py-4 text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
                    aria-label="退会手続きへ"
                    style={{ color: "red" }}
                  >
                    退会する
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
