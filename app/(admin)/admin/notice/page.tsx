"use client"

import React, { useState } from "react";
import Textbox from '@/components/ui/admin-textbox';
import AdminButton from '@/components/ui/admin-button';
import "./style.css"; // CSSファイルをインポート
import { Icon } from "@iconify/react";

export default function Page() {
    // 3. 選択状態を管理するstate (初期値は 'public')
    const [selectedStatus, setSelectedStatus] = useState<string>("public");

    // ボタンの定義
    const statusButtons = [
        { id: "draft", label: "下書き" },
        { id: "private", label: "非公開" },
        { id: "public", label: "公開中" },
    ];
    
    return (
        <main className="notice-container">
            {/*---------------------------
                検索ボックス
               ---------------------------*/}
            <div className="flex px-5 pt-3 pb-6 mx-8 my-6 shadow-sm search-area">
                
                <div className="input-group">
                    <p>タイトル</p>
                    <Textbox 
                        size="lg" 
                        className="custom-input-full"
                    />
                </div>

                <div className="ml-5 input-group">
                    <p>公開期間</p>
                    <div className="flex items-center">
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

                <AdminButton
                    label="検索" 
                    type="submit" 
                    icon="mdi:search"
                    iconPosition="left"
                    className='self-end ml-5 search-btn'
                />
            </div>

            <div className="flex justify-between mx-8">
                {/*---------------------------
                お知らせ登録ボタン
               ---------------------------*/}
                <AdminButton
                    label="お知らせ登録"
                    type="button"
                    className="register-btn"
                />
                {/*---------------------------
                ステータス変更ボタン
               ---------------------------*/}
                <div className="flex items-center justify-center px-3 status-wrapper">
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

            <div>
                {/*---------------------------
                お知らせ・寄贈タブ
               ---------------------------*/}
                <div className="flex mx-8 mt-8 border-b tab">
                    <p className="pb-3 border-b-2 notice-tab mr-7 text-h1">お知らせ</p>
                    <p className="">寄贈</p>
                </div>
            </div>

            <div className="mx-8 mt-8">
                <table className="w-full">
                    <thead className="table-head">
                        <tr className="flex mx-6 my-2">
                            <th className="flex items-center w-2/7">タイトル<Icon icon="uil:arrow" rotate={1}></Icon></th>
                            <th className="flex items-center w-2/7">詳細<Icon icon="uil:arrow" rotate={1}></Icon></th>
                            <th className="flex items-center w-1/4">公開期間<Icon icon="uil:arrow" rotate={1}></Icon></th>
                            <th className="flex items-center">ステータス<Icon icon="uil:arrow" rotate={1}></Icon></th>
                        </tr>
                    </thead>
                    <tbody className="border">
                        <tr className="flex mx-6 my-2">
                            <td className="flex w-2/7">第2回文庫X開始！</td>
                            <td className="flex w-2/7">あの人気企画が帰ってきた！書籍タイトルを...</td>
                            <td className="flex w-1/4">2025-10-10 - 2026-10-10</td>
                            <td className="flex items-center">公開中<Icon icon="weui:arrow-filled"></Icon></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    );
}
