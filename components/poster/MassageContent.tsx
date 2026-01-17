import Styles from '@/styles/app/poster.module.css';

export default function MassageContent() {
  return (
    <>
    <div className={`flex justify-start items-center gap-2 mb-1`}>
        <div className='rounded-full bg-red-500 p-3'></div>
        <p className='text-left font-bold'>運営</p>
        <p className={`${Styles.text12px}`}>2025-12-11</p>
    </div>
    <div className={`rounded-sm border p-2 mb-5`}>
        <p className='text-left'>
            --- お知らせ ---<br/>
            タナカタロウさんの書評が1次審査を通過しました！
            ○○月○○日からのユーザー投票の対象となります！<br/>
            <br/>
            ↓詳細はこちら↓
            https://example.com/review-details
        </p>
    </div>
    </>
    );
}
