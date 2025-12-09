import Textbox from '@/components/ui/admin-textbox';
import AdminButton from '@/components/ui/admin-button';
import "@/styles/admin/events-details.css"

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
        </main>
    )    
}
