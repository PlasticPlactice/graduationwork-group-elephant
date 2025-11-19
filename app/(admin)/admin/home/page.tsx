import { Icon } from '@iconify/react';

export default function Page() {
    return (
        <main style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}>

            <div className='mt-10'>
                <h1 style={{ fontSize: "var(--font-size-h1)" ,margin:0}}
                    className='text-center'>開催中のイベント</h1>
                <div className='text-center py-2 w-3/5 m-auto'
                    style={{border:"1px solid var(--color-main)"}}>
                    <p style={{fontSize:"var(--font-size-h1)"}}
                    className='font-bold underline'>第1回文庫X</p>
                    <p className='font-extrabold w-max m-auto px-7 py-0.5 rounded-2xl'
                        style={{ color: "#1E40AF", backgroundColor:"#DBEAFE"}}>二次審査中</p>
                    <p style={{fontSize:"--font-size-small"}}>2024年10月30日～2025年10月30日</p>
                </div>
            </div>
            {/* todo:枠の大きさを変える */}
            {/* todo:枠に丸み */}
            {/* todo:枠に影 */}

            {/* お知らせ・寄贈管理 */}
            <div style={{ border: "2px solid var(--color-main)", borderRadius: "var(--control-radius)" }}
                className='flex w-max p-2 shadow-md'>
                <div className='w-auto mx-1 flex justify-center items-center'>
                    <Icon icon="mdi:megaphone" width="50" height="50"
                        style={{ backgroundColor: "var(--color-main)", color: "var(--color-bg)" }}
                        className='rounded-full' />
                </div>
                <div>
                    <h2 className='text-center mb-1'
                        style={{ fontSize: "var(--font-size-h1)" }}>お知らせ・寄贈管理</h2>
                    <p style={{ color: "var(--color-input-bg)", fontSize: "var(--font-size-small)" }}
                    className='mb-1'>お知らせの一覧・投稿・編集</p>
                </div>
            </div>

            {/* イベント管理 */}
            <div style={{ border: "2px solid var(--color-main)", borderRadius: "var(--control-radius)" }}
                className='flex w-max py-2 pl-2 shadow-md'>
                <div className='w-auto mx-1 flex justify-center items-center'>
                    <Icon icon="mdi:calendar" width="50" height="50"
                        style={{ backgroundColor: "var(--color-main)", color: "var(--color-bg)" }}
                        className='rounded-full p-1' />
                </div>
                <div className='ml-4 mr-16'>
                    <h2 className='text-center mb-1'
                        style={{ fontSize: "var(--font-size-h1)" }}>イベント管理</h2>
                    <p style={{ color: "var(--color-input-bg)", fontSize: "var(--font-size-small)" }}
                    className='mb-1'>イベントの作成・編集</p>
                </div>
            </div>

            {/* ユーザー管理 */}
            <div style={{ border: "2px solid var(--color-main)", borderRadius: "var(--control-radius)" }}
                className='flex w-max py-2 pl-2 pr-5 shadow-md'>
                <div className='w-auto mx-1 flex justify-center items-center'>
                    <Icon icon="mdi:people" width="50" height="50"
                        style={{ backgroundColor: "var(--color-main)", color: "var(--color-bg)" }}
                        className='rounded-full p-1' />
                </div>
                <div className='ml-4 mr-7'>
                    <h2 className='text-center mb-1'
                        style={{ fontSize: "var(--font-size-h1)" }}>ユーザー管理</h2>
                    <p style={{ color: "var(--color-input-bg)", fontSize: "var(--font-size-small)" }}
                    className='mb-1'>ユーザー情報閲覧・書評閲覧</p>
                </div>
            </div>

            {/* パスワード変更 */}
            <div style={{ border: "2px solid var(--color-main)", borderRadius: "var(--control-radius)" }}
                className='flex w-max py-2 pl-2 pr-5 shadow-md'>
                <div className='w-auto mx-1 flex justify-center items-center'>
                    <Icon icon="material-symbols:key" width="50" height="50"
                        style={{ backgroundColor: "var(--color-main)", color: "var(--color-bg)" }}
                        className='rounded-full p-1' />
                </div>
                <div className='ml-4 mr-4'>
                    <h2 className='text-center mb-1'
                        style={{ fontSize: "var(--font-size-h1)" }}>パスワード変更</h2>
                    <p style={{ color: "var(--color-input-bg)", fontSize: "var(--font-size-small)" }}
                    className='mb-1'>パスワードを変更</p>
                </div>
            </div>
        </main>
        );
}
