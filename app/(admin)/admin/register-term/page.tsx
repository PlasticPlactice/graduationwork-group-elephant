"use client";
import React, { useEffect, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import Textbox from "@/components/ui/admin-textbox";
import AdminButton from "@/components/ui/admin-button";
import { useRouter } from "next/navigation";
import "@/styles/admin/register-term.css";

export default function Page() {
  const { addToast } = useToast();
  const router = useRouter();
  const getNowDatetimeLocal = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hour = pad(now.getHours());
    const minute = pad(now.getMinutes());
    return `${year}-${month}-${day}T${hour}:${minute}`;
  };
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [mode, setMode] = useState<"datetime" | "immediate">("immediate");
  const [dateTimeValue, setDateTimeValue] = useState<string>(
    getNowDatetimeLocal(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPreviewUrl(null);
      setSelectedFileName(null);
      setSelectedFile(null);
      return;
    }
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      addToast({
        type: "error",
        message: "PDFファイルのみアップロードできます",
      });
      e.currentTarget.value = "";
      setPreviewUrl(null);
      setSelectedFileName(null);
      setSelectedFile(null);
      return;
    }
    // 既存プレビューを解放
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFileName(file.name);
    setSelectedFile(file);
  };

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFileName(null);
    setSelectedFile(null);
    const input = document.getElementById("pdf-upload") as HTMLInputElement;
    if (input) {
      input.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedFile || !selectedFileName) {
      addToast({ type: "error", message: "ファイルを選択してください" });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("fileName", selectedFileName);
      formData.append("mode", mode);
      formData.append("dateTimeValue", dateTimeValue);

      const response = await fetch("/api/admin/terms", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        addToast({
          type: "error",
          message: error.message || "利用規約の登録に失敗しました",
        });
        return;
      }

      addToast({ type: "success", message: "利用規約を登録しました" });
      router.push("/admin/detail-term");
    } catch (error) {
      console.error("Error:", error);
      addToast({ type: "error", message: "利用規約の登録に失敗しました" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/detail-term");
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">利用規約登録</h1>
      <form onSubmit={handleSubmit}>
        <div className="my-4">
          <label htmlFor="register-pdf-upload" className="text-xl block">
            PDFアップロード
          </label>
          <p className="detail-text text-sm">
            利用規約のPDFファイルをアップロードしてください。
          </p>
          <div>
            <div className="w-full flex items-start gap-6">
              <Textbox
                type="file"
                id="register-pdf-upload"
                name="pdf-upload"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="w-full"
                style={{ backgroundColor: "#F9FAFB" }}
                disabled={isLoading}
              />
              <div className="w-28 h-28 flex-shrink-0">
                <div className="relative w-28 h-28">
                  <div
                    className="upload-preview w-28 h-28 flex items-center justify-center text-xs border-2 border-solid rounded overflow-hidden"
                    role="button"
                    aria-label={
                      previewUrl ? "新しいタブで開く" : "ファイル未選択"
                    }
                    onClick={() => {
                      if (previewUrl) window.open(previewUrl, "_blank");
                    }}
                    style={{
                      backgroundColor: "#ffffff",
                      color: "var(--color-main)",
                      borderColor: "#000000",
                    }}
                  >
                    {previewUrl ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        style={{ width: "36px", height: "36px" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    ) : (
                      <div className="text-center px-1 text-gray-400">
                        未選択
                      </div>
                    )}
                  </div>
                  {previewUrl && (
                    <button
                      type="button"
                      aria-label="プレビューを閉じる"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearPreview();
                      }}
                      className="preview-close-btn absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-sm text-black hover:bg-gray-100"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-start gap-4 mt-6 text-xl">
              <div className="flex items-center">
                <input
                  type="radio"
                  name="apply"
                  id="register-immediate"
                  checked={mode === "immediate"}
                  onChange={() => {
                    setMode("immediate");
                    setDateTimeValue(getNowDatetimeLocal());
                  }}
                  disabled={isLoading}
                />
                <label htmlFor="register-immediate">即時適用</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="apply"
                  id="register-datetime"
                  checked={mode === "datetime"}
                  onChange={() => setMode("datetime")}
                  disabled={isLoading}
                />
                <label htmlFor="register-datetime">日時予約適用</label>
              </div>
              <input
                type="datetime-local"
                className="datetime-input"
                value={dateTimeValue}
                onChange={(e) => setDateTimeValue(e.target.value)}
                disabled={mode !== "datetime" || isLoading}
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-5">
          <AdminButton
            label="戻る"
            className="back-btn"
            onClick={handleCancel}
            disabled={isLoading}
          />
          <AdminButton
            label={isLoading ? "登録中..." : "登録"}
            type="submit"
            className="register-term-btn"
            disabled={isLoading}
          />
        </div>
      </form>
    </main>
  );
}
