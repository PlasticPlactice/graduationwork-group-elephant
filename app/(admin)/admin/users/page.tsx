"use client"
import React, { useState,useEffect } from "react";
import Textbox from '@/components/ui/admin-textbox';
import AdminButton from '@/components/ui/admin-button';
import "@/styles/admin/users.css";
import { Icon } from '@iconify/react';
import UserDetailModal from "@/components/admin/UserDetailModal";
import UserExitModal from '@/components/admin/UserExitModal'

export default function Page() {
    const [isUserExitModalOpen, setIsUserExitModalOpen] = useState(false);
    const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState<number>(1);

    // 検索フォームのstate
    const [searchForm, setSearchForm] = useState({
        id: '',
        nickname: '',
        ageFrom: '',
        ageTo: '',
        prefecture: '',
        city: '',
        status: ''
    });

    // ステータスに応じたクラス名を取得（コンポーネントレベルに移動）
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

    // 入力値の変更を処理
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSearchForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 検索実行
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('検索条件:', searchForm);
        // ここに検索ロジックを実装
    };
    

    // お知らせデータ
    const dummyusersData = [
        { id: 1, nickname: "象花たろう", status: "利用中", age: "20代", address: "東京都",review:5 },
        { id: 2, nickname: "象花ジロー", status: "退会済み", age: "20代", address: "岩手県盛岡市",review:5 },
        { id: 3, nickname: "ヤング綿あめ太郎", status: "利用中", age: "30代", address: "岩手県二戸市",review:10 },
        { id: 4, nickname: "カバ鹿", status: "BAN", age: "30代", address: "神奈川県",review:1 },
        { id: 5, nickname: "kuuma", status: "利用中", age: "30代", address: "鳥取県",review:0 },
        { id: 6, nickname: "hatena", status: "利用中", age: "30代", address: "岩手県盛岡市",review:0 },
        { id: 7, nickname: "mark", status: "利用中", age: "50代", address: "岩手県紫波町",review:15 },
    ];


    // モーダルが開いている時に背景のスクロールを防ぐ
    useEffect(() => {
        if (isUserDetailModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        // クリーンアップ関数
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isUserDetailModalOpen]);

    const handleUserDetail = () => {
        setIsUserDetailModalOpen(true);
    };

    const handleUserExit = () => {
        setIsUserExitModalOpen(true);
    };

    const closeModal = () => {
        setIsUserDetailModalOpen(false);
        setIsUserExitModalOpen(false);
    }
    return (
        <main className="users-container">
            {/*---------------------------
                検索ボックス
            ---------------------------*/}
            <details className="px-5 pt-3 pb-6 mx-8 my-6 shadow-sm search-area">
                <summary className='flex items-center justify-between w-full'>
                    検索ボックス
                    <Icon icon="ep:arrow-up" rotate={2} width={20} className='icon'></Icon>
                </summary>
                <form onSubmit={handleSearch}>
                    <div className='flex items-center w-full justify-between gap-6'>
                        <div className="flex flex-col items-start search-field">
                            <label htmlFor="user-id">ID</label>
                            <Textbox
                                id="user-id"
                                name="id"
                                value={searchForm.id}
                                onChange={handleInputChange}
                                size="lg"
                                className='custom-input w-full'
                            />
                        </div>
                        <div className="flex flex-col items-start search-field">
                            <label htmlFor="user-nickname">ニックネーム</label>
                            <Textbox
                                id="user-nickname"
                                name="nickname"
                                value={searchForm.nickname}
                                onChange={handleInputChange}
                                size="lg"
                                className='custom-input w-full'
                            />
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <label htmlFor="age">年代</label>
                            <div className='flex justify-center items-center'>
                                <select name="ageFrom" id="age" className="mr-2">
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="30">30</option>
                                    <option value="40">40</option>
                                    <option value="50">50</option>
                                    <option value="60">60</option>
                                    <option value="70">70</option>
                                    <option value="80">80</option>
                                    <option value="90">90</option>
                                    <option value="100">100</option>
                                </select>
                                <p>&minus;</p>
                                <select name="ageTo" id="age-to" className="mx-2">
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="30">30</option>
                                    <option value="40">40</option>
                                    <option value="50">50</option>
                                    <option value="60">60</option>
                                    <option value="70">70</option>
                                    <option value="80">80</option>
                                    <option value="90">90</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="prefecture">居住地</label>
                            <div className='flex'>
                                <select
                                    name="prefecture"
                                    value={searchForm.prefecture}
                                    onChange={handleInputChange}
                                    className='mr-3'
                                    id="prefecture"
                                    >
                                    <option value="">都道府県</option>
                                    <option value="北海道">北海道</option>
                                    <option value="青森県">青森県</option>
                                    <option value="岩手県">岩手県</option>
                                    <option value="宮城県">宮城県</option>
                                    <option value="秋田県">秋田県</option>
                                    <option value="山形県">山形県</option>
                                    <option value="福島県">福島県</option>
                                    <option value="茨城県">茨城県</option>
                                    <option value="栃木県">栃木県</option>
                                    <option value="群馬県">群馬県</option>
                                    <option value="埼玉県">埼玉県</option>
                                    <option value="千葉県">千葉県</option>
                                    <option value="東京都">東京都</option>
                                    <option value="神奈川県">神奈川県</option>
                                    <option value="新潟県">新潟県</option>
                                    <option value="富山県">富山県</option>
                                    <option value="石川県">石川県</option>
                                    <option value="福井県">福井県</option>
                                    <option value="山梨県">山梨県</option>
                                    <option value="長野県">長野県</option>
                                    <option value="岐阜県">岐阜県</option>
                                    <option value="静岡県">静岡県</option>
                                    <option value="愛知県">愛知県</option>
                                    <option value="三重県">三重県</option>
                                    <option value="滋賀県">滋賀県</option>
                                    <option value="京都府">京都府</option>
                                    <option value="大阪府">大阪府</option>
                                    <option value="兵庫県">兵庫県</option>
                                    <option value="奈良県">奈良県</option>
                                    <option value="和歌山県">和歌山県</option>
                                    <option value="鳥取県">鳥取県</option>
                                    <option value="島根県">島根県</option>
                                    <option value="岡山県">岡山県</option>
                                    <option value="広島県">広島県</option>
                                    <option value="山口県">山口県</option>
                                    <option value="徳島県">徳島県</option>
                                    <option value="香川県">香川県</option>
                                    <option value="愛媛県">愛媛県</option>
                                    <option value="高知県">高知県</option>
                                    <option value="福岡県">福岡県</option>
                                    <option value="佐賀県">佐賀県</option>
                                    <option value="長崎県">長崎県</option>
                                    <option value="熊本県">熊本県</option>
                                    <option value="大分県">大分県</option>
                                    <option value="宮崎県">宮崎県</option>
                                    <option value="鹿児島県">鹿児島県</option>
                                    <option value="沖縄県">沖縄県</option>
                                </select>
                                <Textbox
                                    name="city"
                                    value={searchForm.city}
                                    onChange={handleInputChange}
                                    className='city-input mr-6'
                                    placeholder='市町村' />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="status" className="block">アカウントの状態</label>
                            <select
                                name="status"
                                value={searchForm.status}
                                onChange={handleInputChange}
                                className='account-input'
                                id="status">
                                <option value="">すべて</option>
                                <option value="利用中">利用中</option>
                                <option value="退会済み">退会済み</option>
                                <option value="BAN">BAN</option>
                            </select>
                        </div>
                    </div>
                    <div className='flex justify-center mt-4'>
                        <AdminButton
                            label="検索" 
                            type="submit" 
                            icon="mdi:search"
                            iconPosition="left"
                            className='search-btn'
                        />
                    </div>
                </form>
            </details>

            {/*---------------------------
                ユーザー一覧
            ---------------------------*/}
            <div className='mx-8 mt-8'>
                <table className="w-full user-table">
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
                            <th className='py-2 pl-10 w-[15%]'>
                                <div className="flex items-center">
                                    ステータス<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                            <th>
                                <div className="flex items-center">
                                    ID<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                            <th>
                                <div className="flex items-center">
                                    ニックネーム<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                            <th>
                                <div className="flex items-center">
                                    年代<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                            <th>
                                <div className="flex items-center">
                                    居住地<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                            <th>
                                <div className="flex items-center">
                                    投稿数<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="border">
                        {dummyusersData.map((users) => {
                            return (
                                <tr key={users.id} className="users-record" onClick={handleUserDetail}>
                                    <td className='py-2 pl-10'><span className={`status-badge ${getStatusClass(users.status)}`}>{users.status}</span></td>
                                    <td className="">{users.id}</td>
                                    <td className="">{users.nickname}</td>
                                    <td className="">{users.age}</td>
                                    <td className="">{users.address}</td>
                                    <td className=''>{users.review}</td>
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

            {/* モーダル */}
            <UserDetailModal isOpen={isUserDetailModalOpen} onClose={closeModal}/>
        </main>
    );
}
