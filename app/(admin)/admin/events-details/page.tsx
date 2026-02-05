"use client";
import Textbox from "@/components/ui/admin-textbox";
import AdminButton from "@/components/ui/admin-button";
import "@/styles/admin/events-details.css";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import StatusEditModal from "@/components/admin/StatusEditModal";
import CsvOutputModal from "@/components/admin/CsvOutputModal";
import AllMessageSendModal from "@/components/admin/AllMessageSendModal";
import BookReviewDetailModal from "@/components/admin/BookReviewDetailModal";
import { useRouter } from "next/navigation";
import React from "react";
import { REVIEW_STATUS_LABELS } from "@/lib/constants/reviewStatus";

// APIから取得するデータの型定義
interface ReviewData {
  id: number;
  book_title: string;
  nickname: string;
  evaluations_status: number;
  evaluations_count: number;
  review: string;
  author: string | null;
  publishers: string | null;
  isbn: string;
}

export default function Page() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [openRows, setOpenRows] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [displayCount, setDisplayCount] = useState<number | "all">(10);
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]); // 選択された行IDを管理
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  const [isStatusEditModalOpen, setIsStatusEditModalOpen] = useState(false);
  const [isCsvOutputModalOpen, setIsCsvOutputModalOpen] = useState(false);
  const [isAllMessageSendModalOpen, setIsAllMessageSendModalOpen] =
    useState(false);
  const [isBookReviewDetailModalOpen, setIsBookReviewDetailModalOpen] =
    useState(false);

  const router = useRouter();

  // データ取得
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("/api/admin/reviews");
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        } else {
          console.error("Failed to fetch reviews");
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, []);

  const toggleRow = (id: number) => {
    setOpenRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  // 全選択・全解除ハンドラ
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRowIds(displayedData.map((row) => row.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  // 個別選択ハンドラ
  const handleSelectRow = (id: number) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  // モーダルが開いている時に背景のスクロールを防ぐ
  useEffect(() => {
    if (isStatusEditModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // クリーンアップ関数
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isStatusEditModalOpen]);

  const handleStatusEdit = () => {
    if (selectedRowIds.length === 0) return alert("データが選択されていません");
    setIsStatusEditModalOpen(true);
  };
  const handleCsvOutput = () => {
    // CSV出力は今回は表示中のデータを対象とする（要件に応じて選択データのみに変更も可）
    setIsCsvOutputModalOpen(true);
  };
  const handleAllMessageSend = () => {
    if (selectedRowIds.length === 0) return alert("データが選択されていません");
    setIsAllMessageSendModalOpen(true);
  };
  const handleBookReviewDetail = (reviewId: number) => {
    setSelectedReviewId(reviewId);
    setIsBookReviewDetailModalOpen(true);
  };
  const closeModal = () => {
    setIsStatusEditModalOpen(false);
    setIsCsvOutputModalOpen(false);
    setIsAllMessageSendModalOpen(false);
    setIsBookReviewDetailModalOpen(false);
    setSelectedReviewId(null);
  };

  const handlePreview = () => {
    router.push("/admin/print-preview");
  };

  // 表示するデータをスライス
  const displayedData =
    displayCount === "all" ? reviews : reviews.slice(0, displayCount);

  // 選択されたデータを取得
  const selectedData = reviews.filter((row) => selectedRowIds.includes(row.id));

  // StatusEditModal用にデータを整形（ステータスを数値に変換）
  const statusTargetReviews = selectedData.map((row) => ({
    id: row.id,
    title: row.book_title,
    nickname: row.nickname,
    status: row.evaluations_status,
  }));

  // AllMessageSendModal用にデータを整形
  const messageTargetReviews = selectedData.map((row) => ({
    id: row.id,
    title: row.book_title,
    nickname: row.nickname,
  }));

  return (
    <main>
      {/*---------------------------
            検索ボックス
            ---------------------------*/}
      <details className="px-5 pt-3 pb-6 mx-8 my-6 shadow-sm search-accordion">
        <summary className="flex items-center justify-between">
          検索ボックス
          <Icon
            icon="ep:arrow-up"
            rotate={2}
            width={20}
            className="icon"
          ></Icon>
        </summary>

        <div className="">
          <label htmlFor="title_box">書籍タイトル</label>
          <Textbox size="lg" className="custom-input-full" id="title_box" />
        </div>
        <div className="">
          <label htmlFor="nickname_box">ニックネーム</label>
          <Textbox
            className="custom-input-full"
            type="text"
            id="nickname_box"
          />
        </div>

        <div>
          <label htmlFor="status" className="block">
            ステータス
          </label>
          <select className="input-group" id="status">
            <option value="評価前">評価前</option>
            <option value="一次通過">一次通過</option>
            <option value="二次通過">二次通過</option>
            <option value="三次通過">三次通過</option>
          </select>
        </div>

        <div className="flex justify-center">
          <AdminButton
            label="検索"
            type="submit"
            icon="mdi:search"
            iconPosition="left"
            className="mt-5 search-btn"
          />
        </div>
      </details>

      <div className="flex justify-between">
        <div className="flex items-center mx-8 gap-3">
          <label htmlFor="cotent-select">表示数</label>
          <select
            className="all-select"
            id="cotent-select"
            value={displayCount}
            onChange={(e) => {
              const value = e.target.value;
              setDisplayCount(value === "all" ? "all" : Number(value));
            }}
          >
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="25">25</option>
            <option value="30">30</option>
            <option value="all">全件表示</option>
          </select>
          <button className="choice-btn font-bold">一括選択</button>
        </div>

        <div className="flex justify-end mx-8 gap-3">
          <AdminButton
            label="ステータス変更"
            icon="material-symbols:edit-outline"
            iconPosition="left"
            className="w-auto"
            onClick={handleStatusEdit}
          />
          <AdminButton
            label="メッセージ送信"
            icon="ic:baseline-message"
            iconPosition="left"
            className="w-auto"
            onClick={handleAllMessageSend}
          />
          <AdminButton
            label="選択したデータのCSV出力"
            icon="material-symbols:download"
            iconPosition="left"
            className="w-auto"
            onClick={handleCsvOutput}
          />
        </div>
      </div>
      <div className="mx-8 mt-8">
        <table className="w-full event-table">
          <thead className="table-head">
            <tr>
              <th className="py-2">
                <div className="ml-3 bg-white flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="head-check"
                    onChange={handleSelectAll}
                    checked={
                      displayedData.length > 0 &&
                      selectedRowIds.length === displayedData.length
                    }
                  />
                </div>
              </th>
              <th className="w-[27.777%]">
                <div className="flex justify-center items-center">
                  ステータス<Icon icon="uil:arrow" rotate={1}></Icon>
                </div>
              </th>
              <th className="w-[11.111%]">
                <div className="flex items-center justify-start">
                  ID<Icon icon="uil:arrow" rotate={1}></Icon>
                </div>
              </th>
              <th className="w-[27.777%]">
                <div className="flex items-center">
                  書籍タイトル<Icon icon="uil:arrow" rotate={1}></Icon>
                </div>
              </th>
              <th className="w-1/6">
                <div className="flex items-center">
                  ニックネーム<Icon icon="uil:arrow" rotate={1}></Icon>
                </div>
              </th>
              <th className="w-[11.111%]">
                <div className="flex items-center">
                  投票数<Icon icon="uil:arrow" rotate={1}></Icon>
                </div>
              </th>
              <th className="w-[5.555%]">
                {/* <Icon icon='fe:arrow-up'></Icon> */}
              </th>
            </tr>
          </thead>
          {/* アコーディオン */}
          <tbody className="border">
            {displayedData.map((row) => (
              <React.Fragment key={row.id}>
                <tr className="table-row">
                  <td className="pl-3">
                    <input
                      type="checkbox"
                      className="head-check"
                      checked={selectedRowIds.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                    />
                  </td>
                  <td className="text-center">
                    <span className="status-text font-bold py-1 px-6">
                      {REVIEW_STATUS_LABELS[row.evaluations_status] ?? "-"}
                    </span>
                  </td>
                  <td className="text-left">
                    <span>{row.id}</span>
                  </td>
                  <td onClick={() => handleBookReviewDetail(row.id)}>
                    <span className="title-text">{row.book_title}</span>
                  </td>
                  <td>
                    <span>{row.nickname}</span>
                  </td>
                  <td>
                    <span>{row.evaluations_count}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleRow(row.id)}
                      className="accordion-toggle"
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
                    <td colSpan={7} className="details-content">
                      <div className="p-4 flex">
                        <section className="w-4/7">
                          <h3 className="font-bold mb-2 ml-4">書評本文</h3>
                          <div className="book-review-section w-auto h-84 ml-4 p-2">
                            <p className="whitespace-pre-wrap">{row.review}</p>
                          </div>
                        </section>

                        <section className="ml-10 w-3/7">
                          <h3 className="font-bold mb-2">書籍情報</h3>
                          <div>
                            <div className="book-data">
                              <h4 className="book-head">タイトル</h4>
                              <p className="book-content">{row.book_title}</p>
                            </div>

                            <div className="book-data">
                              <h4 className="book-head">著者</h4>
                              <p className="book-content">{row.author}</p>
                            </div>

                            <div className="book-data">
                              <h4 className="book-head">出版社</h4>
                              <p className="book-content">{row.publishers}</p>
                            </div>

                            <div className="book-data">
                              <h4 className="book-head">ISBN</h4>
                              <p className="book-content">{row.isbn}</p>
                            </div>
                          </div>
                          <div className="flex justify-between gap-5">
                            <AdminButton
                              label="書評編集"
                              className="review-edit-btn w-auto"
                              onClick={() => handleBookReviewDetail(row.id)}
                            />
                            <AdminButton
                              label="印刷プレビュー"
                              icon="material-symbols:print"
                              iconPosition="left"
                              className="print-preview-btn w-auto"
                              onClick={handlePreview}
                            />
                          </div>
                        </section>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mr-8 my-5">
        <AdminButton
          label="全件CSV出力"
          icon="material-symbols:download"
          iconPosition="left"
          className="w-auto"
          onClick={handleCsvOutput}
        />
      </div>
      {/* ページネーション */}
      {displayCount !== "all" && (
        <div className="flex items-center justify-center my-5 page-section">
          <Icon
            icon="weui:arrow-filled"
            rotate={2}
            width={20}
            className="page-arrow"
          ></Icon>
          <button
            type="button"
            className={`px-4 py-1 page-number ${currentPage === 1 ? "active" : ""}`}
            onClick={() => setCurrentPage(1)}
            aria-current={currentPage === 1 ? "page" : undefined}
          >
            1
          </button>
          <button
            type="button"
            className={`px-4 py-1 page-number ${currentPage === 2 ? "active" : ""}`}
            onClick={() => setCurrentPage(2)}
            aria-current={currentPage === 2 ? "page" : undefined}
          >
            2
          </button>
          <button
            type="button"
            className={`px-4 py-1 page-number ${currentPage === 3 ? "active" : ""}`}
            onClick={() => setCurrentPage(3)}
            aria-current={currentPage === 3 ? "page" : undefined}
          >
            3
          </button>
          <span className="px-4 py-1 page-number" aria-hidden="true">
            ...
          </span>
          <button
            type="button"
            className={`px-4 py-1 page-number ${currentPage === 5 ? "active" : ""}`}
            onClick={() => setCurrentPage(5)}
            aria-current={currentPage === 5 ? "page" : undefined}
          >
            5
          </button>
          <Icon
            icon="weui:arrow-filled"
            width={20}
            className="page-arrow"
          ></Icon>
        </div>
      )}
      {/* モーダル */}
      <StatusEditModal
        isOpen={isStatusEditModalOpen}
        onClose={closeModal}
        selectedReviews={statusTargetReviews}
      />
      <CsvOutputModal
        isOpen={isCsvOutputModalOpen}
        onClose={closeModal}
        data={displayedData}
      />
      <AllMessageSendModal
        isOpen={isAllMessageSendModalOpen}
        onClose={closeModal}
        selectedReviews={messageTargetReviews}
      />
      <BookReviewDetailModal
        isOpen={isBookReviewDetailModalOpen}
        onClose={closeModal}
        reviewId={selectedReviewId}
      />
    </main>
  );
}
