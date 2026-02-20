"use client";
import React, { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import "@/styles/admin/users.css";
import { Icon } from "@iconify/react";
import AdminButton from "@/components/ui/admin-button";
import {
  USER_STATUS_CLASS,
  USER_STATUS,
  USER_STATUS_LABELS,
} from "@/lib/constants/userStatus";
import { formatAddress } from "@/lib/formatAddress";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUserExit?: (userId: number) => void;
  userId?: number | null;
}

interface Event {
  id: number;
  title: string;
}

interface BookReview {
  id: number;
  book_title: string;
  evaluations_status: string;
  review: string;
  event: Event | null;
}

interface UserDetail {
  id: number;
  account_id: string;
  nickname: string;
  email: string;
  age: number | null;
  address: string | null;
  sub_address?: string | null;
  user_status: number;
  bookReviews: BookReview[];
}

export default function UserDetailModal({
  isOpen,
  onClose,
  onOpenUserExit,
  userId,
}: UserDetailModalProps) {
  const [openRows, setOpenRows] = useState<number[]>([]);
  const [displayCount, setDisplayCount] = useState<number | "all">(2);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const [sortBy, setSortBy] = useState<string>("event_title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const STATUS_CONFIG: Record<number, { label: string; className: string }> = {
    0: {
      label: "審査前",
      className: "text-blue-500",
    },
    1: {
      label: "審査中",
      className: "text-green-600",
    },
    2: {
      label: "当選",
      className: "text-yellow-600",
    },
    3: {
      label: "終了済み",
      className: "text-red-400",
    },
  };

  useEffect(() => {
    if (isOpen && userId) {
      const fetchUserDetail = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/admin/users/${userId}`);
          if (!response.ok) throw new Error("Failed to fetch user detail");
          const data = await response.json();
          setUserDetail(data);
        } catch (error) {
          console.error("Error fetching user detail:", error);
          setUserDetail(null);
          addToast({
            type: "error",
            message: "ユーザー情報の取得に失敗しました。",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserDetail();
    } else if (!isOpen) {
      // モーダルが閉じられたときに状態をリセット
      setUserDetail(null);
      setOpenRows([]);
      setDisplayCount(2);
    }
  }, [isOpen, userId, addToast]);

  const toggleRow = (id: number) => {
    setOpenRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  // ソート処理
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // 同じカラムをクリックした場合は昇降順を切り替え
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // 異なるカラムをクリックした場合は昇順でリセット
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // データをソートしてから表示するデータをスライス
  const sortedBookReviews = React.useMemo(() => {
    if (!userDetail?.bookReviews) return [];

    const sorted = [...userDetail.bookReviews].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "event_title":
          aValue = a.event?.title || "";
          bValue = b.event?.title || "";
          break;
        case "evaluations_status":
          aValue = Number(a.evaluations_status);
          bValue = Number(b.evaluations_status);
          break;
        case "book_title":
          aValue = a.book_title;
          bValue = b.book_title;
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue, "ja");
        return sortOrder === "asc" ? comparison : -comparison;
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

    return sorted;
  }, [userDetail?.bookReviews, sortBy, sortOrder]);

  const displayedData =
    displayCount === "all"
      ? sortedBookReviews
      : sortedBookReviews.slice(0, displayCount);

  // displayedData is used in rendering; no debug logging

  const handleUserExit = () => {
    if (!userId) return;
    onClose();
    onOpenUserExit?.(userId);
  };

  const statusClass = userDetail
    ? USER_STATUS_CLASS[userDetail.user_status] || ""
    : "";
  const statusLabel = userDetail
    ? USER_STATUS_LABELS[userDetail.user_status] || ""
    : "";

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 user-detail-modal bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="modal-content bg-white rounded-lg w-11/12 max-w-8xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">ユーザー詳細</h2>
          <button
            onClick={onClose}
            className="close-btn text-black"
            aria-label="閉じる"
          >
            <Icon icon="mdi:close" width={24} className="text-black" />
          </button>
        </div>
        <div className="user-data-title grid grid-cols-5 px-6 text-center">
          <p>アカウントID</p>
          <p>ニックネーム</p>
          <p>ステータス</p>
          <p>年代</p>
          <p>居住地</p>
        </div>
        {isLoading ? (
          <div className="text-center py-4">読み込み中...</div>
        ) : userDetail ? (
          <div className="text-2xl grid grid-cols-5 px-6 text-center font-bold">
            <p>{userDetail.account_id}</p>
            <p>{userDetail.nickname}</p>
            <p>
              <span className={`status-badge ${statusClass}`}>
                {statusLabel}
              </span>
            </p>
            <p>{userDetail.age ? `${userDetail.age}代` : "-"}</p>
            <p>{formatAddress(userDetail.address, userDetail.sub_address)}</p>
          </div>
        ) : (
          <div className="text-center py-4">
            ユーザー情報が取得できませんでした
          </div>
        )}

        <div className="mx-8 mt-8 overflow-y-auto">
          <table className="w-full event-table">
            <thead className="table-head">
              <tr>
                <th>
                  <button
                    type="button"
                    className="flex items-center ml-3 cursor-pointer"
                    onClick={() => handleSort("event_title")}
                    aria-label={`イベント名で${sortBy === "event_title" && sortOrder === "asc" ? "降順" : "昇順"}にソート`}
                  >
                    イベント名
                    <Icon
                      icon="uil:arrow"
                      rotate={
                        sortBy === "event_title" && sortOrder === "desc" ? 3 : 1
                      }
                    />
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="flex items-center ml-3 cursor-pointer"
                    onClick={() => handleSort("evaluations_status")}
                    aria-label={`ステータスで${sortBy === "evaluations_status" && sortOrder === "asc" ? "降順" : "昇順"}にソート`}
                  >
                    ステータス
                    <Icon
                      icon="uil:arrow"
                      rotate={
                        sortBy === "evaluations_status" && sortOrder === "desc"
                          ? 3
                          : 1
                      }
                    />
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("book_title")}
                    aria-label={`書籍タイトルで${sortBy === "book_title" && sortOrder === "asc" ? "降順" : "昇順"}にソート`}
                  >
                    書籍タイトル
                    <Icon
                      icon="uil:arrow"
                      rotate={
                        sortBy === "book_title" && sortOrder === "desc" ? 3 : 1
                      }
                    />
                  </button>
                </th>
                <th>{/* <Icon icon='fe:arrow-up'></Icon> */}</th>
              </tr>
            </thead>
            {/* アコーディオン */}
            <tbody className="border">
              {displayedData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    書評がありません
                  </td>
                </tr>
              ) : (
                displayedData.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr className="table-row">
                      <td>
                        <span className="ml-3">{row.event?.title}</span>
                      </td>
                      <td className="text-left">
                        <span className="">
                          {(() => {
                            const statusKey = Number(row.evaluations_status);
                            const config = STATUS_CONFIG[statusKey];

                            if (!config) return null;

                            return (
                              <div
                                key={statusKey}
                                className={`text-center w-1/2 ml-3 py-2 rounded-full text-sm font-bold border ${config.className}`}
                              >
                                {/* 当選した時だけ王冠アイコンを付ける、などの遊び心 */}
                                {statusKey === 3}
                                {config.label}
                              </div>
                            );
                          })()}
                        </span>
                      </td>
                      <td>
                        <span className="modal-title-text">
                          {row.book_title}
                        </span>
                      </td>
                      <td className="text-right align-middle pr-3">
                        <button
                          onClick={() => toggleRow(row.id)}
                          className="accordion-toggle"
                          aria-label="詳細を表示"
                        >
                          <Icon
                            icon="fe:arrow-up"
                            rotate={2}
                            className={`icon transition-transform ${openRows.includes(row.id) ? "rotate-180" : "rotate-0"}`}
                          />
                        </button>
                      </td>
                    </tr>
                    {openRows.includes(row.id) && (
                      <tr key={`${row.id}-details`} className="details-row">
                        <td colSpan={4} className="details-content">
                          <div className="p-4 flex">
                            <section className="w-full">
                              <h3 className="font-bold mb-2 ml-4">書評本文</h3>
                              <div className="book-review-section w-auto h-84 ml-4 p-2">
                                <p
                                  dangerouslySetInnerHTML={{
                                    __html: row.review,
                                  }}
                                ></p>
                              </div>
                            </section>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
          <div className="text-center p-4">
            {userDetail && userDetail.bookReviews.length > 2 && (
              <button
                onClick={() =>
                  setDisplayCount((prev) => (prev === "all" ? 2 : "all"))
                }
                className="data-row-link"
              >
                {displayCount === "all" ? "表示を戻す" : "さらに表示"}
              </button>
            )}
          </div>
        </div>
        <div className="py-5 mx-8 flex items-center justify-end gap-4">
          {userDetail && userDetail.user_status === USER_STATUS.BAN && (
            <p className="text-sm text-red-500">
              このユーザーは既にアカウントが停止されています。
            </p>
          )}
          <AdminButton
            label="アカウント停止"
            className="exit-btn"
            onClick={handleUserExit}
            disabled={
              !userDetail || userDetail.user_status !== USER_STATUS.ACTIVE
            }
          />
        </div>
      </div>
    </div>
  );
}
