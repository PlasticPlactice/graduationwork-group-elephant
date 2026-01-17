// components/admin/EventRegisterModal.tsx
"use client"
import { Icon } from "@iconify/react";
import Textbox from '@/components/ui/admin-textbox';
import "@/styles/admin/events.css"
import { useState } from "react";
import { useRouter } from "next/navigation";

interface EventRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EventRegisterModal({ isOpen, onClose }: EventRegisterModalProps) {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [detail, setDetail] = useState("");
    const [startPeriod, setStartPeriod] = useState("");
    const [endPeriod, setEndPeriod] = useState("");
    const [firstVotingStart, setFirstVotingStart] = useState("");
    const [firstVotingEnd, setFirstVotingEnd] = useState("");
    const [secondVotingStart, setSecondVotingStart] = useState("");
    const [secondVotingEnd, setSecondVotingEnd] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                title,
                detail,
                start_period: startPeriod,
                end_period: endPeriod,
                first_voting_start_period: firstVotingStart,
                first_voting_end_period: firstVotingEnd,
                second_voting_start_period: secondVotingStart,
                second_voting_end_period: secondVotingEnd,
                status: 0,
                public_flag: false
            };

            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                console.error('イベント登録エラー', err);
                alert('イベント登録に失敗しました。');
                setSubmitting(false);
                return;
            }

            // 成功: モーダルを閉じて画面更新
            onClose();
            router.refresh();
        } catch (err) {
            console.error(err);
            alert('通信エラーが発生しました。');
        } finally {
            setSubmitting(false);
        }

    };

    return (
        <div className="fixed inset-0 reg-modal bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="modal-content bg-white rounded-lg w-11/12 max-w-8xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">イベント登録</h2>
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
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className='w-full custom-input'
                                style={{backgroundColor:'#F9FAFB'}}
                                placeholder='イベントのタイトルを入力'
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
                                    value={startPeriod}
                                    onChange={(e) => setStartPeriod(e.target.value)}
                                    style={{backgroundColor:'#F9FAFB'}}
                                />
                                <p>～</p>
                                <Textbox
                                    id='event-end-datetime'
                                    name='event-end-datetime'
                                    className='datetime-input'
                                    type='datetime-local'
                                    value={endPeriod}
                                    onChange={(e) => setEndPeriod(e.target.value)}
                                    style={{backgroundColor:'#F9FAFB'}}
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
                                    value={firstVotingStart}
                                    onChange={(e) => setFirstVotingStart(e.target.value)}
                                    style={{backgroundColor:'#F9FAFB'}}
                                />
                                <p>～</p>
                                <Textbox
                                    id='book-post-end-datetime'
                                    name='book-post-end-datetime'
                                    className='datetime-input'
                                    type='datetime-local'
                                    value={firstVotingEnd}
                                    onChange={(e) => setFirstVotingEnd(e.target.value)}
                                    style={{backgroundColor:'#F9FAFB'}}
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
                                    value={secondVotingStart}
                                    onChange={(e) => setSecondVotingStart(e.target.value)}
                                    style={{backgroundColor:'#F9FAFB'}}
                                />
                                <p>～</p>
                                <Textbox
                                    id='book-vote-end-datetime'
                                    name='book-vote-end-datetime'
                                    className='datetime-input'
                                    type='datetime-local'
                                    value={secondVotingEnd}
                                    onChange={(e) => setSecondVotingEnd(e.target.value)}
                                    style={{backgroundColor:'#F9FAFB'}}
                                />
                            </div>
                        </div>

                        <div className='my-4'>
                            <label htmlFor="event-status" className='text-xl block'>ステータス</label>
                            <div className='flex justify-between w-4/5 m-auto'>
                                <p className='w-10'><Icon icon="bxs:up-arrow" rotate={2} className='up-arrow m-auto'></Icon></p>
                                <p className='w-10'><Icon icon='material-symbols:circle' className='m-auto text-white'></Icon></p>
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
                                <progress max={100} value={11} className='w-full h-0.5'></progress>
                            </div>
                            <div className='flex justify-between w-4/5 m-auto'>
                                <span>開催前</span>
                                <span>一次審査</span>
                                <span>二次審査</span>
                                <span>終了済</span>
                            </div>
                        </div>

                        <div className='my-4'>
                            <label htmlFor="remarks" className='text-xl block'>備考欄</label>
                            <p className='event-detail-text text-sm'>イベントについての詳細を記入してください。 ※ユーザーには公開されません</p>
                            <textarea name="remarks" id="remarks" value={detail} onChange={(e) => setDetail(e.target.value)}></textarea>
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
