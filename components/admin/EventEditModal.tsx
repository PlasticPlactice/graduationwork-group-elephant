// components/admin/EventRegisterModal.tsx
"use client"
import { Icon } from "@iconify/react";
import Textbox from '@/components/ui/admin-textbox';
import "@/styles/admin/events.css"
import { useEffect, useState, startTransition } from "react";

type EventItem = {
  id: number;
  title: string;
  detail?: string;
  status?: string | number;
  start_period?: string;
  end_period?: string;
  first_voting_start_period?: string;
  first_voting_end_period?: string;
  second_voting_start_period?: string;
  second_voting_end_period?: string;
  public_flag?: boolean | string;
};

interface EventRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    event?: EventItem | null;
}

const toDateTimeLocalValue = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0,16);
};

export default function EventRegisterModal({ isOpen, onClose,event }: EventRegisterModalProps) {
    const [title, setTitle] = useState("");
    const [detail, setDetail] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [firstStart, setFirstStart] = useState("");
    const [firstEnd, setFirstEnd] = useState("");
    const [secondStart, setSecondStart] = useState("");
    const [secondEnd, setSecondEnd] = useState("");
    const [publicFlag, setPublicFlag] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<number | null>(null);
    const [nextStatus, setNextStatus] = useState<number>(0);

    useEffect(() => {
        if (isOpen && event) {
        startTransition(() => {
            setTitle(event.title ?? "");
            setDetail(event.detail ?? "");
            setStart(toDateTimeLocalValue(event.start_period));
            setEnd(toDateTimeLocalValue(event.end_period));
            setFirstStart(toDateTimeLocalValue(event.first_voting_start_period));
            setFirstEnd(toDateTimeLocalValue(event.first_voting_end_period));
            setSecondStart(toDateTimeLocalValue(event.second_voting_start_period));
            setSecondEnd(toDateTimeLocalValue(event.second_voting_end_period));
            setPublicFlag(event.public_flag === true || event.public_flag === "true");
            const initStatus = Number(event.status ?? 0);
            setCurrentStatus(initStatus);
            setNextStatus(initStatus);
        });
        }
    }, [isOpen, event]);
    
    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!event) return onClose();

        try {
        const payload = {
            id: event.id,
            title,
            detail,
            start_period: start ? new Date(start).toISOString() : null,
            end_period: end ? new Date(end).toISOString() : null,
            first_voting_start_period: firstStart ? new Date(firstStart).toISOString() : null,
            first_voting_end_period: firstEnd ? new Date(firstEnd).toISOString() : null,
            second_voting_start_period: secondStart ? new Date(secondStart).toISOString() : null,
            second_voting_end_period: secondEnd ? new Date(secondEnd).toISOString() : null,
            public_flag: publicFlag,
            status: nextStatus,
        };

        const res = await fetch('/api/events', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            console.error('update failed', await res.text());
            alert('更新に失敗しました');
            return;
        }

        onClose();
        } catch (err) {
        console.error(err);
        alert('通信エラー');
        }
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
                                value={title}
                                onChange={(e)=> setTitle(e.target.value)}
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
                                    value={start}
                                    onChange={(e)=>setStart(e.target.value)}
                                />
                                <p>～</p>
                                <Textbox
                                    id='event-end-datetime'
                                    name='event-end-datetime'
                                    className='datetime-input'
                                    type='datetime-local'
                                    style={{ backgroundColor: '#F9FAFB' }}
                                    value={end}
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
                                    value={firstStart}
                                    onChange={(e)=>setFirstStart(e.target.value)}
                                />
                                <p>～</p>
                                <Textbox
                                    id='book-post-end-datetime'
                                    name='book-post-end-datetime'
                                    className='datetime-input'
                                    type='datetime-local'
                                    style={{ backgroundColor: '#F9FAFB' }}
                                    value={firstEnd}
                                    onChange={(e)=>setFirstEnd(e.target.value)}
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
                                    value={secondStart}
                                    onChange={(e)=>setSecondStart(e.target.value)}
                                />
                                <p>～</p>
                                <Textbox
                                    id='book-vote-end-datetime'
                                    name='book-vote-end-datetime'
                                    className='datetime-input'
                                    type='datetime-local'
                                    style={{ backgroundColor: '#F9FAFB' }}
                                    value={secondEnd}
                                    onChange={(e)=>setSecondEnd(e.target.value)}
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
                                {/* todo:statusが0なら開催前、1なら一次審査中、2なら二次審査中、3なら終了済にする */}
                                <span className="now-status py-1 px-6 rounded-4xl font-bold">
                                    {(() => {
                                        switch (currentStatus) {
                                            case 0: return "開催前";
                                            case 1: return "一次審査中";
                                            case 2: return "二次審査中";
                                            case 3: return "終了済";
                                            default: return "未設定";
                                        }
                                    })()}
                                </span>
                                <Icon icon='mdi:arrow-up-bold' rotate={1} width={30}></Icon>
                                <select
                                    className="next-status"
                                    value={String(nextStatus)}
                                    onChange={(e) => setNextStatus(Number(e.target.value))}
                                >
                                    <option value="0">開催前</option>
                                    <option value="1">一次審査中</option>
                                    <option value="2">二次審査中</option>
                                    <option value="3">終了済</option>
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
