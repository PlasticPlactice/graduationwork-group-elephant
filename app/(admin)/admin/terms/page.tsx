"use client";

import { TERM_STATUS_LABELS, TERM_STATUS_CLASS } from "@/lib/constants/termStatus";
import "@/styles/admin/terms.css";
import AdminButton from "@/components/ui/admin-button";
import { useRouter } from "next/navigation";

export default function Page() {
    const router = useRouter();
    const terms = [
    // 最新順に表示
        {
            id: 1,
            status: 0,
            displayName: '利用規約_2024年6月版.pdf',
            appliedAt: '2024-06-01 00:00:00',
            createdAt: '2024-05-15 12:34:56',
        },
        {
            id: 2,
            status: 1,
            displayName: '利用規約_2024年5月版.pdf',
            appliedAt: '2024-05-01 00:00:00',
            createdAt: '2024-04-15 12:34:56',
        },
        {
            id: 3,
            status: 1,
            displayName: '利用規約_2024年3月版.pdf',
            appliedAt: '2024-03-01 00:00:00',
            createdAt: '2024-02-15 12:34:56',
        },
        {
            id: 4,
            status: 2,
            displayName: '利用規約_2024年7月版.pdf',
            appliedAt: '2024-07-01 00:00:00',
            createdAt: '2024-06-15 12:34:56',
        },
    ]

      // ステータスに応じたクラス名を取得
      const getStatusClass = (status: number) => {
        return TERM_STATUS_CLASS[status] || "";
      };
    
      // ステータス値を表示テキストに変換
      const getStatusLabel = (status: number) => {
        return TERM_STATUS_LABELS[status] || "";
    };
    
    const handleRegister = () => {
        router.push("/admin/register-term");
    };

    return (
        <main>
            <div className="mx-8 mt-8">
                <AdminButton
                label="利用規約登録"
                type="button"
                className="register-btn mb-6"
                onClick={handleRegister}
                />
                <table className="w-full terms-table">
                    {/*
                    ステータス、ファイルの表示名、適用日時、登録日時、ファイルの表示名
                     */}
                    <thead className="table-head">
                        <tr>
                            <th className="py-2 pl-10 text-left">ステータス</th>
                            <th className="text-left">ファイルの表示名</th>
                            <th className="text-left">適用日時</th>
                            <th className="text-left">登録日時</th>
                        </tr>
                    </thead>
                    <tbody className="border">
                        {terms.map((term) => (
                            <tr key={term.id} className="table-row cursor-pointer">
                                <td className="py-2 pl-10">
                                    <span
                                    className={`status-badge ${getStatusClass(term.status)}`}
                                    >
                                    {getStatusLabel(term.status)}
                                    </span>
                                </td>
                                <td>{term.displayName}</td>
                                <td>{term.appliedAt}</td>
                                <td>{term.createdAt}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* この下にページネーション追加(バックエンド書く際に追記してもらえると助かります) */}
        </main>
    )
}
