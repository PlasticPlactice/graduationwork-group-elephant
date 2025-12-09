// components/admin/EventRegisterModal.tsx
"use client"
import { Icon } from "@iconify/react";
import Textbox from '@/components/ui/admin-textbox';
import "@/styles/admin/events.css"

interface EventRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EventRegisterModal({ isOpen, onClose }: EventRegisterModalProps) {
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // フォーム送信処理をここに追加
        console.log('フォームを送信');
        onClose();
    };

    return (
        <div className="fixed inset-0 reg-modal bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="modal-content bg-white rounded-lg w-11/12 max-w-8xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">イベント編集</h2>
                    <button onClick={onClose} className="close-btn text-black">
                        <Icon icon="mdi:close" width={24} className='text-black'/>
                    </button>
                </div>
                
                <div className="modal-scroll-area overflow-y-auto p-3">
                    <form onSubmit={handleSubmit} className='p-3'>
                        <div className='my-4'>
                            <label htmlFor="title-form" className='title-label text-xl block'>タイトル</label>
                            <Textbox
                                id='title-form'
                                name='title'
                                className='w-full custom-input'
                                style={{backgroundColor:'#F9FAFB'}}
                                placeholder='イベントのタイトルを入力'
                                value={'第1回文庫X'}
                            />
                        </div>

                        <div className='my-4'>
                            <label htmlFor="event-start-datetime" className='text-xl block'>イベント開催期間</label>
                            <p className='event-detail-text text-sm'>イベントの開催期間を決定します</p>
                            <div className='flex justify-between items-center'>
                                <Textbox
                                    id='event-start-datetime'
                                    name='event-start-datetime'
                                    className='datetime-input'
                                    type='datetime-local'
                                    style={{ backgroundColor: '#F9FAFB' }}
                                    value={'2024-10-30 12:00'}
                                />
                                <p>～</p>
                                <Textbox
                                    id='event-end-datetime'
                                    name='event-end-datetime'
                                    className='datetime-input'
                                    type='datetime-local'
                                    style={{ backgroundColor: '#F9FAFB' }}
                                    value={'2025-10-30 12:00'}
                                />
                            </div>
                        </div>

                        <div className='my-4'>
                            <label htmlFor="book-post-datetime" className='text-xl block'>書評投稿期間</label>
                            <p className='event-detail-text text-sm'>ユーザーが書評を投稿できる期間を決定します</p>
                            <div className='flex justify-between items-center'>
                                <Textbox
                                    id='book-post-start-datetime'
                                    name='book-post-start-datetime'
                                    className='datetime-input'
                                    type='datetime-local'
                                    style={{ backgroundColor: '#F9FAFB' }}
                                    value={'2024-11-30 12:00'}
                                />
                                <p>～</p>
                                <Textbox
                                    id='book-post-end-datetime'
                                    name='book-post-end-datetime'
                                    className='datetime-input'
                                    type='datetime-local'
                                    style={{ backgroundColor: '#F9FAFB' }}
                                    value={'2024-12-30 12:00'}
                                />
                            </div>
                        </div>

                        <div className='my-4'>
                            <label htmlFor="book-vote-datetime" className='text-xl block'>書評投票期間</label>
                            <p className='event-detail-text text-sm'>ユーザーが書評に対して投票できる期間を決定します</p>
                            <div className='flex justify-between items-center'>
                                <Textbox
                                    id='book-vote-start-datetime'
                                    name='book-vote-start-datetime'
                                    className='datetime-input'
                                    type='datetime-local'
                                    style={{ backgroundColor: '#F9FAFB' }}
                                    value={'2025-01-05 12:00'}
                                />
                                <p>～</p>
                                <Textbox
                                    id='book-vote-end-datetime'
                                    name='book-vote-end-datetime'
                                    className='datetime-input'
                                    type='datetime-local'
                                    style={{ backgroundColor: '#F9FAFB' }}
                                    value={'2025-02-05 12:00'}
                                />
                            </div>
                        </div>

                        <div className='my-4'>
                            <label htmlFor="event-status" className='text-xl block'>ステータス</label>
                            <div className='flex justify-between w-4/5 m-auto'>
                                <p className='w-10'><Icon icon='material-symbols:circle' className='m-auto text-white'></Icon></p>
                                <p className='w-10'><Icon icon="bxs:up-arrow" rotate={2} className='up-arrow m-auto'></Icon></p>
                                <p className='w-10'><Icon icon='material-symbols:circle' className='m-auto text-white'></Icon></p>
                                <p className='w-10'><Icon icon='material-symbols:circle' className='m-auto text-white'></Icon></p>
                            </div>
                            <div className='flex justify-between w-4/5 m-auto'>
                                <p className='w-10'><Icon icon='material-symbols:circle' className='event-condition-circle-now'></Icon></p>
                                <p className='w-10'><Icon icon='material-symbols:circle' className='event-condition-circle-now'></Icon></p>
                                <p className='w-10'><Icon icon='material-symbols:circle' className='event-condition-circle-future'></Icon></p>
                                <p className='w-10'><Icon icon='material-symbols:circle' className='event-condition-circle-future'></Icon></p>
                            </div>
                            <div className='flex justify-center mt-2'>
                                <progress max={100} value={37} className='w-full h-0.5'></progress>
                            </div>
                            <div className='flex justify-between w-4/5 m-auto'>
                                <span>開催前</span>
                                <span>一次審査</span>
                                <span>二次審査</span>
                                <span>終了済</span>
                            </div>
                        </div>

                        <div className='my-4'>
                            <label htmlFor="remarks" className='text-lg block'>現在のステータス</label>
                            <div className="flex items-center gap-3">
                                <span className="now-status py-1 px-6 rounded-4xl font-bold">一次審査中</span>
                                <Icon icon='mdi:arrow-up-bold' rotate={1} width={30}></Icon>
                                <select className="next-status">
                                    <option value="開催前">開催前</option>
                                    <option value="一次審査中">一次審査中</option>
                                    <option value="二次審査中">二次審査中</option>
                                    <option value="終了済">終了済</option>
                                </select>
                            </div>
                        </div>

                        <div className='flex justify-end gap-4'>
                            <button type="button" className='cancel-btn' onClick={onClose}>キャンセル</button>
                            <input type="submit" value='登録' className='reg-form-btn'/>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
