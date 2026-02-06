"use client";

import { useState, useEffect } from "react";
import "@/styles/admin/detail-term.css";
import AdminButton from "@/components/ui/admin-button";
import { useRouter } from "next/navigation";

type Term = {
  id: number;
  file_name: string;
  data_path: string;
  public_flag: boolean;
  applied_at: string | null;
  scheduled_applied_at: string | null;
  admin_id: number;
};

export default function Page() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [currentTerm, setCurrentTerm] = useState<Term | null>(null);
  const [scheduledTerm, setScheduledTerm] = useState<Term | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setIsLoading(true);
        // 全ての削除されていない利用規約を取得
        const response = await fetch("/api/admin/terms");
        if (!response.ok) {
          throw new Error("利用規約の取得に失敗しました");
        }
        const data = await response.json();

        // 公開中のものと予約中のものを分ける
        const current = data.find((term: Term) => term.public_flag === true);
        const scheduled = data.find(
          (term: Term) =>
            term.scheduled_applied_at !== null && term.public_flag === false,
        );

        setCurrentTerm(current || null);
        setScheduledTerm(scheduled || null);
        setSelectedTerm(current || scheduled || null);
        setError(null);
      } catch (err) {
        console.error("Error:", err);
        setError(
          err instanceof Error ? err.message : "利用規約の取得に失敗しました",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerms();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleRegister = () => {
    router.push("/admin/register-term");
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    } catch {
      return "-";
    }
  };

  return (
    <main className="p-6">
      <div className="flex justify-end">
        <AdminButton
          label="利用規約登録"
          className="resiter-btn"
          onClick={handleRegister}
          />
      </div>
      {isLoading && <p className="text-center mt-8">読み込み中...</p>}
      {error && (
        <p className="text-center mt-8 text-red-600">エラー: {error}</p>
      )}
      {!isLoading && !error && (currentTerm || scheduledTerm) && (
        <div className="my-4 flex justify-center">
          <div className="w-full max-w-6xl flex flex-col gap-8">
            {/* 現在適用中の利用規約 */}
            {currentTerm && (
              <div className="flex">
                <div className="w-2/3 pl-10 pr-5 border-r-2">
                  <p className="text-xl font-bold">現在適用中の利用規約情報</p>
                  <p className="ml-10 mt-5 mb-1 text-lg">
                    {currentTerm.file_name}
                  </p>
                  <div className="ml-10 mt-5">
                    <div className="grid grid-cols-2">
                      <p>適用日時</p>
                      <p>{formatDateTime(currentTerm.applied_at)}</p>
                    </div>
                  </div>
                </div>
                <div className="ml-10 w-28 h-28 flex-shrink-0">
                  <div className="relative w-28 h-28">
                    <div
                      className="upload-preview w-28 h-28 flex items-center justify-center text-xs text-gray-400 border-2 border-dashed rounded overflow-hidden cursor-pointer hover:bg-gray-50"
                      role="button"
                      aria-label="プレビューを開く"
                      onClick={() => {
                        setSelectedTerm(currentTerm);
                        setIsModalOpen(true);
                      }}
                    >
                      <span>{currentTerm.file_name}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 予約中の利用規約 */}
            {scheduledTerm && (
              <div className="flex">
                <div className="w-2/3 pl-10 pr-5 border-r-2 bg-blue-50">
                  <p className="text-xl font-bold text-blue-900">
                    予約中の利用規約情報
                  </p>
                  <p className="ml-10 mt-5 mb-1 text-lg">
                    {scheduledTerm.file_name}
                  </p>
                  <div className="ml-10 mt-5">
                    <div className="grid grid-cols-2 gap-4">
                      <p>適用予定日時</p>
                      <p className="text-blue-700 font-semibold">
                        {formatDateTime(scheduledTerm.scheduled_applied_at)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="ml-10 w-28 h-28 flex-shrink-0">
                  <div className="relative w-28 h-28">
                    <div
                      className="upload-preview w-28 h-28 flex items-center justify-center text-xs text-gray-400 border-2 border-dashed rounded overflow-hidden cursor-pointer hover:bg-gray-50"
                      role="button"
                      aria-label="プレビューを開く"
                      onClick={() => {
                        setSelectedTerm(scheduledTerm);
                        setIsModalOpen(true);
                      }}
                    >
                      <span>{scheduledTerm.file_name}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {!isLoading && !error && !currentTerm && !scheduledTerm && (
        <p className="text-center mt-8">利用規約が登録されていません</p>
      )}
      {/* PDFモーダル */}
      {isModalOpen && selectedTerm && (
        <div
          className="upload-modal fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded p-4 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-lg font-medium">プレビュー</h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="close-btn text-2xl px-2 hover:bg-gray-100 rounded"
                aria-label="閉じる"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              <object
                data={selectedTerm.data_path}
                type="application/pdf"
                style={{ maxHeight: "70vh", minHeight: "60vh" }}
              >
                <p className="text-sm text-gray-600">
                  PDFプレビューを表示できません。ダウンロードしてください。
                </p>
              </object>

              <p className="font-medium mt-4">ファイル名</p>
              <p className="mt-2 break-words">{selectedTerm.file_name}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
