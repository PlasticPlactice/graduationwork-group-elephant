import type { Metadata } from "next";
import Textbox from '@/components/ui/admin-textbox';
import AdminButton from '@/components/ui/admin-button';


export const metadata: Metadata = {
  title: "お知らせ・寄贈",
};

export default function page() {
    return (
        <main style={{backgroundColor:"var(--color-bg)" ,color:"var(--color-text)"}}>
            <div style={{ border: "1px solid #8B8B8B" ,borderRadius:"var(--control-radius)"}}
                className="mx-8 my-9 px-5 pt-3 pb-6 flex shadow-sm">
                
                <div style={{width:"40%"}}>
                    <p>タイトル</p>
                    <Textbox size="lg" className=""
                        style={{
                            height: "2.5rem",
                            width:"100%"
                    }}></Textbox>
                </div>

                <div className="ml-5" style={{width:"40%"}}>
                    <p>公開期間</p>
                    <div className="flex items-center">
                        <Textbox type="date"
                            className=""
                            style={{ height: "2.5rem" }}></Textbox>
                        <p className="px-2 justify-center items-center">ー</p>
                        <Textbox type="date"
                            className=""
                            style={{height:"2.5rem"}}></Textbox>
                    </div>
                </div>

                <AdminButton
                    label="検索" 
                    type="submit" 
                    icon="mdi:search"
                    iconPosition="left"
                    className='self-end ml-5'
                    style={{
                        height: "2.5rem",
                    }}
                />
            </div>
        </main>
    );
}
