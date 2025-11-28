"use client"
import React, { useState } from "react";
import Textbox from '@/components/ui/admin-textbox';
import AdminButton from '@/components/ui/admin-button';
import "@/styles/admin/users.css";
import { Icon } from '@iconify/react';

export default function Page() {
    const [currentPage, setCurrentPage] = useState<number>(1);
    

    // お知らせデータ
    const usersData = [
        { id: 1, nickname: "象花たろう", status: "利用中", age: "20代", address: "東京都",review:5 },
        { id: 2, nickname: "象花ジロー", status: "退会済み", age: "20代", address: "岩手県盛岡市",review:5 },
        { id: 3, nickname: "ヤング綿あめ太郎", status: "利用中", age: "30代", address: "岩手県二戸市",review:10 },
        { id: 4, nickname: "カバ鹿", status: "BAN", age: "30代", address: "神奈川県",review:1 },
        { id: 5, nickname: "kuuma", status: "利用中", age: "30代", address: "鳥取県",review:0 },
        { id: 6, nickname: "hatena", status: "利用中", age: "30代", address: "岩手県盛岡市",review:0 },
        { id: 7, nickname: "mark", status: "利用中", age: "50代", address: "岩手県紫波町",review:15 },
    ];

    return (
        <main className="notice-container">
            {/*---------------------------
                検索ボックス
            ---------------------------*/}
            <div className="px-5 pt-3 pb-6 mx-8 my-6 shadow-sm search-area">
                <div className='flex justify-center items-center'>
                    <div>
                        <p>ID</p>
                        <Textbox size="lg" className='custom-input mr-3'></Textbox>
                    </div>
                    <div>
                        <p>ニックネーム</p>
                        <Textbox size="lg" className='custom-input mr-3'></Textbox>
                    </div>
                    <div>
                        <p>年代</p>
                        <div className='flex justify-center items-center'>
                            <Textbox type='number' size="lg" className='custom-input age-input mr-2'></Textbox>
                            <p>&minus;</p>
                            <Textbox type='number' size="lg" className='custom-input age-input mx-2'></Textbox>
                        </div>
                    </div>
                    <div>
                        <p>居住地</p>
                        <div className='flex'>
                            <select className='mr-3'>
                                <option value="">都道府県</option>
                            </select>
                            <Textbox className='city-input mr-6' placeholder='市町村'></Textbox>
                        </div>
                    </div>
                    <div>
                        <p>アカウントの状態</p>
                        <select className='account-input'>
                            <option value=""></option>
                        </select>
                    </div>
                </div>
                <div className='flex justify-end mt-4 mr-2'>
                    <AdminButton
                        label="検索" 
                        type="submit" 
                        icon="mdi:search"
                        iconPosition="left"
                        className='search-btn'
                    />
                </div>
            </div>

            {/*---------------------------
                ユーザー一覧
            ---------------------------*/}
            <div className='mx-8 mt-8'>
                <table className="w-full notice-table">
                    <colgroup>
                        <col className='w-1'/>
                        <col className='w-10' />
                        <col className='w-10' />
                        <col className='w-10' />
                        <col className='w-10' />
                        <col className='w-10' />
                    </colgroup>
                    <thead className="table-head">
                        <tr>
                            <th className='py-2'>
                                <div className="flex items-center justify-center">
                                    ID<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                            <th className=''>
                                <div className="flex items-center justify-center">
                                    ニックネーム<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                            <th className=''>
                                <div className="flex items-center justify-center">
                                    ステータス<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                            <th className=''>
                                <div className="flex items-center justify-center">
                                    年代<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                            <th className=''>
                                <div className="flex items-center justify-center">
                                    居住地<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                            <th className=''>
                                <div className="flex items-center justify-center">
                                    投票数<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="border">
                        {usersData.map((users) => {
                            // ステータスに応じたクラス名を取得
                            const getStatusClass = (status: string) => {
                                switch(status) {
                                    case "利用中":
                                        return "active";
                                    case "退会済み":
                                        return "disable";
                                    case "BAN":
                                        return "ban";
                                    default:
                                        return "";
                                }
                            };

                            return (
                                <tr key={users.id} className="users-record">
                                    <td className="py-2 text-center">{users.id}</td>
                                    <td className="text-center">{users.nickname}</td>
                                    <td className='text-center'><span className={`status-badge px-4 py-1 ${getStatusClass(users.status)}`}>{users.status}</span></td>
                                    <td className="text-center">{users.age}</td>
                                    <td className="text-center">{users.address}</td>
                                    <td className='text-center'>{users.review}</td>
                                </tr>
                            );
                        })}
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
