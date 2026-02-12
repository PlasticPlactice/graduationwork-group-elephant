"use client";

import "@/styles/admin/print-preview.css";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type PreviewReview = {
  id: number;
  book_title: string;
  author: string | null;
  publishers: string | null;
  isbn: string;
  nickname: string;
  review: string;
  self_introduction: string;
  color: string;
  pattern: string;
  pattern_color: string;
};

const stripHtml = (html: string) => {
  if (!html) return "";
  if (typeof window === "undefined") {
    return html.replace(/<[^>]*>/g, "");
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").trim();
};

export default function Page() {
  const searchParams = useSearchParams();
  const reviewId = searchParams.get("reviewId");

  const [selectedButtonId, setSelectedButtonId] = useState<string>("btn-1-1");
  const [review, setReview] = useState<PreviewReview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handlePrint = () => {
    window.print();
  };

  const handleColorBtnClick = (id: string) => {
    setSelectedButtonId(id);
  };

  useEffect(() => {
    if (!reviewId) {
      setReview(null);
      setError("レビューIDが指定されていません。");
      return;
    }

    let mounted = true;
    const fetchReview = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/reviews/${reviewId}`);
        if (!res.ok) {
          throw new Error("レビューの取得に失敗しました。");
        }
        const data = (await res.json()) as PreviewReview;
        if (mounted) {
          setReview(data);
        }
      } catch (e) {
        if (mounted) {
          setReview(null);
          setError(e instanceof Error ? e.message : "レビューの取得に失敗しました。");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchReview();
    return () => {
      mounted = false;
    };
  }, [reviewId]);

  const reviewText = useMemo(() => stripHtml(review?.review ?? ""), [review?.review]);

  return (
    <main className="print-preview-page">
      <div className="preview-panel">
        <h2 className="panel-head">プレビュー</h2>
        <section className="print-area">
          <div className="card-area">
            <p id="number">No. {review ? String(review.id).padStart(3, "0") : "---"}</p>
            <p id="book-review">
              {isLoading
                ? "読み込み中..."
                : error
                  ? error
                  : reviewText || "書評データがありません。"}
            </p>
            <div id="reviewer-section">
              <p>【評者】{review?.nickname ?? "-"}</p>
              <p id="reviewer-introduction">
                {review?.self_introduction ?? "自己紹介データがありません。"}
              </p>
              <p className="mt-3">書籍: {review?.book_title ?? "-"}</p>
              <p>著者: {review?.author ?? "-"}</p>
              <p>出版社: {review?.publishers ?? "-"}</p>
              <p>ISBN: {review?.isbn ?? "-"}</p>
            </div>
          </div>
        </section>
        <div className="preview-action-row">
          <button id="print-btn" onClick={handlePrint}>
            印刷
          </button>
        </div>
      </div>

      <div className="design-panel">
        <h2 className="panel-head">デザイン設定</h2>
        <div className="design-area">
          <h3 className="design-sub-head font-bold">メインカラー</h3>
          <div className="flex items-center gap-1 mb-4">
            <p
              className="main-color-pick rounded-full"
              style={{ backgroundColor: review?.color || "#fe9c56" }}
            />
            <p className="main-color-text">{review?.color ?? "未設定"}</p>
          </div>

          <h3 className="design-sub-head font-bold">柄</h3>
          <div className="flex items-center gap-1 mb-4">
            <p className="pattern-pick rounded-full" />
            <p className="main-color-text">{review?.pattern ?? "未設定"}</p>
          </div>

          <h3 className="design-sub-head font-bold">柄のカラー</h3>
          <div className="flex items-center gap-1 mb-6">
            <p
              className="pattern-color-pick rounded-full"
              style={{ backgroundColor: review?.pattern_color || "#ffffff" }}
            />
            <p className="main-color-text">{review?.pattern_color ?? "未設定"}</p>
          </div>

          <h3 className="design-sub-head font-bold">フォントカラー</h3>
          <div className="flex items-center gap-1 mb-4">
            <p className="font-color-text">現在:</p>
            <p className="pattern-color-pick rounded-full" />
          </div>

          <div>
            <p className="font-color-text">選択</p>
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, rowIndex) =>
                Array.from({ length: rowIndex === 3 ? 2 : 4 }).map((__, colIndex) => {
                  const id = `btn-${rowIndex + 1}-${colIndex + 1}`;
                  const isSelected = selectedButtonId === id;
                  return (
                    <button
                      key={id}
                      className={`color-btn rounded-full${isSelected ? " selected" : ""}`}
                      id={id}
                      onClick={() => handleColorBtnClick(id)}
                    />
                  );
                }),
              )}
            </div>
          </div>

          <div className="design-action-row">
            <button className="applicable-btn">適用</button>
          </div>
        </div>
      </div>
    </main>
  );
}
