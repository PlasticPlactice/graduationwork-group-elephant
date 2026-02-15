"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/contexts/ToastContext";
import Textbox from "@/components/ui/admin-textbox";
import "@/styles/admin/notice.css";
import { Icon } from "@iconify/react";
import AdminButton from "@/components/ui/admin-button";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import NoticeDeleteModal from "@/components/admin/NoticeDeleteModal";

// APIレスポンスの型定義
interface Notification {
  id: number;
  title: string;
  detail: string;
  public_flag: boolean;
  public_date: string; // Dateオブジェクトとして受け取る場合はDate型にする
  notification_type: number;
  draft_flag: boolean;
}

interface ApiResponse {
  data: Notification[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function Page() {
  const { addToast } = useToast();
  const router = useRouter();

  // ---------------------------
  // State管理
  // ---------------------------
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [sortBy, setSortBy] = useState<string>("public_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // デフォルトを降順に

  const [searchForm, setSearchForm] = useState({
    title: "",
    publicDateFrom: "", // 現APIは未対応
    publicDateTo: "", // 現APIは未対応
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  // 検索ボタン押下時に確定する検索キーワード（入力中の文字では自動検索しない）
  const [searchTitle, setSearchTitle] = useState<string>("");
  // 検索ボタン押下時に確定する公開日範囲
  const [searchDateFrom, setSearchDateFrom] = useState<string>("");
  const [searchDateTo, setSearchDateTo] = useState<string>("");

  const [selectedTab, setSelectedTab] = useState<"notice" | "donation">(
    "notice",
  ); // 'notice' (お知らせ) または 'donation' (寄贈)
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "draft" | "private" | "public"
  >("all"); // 'all', 'draft', 'private', 'public'

  // ---------------------------
  // ヘルパー関数
  // ---------------------------
  const getStatusLabel = (
    public_flag: boolean,
    draft_flag: boolean,
  ): string => {
    if (draft_flag) return "下書き";
    if (public_flag) return "公開中";
    return "非公開";
  };

  const getStatusClass = (
    public_flag: boolean,
    draft_flag: boolean,
  ): string => {
    if (draft_flag) return "status status-draft";
    if (public_flag) return "status status-public";
    return "status status-private";
  };

  // タイトルを一定文字数で省略する
  const getTitleSnippet = (title: string, maxLength: number = 25): string => {
    if (title.length <= maxLength) return title;
    return `${title.slice(0, maxLength)}…`;
  };

  // WYSIWYGで保存されたHTMLからテキストだけを抽出して一覧に表示する
  const getDetailSnippet = (html: string, maxLength: number = 25): string => {
    const text = html
      .replace(/<[^>]+>/g, " ") // タグを削除
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}…`;
  };

  const handleNoticeDetail = (id: number) => {
    // 一覧→詳細へ遷移に変更
    router.push(`/admin/detail-notice?id=${id}`);
  };

  const handleRegister = () => {
    router.push("/admin/register-notice");
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // 行クリックイベントの伝播を防止
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteTargetId(null);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/notifications/${deleteTargetId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        addToast({
          type: "error",
          message: error.message || "削除に失敗しました",
        });
        return;
      }

      addToast({ type: "success", message: "お知らせを削除しました" });
      // 一覧を再取得
      await fetchNotifications(
        currentPage,
        searchTitle,
        searchDateFrom,
        searchDateTo,
      );
    } catch (err) {
      console.error("Delete error:", err);
      addToast({ type: "error", message: "削除に失敗しました" });
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  // ---------------------------
  // データ取得ロジック
  // ---------------------------
  const fetchNotifications = useCallback(
    async (
      page: number = currentPage,
      title: string = searchTitle,
      dateFrom: string = searchDateFrom,
      dateTo: string = searchDateTo,
    ) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("sortBy", sortBy);
        params.append("sortOrder", sortOrder);

        if (title) params.append("title", title);
        if (dateFrom) params.append("publicDateFrom", dateFrom);
        if (dateTo) params.append("publicDateTo", dateTo);

        // タブとステータスフィルターの結合ロジック
        params.append("type", selectedTab === "notice" ? "0" : "1"); // 0:お知らせ, 1:寄贈

        if (selectedStatus === "public") {
          params.append("isPublic", "true");
          params.append("isDraft", "false");
        } else if (selectedStatus === "private") {
          params.append("isPublic", "false");
          params.append("isDraft", "false");
        } else if (selectedStatus === "draft") {
          params.append("isDraft", "true");
          params.append("isPublic", "false"); // 下書きは非公開扱い
        }
        // 'all' の場合はpublic/draftフィルターはつけない

        const response = await fetch(
          `/api/admin/notifications?${params.toString()}`,
          {
            credentials: "include",
          },
        );
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        setNotifications(data.data);
        setTotalPages(data.totalPages);
        setCurrentPage(data.page);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
        setTotalPages(0);
        addToast({
          type: "error",
          message: "お知らせ情報の取得に失敗しました。",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      currentPage,
      sortBy,
      sortOrder,
      selectedTab,
      selectedStatus,
      searchTitle,
      searchDateFrom,
      searchDateTo,
    ],
  );

  // ---------------------------
  // イベントハンドラ
  // ---------------------------
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setSearchForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTitle(searchForm.title);
    setSearchDateFrom(searchForm.publicDateFrom);
    setSearchDateTo(searchForm.publicDateTo);
    setCurrentPage(1); // 検索時は常に1ページ目から
    fetchNotifications(
      1,
      searchForm.title,
      searchForm.publicDateFrom,
      searchForm.publicDateTo,
    );
  };

  const handleResetSearch = () => {
    setSearchForm({
      title: "",
      publicDateFrom: "",
      publicDateTo: "",
    });
    setSearchTitle("");
    setSearchDateFrom("");
    setSearchDateTo("");
    setSelectedStatus("all");
    setSelectedTab("notice");
    setSortBy("public_date");
    setSortOrder("desc");
    setCurrentPage(1);
    fetchNotifications(1, "", "", "");
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // ---------------------------
  // useEffects
  // ---------------------------
  useEffect(() => {
    fetchNotifications(undefined, searchTitle, searchDateFrom, searchDateTo);
  }, [
    selectedTab,
    selectedStatus,
    sortBy,
    sortOrder,
    searchTitle,
    searchDateFrom,
    searchDateTo,
  ]); // フィルター・ソート変更時

  // ページ変更時
  useEffect(() => {
    fetchNotifications(currentPage, searchTitle, searchDateFrom, searchDateTo);
  }, [currentPage]);

  // ---------------------------
  // UIレンダリング
  // ---------------------------
  // ボタンの定義
  const statusButtons = [
    { id: "all", label: "すべて" },
    { id: "draft", label: "下書き" },
    { id: "private", label: "非公開" },
    { id: "public", label: "公開中" },
  ];

  return (
    <main className="notice-container">
      <div className="flex justify-end mr-8">
        {/*---------------------------
            お知らせ登録ボタン
            ---------------------------*/}
        <AdminButton
          label="お知らせ登録"
          type="button"
          className="register-btn mt-5"
          onClick={handleRegister}
        />
      </div>
      {/*---------------------------
                検索ボックス
               ---------------------------*/}
      <details className="px-5 pt-3 pb-3 mx-8 my-6 search-accordion">
        <summary className="flex items-center justify-between">
          <p>検索ボックス</p>
          <Icon
            icon="ep:arrow-up"
            rotate={2}
            width={20}
            className="icon"
          ></Icon>
        </summary>
        <section>
          <form onSubmit={handleSearch}>
            <div className="input-group">
              <p>タイトル</p>
              <Textbox
                size="lg"
                className="custom-input-full"
                name="title"
                value={searchForm.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="input-group">
              <p>公開期間</p>
              <div className="flex justify-between items-center">
                <Textbox
                  type="date"
                  className="custom-input"
                  name="publicDateFrom"
                  value={searchForm.publicDateFrom}
                  onChange={handleInputChange}
                />
                <p className="items-center justify-center px-2">ー</p>
                <Textbox
                  type="date"
                  className="custom-input"
                  name="publicDateTo"
                  value={searchForm.publicDateTo}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-5">
              <AdminButton
                label="検索"
                type="submit"
                icon="mdi:search"
                iconPosition="left"
                className="search-btn"
              />
              <AdminButton
                label="リセット"
                type="button"
                icon="mdi:refresh"
                iconPosition="left"
                className="search-btn"
                onClick={handleResetSearch}
              />
            </div>
          </form>
        </section>
      </details>

      <div>
        {/*---------------------------
                お知らせ・寄贈タブ
               ---------------------------*/}
        <div className="flex mx-8 mt-8 border-b tab">
          <button
            onClick={() => setSelectedTab("notice")}
            className={`pb-3 mr-7 text-h1 notice-tab-link ${
              selectedTab === "notice" ? "active" : ""
            }`}
          >
            お知らせ
          </button>
          <button
            onClick={() => setSelectedTab("donation")}
            className={`pb-3 notice-tab-link ${
              selectedTab === "donation" ? "active" : ""
            }`}
          >
            寄贈
          </button>
        </div>
        <div className="flex justify-end mx-8">
          {/*---------------------------
                ステータス変更ボタン
               ---------------------------*/}
          <div className="grid grid-flow-row mt-3">
            <p className="px-5">
              現在表示中の{selectedTab === "notice" ? "お知らせ" : "寄贈"}
              のステータス
            </p>
            <div className="flex items-center justify-center px-3 status-wrapper py-1 mt-2">
              {statusButtons.map((btn) => {
                const isActive = selectedStatus === btn.id;
                return (
                  <button
                    key={btn.id}
                    onClick={() =>
                      setSelectedStatus(btn.id as typeof selectedStatus)
                    } // 型アサーションを追加
                    className={`mx-2 px-2 rounded status-toggle ${
                      isActive ? "active" : ""
                    }`}
                  >
                    <span className="text-xl">{btn.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 通知はトーストで表示します */}

      <div className="mx-8 mt-5">
        <table className="w-full notice-table">
          <thead className="table-head">
            <tr>
              <th className="py-2 pl-6 ">
                <button
                  type="button"
                  className={`flex items-center cursor-pointer ${sortBy === "public_flag" ? "sorted" : ""}`}
                  onClick={() => handleSort("public_flag")}
                  aria-label={`ステータスで${sortBy === "public_flag" && sortOrder === "asc" ? "降順" : "昇順"}にソート`}
                  aria-sort={
                    sortBy === "public_flag"
                      ? sortOrder === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  ステータス
                  <span className="sort-icon">
                    {sortBy === "public_flag" ? (
                      sortOrder === "asc" ? (
                        <Icon icon="uil:angle-up" width={18} />
                      ) : (
                        <Icon icon="uil:angle-down" width={18} />
                      )
                    ) : (
                      <Icon icon="uil:sort" width={18} />
                    )}
                  </span>
                </button>
              </th>
              <th className="w-2/7">
                <button
                  type="button"
                  className={`flex items-center cursor-pointer ${sortBy === "title" ? "sorted" : ""}`}
                  onClick={() => handleSort("title")}
                  aria-label={`タイトルで${sortBy === "title" && sortOrder === "asc" ? "降順" : "昇順"}にソート`}
                  aria-sort={
                    sortBy === "title"
                      ? sortOrder === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  タイトル
                  <span className="sort-icon">
                    {sortBy === "title" ? (
                      sortOrder === "asc" ? (
                        <Icon icon="uil:angle-up" width={18} />
                      ) : (
                        <Icon icon="uil:angle-down" width={18} />
                      )
                    ) : (
                      <Icon icon="uil:sort" width={18} />
                    )}
                  </span>
                </button>
              </th>
              <th className="w-2/7">
                <div className="flex items-center">詳細</div>
              </th>
              <th className="w-1/4">
                <button
                  type="button"
                  className={`flex items-center cursor-pointer ${sortBy === "public_date" ? "sorted" : ""}`}
                  onClick={() => handleSort("public_date")}
                  aria-label={`公開期間で${sortBy === "public_date" && sortOrder === "asc" ? "降順" : "昇順"}にソート`}
                  aria-sort={
                    sortBy === "public_date"
                      ? sortOrder === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  公開期間
                  <span className="sort-icon">
                    {sortBy === "public_date" ? (
                      sortOrder === "asc" ? (
                        <Icon icon="uil:angle-up" width={18} />
                      ) : (
                        <Icon icon="uil:angle-down" width={18} />
                      )
                    ) : (
                      <Icon icon="uil:sort" width={18} />
                    )}
                  </span>
                </button>
              </th>
              <th className="w-20">
                <div className="flex items-center justify-center">操作</div>
              </th>
            </tr>
          </thead>
          <tbody className="border">
            {isLoading ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="py-4">
                      <div className="ml-5 py-1 px-9 bg-gray-200 rounded w-20 h-6"></div>
                    </td>
                    <td className="py-4">
                      <div className="bg-gray-200 rounded w-3/4 h-6"></div>
                    </td>
                    <td className="py-4">
                      <div className="bg-gray-200 rounded w-full h-6"></div>
                    </td>
                    <td className="py-4">
                      <div className="bg-gray-200 rounded w-32 h-6 mx-auto"></div>
                    </td>
                    <td className="py-4">
                      <div className="bg-gray-200 rounded w-8 h-6 mx-auto"></div>
                    </td>
                  </tr>
                ))}
              </>
            ) : notifications.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  お知らせが見つかりません
                </td>
              </tr>
            ) : (
              notifications.map((notice) => (
                <tr
                  key={notice.id}
                  className="notice-record"
                  onClick={() => handleNoticeDetail(notice.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleNoticeDetail(notice.id);
                    }
                  }}
                >
                  <td>
                    <span
                      className={
                        "ml-2 py-1 px-9 " +
                        getStatusClass(notice.public_flag, notice.draft_flag)
                      }
                    >
                      {getStatusLabel(notice.public_flag, notice.draft_flag)}
                    </span>
                  </td>
                  <td className="py-2 font-bold w-2/7">
                    {getTitleSnippet(notice.title)}
                  </td>
                  <td className="notice-content w-2/7">
                    {getDetailSnippet(notice.detail)}
                  </td>
                  <td>
                    <div className="flex items-center">
                      <p className="px-9 ml-20">
                        {format(
                          new Date(notice.public_date),
                          "yyyy年MM月dd日",
                          { locale: ja },
                        )}
                      </p>
                      <Icon icon="weui:arrow-filled" width={15}></Icon>
                    </div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center">
                      <button
                        onClick={(e) => handleDeleteClick(e, notice.id)}
                        className="delete-btn text-red-600 hover:text-red-800 transition-colors p-2"
                        title="削除"
                        aria-label="削除"
                      >
                        <Icon icon="mdi:delete" id="delete-icon" width={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center my-5 page-section">
        <button
          type="button"
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="前のページ"
          className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
        >
          <Icon
            icon="weui:arrow-filled"
            rotate={2}
            width={20}
            className="page-arrow"
          ></Icon>
        </button>
        {(() => {
          const pages: (number | string)[] = [];
          if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
          } else {
            pages.push(1);
            if (currentPage <= 4) {
              for (let i = 2; i <= 5; i++) pages.push(i);
              pages.push("...");
            } else if (currentPage >= totalPages - 3) {
              pages.push("...");
              for (let i = totalPages - 4; i <= totalPages - 1; i++)
                pages.push(i);
            } else {
              pages.push("...");
              for (let i = currentPage - 1; i <= currentPage + 1; i++)
                pages.push(i);
              pages.push("...");
            }
            pages.push(totalPages);
          }

          return pages.map((pageNum, index) =>
            typeof pageNum === "number" ? (
              <button
                key={`page-${pageNum}`}
                type="button"
                className={`px-4 py-1 page-number ${currentPage === pageNum ? "active" : ""}`}
                onClick={() => setCurrentPage(pageNum)}
                aria-current={currentPage === pageNum ? "page" : undefined}
              >
                {pageNum}
              </button>
            ) : (
              <span
                key={`ellipsis-${index}`}
                className="px-4 py-1 page-number"
                aria-hidden="true"
              >
                {pageNum}
              </span>
            ),
          );
        })()}
        <button
          type="button"
          onClick={() =>
            currentPage < totalPages && setCurrentPage(currentPage + 1)
          }
          disabled={currentPage === totalPages}
          aria-label="次のページ"
          className={
            currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
          }
        >
          <Icon
            icon="weui:arrow-filled"
            width={20}
            className="page-arrow"
          ></Icon>
        </button>
      </div>

      {/* 削除モーダル */}
      <NoticeDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </main>
  );
}
