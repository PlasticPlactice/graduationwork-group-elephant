"use client"
import Textbox from '@/components/ui/admin-textbox';
import AdminButton from '@/components/ui/admin-button';
import "@/styles/admin/events-details.css"
import { Icon } from '@iconify/react';
import { useState } from 'react';

export default function Page() { 

    const [openRows, setOpenRows] = useState<number[]>([]);

    const toggleRow = (id: number) => {
        setOpenRows(prev => 
            prev.includes(id) 
                ? prev.filter(rowId => rowId !== id)
                : [...prev, id]
        );
    };

    // サンプルデータ
    const tableData = [
        { id: 10, title: '転生したらスライムだった件', nickname: '象花たろう', status: '一次通過', votes: 30 },
        { id: 11, title: '本好きの下剋上', nickname: '山田太郎', status: '一次通過', votes: 45 },
        { id: 12, title: '無職転生', nickname: '佐藤花子', status: '一次通過', votes: 15},
    ];
    return (
        <main>
            {/*---------------------------
            検索ボックス
            ---------------------------*/}
            <div className="flex px-5 pt-3 pb-6 mx-8 my-6 shadow-sm search-area">
                
                <div className="input-group">
                    <p>書籍タイトル</p>
                    <Textbox 
                        size="lg" 
                        className="custom-input-full"
                    />
                </div>

                <div className="ml-5 input-group">
                    <p>ニックネーム</p>
                    <Textbox
                        className='custom-input-full'
                        type='text'/>
                </div>

                <div className="ml-5 input-group">
                    <p>ステータス</p>
                    <select className='custom-input-full'>
                        <option value="評価前">評価前</option>
                        <option value="一次通過">一次通過</option>
                        <option value="二次通過">二次通過</option>
                        <option value="三次通過">三次通過</option>
                    </select>
                </div>

                <AdminButton
                    label="検索" 
                    type="submit" 
                    icon="mdi:search"
                    iconPosition="left"
                    className='self-end ml-5 search-btn'
                />
            </div>

            <div className='flex justify-end mx-8 gap-3'>
                <AdminButton
                    label='メッセージ送信'
                    icon='ic:baseline-message'
                    iconPosition='left'
                    className='w-auto'
                />
                <AdminButton
                    label='CSV出力'
                    icon='material-symbols:download'
                    iconPosition='left'
                    className='w-auto'
                />
                <AdminButton
                    label='ステータス変更'
                    icon='material-symbols:edit-outline'
                    iconPosition='left'
                    className='w-auto'
                />
            </div>

            <div className='flex items-center mx-8 gap-3'>
                <p>表示数</p>
                <select className='all-select'>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                </select>
                <button className='choice-btn font-bold'>一括選択</button>
            </div>

            <div className='mx-8 mt-8'>
                <table className="w-full event-table">
                    <thead className='table-head'>
                        <tr>
                            <th className='flex items-center justify-center py-2 pl-1'>
                                <input type="checkbox" className='head-check'/>
                            </th>
                            <th className='w-28'>
                                <div className='flex items-center '>
                                    ID<Icon icon='uil:arrow' rotate={1}></Icon>
                                </div>
                            </th>
                            <th className='w-1/4'>
                                <div className='flex items-center'>
                                    書籍タイトル<Icon icon='uil:arrow' rotate={1}></Icon>
                                </div>
                            </th>
                            <th>
                                <div className='flex items-center'>
                                    ニックネーム<Icon icon='uil:arrow' rotate={1}></Icon>
                                </div>
                            </th>
                            <th>
                                <div className='flex items-center '>
                                    ステータス<Icon icon='uil:arrow' rotate={1}></Icon>
                                </div>
                            </th>
                            <th>
                                <div className='flex items-center'>
                                    投票数<Icon icon='uil:arrow' rotate={1}></Icon>
                                </div>
                            </th>
                            <th>
                                {/* <Icon icon='fe:arrow-up'></Icon> */}
                            </th>
                        </tr>
                    </thead>
                    <tbody className='border'>
                        {tableData.map((row) => (
                            <>
                                <tr key={row.id} className='table-row'>
                                    <td className='text-center py-2 pl-1'>
                                        <input type="checkbox" className='head-check' />
                                    </td>
                                    <td>
                                        <span>{row.id}</span>
                                    </td>
                                    <td>
                                        <span className='title-text'>{row.title}</span>
                                    </td>
                                    <td>
                                        <span>{row.nickname}</span>
                                    </td>
                                    <td>
                                        <span className='status-text font-bold py-2 px-6 rounded-2xl'>{row.status}</span>
                                    </td>
                                    <td>
                                        <span>{row.votes}</span>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => toggleRow(row.id)}
                                            className='accordion-toggle'
                                        >
                                            <Icon 
                                                icon='fe:arrow-up' 
                                                className={`icon transition-transform ${openRows.includes(row.id) ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                    </td>
                                </tr>
                                {openRows.includes(row.id) && (
                                    <tr key={`${row.id}-details`} className='details-row'>
                                        <td colSpan={7} className='details-content'>
                                            <div className='p-4 bg-gray-50'>
                                                <h3 className='font-bold mb-2'>書評内容</h3>
                                                <div className='mt-4 flex gap-4'>
                                                    <div>
                                                        <span className='font-semibold'>投稿日:</span> 2024-10-15
                                                    </div>
                                                    <div>
                                                        <span className='font-semibold'>最終更新:</span> 2024-10-20
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    )    
}
