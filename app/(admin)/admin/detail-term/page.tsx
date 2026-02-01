"use client";

import { useState } from "react";
import "@/styles/admin/detail-term.css";
import AdminButton from "@/components/ui/admin-button";
import { useRouter } from "next/navigation";

export default function Page() {
    const router = useRouter();
    type Term = {
        id: number;
        displayName: string;
        uploadFileName?: string;
        appliedAt?: string | null;
    };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
    const terms: Term[] = [
        {
            id: 1,
            displayName: '利用規約_2024年6月版.pdf',
            uploadFileName: '/uploads/1769407922017-ekx6gf05ok.pdf',
            appliedAt: '2024-06-01 00:00:00',
        },
    ];
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTerm(null);
    };

    const handleRegister = () => {
        router.push("/admin/register-term");
    }

    return (
        <main className="p-6">
            <AdminButton
                label="利用規約登録"
                className="resiter-btn"
                onClick={handleRegister}
            />
            <div className="my-4 flex justify-center">
                {terms.map((term) => (
                    <div key={term.id} className="w-full max-w-5xl flex">
                        <div className="w-1/2 pl-10 pr-5 border-r-2">
                            <p className="text-xl font-bold">現在適用中の利用規約情報</p>
                            <p className="ml-10 mt-5 mb-1 text-lg">{term.displayName}</p>
                            <div className="ml-10 mt-5">
                                <div className="grid grid-cols-2">
                                    <p>適用日時</p>
                                    <p>{term.appliedAt}</p>
                                </div>
                            </div>
                        </div>
                            <div className="ml-10 w-28 h-28 flex-shrink-0">
                                <div className="relative w-28 h-28">
                                    <div
                                        className="upload-preview w-28 h-28 flex items-center justify-center text-xs text-gray-400 border-2 border-dashed rounded overflow-hidden"
                                        role="button"
                                        aria-label={term.uploadFileName ? "プレビューを開く" : "ファイル未選択"}
                                        onClick={() => {
                                            if (term.uploadFileName) {
                                                setSelectedTerm(term);
                                                setIsModalOpen(true);
                                            }
                                        }}
                                    >
                                        <span>{term.displayName}</span>
                                    </div>
                            </div>
                        </div>
                    </div>
                ))}
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
                                    data={selectedTerm.uploadFileName}
                                    type="application/pdf"
                                    // className="w-full"
                                    style={{ maxHeight:"70vh", minHeight:"60vh" }}
                                >
                                    <p className="text-sm text-gray-600">
                                        PDFプレビューを表示できません。ダウンロードしてください。
                                    </p>
                                </object>

                                <p className="font-medium mt-4">ファイル名</p>
                                <p className="mt-2 break-words">{selectedTerm.displayName}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
