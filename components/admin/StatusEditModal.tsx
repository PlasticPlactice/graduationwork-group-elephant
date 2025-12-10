"use client"

import { Icon } from "@iconify/react";
import AdminButton from '@/components/ui/admin-button';

interface StatusEditModalPops {
    isOpen: boolean;
    onClose: () => void;
}

export default function StatusEditModal({ isOpen, onClose }: StatusEditModalPops) {
    if (!isOpen) return null;

    // サンプルデータ10件
    const statusRecords = [
        { id: 10, title: '転生したらスライムだった件', nickname: '象花たろう' },
        { id: 11, title: '本好きの下剋上', nickname: '山田太郎' },
        { id: 12, title: '無職転生', nickname: '佐藤花子' },
        { id: 13, title: 'オーバーロード', nickname: '田中一郎' },
        { id: 14, title: 'この素晴らしい世界に祝福を!', nickname: '鈴木次郎' },
        { id: 15, title: 'Re:ゼロから始める異世界生活', nickname: '高橋三郎' },
        { id: 16, title: '幼女戦記', nickname: '伊藤四郎' },
        { id: 17, title: 'ログ・ホライズン', nickname: '渡辺五郎' },
        { id: 18, title: 'ソードアート・オンライン', nickname: '中村六郎' },
        { id: 19, title: '魔法科高校の劣等生', nickname: '小林七郎' },
    ];

    return (
        <div className="fixed inset-0 status-edit-modal bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="modal-content bg-white rounded-lg w-11/12 max-w-8xl max-h-[90vh] flex flex-col p-6"  onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-head text-center">ステータス変更</h2>
                <h3 className="modal-sub-head mt-3">ステータス変更する書評</h3>

                <div className="border p-3 overflow-auto h-64">
                    <table className="w-full status-table">
                        <thead className="table-head">
                            <tr>
                                <th>ID</th>
                                <th>書籍タイトル</th>
                                <th>ニックネーム</th>
                            </tr>
                        </thead>
                        <tbody className="border status-book-section">
                            {statusRecords.map((record) => (
                                <tr key={record.id} className="status-record text-center">
                                    <td>{record.id}</td>
                                    <td>{record.title}</td>
                                    <td>{record.nickname}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="grid grid-cols-3 items-center my-3 m-auto">
                    <p className="now-status-head ">変更前ステータス</p>
                    <p className="now-status-text font-bold py-1.5 px-7 rounded-2xl">一次通過</p>
                    <p id="dummy_text">fff</p>
                </div>
                <Icon icon='ri:arrow-up-line' rotate={2} className="mx-auto status-arrow" width={30}></Icon>
                <form action="" method="post" className="m-auto w-1/4">
                    <select className="w-full">
                        <option value="評価前">評価前</option>
                        <option value="一次通過">一次通過</option>
                        <option value="二次通過">二次通過</option>
                        <option value="三次通過">三次通過</option>
                    </select>

                    <AdminButton
                        label="変更"
                        type="submit"
                        className="w-full mt-5"
                    />
                </form>
            </div>
        </div>
    )
}
