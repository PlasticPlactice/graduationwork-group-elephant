"use client"
import AdminButton from '@/components/ui/admin-button';
import { useRouter } from 'next/navigation';
import { useState,useEffect } from 'react';
import "@/styles/admin/events.css"
import { Icon } from "@iconify/react";
import EventRegisterModal from '@/components/admin/EventRegisterModal';

export default function Page() {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rangeValue, setRangeValue] = useState(33);

    // モーダルが開いている時に背景のスクロールを防ぐ
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        // クリーンアップ関数
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);

    const handleRegister = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    }
    const handledetail = () => {
        router.push('/admin/home')
    }

    return (
        <main>
            <AdminButton
                label="イベント登録" 
                type="button" 
                className='self-end ml-5 my-3 register-btn'
                onClick={handleRegister}
            />
            <h1 className='events-headline text-center'>開催中のイベント</h1>

            <section className='w-11/12 now-event-section m-auto p-4'>
                <div className='flex items-center justify-between pb-3 event-title-section'>
                    <div className='flex items-center'>
                        <AdminButton
                            label='第1回文庫X'
                            className='font-bold event-btn'
                            onClick={handledetail}
                        />
                        <p className='ml-3'>2022-10-01 ~ 2023-10-01</p>
                    </div>
                    <div className='flex items-center mr-10'>
                        <p>イベントの公開</p>
                        <label className="toggle-switch ml-7">
                            <input type="checkbox" id="myToggle"/>
                            
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                <p className='now-event-condition my-5'>現在のイベント状況</p>
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

                <div className='flex items-center justify-between'>
                    <h2 className='font-bold event-data-headline'>イベント情報</h2>
                    <AdminButton
                        label='編集'
                        type="button" 
                        className='edit_btn'
                    />
                </div>

            <div className="schedule-table">
                <div className="row ">
                    <div className="label text-center">テーマタイトル</div>
                    <div className="content">第1回文庫X</div>
                </div>

                <div className="row">
                    <div className="label text-center">開始日</div>
                    <div className="content">2024年10月30日 ～ 2025年10月30日</div>
                </div>

                <div className="row">
                    <div className="label text-center">書評投稿期間</div>
                    <div className="content">20xx年xx月xx日 - 20xx年xx月xx日</div>
                </div>

                <div className="row">
                    <div className="label text-center">1次審査期間</div>
                    <div className="content">20xx年xx月xx日 - 20xx年xx月xx日</div>
                </div>

                <div className="row">
                    <div className="label text-center">2次審査期間</div>
                    <div className="content">20xx年xx月xx日 - 20xx年xx月xx日</div>
                </div>

                <div className="row">
                    <div className="label large text-center">備考</div>
                    <div className="content large"></div>
                </div>
            </div>
            </section>

            <h1 className='events-headline text-center'>終了済のイベント</h1>

            <details className='w-11/12 m-auto p-4 end-event-accordion'>
                <summary className='flex items-center justify-between'>
                    <div className='summary_title'>
                        <h2 className='font-bold'>第0回文庫X</h2>
                        <p>2022-10-01 ~ 2023-10-01</p>
                    </div>
                        <Icon icon="ep:arrow-up" rotate={2} width={40} className='icon'></Icon>
                </summary>
                <section className='w-11/12 end-event-section m-auto p-4'>
                    <div className='flex items-center justify-between pb-3 event-title-section'>
                        <div className='flex items-center'>
                            <AdminButton
                                label='第0回文庫X'
                                className='font-bold event-btn'
                                onClick={handledetail}
                            />
                            <p className='ml-3'>2022-10-01 ~ 2023-10-01</p>
                        </div>
                        <div className='flex items-center mr-10'>
                            <p>イベントの公開</p>
                            <label className="toggle-switch ml-7">
                                <input type="checkbox" id="myToggle"/>
                                
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>

                    <p className='now-event-condition my-5'>現在のイベント状況</p>
                    <div className='flex justify-between w-2/3 m-auto'>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='m-auto text-white'></Icon></p>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='m-auto text-white'></Icon></p>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='m-auto text-white'></Icon></p>
                        <p className='w-10'><Icon icon="bxs:up-arrow" rotate={2} className='up-arrow m-auto'></Icon></p>
                    </div>
                    <div className='flex justify-between w-2/3 m-auto'>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='event-condition-circle-now'></Icon></p>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='event-condition-circle-now'></Icon></p>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='event-condition-circle-now'></Icon></p>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='event-condition-circle-now'></Icon></p>
                    </div>
                    <div className='flex justify-center mt-2'>
                        <progress max={100} value={100} className='w-full h-0.5'></progress>
                    </div>
                    <div className='flex justify-between w-2/3 m-auto'>
                        <span>開催前</span>
                        <span>一次審査</span>
                        <span>二次審査</span>
                        <span>終了済</span>
                    </div>

                    <div className='flex items-center justify-between'>
                        <h2 className='font-bold event-data-headline'>イベント情報</h2>
                        <AdminButton
                            label='編集'
                            type="button" 
                            className='edit_btn'
                        />
                    </div>

                    <div className="schedule-table">
                        <div className="row ">
                            <div className="label text-center">テーマタイトル</div>
                            <div className="content">第1回文庫X</div>
                        </div>

                        <div className="row">
                            <div className="label text-center">開始日</div>
                            <div className="content">2024年10月30日 ～ 2025年10月30日</div>
                        </div>

                        <div className="row">
                            <div className="label text-center">書評投稿期間</div>
                            <div className="content">20xx年xx月xx日 - 20xx年xx月xx日</div>
                        </div>

                        <div className="row">
                            <div className="label text-center">1次審査期間</div>
                            <div className="content">20xx年xx月xx日 - 20xx年xx月xx日</div>
                        </div>

                        <div className="row">
                            <div className="label text-center">2次審査期間</div>
                            <div className="content">20xx年xx月xx日 - 20xx年xx月xx日</div>
                        </div>

                        <div className="row">
                            <div className="label large text-center">備考</div>
                            <div className="content large"></div>
                        </div>
                    </div>
                </section>
            </details>

            <details className='w-11/12 m-auto p-4 end-event-accordion'>
                <summary className='flex items-center justify-between'>
                    <div className='summary_title'>
                        <h2 className='font-bold'>第0回文庫X</h2>
                        <p>2022-10-01 ~ 2023-10-01</p>
                    </div>
                        <Icon icon="ep:arrow-up" rotate={2} width={40} className='icon'></Icon>
                </summary>
                <section className='w-11/12 end-event-section m-auto p-4'>
                    <div className='flex items-center justify-between pb-3 event-title-section'>
                        <div className='flex items-center'>
                            <AdminButton
                                label='第0回文庫X'
                                className='font-bold event-btn'
                                onClick={handledetail}
                            />
                            <p className='ml-3'>2022-10-01 ~ 2023-10-01</p>
                        </div>
                        <div className='flex items-center mr-10'>
                            <p>イベントの公開</p>
                            <label className="toggle-switch ml-7">
                                <input type="checkbox" id="myToggle"/>
                                
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>

                    <p className='now-event-condition my-5'>現在のイベント状況</p>
                    <div className='flex justify-between w-2/3 m-auto'>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='m-auto text-white'></Icon></p>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='m-auto text-white'></Icon></p>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='m-auto text-white'></Icon></p>
                        <p className='w-10'><Icon icon="bxs:up-arrow" rotate={2} className='up-arrow m-auto'></Icon></p>
                    </div>
                    <div className='flex justify-between w-2/3 m-auto'>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='event-condition-circle-now'></Icon></p>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='event-condition-circle-now'></Icon></p>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='event-condition-circle-now'></Icon></p>
                        <p className='w-10'><Icon icon='material-symbols:circle' className='event-condition-circle-now'></Icon></p>
                    </div>
                    <div className='flex justify-center mt-2'>
                        <progress max={100} value={100} className='w-full h-0.5'></progress>
                    </div>
                    <div className='flex justify-between w-2/3 m-auto'>
                        <span>開催前</span>
                        <span>一次審査</span>
                        <span>二次審査</span>
                        <span>終了済</span>
                    </div>

                    <div className='flex items-center justify-between'>
                        <h2 className='font-bold event-data-headline'>イベント情報</h2>
                        <AdminButton
                            label='編集'
                            type="button" 
                            className='edit_btn'
                        />
                    </div>

                    <div className="schedule-table">
                        <div className="row ">
                            <div className="label text-center">テーマタイトル</div>
                            <div className="content">第1回文庫X</div>
                        </div>

                        <div className="row">
                            <div className="label text-center">開始日</div>
                            <div className="content">2024年10月30日 ～ 2025年10月30日</div>
                        </div>

                        <div className="row">
                            <div className="label text-center">書評投稿期間</div>
                            <div className="content">20xx年xx月xx日 - 20xx年xx月xx日</div>
                        </div>

                        <div className="row">
                            <div className="label text-center">1次審査期間</div>
                            <div className="content">20xx年xx月xx日 - 20xx年xx月xx日</div>
                        </div>

                        <div className="row">
                            <div className="label text-center">2次審査期間</div>
                            <div className="content">20xx年xx月xx日 - 20xx年xx月xx日</div>
                        </div>

                        <div className="row">
                            <div className="label large text-center">備考</div>
                            <div className="content large"></div>
                        </div>
                    </div>
                </section>
            </details>

            {/* モーダル */}
            <EventRegisterModal isOpen={isModalOpen} onClose={closeModal} />
        </main>
    )
}
