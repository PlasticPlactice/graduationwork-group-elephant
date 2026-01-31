"use client";

import { TERM_STATUS_LABELS, TERM_STATUS_CLASS } from "@/lib/constants/termStatus";
import "@/styles/admin/detail-term.css";

export default function Page() {
    const terms = [
        {
            id: 1,
            status: 0,
            displayName: '利用規約_2024年6月版.pdf',
            uploadFileName: '/uploads/1769407922017-ekx6gf05ok.pdf',
            appliedAt: '2024-06-01 00:00:00',
            createdAt: '2024-05-15 12:34:56',
            remarks: '●●を××に変更しました。',
        },
    ];

    const getStatusClass = (status: number) => {
        return TERM_STATUS_CLASS[status] || "";
    };

    const getStatusLabel = (status: number) => {
        return TERM_STATUS_LABELS[status] || "";
    };

    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-6">利用規約詳細</h1>
            <div className="my-4 flex justify-center">
                {terms.map((term) => (
                    <div key={term.id} className="w-full max-w-5xl flex">
                        <div className="w-1/2 pl-10 pr-5 border-r-2">
                            <p className="text-xl font-bold">利用規約情報</p>
                            <p className="ml-10 mt-5 mb-1 text-lg">{term.displayName}</p>
                            <span className={`status-badge ml-10 text-lg ${getStatusClass(term.status)}`}>
                                {getStatusLabel(term.status)}
                            </span>
                            <div className="ml-10 mt-5">
                                <div className="grid grid-cols-2">
                                    <p>登録日時</p>
                                    <p>{term.createdAt}</p>
                                </div>
                                <div className="grid grid-cols-2">
                                    <p>適用日時</p>
                                    <p>{term.appliedAt}</p>
                                </div>
                                <div>
                                    <p>備考</p>
                                    <p>{term.remarks}</p>
                                </div>
                                <div className="mt-4">
                                    <a
                                        href={term.uploadFileName}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline"
                                    >
                                        別タブで開く / ダウンロード
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="w-1/2 ml-5 pb-6 px-6 bg-gray-50">
                            <p className="text-xl font-bold mb-4">PDFプレビュー</p>
                            <div className="h-[600px] bg-white border">
                                <object
                                    data={term.uploadFileName}
                                    type="application/pdf"
                                    width="100%"
                                    height="100%"
                                >
                                    <div className="p-6">
                                        <p>このブラウザではPDFを表示できません。</p>
                                        <a
                                            href={term.uploadFileName}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                            PDFを開く / ダウンロード
                                        </a>
                                    </div>
                                </object>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center">
                {/* 「適用する」ボタン、「戻る」ボタン、「削除」ボタン */}
                <div>
                    <button
                        type="button"
                        className="remove-btn"
                    >削除する
                    </button>
                </div>
                <div className="ml-auto flex">
                    <button
                        type="button"
                        className="back-btn"
                        onClick={() => window.history.back()}
                    >戻る
                    </button>
                    <button
                        type="button"
                        // ステータスが「適用中」ならclassをapply-btn
                        // それ以外ならapplyend-btn
                        className="apply-btn ml-4"
                    >
                        {/*ステータスが「適用中」ならボタンのテキストを"適用を終了する"
                        // それ以外なら"適用する" */}
                        適用する
                    </button>
                </div>
            </div>
        </main>
    );
}
