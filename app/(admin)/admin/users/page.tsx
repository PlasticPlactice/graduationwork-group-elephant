"use client";
import React, { useState, useEffect } from "react";
import Textbox from "@/components/ui/admin-textbox";
import AdminButton from "@/components/ui/admin-button";
import "@/styles/admin/users.css";
import { Icon } from "@iconify/react";
import UserDetailModal from "@/components/admin/UserDetailModal";
import UserExitModal from "@/components/admin/UserExitModal";
import {
  USER_STATUS_LABELS,
  USER_STATUS_CLASS,
} from "@/lib/constants/userStatus";

interface User {
  id: number;
  account_id: string;
  nickname: string;
  age: number;
  address: string;
  status: number;
  reviewCount: number;
  deletedFlag: boolean;
}

interface ApiResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function Page() {
  const [isUserExitModalOpen, setIsUserExitModalOpen] = useState(false);
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false);
  const [exitUserId, setExitUserId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("account_id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 検索フォームのstate
  const [searchForm, setSearchForm] = useState({
    id: "",
    nickname: "",
    ageFrom: "",
    ageTo: "",
    prefecture: "",
    city: "",
    status: "all",
  });

  // ステータスに応じたクラス名を取得
  const getStatusClass = (status: number) => {
    return USER_STATUS_CLASS[status] || "";
  };

  // ステータス値を表示テキストに変換
  const getStatusLabel = (status: number) => {
    return USER_STATUS_LABELS[status] || "";
  };

  // ユーザー一覧取得APIを呼び出す（useCallbackでメモ化）
  const fetchUsers = React.useCallback(
    async (page: number = 1) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("sortBy", sortBy);
        params.append("sortOrder", sortOrder);
        if (searchForm.id) params.append("account_id", searchForm.id);
        if (searchForm.nickname) params.append("nickname", searchForm.nickname);
        if (searchForm.ageFrom) params.append("ageFrom", searchForm.ageFrom);
        if (searchForm.ageTo) params.append("ageTo", searchForm.ageTo);
        if (searchForm.prefecture)
          params.append("prefecture", searchForm.prefecture);
        if (searchForm.city) params.append("city", searchForm.city);
        params.append("status", searchForm.status);

        const response = await fetch(`/api/admin/users?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setCurrentPage(page);
        setErrorMessage("");
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
        setTotalPages(0);
        setErrorMessage("ユーザー情報の取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    },
    [sortBy, sortOrder, searchForm],
  );

  // 入力値の変更を処理
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setSearchForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 検索実行
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1);
  };

  // 検索フォームをリセット
  const handleResetSearch = () => {
    setSearchForm({
      id: "",
      nickname: "",
      ageFrom: "",
      ageTo: "",
      prefecture: "",
      city: "",
      status: "all",
    });
    setCurrentPage(1);
    fetchUsers(1);
  };

  // ソート処理（カラムごとに独立した状態管理）
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

  // モーダルが開いている時に背景のスクロールを防ぐ
  useEffect(() => {
    if (isUserDetailModalOpen || isUserExitModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // クリーンアップ関数
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isUserDetailModalOpen, isUserExitModalOpen]);

  // 初回ロードとソート変更時にユーザー一覧を取得（デバウンス付き）
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchUsers(currentPage);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder]);

  // 初期ロード
  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUserDetail = (userId: number) => {
    setSelectedUserId(userId);
    setIsUserDetailModalOpen(true);
  };

  const handleCloseUserDetail = () => {
    setIsUserDetailModalOpen(false);
    setSelectedUserId(null);
  };

  const handleWithdrawSuccess = () => {
    setIsUserExitModalOpen(false);
    setExitUserId(null);
    fetchUsers(currentPage);
  };
  return (
    <main className="users-container">
      {/*---------------------------
                検索ボックス
            ---------------------------*/}
      <details className="px-5 pt-3 pb-6 mx-8 my-6 shadow-sm search-area">
        <summary className="flex items-center justify-between w-full">
          検索ボックス
          <Icon
            icon="ep:arrow-up"
            rotate={2}
            width={20}
            className="icon"
          ></Icon>
        </summary>
        <form onSubmit={handleSearch}>
          <div className="flex items-center w-full justify-between gap-6">
            <div className="flex flex-col items-start search-field">
              <label htmlFor="user-id">ID</label>
              <Textbox
                id="user-id"
                name="id"
                value={searchForm.id}
                onChange={handleInputChange}
                size="lg"
                className="custom-input w-full"
              />
            </div>
            <div className="flex flex-col items-start search-field">
              <label htmlFor="user-nickname">ニックネーム</label>
              <Textbox
                id="user-nickname"
                name="nickname"
                value={searchForm.nickname}
                onChange={handleInputChange}
                size="lg"
                className="custom-input w-full"
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <label htmlFor="age">年代</label>
              <div className="flex justify-center items-center">
                <select
                  name="ageFrom"
                  id="age"
                  className="mr-2"
                  value={searchForm.ageFrom}
                  onChange={handleInputChange}
                >
                  <option value="">指定なし</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="40">40</option>
                  <option value="50">50</option>
                  <option value="60">60</option>
                  <option value="70">70</option>
                  <option value="80">80</option>
                  <option value="90">90</option>
                  <option value="100">100</option>
                </select>
                <p>&minus;</p>
                <select
                  name="ageTo"
                  id="age-to"
                  className="mx-2"
                  value={searchForm.ageTo}
                  onChange={handleInputChange}
                >
                  <option value="">指定なし</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="40">40</option>
                  <option value="50">50</option>
                  <option value="60">60</option>
                  <option value="70">70</option>
                  <option value="80">80</option>
                  <option value="90">90</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="prefecture">居住地</label>
              <div className="flex">
                <select
                  name="prefecture"
                  value={searchForm.prefecture}
                  onChange={handleInputChange}
                  className="mr-3"
                  id="prefecture"
                >
                  <option value="">都道府県</option>
                  <option value="北海道">北海道</option>
                  <option value="青森県">青森県</option>
                  <option value="岩手県">岩手県</option>
                  <option value="宮城県">宮城県</option>
                  <option value="秋田県">秋田県</option>
                  <option value="山形県">山形県</option>
                  <option value="福島県">福島県</option>
                  <option value="茨城県">茨城県</option>
                  <option value="栃木県">栃木県</option>
                  <option value="群馬県">群馬県</option>
                  <option value="埼玉県">埼玉県</option>
                  <option value="千葉県">千葉県</option>
                  <option value="東京都">東京都</option>
                  <option value="神奈川県">神奈川県</option>
                  <option value="新潟県">新潟県</option>
                  <option value="富山県">富山県</option>
                  <option value="石川県">石川県</option>
                  <option value="福井県">福井県</option>
                  <option value="山梨県">山梨県</option>
                  <option value="長野県">長野県</option>
                  <option value="岐阜県">岐阜県</option>
                  <option value="静岡県">静岡県</option>
                  <option value="愛知県">愛知県</option>
                  <option value="三重県">三重県</option>
                  <option value="滋賀県">滋賀県</option>
                  <option value="京都府">京都府</option>
                  <option value="大阪府">大阪府</option>
                  <option value="兵庫県">兵庫県</option>
                  <option value="奈良県">奈良県</option>
                  <option value="和歌山県">和歌山県</option>
                  <option value="鳥取県">鳥取県</option>
                  <option value="島根県">島根県</option>
                  <option value="岡山県">岡山県</option>
                  <option value="広島県">広島県</option>
                  <option value="山口県">山口県</option>
                  <option value="徳島県">徳島県</option>
                  <option value="香川県">香川県</option>
                  <option value="愛媛県">愛媛県</option>
                  <option value="高知県">高知県</option>
                  <option value="福岡県">福岡県</option>
                  <option value="佐賀県">佐賀県</option>
                  <option value="長崎県">長崎県</option>
                  <option value="熊本県">熊本県</option>
                  <option value="大分県">大分県</option>
                  <option value="宮崎県">宮崎県</option>
                  <option value="鹿児島県">鹿児島県</option>
                  <option value="沖縄県">沖縄県</option>
                </select>
                <Textbox
                  name="city"
                  value={searchForm.city}
                  onChange={handleInputChange}
                  className="city-input mr-6"
                  placeholder="市町村"
                />
              </div>
            </div>
            <div>
              <label htmlFor="status" className="block">
                アカウントの状態
              </label>
              <select
                name="status"
                value={searchForm.status}
                onChange={handleInputChange}
                className="account-input"
                id="status"
              >
                <option value="all">すべて</option>
                <option value="0">利用中</option>
                <option value="1">退会済み</option>
                <option value="2">アカウント停止</option>
              </select>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4">
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
      </details>

      {/*---------------------------
                ユーザー一覧
            ---------------------------*/}
      {errorMessage && (
        <div className="mx-8 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}
      <div className="mx-8 mt-8">
        <table className="w-full user-table">
          <colgroup>
            <col className="w-1" />
            <col className="w-10" />
            <col className="w-10" />
            <col className="w-10" />
            <col className="w-10" />
            <col className="w-10" />
          </colgroup>
          <thead className="table-head">
            <tr>
              <th className="py-2 pl-10 w-[15%]">
                <button
                  type="button"
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("user_status")}
                  aria-label={`ステータスで${sortBy === "user_status" && sortOrder === "asc" ? "降順" : "昇順"}にソート`}
                >
                  ステータス<Icon icon="uil:arrow" rotate={1}></Icon>
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("account_id")}
                  aria-label={`IDで${sortBy === "account_id" && sortOrder === "asc" ? "降順" : "昇順"}にソート`}
                >
                  ID<Icon icon="uil:arrow" rotate={1}></Icon>
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("nickname")}
                  aria-label={`ニックネームで${sortBy === "nickname" && sortOrder === "asc" ? "降順" : "昇順"}にソート`}
                >
                  ニックネーム<Icon icon="uil:arrow" rotate={1}></Icon>
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("age")}
                  aria-label={`年代で${sortBy === "age" && sortOrder === "asc" ? "降順" : "昇順"}にソート`}
                >
                  年代<Icon icon="uil:arrow" rotate={1}></Icon>
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("address")}
                  aria-label={`居住地で${sortBy === "address" && sortOrder === "asc" ? "降順" : "昇順"}にソート`}
                >
                  居住地<Icon icon="uil:arrow" rotate={1}></Icon>
                </button>
              </th>
              <th>
                <div className="flex items-center">
                  投稿数<Icon icon="uil:arrow" rotate={1}></Icon>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  読み込み中...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  ユーザーが見つかりません
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="users-record cursor-pointer"
                  onClick={() => handleUserDetail(user.id)}
                >
                  <td className="py-2 pl-10">
                    <span
                      className={`status-badge ${getStatusClass(user.status)}`}
                    >
                      {getStatusLabel(user.status)}
                    </span>
                  </td>
                  <td className="">{user.account_id}</td>
                  <td className="">{user.nickname}</td>
                  <td className="">{user.age}</td>
                  <td className="">{user.address}</td>
                  <td className="">{user.reviewCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center my-5 page-section">
        <button
          type="button"
          onClick={() => currentPage > 1 && fetchUsers(currentPage - 1)}
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
            // ページ数が7以下なら全て表示
            for (let i = 1; i <= totalPages; i++) pages.push(i);
          } else {
            // 常に最初のページを表示
            pages.push(1);

            // 現在のページ周辺を表示
            if (currentPage <= 4) {
              // 最初の方のページにいる場合
              for (let i = 2; i <= 5; i++) pages.push(i);
              pages.push("...");
            } else if (currentPage >= totalPages - 3) {
              // 最後の方のページにいる場合
              pages.push("...");
              for (let i = totalPages - 4; i <= totalPages - 1; i++)
                pages.push(i);
            } else {
              // 中間のページにいる場合
              pages.push("...");
              for (let i = currentPage - 1; i <= currentPage + 1; i++)
                pages.push(i);
              pages.push("...");
            }

            // 常に最後のページを表示
            pages.push(totalPages);
          }

          return pages.map((pageNum, index) =>
            typeof pageNum === "number" ? (
              <button
                key={`page-${pageNum}`}
                type="button"
                className={`px-4 py-1 page-number ${currentPage === pageNum ? "active" : ""}`}
                onClick={() => fetchUsers(pageNum)}
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
            currentPage < totalPages && fetchUsers(currentPage + 1)
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
      {/* モーダル */}
      <UserDetailModal
        isOpen={isUserDetailModalOpen}
        onClose={handleCloseUserDetail}
        onOpenUserExit={(userId) => {
          setIsUserDetailModalOpen(false);
          setExitUserId(userId);
          setIsUserExitModalOpen(true);
        }}
        userId={selectedUserId}
      />

      <UserExitModal
        isOpen={isUserExitModalOpen}
        userId={exitUserId}
        onClose={() => {
          setIsUserExitModalOpen(false);
          setExitUserId(null);
        }}
        onWithdrawSuccess={handleWithdrawSuccess}
      />
    </main>
  );
}
