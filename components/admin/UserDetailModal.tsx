"use client";
import React, { useState, useEffect } from "react";
import "@/styles/admin/users.css";
import { Icon } from "@iconify/react";
import AdminButton from "@/components/ui/admin-button";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUserExit?: () => void;
  userId?: number | null;
}

interface BookReview {
  id: number;
  bookTitle: string;
  event_name: string;
  status: string;
}

interface UserDetail {
  id: number;
  nickname: string;
  email: string;
  age: number | null;
  address: string | null;
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
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen && userId) {
      const fetchUserDetail = async () => {
        setIsLoading(true);
        setError("");
        try {
          const response = await fetch(`/api/admin/users/${userId}`);
          if (!response.ok) throw new Error("Failed to fetch user detail");
          const data = await response.json();
          setUserDetail(data);
        } catch (error) {
          console.error("Error fetching user detail:", error);
          setUserDetail(null);
          setError("ユーザー情報の取得に失敗しました。");
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
      setError("");
    }
  }, [isOpen, userId]);

  const toggleRow = (id: number) => {
    setOpenRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  // 表示するデータをスライス
  const displayedData =
    displayCount === "all"
      ? userDetail?.bookReviews || []
      : (userDetail?.bookReviews || []).slice(0, displayCount);

  const handleUserExit = () => {
    // 詳細モーダルを閉じ、親に退会モーダルを開くよう通知
    onClose();
    onOpenUserExit?.();
  };

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
          <p>書評ID</p>
          <p>ニックネーム</p>
          <p>ステータス</p>
          <p>年代</p>
          <p>居住地</p>
        </div>
        {isLoading ? (
          <div className="text-center py-4">読み込み中...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-600">{error}</div>
        ) : userDetail ? (
          <div className="text-2xl grid grid-cols-5 px-6 text-center font-bold">
            <p>{String(userDetail.id).padStart(6, "0")}</p>
            <p>{userDetail.nickname}</p>
            <p>
              <span className="status">
                {userDetail.user_status === 0
                  ? "利用中"
                  : userDetail.user_status === 1
                    ? "退会済み"
                    : "BAN"}
              </span>
            </p>
            <p>{userDetail.age ? `${userDetail.age}代` : "-"}</p>
            <p>{userDetail.address || "-"}</p>
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
                <th className="w-1/5">
                  <div className="flex items-center ml-3">
                    ステータス<Icon icon="uil:arrow" rotate={1}></Icon>
                  </div>
                </th>
                <th className="w-1/10">
                  <div className="flex items-center justify-start">
                    ID<Icon icon="uil:arrow" rotate={1}></Icon>
                  </div>
                </th>
                <th className="w-2/5">
                  <div className="flex items-center">
                    書籍タイトル<Icon icon="uil:arrow" rotate={1}></Icon>
                  </div>
                </th>
                <th className="w-1/5">
                  <div className="flex items-center">
                    イベント名<Icon icon="uil:arrow" rotate={1}></Icon>
                  </div>
                </th>
                <th>{/* <Icon icon='fe:arrow-up'></Icon> */}</th>
              </tr>
            </thead>
            {/* アコーディオン */}
            <tbody className="border">
              {displayedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    書評がありません
                  </td>
                </tr>
              ) : (
                displayedData.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr className="table-row">
                      <td className="text-left">
                        <span className="status-text font-bold py-1 px-6 ml-3">
                          {row.status}
                        </span>
                      </td>
                      <td className="text-left">
                        <span>{row.id}</span>
                      </td>
                      <td>
                        <span className="title-text">{row.bookTitle}</span>
                      </td>
                      <td>
                        <span>{row.event_name}</span>
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
                        <td colSpan={5} className="details-content">
                          <div className="p-4 flex">
                            <section className="w-[57.142%]">
                              <h3 className="font-bold mb-2 ml-4">書評本文</h3>
                              <div className="book-review-section w-auto h-84 ml-4 p-2">
                                <p>書評本文の詳細はこちらに表示されます。</p>
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
        <div className="py-5 mx-8 flex justify-end">
          <AdminButton
            label="退会"
            className="exit-btn"
            onClick={handleUserExit}
          />
        </div>
      </div>
    </div>
  );
}
