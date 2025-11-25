import type { Metadata } from "next";

import { Icon } from '@iconify/react';
import './style.css';

export const metadata: Metadata = {
  title: "ホーム",
};

export default function Page() {
    return (
        <main className="home-main">

            <div className='mt-10'>
                <h1 className='text-center event-title'>開催中のイベント</h1>
                <div className='text-center py-2 w-3/5 m-auto event-container'>
                    <p className='font-bold underline event-name'>第1回文庫X</p>
                    <p className='font-extrabold w-max m-auto px-7 py-0.5 rounded-2xl event-status'>二次審査中</p>
                    <p className="event-date">2024年10月30日～2025年10月30日</p>
                </div>
            </div>

            <div className='grid grid-cols-2 grid-rows-2 w-max m-auto gap-x-14 gap-y-10 mt-18'>
                {/* お知らせ・寄贈管理 */}
                <div className='flex w-max p-2 shadow-md admin-card'>
                    <div className='w-auto mx-1 flex justify-center items-center'>
                        <Icon icon="mdi:megaphone" width="50" height="50"
                            className='rounded-full admin-icon' />
                    </div>
                    <div>
                        <h2 className='text-center mb-1 card-title'>お知らせ・寄贈管理</h2>
                        <p className='mb-1 card-description'>お知らせの一覧・投稿・編集</p>
                    </div>
                </div>

                {/* イベント管理 */}
                <div className='flex w-max py-2 pl-2 shadow-md admin-card'>
                    <div className='w-auto mx-1 flex justify-center items-center'>
                        <Icon icon="mdi:calendar" width="50" height="50"
                            className='rounded-full p-1 admin-icon' />
                    </div>
                    <div className='ml-4 mr-16'>
                        <h2 className='text-center mb-1 card-title'>イベント管理</h2>
                        <p className='mb-1 card-description'>イベントの作成・編集</p>
                    </div>
                </div>

                {/* ユーザー管理 */}
                <div className='flex w-max py-2 pl-2 pr-5 shadow-md admin-card'>
                    <div className='w-auto mx-1 flex justify-center items-center'>
                        <Icon icon="mdi:people" width="50" height="50"
                            className='rounded-full p-1 admin-icon' />
                    </div>
                    <div className='ml-4 mr-7'>
                        <h2 className='text-center mb-1 card-title'>ユーザー管理</h2>
                        <p className='mb-1 card-description'>ユーザー情報閲覧・書評閲覧</p>
                    </div>
                </div>

                {/* パスワード変更 */}
                <div className='flex w-max py-2 pl-2 pr-5 shadow-md admin-card'>
                    <div className='w-auto mx-1 flex justify-center items-center'>
                        <Icon icon="material-symbols:key" width="50" height="50"
                            className='rounded-full p-1 admin-icon' />
                    </div>
                    <div className='ml-4 mr-4'>
                        <h2 className='text-center mb-1 card-title'>パスワード変更</h2>
                        <p className='mb-1 card-description'>パスワードを変更</p>
                    </div>
                </div>
            </div>
        </main>
        );
}
