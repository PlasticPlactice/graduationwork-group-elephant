import Textbox from '@/components/ui/admin-textbox';
import AdminButton from '@/components/ui/admin-button';
import "@/styles/admin/users.css";
import { Icon } from '@iconify/react';

export default function page() {
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
                    <thead className="table-head">
                        <tr>
                            <th className='py-2 pl-6 w-1/10'>
                                <div className="flex items-center">
                                    ID<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                            <th className='w-2/10'>
                                <div className="flex items-center">
                                    ニックネーム<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                            <th className='w-2/10'>
                                <div className="flex items-center">
                                    ステータス<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                            <th className='w-2/10'>
                                <div className="flex items-center">
                                    年代<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                            <th className='w-2/10'>
                                <div className="flex items-center">
                                    居住地<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                            <th>
                                <div className="flex items-center">
                                    投票数<Icon icon="uil:arrow" rotate={1}></Icon>
                                </div>
                            </th>
                        </tr>
                    </thead>
                </table>
            </div>
        </main>
    );
}
