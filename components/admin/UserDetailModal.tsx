"use client"
import React, { useState } from 'react';
import "@/styles/admin/users.css"
import { Icon } from "@iconify/react";
import AdminButton from '@/components/ui/admin-button';

interface UserDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenUserExit?: () => void;
}

export default function UserDetailModal({ isOpen, onClose, onOpenUserExit }: UserDetailModalProps) {
    const [openRows, setOpenRows] = useState<number[]>([]);
    const [displayCount, setDisplayCount] = useState<number | "all">(2);

    const toggleRow = (id: number) => {
        setOpenRows(prev =>
            prev.includes(id)
                ? prev.filter(rowId => rowId !== id)
                : [...prev, id]
        );
    };
    // サンプルデータ
    const tableData = [
        { id: 10, title: '転生したらスライムだった件', eventname: '第1回文庫X', status: '一次通過' },
        { id: 11, title: '本好きの下剋上', eventname: '第1回文庫X', status: '一次通過' },
        { id: 12, title: '無職転生', eventname: '第1回文庫X', status: '一次通過' },
        { id: 13, title: 'オーバーロード', eventname: '第1回文庫X', status: '一次通過' },
        { id: 14, title: 'この素晴らしい世界に祝福を!', eventname: '第1回文庫X', status: '一次通過' },
        { id: 15, title: 'Re:ゼロから始める異世界生活', eventname: '第1回文庫X', status: '一次通過' },
        { id: 16, title: '幼女戦記', eventname: '第1回文庫X', status: '一次通過' },
    ];
    // 表示するデータをスライス
    const displayedData = displayCount === "all"
        ? tableData
        : tableData.slice(0, displayCount);
    
    const handleUserExit = () => {
        // 詳細モーダルを閉じ、親に退会モーダルを開くよう通知
        onClose();
        onOpenUserExit?.();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 user-detail-modal bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="modal-content bg-white rounded-lg w-11/12 max-w-8xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">ユーザー詳細</h2>
                    <button onClick={onClose} className="close-btn text-black" aria-label='閉じる'>
                        <Icon icon="mdi:close" width={24} className='text-black' />
                    </button>
                </div>
                <div className="user-data-title grid grid-cols-5 px-6 text-center">
                    <p>書評ID</p>
                    <p>ニックネーム</p>
                    <p>ステータス</p>
                    <p>年代</p>
                    <p>居住地</p>
                </div>
                <div className="text-2xl grid grid-cols-5 px-6 text-center font-bold">
                    <p>000000</p>
                    <p>象花たろう</p>
                    <p><span className="status">利用中</span></p>
                    <p>20代</p>
                    <p>岩手県盛岡市</p>
                </div>

                <div className='mx-8 mt-8 overflow-y-auto'>
                    <table className="w-full event-table">
                        <thead className='table-head'>
                            <tr>
                                <th className='w-1/5'>
                                    <div className='flex items-center ml-3'>
                                        ステータス<Icon icon='uil:arrow' rotate={1}></Icon>
                                    </div>
                                </th>
                                <th className='w-1/10'>
                                    <div className='flex items-center justify-start'>
                                        ID<Icon icon='uil:arrow' rotate={1}></Icon>
                                    </div>
                                </th>
                                <th className='w-2/5'>
                                    <div className='flex items-center'>
                                        書籍タイトル<Icon icon='uil:arrow' rotate={1}></Icon>
                                    </div>
                                </th>
                                <th className='w-1/5'>
                                    <div className='flex items-center'>
                                        イベント名<Icon icon='uil:arrow' rotate={1}></Icon>
                                    </div>
                                </th>
                                <th>
                                    {/* <Icon icon='fe:arrow-up'></Icon> */}
                                </th>
                            </tr>
                        </thead>
                        {/* アコーディオン */}
                        <tbody className='border'>
                            {displayedData.map((row) => (
                                <React.Fragment key={row.id}>
                                    <tr className='table-row'>
                                        <td className='text-left'>
                                            <span className='status-text font-bold py-1 px-6 ml-3'>{row.status}</span>
                                        </td>
                                        <td className='text-left'>
                                            <span>{row.id}</span>
                                        </td>
                                        <td>
                                            <span className='title-text'>{row.title}</span>
                                        </td>
                                        <td>
                                            <span>{row.eventname}</span>
                                        </td>
                                        <td className="text-right align-middle pr-3">
                                            <button
                                                onClick={() => toggleRow(row.id)}
                                                className='accordion-toggle'
                                            >
                                                <Icon
                                                    icon='fe:arrow-up'
                                                    rotate={2}
                                                    className={`icon transition-transform ${openRows.includes(row.id) ? 'rotate-180' : 'rotate-0'}`} />
                                            </button>
                                        </td>
                                    </tr>
                                    {openRows.includes(row.id) && (
                                        <tr key={`${row.id}-details`} className='details-row'>
                                            <td colSpan={5} className='details-content'>
                                                <div className='p-4 flex'>
                                                    <section className='w-[57.142%]'>
                                                        <h3 className='font-bold mb-2 ml-4'>書評本文</h3>
                                                        <div className='book-review-section w-auto h-84 ml-4 p-2'>
                                                            <p>１ヶ月前、私は会社の先輩の冴子さえこさんと付き合うことになった。
                                                                前からずっと気になっていた先輩に断れるのを覚悟で呑みに誘った。
                                                                「美味しいお酒が呑めるなら一緒に呑んでもいいけど」
                                                                普段あまり笑顔を見せない冴子さんが少し楽しそうに笑みを浮かべているのを見て、私は内心ガッツポーズをした。
                                                                大分酔いが回って来た頃、私は思いきって冴子さんに
                                                                「彼氏さんどんな人なんですか？」と探りを入れた。
                                                                社内でも美人で仕事もできる冴子さんがモテないわけがないのだけど、人づてにフリーらしいと聞いて本当かどうか確かめたかった。「今は一人」「へぇ～意外ですね。私が男なら冴子さんみたいな素敵な人、絶対落としに行きますよ！」「藍田あいだは男じゃないから落としには来ないってこと？」全くもって予想外の返答に私は持っていたグラスを落としそうになった。「…女が落としに行っても冴子さんは落ちてくれるんですか？」平然を装いながら、でも内心では耳元にも聞こえるくらいに心臓がドキドキしていた。「男とか女とかそんな些末なこと、どうでもいいでしょ」当たり前のことを聞くなと言わんばかりの態度に私は思いきって
                                                                エクスアーマータイプ：モノケロス。リバティー・アライアンスの紋章に描かれたモノケロスを外観モチーフに取り入れた最新型のアーマータイプである。ポーンA1などの生命保護機能を重要視した汎用アーマータイプと異なり、より攻撃的な目的をもって開発された経緯を持つ。また使用者の能力・適正に依存する部分が多く、白堊理研の人体強化計画によって生み出された強化兵士を素体として装着することを前提としている。
                                                                リバティー・アライアンスにとって脅威となる「ゾアントロプス・レーヴェ」「パラポーン・エクスパンダー」といった強力な個体に対抗するべく、素体となる強化兵士は全身の知覚、筋力を強制的に向上させられている。彼らは 機械部品に頼らない生物としての強化を施され、ヒトという種の枠の中で生きながらに最大限の戦闘能力を獲得したが、代償としてすべての個体が人格面に何らかの障害を抱えている。実戦では一体がモノケロスを纏って対エクスパンダーに投入された記録があり、短時間ではあるが互角以上の戦闘能力を発揮したこの個体には「白麟角」と呼ばれる特別な呼称が与えられた。
                                                            </p>
                                                        </div>
                                                    </section>
    
                                                    <section className='ml-10 w-[42.857%]'>
                                                        <h3 className='font-bold mb-2'>書籍情報</h3>
                                                        <div>
                                                            <div className='book-data'>
                                                                <h4 className='book-head'>タイトル</h4>
                                                                <p className='book-content'>転生したらスライムだった件</p>
                                                            </div>
    
                                                            <div className='book-data'>
                                                                <h4 className='book-head'>著者</h4>
                                                                <p className='book-content'>伏瀬</p>
                                                            </div>
    
                                                            <div className='book-data'>
                                                                <h4 className='book-head'>出版社</h4>
                                                                <p className='book-content'>マイクロマガジン社</p>
                                                            </div>
    
                                                            <div className='book-data'>
                                                                <h4 className='book-head'>ISBN</h4>
                                                                <p className='book-content'>978-4-89637-459-9(一巻)</p>
                                                            </div>
                                                        </div>
                                                    </section>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                    <div className="text-center p-4">
                        <button
                            onClick={() => setDisplayCount(prev => prev === "all" ? 2 : "all")}
                            className="data-row-link"
                        >
                            {displayCount === "all" ? "表示を戻す" : "さらに表示"}
                        </button>
                    </div>
                </div>
                <div className="py-5 mx-8 flex justify-end">
                    <AdminButton
                        label="退会"
                        className="exit-btn"
                        onClick={handleUserExit}
                    />
                </div>
            </div>
        </div>
        )
    };
