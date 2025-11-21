"use client"

import React, { useState } from "react";
import Textbox from '@/components/ui/admin-textbox';
import AdminButton from '@/components/ui/admin-button';
import "./style.css"; // CSSファイルをインポート

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
            <div className="mx-8 my-6 px-5 pt-3 pb-6 flex shadow-sm search-area">
                
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
                        <p className="px-2 justify-center items-center">ー</p>
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

            <div className="mx-8 flex justify-between">
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
                <div className="px-3 flex items-center justify-center status-wrapper">
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
        </main>
    );
}
