"use client";
import React, { useEffect, useState } from "react";
import Textbox from '@/components/ui/admin-textbox';
import AdminButton from "@/components/ui/admin-button";
import "@/styles/admin/register-term.css"

export default function Page() {
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<"datetime" | "immediate">("datetime");
  const [dateTimeValue, setDateTimeValue] = useState<string>(getNowDatetimeLocal());

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
            return;
        }
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            alert('PDFファイルのみアップロードできます');
            e.currentTarget.value = '';
            setPreviewUrl(null);
            setSelectedFileName(null);
            return;
        }
        // 既存プレビューを解放
        if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setSelectedFileName(file.name);
    };

    const clearPreview = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setSelectedFileName(null);
        const input = document.getElementById('pdf-upload') as HTMLInputElement;
        if (input) {
            input.value = '';
        }
        setIsModalOpen(false);
    };

    useEffect(() => {
        if (!isModalOpen) return;
        const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsModalOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isModalOpen]);

    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-6">利用規約登録</h1>
            <form action="">
                <div className='my-4'>
                    <label htmlFor="pdf-upload" className='text-xl block'>PDFアップロード</label>
                    <p className='detail-text text-sm'>利用規約のPDFファイルをアップロードしてください。</p>
                    <form>
                        <div className="w-full flex items-start gap-6">
                            <Textbox
                                type='file'
                                id='pdf-upload'
                                name='pdf-upload'
                                accept=".pdf,application/pdf"
                                onChange={handleFileChange}
                                className='w-full custom-input'
                                style={{backgroundColor:'#F9FAFB'}}
                            />
                            <div className="w-28 h-28 flex-shrink-0">
                                <div className="relative w-28 h-28">
                                    <div
                                        className="upload-preview w-28 h-28 flex items-center justify-center text-xs text-gray-400 border-2 border-dashed rounded overflow-hidden"
                                        role="button"
                                        aria-label={previewUrl ? "プレビューを開く" : "ファイル未選択"}
                                        onClick={() => {
                                            if (previewUrl) setIsModalOpen(true);
                                        }}
                                    >
                                        {previewUrl ? (
                                            <div className="w-full h-full flex items-center justify-center text-sm text-gray-800 break-words px-1">
                                                {selectedFileName ?? "選択済み"}
                                            </div>
                                        ) : (
                                            <div className="text-center px-1">未選択</div>
                                        )}
                                    </div>
                                    {previewUrl && (
                                    <button
                                        type="button"
                                        aria-label="プレビューを閉じる"
                                        onClick={(e) => { e.stopPropagation(); clearPreview(); }}
                                        className="preview-close-btn absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-sm text-black hover:bg-gray-100"
                                    >&times;</button>
                                    )}
                            </div>
                            </div>
                        </div>
                        <div className="flex justify-center gap-4 mt-6 text-xl">
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="apply"
                                    id="datetime"
                                checked={mode === "datetime"}
                                    onChange={() => setMode("datetime")}/>
                                <label htmlFor="datetime">日時予約適用</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="apply"
                                    id="immediate"
                                    checked={mode === "immediate"}
                                    onChange={() => {
                                        setMode("immediate");
                                        setDateTimeValue(getNowDatetimeLocal());
                                    }}
                                />
                                <label htmlFor="immediate">即時適用</label>
                            </div>
                        </div>
                    <div className="flex justify-center mt-6">
                        <input
                            type="datetime-local"
                            className="datetime-input"
                            value={dateTimeValue}
                            onChange={(e) => setDateTimeValue(e.target.value)}
                            disabled={mode !== "datetime"}
                        />
                    </div>
                    </form>
                    {/* PDFモーダル */}
                    {isModalOpen && previewUrl && (
                        <div
                            className="upload-modal fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <div
                                className="bg-white rounded p-4 overflow-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <h3 className="text-lg font-medium">プレビュー</h3>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="close-btn text-2xl px-2 hover:bg-gray-100 rounded"
                                        aria-label="閉じる"
                                    >
                                    &times;
                                    </button>
                                </div>
                                <div className="p-4">
                                    <object
                                        data={previewUrl}
                                        type="application/pdf"
                                        // className="w-full"
                                        style={{ maxHeight:"70vh", minHeight:"60vh" }}
                                    >
                                        <p className="text-sm text-gray-600">
                                            PDFプレビューを表示できません。ダウンロードしてください。
                                        </p>
                                    </object>

                                    <p className="font-medium mt-4">ファイル名</p>
                                    <p className="mt-2 break-words">{selectedFileName}</p>
                                </div>
                            </div>
                        </div>                    
                    )}
                </div>
                <div className="mt-6 flex gap-5 justify-end">
                    <AdminButton
                        label="戻る"
                        className="back-btn"
                    />
                    <AdminButton
                        label="登録"
                        type="submit"
                        className="register-btn"
                    />
                </div>
            </form>
        </main>
    );
}
