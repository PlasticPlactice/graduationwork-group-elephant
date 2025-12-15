"use client"
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Icon } from '@iconify/react';
import '@/styles/admin/home.css';
import Link from "next/link";


export default function Page() {
    const router = useRouter();

    // ページタイトルを設定
    useEffect(() => {
        document.title = "ホーム - 管理者";
    }, []);

    const handledetail = () => {
        router.push('/admin/events')
    }
    return (
        <main className="home-main">

            <div className='mt-10'>
                <h1 className='text-center event-title'>開催中のイベント</h1>
                <div className='w-3/5 py-2 m-auto text-center event-container'>
                    <p className='font-bold event-name'>第1回文庫X</p>
                    <p className='font-extrabold w-max m-auto px-7 py-0.5 rounded-2xl event-status'>一次審査中</p>

                    <div className='flex justify-between w-2/3 m-auto'>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='m-auto text-white'></Icon></p>
                        <p className='w-10'><Icon icon="bxs:up-arrow" rotate={2} className='up-arrow m-auto'></Icon></p>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='m-auto text-white'></Icon></p>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='m-auto text-white'></Icon></p>
                    </div>
                    <div className='flex justify-between w-2/3 m-auto'>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='event-condition-circle-now'></Icon></p>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='event-condition-circle-now'></Icon></p>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='event-condition-circle-future'></Icon></p>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='event-condition-circle-future'></Icon></p>
                    </div>
                    <div className='flex justify-center mt-2'>
                        <progress max={100} value={40} className='w-full h-0.5'></progress>
                    </div>
                    <div className='flex justify-between w-2/3 m-auto'>
                        <span>開催前</span>
                        <span>一次審査</span>
                        <span>二次審査</span>
                        <span>終了済</span>
                    </div>
            
                    <p className="event-date mt-5">イベント開催期間：2024年10月30日～2025年10月30日</p>
                    <p className="event-date">書評投稿期間：2024年10月30日～2025年10月30日</p>
                    <p className="event-date event-data-now">一次審査期間：2024年10月30日～2025年10月30日</p>
                    <p className="event-date">二次審査期間：2024年10月30日～2025年10月30日</p>

                    <button className="event-detail-btn mt-5" onClick={handledetail}>イベント詳細</button>
                </div>
            </div>

            <div className='grid grid-cols-2 grid-rows-2 m-auto w-max gap-x-14 gap-y-10 mt-18'>
                {/* お知らせ・寄贈管理 */}
                <Link href="/admin/notice" className='flex p-2 shadow-md w-max admin-card'>
                    <div className='flex items-center justify-center w-auto mx-1'>
                        <Icon icon="mdi:megaphone" width="50" height="50"
                            className='rounded-full admin-icon' />
                    </div>
                    <div>
                        <h2 className='mb-1 text-center card-title'>お知らせ・寄贈管理</h2>
                        <p className='mb-1 card-description'>お知らせの一覧・投稿・編集</p>
                    </div>
                </Link>

                {/* イベント管理 */}
                <Link href="/admin/events" className='flex py-2 pl-2 shadow-md w-max admin-card'>
                    <div className='flex items-center justify-center w-auto mx-1'>
                        <Icon icon="mdi:calendar" width="50" height="50"
                            className='p-1 rounded-full admin-icon' />
                    </div>
                    <div className='ml-4 mr-16'>
                        <h2 className='mb-1 text-center card-title'>イベント管理</h2>
                        <p className='mb-1 card-description'>イベントの作成・編集</p>
                    </div>
                </Link>

                {/* ユーザー管理 */}
                <Link href="/admin/users" className='flex py-2 pl-2 pr-5 shadow-md w-max admin-card'>
                    <div className='flex items-center justify-center w-auto mx-1'>
                        <Icon icon="mdi:people" width="50" height="50"
                            className='p-1 rounded-full admin-icon' />
                    </div>
                    <div className='ml-4 mr-7'>
                        <h2 className='mb-1 text-center card-title'>ユーザー管理</h2>
                        <p className='mb-1 card-description'>ユーザー情報閲覧・書評閲覧</p>
                    </div>
                </Link>

                {/* パスワード変更 */}
                <Link href="#" className='flex py-2 pl-2 pr-5 shadow-md w-max admin-card'>
                    <div className='flex items-center justify-center w-auto mx-1'>
                        <Icon icon="material-symbols:key" width="50" height="50"
                            className='p-1 rounded-full admin-icon' />
                    </div>
                    <div className='ml-4 mr-4'>
                        <h2 className='mb-1 text-center card-title'>パスワード変更</h2>
                        <p className='mb-1 card-description'>パスワードを変更</p>
                    </div>
                </Link>
            </div>
        </main>
        );
}
