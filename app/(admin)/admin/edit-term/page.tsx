"use client";
import React, { useEffect, useState } from "react";
import Textbox from "@/components/ui/admin-textbox";
import AdminButton from "@/components/ui/admin-button";
import "@/styles/admin/edit-term.css";

export default function Page() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);

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
      setPreviewName(null);
      return;
    }
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      alert("PDFファイルのみアップロードできます");
      e.currentTarget.value = "";
      setPreviewUrl(null);
      setPreviewName(null);
      return;
    }
    // 既存プレビューを解放
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPreviewName(file.name);
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">利用規約編集</h1>
      <form action="">
        <div className="my-4">
          <label htmlFor="file-form" className="text-xl block">
            ファイルの表示名
          </label>
          <p className="detail-text text-sm">
            利用者に表示されるファイル名を入力してください。
          </p>
          <Textbox
            id="file-form"
            name="file"
            className="w-full custom-input"
            style={{ backgroundColor: "#F9FAFB" }}
            placeholder="例：利用規約_2024年6月版"
          />
        </div>
        <div className="my-4">
          <label htmlFor="term-start-datetime" className="text-xl block">
            規約の適用日時
          </label>
          <p className="detail-text text-sm">
            登録する利用規約をいつから適用するかを入力してください。
          </p>
          <Textbox
            type="datetime-local"
            id="term-start-datetime"
            name="term-start-datetime"
            className="w-full custom-input"
            style={{ backgroundColor: "#F9FAFB" }}
          />
        </div>
        <div className="my-4">
          <label htmlFor="edit-pdf-upload" className="text-xl block">
            PDFアップロード
          </label>
          <p className="detail-text text-sm">
            利用規約のPDFファイルをアップロードしてください。
          </p>
          <div className="flex items-start gap-4">
            <div className="w-full">
              <Textbox
                type="file"
                id="edit-pdf-upload"
                name="pdf-upload"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="w-full custom-input"
                style={{ backgroundColor: "#F9FAFB" }}
              />
              <div className="my-4">
                <label htmlFor="remarks" className="text-xl block">
                  備考
                </label>
                <p className="detail-text text-sm">
                  利用規約の説明などを記入してください。※ユーザーには公開されません。
                </p>
                <textarea
                  name="remarks"
                  id="remarks"
                  className="w-full custom-input"
                ></textarea>
              </div>
            </div>
            {previewUrl && (
              <div
                className="w-48 border rounded overflow-hidden"
                style={{ minHeight: 200 }}
              >
                <div className="px-2 py-1 bg-gray-100 text-sm">
                  {previewName}
                </div>
                <iframe
                  src={previewUrl}
                  title="PDF Preview"
                  style={{ width: "100%", height: 360, border: "none" }}
                />
                <div className="p-2 text-right">
                  <a
                    href={previewUrl}
                    download={previewName ?? ""}
                    className="text-sm text-blue-600"
                  >
                    ダウンロード
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex gap-5 justify-end">
          <AdminButton label="戻る" className="back-btn" />
          <AdminButton label="更新" type="submit" className="edit-btn" />
        </div>
      </form>
    </main>
  );
}
