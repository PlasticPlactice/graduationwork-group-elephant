import { Icon } from '@iconify/react';

export default function Page() {
    return (
        <main style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}>
            {/* todo:枠の大きさを変える */}
            {/* todo:枠に丸み */}
            {/* todo:枠に影 */}

            {/* お知らせ管理 */}
            <div style={{ border: "1px solid var(--color-main)", borderRadius: "var(--control-radius)" }}
                className='flex w-max p-2 pr-6 shadow-md'>
                <div className='w-auto mx-1 flex justify-center items-center'>
                    <Icon icon="mdi:megaphone" width="50" height="50"
                        style={{ backgroundColor: "var(--color-main)", color: "var(--color-bg)" }}
                        className='rounded-full' />
                </div>
                <div>
                    <h2 className='text-center mb-1'
                        style={{ fontSize: "var(--font-size-h1)" }}>お知らせ管理</h2>
                    <p style={{ color: "var(--color-input-bg)", fontSize: "var(--font-size-small)" }}
                    className='mb-1'>お知らせの一覧・投稿・編集</p>
                </div>
            </div>

            {/* イベント管理 */}
            <div style={{ border: "1px solid var(--color-main)", borderRadius: "var(--control-radius)" }}
                className='flex w-max p-2 pr-9 shadow-md'>
                <div className='w-auto mx-1 flex justify-center items-center'>
                    <Icon icon="mdi:calendar" width="50" height="50"
                        style={{ backgroundColor: "var(--color-main)", color: "var(--color-bg)" }}
                        className='rounded-full p-1' />
                </div>
                <div>
                    <h2 className='text-center mb-1'
                        style={{ fontSize: "var(--font-size-h1)" }}>イベント管理</h2>
                    <p style={{ color: "var(--color-input-bg)", fontSize: "var(--font-size-small)" }}
                    className='mb-1'>イベントの作成・編集</p>
                </div>
            </div>

            {/* ユーザー管理 */}
            <div style={{ border: "1px solid var(--color-main)", borderRadius: "var(--control-radius)" }}
                className='flex w-max p-2 pr-5 shadow-md'>
                <div className='w-auto mx-1 flex justify-center items-center'>
                    <Icon icon="mdi:people" width="50" height="50"
                        style={{ backgroundColor: "var(--color-main)", color: "var(--color-bg)" }}
                        className='rounded-full p-1' />
                </div>
                <div>
                    <h2 className='text-center mb-1'
                        style={{ fontSize: "var(--font-size-h1)" }}>ユーザー管理</h2>
                    <p style={{ color: "var(--color-input-bg)", fontSize: "var(--font-size-small)" }}
                    className='mb-1'>ユーザー情報閲覧・書評閲覧</p>
                </div>
            </div>

            {/* <Icon icon="mdi:calendar" style={{ backgroundColor: "var(--color-main)", color: "var(--color-bg)" }}/> */}
                {/* <Icon icon="ic:outline-people" style={{ backgroundColor: "var(--color-main)", color: "var(--color-bg)" }}/> */}
                {/* <Icon icon="mdi:love" style={{ backgroundColor: "var(--color-main)", color: "var(--color-bg)" }}/> */}
                {/* <Icon icon="material-symbols:key" style={{ backgroundColor: "var(--color-main)", color: "var(--color-bg)" }}/> */}
                {/* サイズと色を指定 */}
                {/* <Icon icon="mdi:user" width="24" height="24" color="#ff4463" /> */}
                {/* CSSクラスでスタイル */}
                {/* <Icon icon="mdi:settings" className="text-2xl text-blue-500" /> */}
        </main>
        );
}
