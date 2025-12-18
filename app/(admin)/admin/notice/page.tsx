"use client"

import React, { useState } from "react";
import Textbox from '@/components/ui/admin-textbox';
import AdminButton from '@/components/ui/admin-button';
import "@/styles/admin/notice.css"; // CSSファイルをインポート
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function Page() {
    // 3. 選択状態を管理するstate (初期値は 'public')
    const [selectedStatus, setSelectedStatus] = useState<string>("public");
    const [currentPage, setCurrentPage] = useState<number>(1);

    const [selectedTab, setSelectedTab] = useState<string>("notice");
    
    // ボタンの定義
    const statusButtons = [
        { id: "all", label: "すべて" },
        { id: "draft", label: "下書き" },
        { id: "private", label: "非公開" },
        { id: "public", label: "公開中" },
    ];

    // お知らせデータ
    const noticeData = [
        { id: 1, title: "第2回文庫X開始！", content: "あの人気企画が帰ってきた！書籍タイトルを...", period: "2025-10-10 - 2026-10-10", status: "公開中" },
        { id: 2, title: "第2回文庫X開始！", content: "あの人気企画が帰ってきた！書籍タイトルを...", period: "2025-10-10 - 2026-10-10", status: "公開中" },
        { id: 3, title: "第2回文庫X開始！", content: "あの人気企画が帰ってきた！書籍タイトルを...", period: "2025-10-10 - 2026-10-10", status: "公開中" },
        { id: 4, title: "第2回文庫X開始！", content: "あの人気企画が帰ってきた！書籍タイトルを...", period: "2025-10-10 - 2026-10-10", status: "公開中" },
        { id: 5, title: "第2回文庫X開始！", content: "あの人気企画が帰ってきた！書籍タイトルを...", period: "2025-10-10 - 2026-10-10", status: "公開中" },
        { id: 6, title: "第2回文庫X開始！", content: "あの人気企画が帰ってきた！書籍タイトルを...", period: "2025-10-10 - 2026-10-10", status: "公開中" },
        { id: 7, title: "第2回文庫X開始！", content: "あの人気企画が帰ってきた！書籍タイトルを...", period: "2025-10-10 - 2026-10-10", status: "公開中" },
    ];
    
    return (
        <main className="notice-container">
            {/*---------------------------
            お知らせ登録ボタン
            ---------------------------*/}
            <AdminButton
                label="お知らせ登録"
                type="button"
                className="register-btn ml-8 mt-5"
            />
            {/*---------------------------
                検索ボックス
               ---------------------------*/}
            <details className="px-5 pt-3 pb-3 mx-8 my-6 search-accordion"> 
                <summary className='flex items-center justify-between'>
                    <p>検索ボックス</p>
                    <Icon icon="ep:arrow-up" rotate={2} width={20} className='icon'></Icon>
                </summary>
                <section>
                    <div className="input-group">
                        <p>タイトル</p>
                        <Textbox 
                            size="lg" 
                            className="custom-input-full"
                        />
                    </div>

                    <div className=" input-group">
                        <p>公開期間</p>
                        <div className="flex justify-between items-center">
                            <Textbox 
                                type="date"
                                className="custom-input"
                            />
                            <p className="items-center justify-center px-2">ー</p>
                            <Textbox 
                                type="date"
                                className="custom-input"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <AdminButton
                            label="検索" 
                            type="submit" 
                            icon="mdi:search"
                            iconPosition="left"
                            className='search-btn mt-5'
                            />
                    </div>
                </section>
            </details>


            <div>
                {/*---------------------------
                お知らせ・寄贈タブ
               ---------------------------*/}
                <div className="flex mx-8 mt-8 border-b tab">
                    <button 
                        onClick={() => setSelectedTab("notice")}
                        className={`pb-3 mr-7 text-h1 notice-tab-link ${selectedTab === "notice" ? "active" : ""}`}
                    >
                    お知らせ
                    </button>
                    <button 
                        onClick={() => setSelectedTab("donation")}
                        className={`pb-3 notice-tab-link ${selectedTab === "donation" ? "active" : ""}`}
                    >
                     寄贈
                    </button>
                </div>
                <div className="flex justify-end mx-8">
                {/*---------------------------
                ステータス変更ボタン
               ---------------------------*/}
                <div className="flex items-center justify-center px-3 status-wrapper py-1 mt-5">
                    {statusButtons.map((btn) => {
                        const isActive = selectedStatus === btn.id;
                        return (
                            <button
                                key={btn.id}
                                onClick={() => setSelectedStatus(btn.id)}
                                // 条件付きクラスでスタイルを切り替え
                                className={`mx-2 px-2 py-1 rounded status-toggle ${isActive ? "active" : ""}`}
                            >
                                {btn.label}
                            </button>
                        );
                    })}
                </div>
            </div>
            </div>

            <div className="mx-8 mt-5">
                <table className="w-full notice-table">
                    <thead className="table-head">
                        <tr>
                            <th className="py-2 pl-6 ">
                                <div className="flex items-center">
                                    ステータス<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                            <th className="w-2/7">
                                <div className="flex items-center">
                                    タイトル<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                            <th className="w-2/7">
                                <div className="flex items-center">
                                    詳細<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                            <th className="w-1/4">
                                <div className="flex items-center">
                                    公開期間<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="border">
                        {noticeData.map((notice) => (
                            <tr key={notice.id} className="notice-record">
                                <td>
                                    <div className="w-fit">
                                        <p className="ml-5 py-1 mr-24 px-9 status">{notice.status}</p>
                                    </div>
                                </td>
                                <td className="py-2 font-bold w-2/7">{notice.title}</td>
                                <td className="notice-content w-2/7">{notice.content}</td>
                                <td>
                                    <div className="flex items-center">
                                        <p className="px-9">{notice.period}</p>
                                        <Icon icon="weui:arrow-filled" width={15}></Icon>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-center my-5 page-section">
                <Icon icon="weui:arrow-filled" rotate={2} width={20} className="page-arrow"></Icon>
               <button
                    type="button"
                    className={`px-4 py-1 page-number ${currentPage === 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(1)}
                    aria-current={currentPage === 1 ? "page" : undefined}
                >1</button>
                <button
                    type="button"
                    className={`px-4 py-1 page-number ${currentPage === 2 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(2)}
                    aria-current={currentPage === 2 ? "page" : undefined}
                >2</button>
                <button
                    type="button"
                    className={`px-4 py-1 page-number ${currentPage === 3 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(3)}
                    aria-current={currentPage === 3 ? "page" : undefined}
                >3</button>
                <span className="px-4 py-1 page-number" aria-hidden="true">...</span>
                <button
                    type="button"
                    className={`px-4 py-1 page-number ${currentPage === 5 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(5)}
                    aria-current={currentPage === 5 ? "page" : undefined}
                >5</button>
                <Icon icon="weui:arrow-filled" width={20} className="page-arrow"></Icon>
            </div>
        </main>
    );
}
