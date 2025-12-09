import Textbox from '@/components/ui/admin-textbox';
import AdminButton from '@/components/ui/admin-button';
import "@/styles/admin/events-details.css"
import { Icon } from '@iconify/react';

export default function Page() { 
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
                <table className="w-full user-table">
                    <thead className='table-head'>
                        <tr>
                            <th>
                                <input type="checkbox"/>
                            </th>
                            <th>
                                <div className='flex items-center justify-center'>
                                    ID<Icon icon='uil:arrow' rotate={1}></Icon>
                                </div>
                            </th>
                            <th>
                                <div className='flex items-center justify-center'>
                                    書籍タイトル<Icon icon='uil:arrow' rotate={1}></Icon>
                                </div>
                            </th>
                            <th>
                                <div className='flex items-center justify-center'>
                                    ニックネーム<Icon icon='uil:arrow' rotate={1}></Icon>
                                </div>
                            </th>
                            <th>
                                <div className='flex items-center justify-center'>
                                    ステータス<Icon icon='uil:arrow' rotate={1}></Icon>
                                </div>
                            </th>
                            <th>
                                <div className='flex items-center justify-center'>
                                    投票数<Icon icon='uil:arrow' rotate={1}></Icon>
                                </div>
                            </th>
                        </tr>
                    </thead>
                </table>
            </div>
        </main>
    )    
}
