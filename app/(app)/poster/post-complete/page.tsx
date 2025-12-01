"use client";

import Styles from "@/styles/app/account-create.module.css";
import Image from "next/image";

export default function PostCompletePage() {
    return (
        <div className={`${Styles.posterContainer}`}>
            <Image src="/app/checkbox-multiple-marked-circle-outline.png" alt="checkMark" width={80} height={80} className="mx-auto" />
            <p className={`font-bold text-center ${Styles.text24px}`}>投稿が完了しました！</p>
            <p className={`${Styles.warningColor}`}>※１次審査が開始されるまでマイページより書評の編集が可能です。</p>

            <div className={`border rounded-sm p-4 mt-4 mb-8`}>
                <p className={`text-center border-b pb-4`}>第１回文庫X</p>
                <div className="max-w-10/12 mx-auto">
                    <div className="mt-4">
                        <div className="flex gap-7 justify-between">
                            <p className={`${Styles.text16px}`}>１次審査開始</p>
                            <p className={`font-bold text-blue-500`}>2025年8月1日</p>
                        </div>
                        <p className={`${Styles.text12px} ${Styles.subColor}`}>運営が１次審査を行います。</p>
                    </div>
                    <div className="mt-4">
                        <div className="flex gap-7 justify-between">
                            <p className={`${Styles.text16px}`}>２次審査開始</p>
                            <p className={`font-bold`}>2025年8月30日</p>
                        </div>
                        <p className={`${Styles.text12px} ${Styles.subColor}`}>ユーザーの皆さんが２次審査を行います。</p>
                    </div>
                    <div className="mt-4">
                        <div className="flex gap-7 justify-between">
                            <p className={`${Styles.text16px}`}>結果発表</p>
                            <p className={`font-bold`}>2025年9月25日</p>
                        </div>
                        <p className={`${Styles.text12px} ${Styles.subColor}`}>
                            上位作品は入賞しサイトに掲載されます。<br/>
                            また、実際に文庫Xとして販売される書評もあります。
                        </p>
                    </div>
                </div>
            </div>

            <p className={`font-bold text-center ${Styles.subColor} ${Styles.text12px}`}>過去の受賞作品、現在開催中のイベントはこちら ↓</p>
            <button type="button" onClick={() => window.location.href = "https://zoutohana.com/"} className={`w-full mb-5 ${Styles.barcodeScan__backButton}`} >像と花ファンサイトへ</button>
            <button type="button" className={`w-full mb-5 ${Styles.barcodeScan__backButton}`} >もう１冊登録する</button>
            <button type="button" className={`w-full`} >書評を確認する（マイページ）</button>
        </div>
    )
}
