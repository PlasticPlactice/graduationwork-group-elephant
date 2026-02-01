"use client";
import { useCallback } from "react";
import AdminButton from "@/components/ui/admin-button";

// 出力するデータの型定義
export interface CsvRecord {
  id: number;
  book_title: string;
  nickname: string;
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
    const CSV_HEADER = "ID,書籍タイトル,ニックネーム\n";

    const csvBody = data
      .map((record) => {
        const escapedTitle = record.book_title.replace(/"/g, '""');
        const escapedNickname = record.nickname.replace(/"/g, '""');
        return `${record.id},"${escapedTitle}","${escapedNickname}"`;
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
        <h2 className="modal-head text-center">CSV出力</h2>
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
              {data.map((record) => (
                <tr key={record.id} className="status-record text-center">
                  <td>{record.id}</td>
                  <td>{record.book_title}</td>
                  <td>{record.nickname}</td>
                </tr>
              ))}
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
