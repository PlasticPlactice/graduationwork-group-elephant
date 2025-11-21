"use client"

import React,{useState} from "react";
import Textbox from '@/components/ui/admin-textbox';
import AdminButton from '@/components/ui/admin-button';


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
        <main style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}>
            {/*---------------------------
                検索ボックス
               ---------------------------*/}
            <div style={{ border: "1px solid #8B8B8B" ,borderRadius:"var(--control-radius)"}}
                className="mx-8 my-6     px-5 pt-3 pb-6 flex shadow-sm">
                
                <div style={{width:"40%"}}>
                    <p>タイトル</p>
                    <Textbox size="lg" className=""
                        style={{
                            height: "2.5rem",
                            width:"100%"
                    }}></Textbox>
                </div>

                <div className="ml-5" style={{width:"40%"}}>
                    <p>公開期間</p>
                    <div className="flex items-center">
                        <Textbox type="date"
                            className=""
                            style={{ height: "2.5rem" }}></Textbox>
                        <p className="px-2 justify-center items-center">ー</p>
                        <Textbox type="date"
                            className=""
                            style={{height:"2.5rem"}}></Textbox>
                    </div>
                </div>

                <AdminButton
                    label="検索" 
                    type="submit" 
                    icon="mdi:search"
                    iconPosition="left"
                    className='self-end ml-5'
                    style={{
                        height: "2.5rem",
                    }}
                />
            </div>

            <div className="mx-8 flex justify-between">
                {/*---------------------------
                お知らせ登録ボタン
               ---------------------------*/}
                <AdminButton
                    label="お知らせ登録"
                    type="button"
                    className=""
                    style={{
                        width: "20%",
                        fontSize: "var(--page-padding-lg)",
                        height:"3.5rem"
                    }}
                />
                {/*---------------------------
                ステータス変更ボタン
               ---------------------------*/}
                <div 
                    style={{
                        backgroundColor: "var(--color-input-bg)",
                        borderRadius:"var(--control-radius)"
                    }}
                    className="px-3 flex items-center justify-center">
                    {statusButtons.map((btn) => {
                        const isActive = selectedStatus === btn.id;
                        return (
                            <button
                                key={btn.id}
                                onClick={() => setSelectedStatus(btn.id)}
                                className={`mx-2 px-2 py-1 rounded transition-colors ${isActive ? "shadow-md" : ""}`}
                                style={{
                                    // 選択時は背景白・文字色付き、非選択時は背景色付き・文字白
                                    backgroundColor: isActive ? "var(--color-bg)" : "transparent",
                                    color: isActive ? "var(--color-input-bg)" : "white",
                                    border: "1px solid var(--color-bg)", // 枠線は常に白っぽくしておくか調整
                                    fontSize: "var(--page-padding-lg)",
                                }}
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
