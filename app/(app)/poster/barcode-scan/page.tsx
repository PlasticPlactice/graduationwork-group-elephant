"use client";

import Styles from "@/styles/app/poster.module.css"
import Image from "next/image";
import { useState } from "react";

import Modal from "@/app/(app)/poster/barcode-scan/Modal";

export default function BarcodeScanPage() {
    const [helpOpen, setHelpOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    return (
        <div>
            <a href="" className={`block mt-7 ml-3 font-bold ${Styles.subColor}`}><span>&lt;</span> ファンサイトはこちら</a>
            <div className={`${Styles.posterContainer}`}>
                <div className="mt-7 mb-10">
                    <h1 className="font-bold text-center">本のバーコードをスキャン</h1>
                    <p className={`font-bold text-center ${Styles.subColor}`}>冊子のバーコードを読み込む必要があります。</p>

                    <Image src="/app/barcode.png" alt="バーコード" width={200} height={200} className="mx-auto my-10"/>
                    <button type="button" className="w-full">カメラを起動</button>
                </div>
                <div>
                    <p className={`text-center font-bold mb-4 ${Styles.text16px}`}>読み取れない方、読み取りにくい方はこちら</p>
                    <p className={`${Styles.mainColor} ${Styles.text12px}`}>※ハイフンなしで入力してください</p>

                    <div className="flex gap-3">
                        <input type="text" name="isbn" placeholder="ISBNコードを入力" className="w-full"/>
                        <button type="button" onClick={() => setConfirmOpen(true)} className="w-2/4">検索</button>
                    </div>

                    <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                        <div className="mb-10">
                            <p>ISBNコード</p>
                            <div className={`border rounded-sm py-2 mb-4 ${Styles.text16px}`}>
                                <p className={`font-bold text-center`}>978-4167905033</p>
                            </div>

                            <p>本情報</p>
                            <div className={`border rounded-sm py-1 px-2 mb-8 ${Styles.text16px}`}>
                                <div className="flex my-5">
                                    <div>
                                        <p className={`font-bold mb-8 ${Styles.text16px}`}>色彩を持たない多崎をつくると、彼の巡礼の年</p>
                                        <p className={`${Styles.text16px}`}>村上春樹</p>
                                    </div>
                                    <Image src="/app/example-book.png" alt="本" width={125} height={175} />
                                </div>
                            </div>

                            <p className={`font-bold text-center ${Styles.text16px}`}>こちらの本の書評を投稿しますか？</p>
                            <div className={`mb-10 rounded-sm ${Styles.barcodeScan__alertContainer}`}>
                                <p className={`py-2 px-3 font-bold ${Styles.warningColor} ${Styles.text12px}`}>この先のページに進むと、本の変更はできません。内容をご確認の上、「登録へ」ボタンを押してください。</p>
                            </div>
                        </div>
                        <button type="button" className={`w-full mb-3`}>登録へ</button>
                        <button type="button" onClick={() => setConfirmOpen(false)} className={`w-full inline-flex items-center justify-center font-bold border ${Styles.barcodeScan__backButton}`}>戻る</button>
                    </Modal>

                    <div className="flex items-center my-2">
                        <p className="">ISBNコードとは</p>
                        <button 
                            type="button"
                            aria-label="ISBNコードのヘルプを表示"
                            onClick={() => setHelpOpen(true)}
                            className={`${Styles.helpButton}`}
                        >
                            <Image src="/app/help-circle-outline.png" alt="ヘルプマーク" width={30} height={20}/>
                        </button>

                        <Modal open={helpOpen} onClose={() => setHelpOpen(false)}>
                            <h2 className="font-bold text-center mb-4">ISBNコードとは？</h2>
                            <p className="mb-4">ISBNコードは、本の背表紙や裏表紙に記載されている13桁または10桁の数字です。このコードは、書籍を特定するための国際的な標準番号であり、出版社や書店が本を管理する際に使用されます。</p>
                            <p className="mb-4">13桁のISBNコードは通常、「978」または「979」で始まり、その後に出版社コード、タイトルコード、チェックデジットが続きます。10桁のISBNコードは、古い形式であり、現在は主に13桁の形式が使用されています。</p>
                            <button type="button" onClick={() => setHelpOpen(false)} className="w-full mt-6">閉じる</button>
                        </Modal>
                    </div>
                </div>
            </div>
        </div>
    )
}
