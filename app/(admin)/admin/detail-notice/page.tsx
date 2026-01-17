"use client";
import "@/styles/admin/detail-notice.css"
import "@/styles/admin/notice-upload.css"
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import NoticeDisableModal from "@/components/admin/NoticeDisableModal";

export default function Page() 
{
    const router = useRouter();
    const handleEdit = () => {
        router.push('/admin/edit-notice')
    }
    // モーダル制御
    const [modalIndex, setModalIndex] = useState<number | null>(null);
    const [isNoticeDisableModalOpen, setIsNoticeDisableModalOpen] = useState(false);
    const openPreview = (index: number) => setModalIndex(index);
    const closeModal = () => setModalIndex(null);

    // Esc で閉じる
    useEffect(() => {
    if (modalIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    }, [modalIndex]);

    const handleNoticeDisable = () => {
        setIsNoticeDisableModalOpen(true)
    }
    const closeNoticeDisableModal = () => {
        setIsNoticeDisableModalOpen(false)
    }
    
    return (
        <main className="p-6">
            <section className="thumbnail-container h-50">
                <img src="/admin/JYUN923_4_TP_V4.jpg" alt="サムネイル" className='thumbnail-preview w-full'/>
            </section>
            <h1 className='notice-title font-bold'>第2回文庫X開始!!</h1>
            <div className='flex items-center'>
                <div className='date-range flex mr-3'>
                    <p>2025-10-10</p>
                    <p>&minus;</p>
                    <p>2026-10-10</p>
                </div>
                <p className='status font-bold mx-2 px-4 py-1'>公開中</p>
            </div>
            <p className='my-4'>
                エクスアーマータイプ：モノケロス。リバティー・アライアンスの紋章に描かれたモノケロスを外観モチーフに取り入れた最新型のアーマータイプである。
                ポーンA1などの生命保護機能を重要視した汎用アーマータイプと異なり、より攻撃的な目的をもって開発された経緯を持つ。
                また使用者の能力・適正に依存する部分が多く、白堊理研の人体強化計画によって生み出された強化兵士を素体として装着することを前提としている。
                リバティー・アライアンスにとって脅威となる「ゾアントロプス・レーヴェ」「パラポーン・エクスパンダー」といった強力な個体に対抗するべく、素体となる強化兵士は全身の知覚、筋力を強制的に向上させられている。
                彼らは 機械部品に頼らない生物としての強化を施され、ヒトという種の枠の中で生きながらに最大限の戦闘能力を獲得したが、代償としてすべての個体が人格面に何らかの障害を抱えている。
                実戦では一体がモノケロスを纏って対エクスパンダーに投入された記録があり、短時間ではあるが互角以上の戦闘能力を発揮したこの個体には「白麟角」と呼ばれる特別な呼称が与えられた。
            </p>

            <p className='img-file'>添付画像・ファイル</p>
            <div className="relative overflow-hidden upload-preview">
                {/* todo:画像かその他ファイルかによって変える必要がある */}
                <img src="/admin/JYUN923_4_TP_V4.jpg"  onClick={() => openPreview(0)} alt="添付画像" className='img-border w-full h-full object-cover h-20 flex items-center justify-center text-sm text-black'/>
            </div>

            <div className="btn-group flex items-center">
                <button className="not-public-btn" onClick={handleNoticeDisable}>非公開にする</button>
                <div className="ml-auto flex gap-2">
                    <button className="close-btn">閉じる</button>
                    <button onClick={handleEdit} className="edit-btn">編集する</button>
                </div>
            </div>

            {/* プレビューモーダル */}
      {modalIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 preview-modal" onClick={closeModal}>
          <div className="bg-white rounded p-4 max-w-[100%] max-h-[100%] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-lg font-medium">プレビュー</h3>
              <button type="button" onClick={closeModal} className="close-btn">&times;</button>
            </div>
            <div className="mt-4">
                <img src="/admin/JYUN923_4_TP_V4.jpg" alt="添付画像" className="max-w-full max-h-[80vh] object-contain" />
            </div>
          </div>
        </div>
            )}
        {/* モーダル */}
        <NoticeDisableModal isOpen={isNoticeDisableModalOpen} onClose={closeNoticeDisableModal} />
        </main>
    )
};
