import type { Metadata } from "next";
import Textbox from '@/components/ui/admin-textbox';
// import { Icon } from '@iconify/react';

export const metadata: Metadata = {
  title: "お知らせ・寄贈",
};

export default function page() {
    return (
        <main style={{backgroundColor:"var(--color-bg)" ,color:"var(--color-text)"}}>
            <div style={{ border: "1px solid #8B8B8B" ,borderRadius:"var(--control-radius)"}}
                className="mx-8 my-9 px-5 pt-3 pb-6 flex">
                <div>
                    <p>タイトル</p>
                    <Textbox size="lg" className="w-96"
                    style={{height:"2.5rem"}}></Textbox>
                </div>
                <div className="ml-5">
                    <p>公開期間</p>
                    <div className="flex justify-center items-center">
                        <Textbox type="date"
                            className="w-40"
                            style={{height:"2.5rem"}}></Textbox>
                        <p>ー</p>
                        <Textbox type="date"
                            className="w-40"
                            style={{height:"2.5rem"}}></Textbox>
                    </div>
                </div>
            </div>
        </main>
    );
}
