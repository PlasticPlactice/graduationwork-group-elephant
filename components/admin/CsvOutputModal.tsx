"use client";
import { useCallback } from "react";
import { Icon } from "@iconify/react";
import AdminButton from "@/components/ui/admin-button";

// 出力するデータの型定義
export interface CsvRecord {
  id: number;
  book_title: string;
  nickname: string;
  author: string | null;
  publishers: string | null;
  isbn: string;
  evaluations_status: number;
  evaluations_count: number;
  review: string;
  // 構造的部分型により、これ以外のプロパティを持っていても許容される
}

interface CsvOutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CsvRecord[]; // 親からデータを受け取る
  fileName?: string;
}

export default function CsvOutputModal({
  isOpen,
  onClose,
  data,
  fileName = "book_reviews",
}: CsvOutputModalProps) {
  // useCallbackで関数をメモ化
  const handleDownloadCsv = useCallback(() => {
    const CSV_HEADER =
      "ID,書籍タイトル,ニックネーム,著者,出版社,ISBN,ステータス,投票数,書評本文\n";

    // ステータスのラベル変換用マッピング
    const statusLabels: { [key: number]: string } = {
      0: "評価前",
      1: "一次通過",
      2: "二次通過",
      3: "三次通過",
      4: "不採用",
    };

    const csvBody = data
      .map((record) => {
        const escapedTitle = record.book_title.replace(/"/g, '""');
        const escapedNickname = record.nickname.replace(/"/g, '""');
        const escapedAuthor = (record.author || "").replace(/"/g, '""');
        const escapedPublishers = (record.publishers || "").replace(/"/g, '""');
        const escapedIsbn = record.isbn.replace(/"/g, '""');
        const statusLabel = statusLabels[record.evaluations_status] || "不明";
        const escapedReview = record.review
          .replace(/"/g, '""')
          .replace(/\n/g, " ");
        return `${record.id},"${escapedTitle}","${escapedNickname}","${escapedAuthor}","${escapedPublishers}","${escapedIsbn}","${statusLabel}",${record.evaluations_count},"${escapedReview}"`;
      })
      .join("\n");

    const csvContent = CSV_HEADER + csvBody;

    // BOM (Byte Order Mark) を付与して文字化けを防止
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, csvContent], { type: "text/csv" });
    const downloadUrl = URL.createObjectURL(blob);

    // 現在日時を取得してファイル名を生成 (例: book_reviews_20240101_120000.csv)
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const timestamp = `${yyyy}${mm}${dd}_${hh}${min}${ss}`;

    // ダウンロード用の一時的なリンクを作成
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = `${fileName.replace(/\.csv$/, "")}_${timestamp}.csv`;
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // クリーンアップ
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadUrl);
  }, [data, fileName]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 status-edit-modal bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="modal-content bg-white rounded-lg w-9/12 max-w-8xl max-h-[90vh] flex flex-col p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-3">
          <h2 className="modal-head font-bold text-center">CSV出力</h2>
          <button onClick={onClose} className="close-btn text-black">
            <Icon icon="mdi:close" width={24} className="text-black" />
          </button>
        </div>
        <h3 className="modal-sub-head mt-3">CSV出力書評</h3>

        <div className="border p-3 overflow-auto h-64 mb-5">
          <table className="w-full status-table">
            <thead className="table-head">
              <tr>
                <th>ID</th>
                <th>書籍タイトル</th>
                <th>ニックネーム</th>
              </tr>
            </thead>
            <tbody className="border status-book-section">
              {data.map((record) => {
                return (
                  <tr key={record.id} className="status-record text-center">
                    <td>{record.id}</td>
                    <td>{record.book_title}</td>
                    <td>{record.nickname}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="m-auto w-1/4">
          <AdminButton
            label="CSV出力"
            type="button"
            onClick={handleDownloadCsv}
          />
        </div>
      </div>
    </div>
  );
}
